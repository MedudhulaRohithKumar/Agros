package com.agros.billing.service;

import com.agros.billing.dto.ProductDTO;
import com.agros.billing.entity.Product;
import com.agros.billing.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        String barcode = dto.getBarcode();
        if (barcode == null || barcode.trim().isEmpty()) {
            barcode = generateUniqueBarcode();
        }

        Product product = Product.builder()
                .barcode(barcode)
                .name(dto.getName())
                .price(dto.getPrice())
                .build();

        product = productRepository.save(product);
        return mapToDTO(product);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Product not found for barcode: " + barcode));
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product = productRepository.save(product);
        return mapToDTO(product);
    }

    private String generateUniqueBarcode() {
        return "AG" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10).toUpperCase();
    }

    private ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setBarcode(product.getBarcode());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        return dto;
    }
}
