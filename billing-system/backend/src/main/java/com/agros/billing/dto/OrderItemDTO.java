package com.agros.billing.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long productId;
    private String barcode;
    private Integer quantity;
}
