package com.agros.billing.service;

import com.agros.billing.dto.OrderRequestDTO;
import com.agros.billing.dto.OrderResponseDTO;
import com.agros.billing.entity.*;
import com.agros.billing.repository.CustomerRepository;
import com.agros.billing.repository.ProductRepository;
import com.agros.billing.repository.SaleOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class POSService {

    private final SaleOrderRepository saleOrderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public OrderResponseDTO processSale(OrderRequestDTO request) {
        // 1. Handle Customer
        Customer customer = null;
        if (request.getCustomerMobile() != null && !request.getCustomerMobile().isEmpty()) {
            customer = customerRepository.findByMobile(request.getCustomerMobile())
                    .orElseGet(() -> customerRepository.save(
                            Customer.builder()
                                    .name(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in")
                                    .mobile(request.getCustomerMobile())
                                    .build()
                    ));
        }

        // 2. Initialize Order
        SaleOrder order = SaleOrder.builder()
                .customer(customer)
                .discountType(request.getDiscountType() != null ? request.getDiscountType() : DiscountType.NONE)
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. Process Items
        for (var itemReq : request.getItems()) {
            Product product = productRepository.findByBarcode(itemReq.getBarcode())
                    .orElseThrow(() -> new RuntimeException("Product not found with barcode: " + itemReq.getBarcode()));
            
            BigDecimal subTotal = product.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            SaleOrderItem orderItem = SaleOrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .subTotal(subTotal)
                    .build();

            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);

        // 4. Calculate Final Amount
        BigDecimal finalAmount = totalAmount;
        if (order.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal discountAmt = totalAmount.multiply(order.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            finalAmount = totalAmount.subtract(discountAmt);
        } else if (order.getDiscountType() == DiscountType.FLAT) {
            finalAmount = totalAmount.subtract(order.getDiscountValue());
        }
        
        // Ensure final amount isn't negative
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        order.setFinalAmount(finalAmount);

        // 5. Save Order
        SaleOrder savedOrder = saleOrderRepository.save(order);

        // 6. Map to Response
        return mapToResponse(savedOrder);
    }

    private OrderResponseDTO mapToResponse(SaleOrder order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(order.getId());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDiscountType(order.getDiscountType());
        dto.setDiscountValue(order.getDiscountValue());
        dto.setFinalAmount(order.getFinalAmount());

        if (order.getCustomer() != null) {
            dto.setCustomerName(order.getCustomer().getName());
            dto.setCustomerMobile(order.getCustomer().getMobile());
        } else {
            dto.setCustomerName("Walk-in");
        }

        List<OrderResponseDTO.OrderItemResponseDTO> itemDTOs = order.getItems().stream().map(item -> {
            OrderResponseDTO.OrderItemResponseDTO itemDTO = new OrderResponseDTO.OrderItemResponseDTO();
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setBarcode(item.getProduct().getBarcode());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setUnitPrice(item.getUnitPrice());
            itemDTO.setSubTotal(item.getSubTotal());
            return itemDTO;
        }).collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }
}
