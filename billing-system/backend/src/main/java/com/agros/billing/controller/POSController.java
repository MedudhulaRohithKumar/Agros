package com.agros.billing.controller;

import com.agros.billing.dto.OrderRequestDTO;
import com.agros.billing.dto.OrderResponseDTO;
import com.agros.billing.service.POSService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class POSController {

    private final POSService posService;

    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody OrderRequestDTO request) {
        return ResponseEntity.ok(posService.processSale(request));
    }
}
