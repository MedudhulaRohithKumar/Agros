package com.agros.billing.dto;

import com.agros.billing.entity.DiscountType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long id;
    private String customerName;
    private String customerMobile;
    private BigDecimal totalAmount;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal finalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemResponseDTO> items;

    @Data
    public static class OrderItemResponseDTO {
        private String productName;
        private String barcode;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subTotal;
    }
}
