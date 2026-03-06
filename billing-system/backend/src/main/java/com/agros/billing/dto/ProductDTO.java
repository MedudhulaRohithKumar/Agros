package com.agros.billing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDTO {
    private Long id;
    private String barcode;
    private String name;
    private BigDecimal price;
}
