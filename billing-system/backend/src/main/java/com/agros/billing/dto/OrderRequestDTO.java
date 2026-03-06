package com.agros.billing.dto;

import com.agros.billing.entity.DiscountType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequestDTO {
    private String customerName;
    private String customerMobile;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private List<OrderItemDTO> items;
}
