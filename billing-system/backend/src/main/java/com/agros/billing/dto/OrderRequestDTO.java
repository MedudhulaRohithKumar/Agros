package com.agros.billing.dto;

import com.agros.billing.entity.DiscountType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequestDTO {
    private String customerName;
    private String customerMobile;
    private DiscountType discountType;
    private BigDecimal discountValue;
    
    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemDTO> items;
}
