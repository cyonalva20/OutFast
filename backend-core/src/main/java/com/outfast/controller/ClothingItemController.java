package com.outfast.controller;

import com.outfast.dto.ClothingItemRequest;
import com.outfast.dto.ClothingItemResponse;
import com.outfast.model.enums.ClothingStatus;
import com.outfast.service.ClothingItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller REST para gestionar prendas de ropa.
 *
 * @RestController combina @Controller + @ResponseBody: todas las
 * respuestas se serializan automáticamente a JSON.
 *
 * @RequestMapping("/api/items") define el prefijo de ruta para
 * todos los endpoints de este controller.
 *
 * Nota: El userId se extrae automáticamente del token JWT provisto por Supabase Auth.
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ClothingItemController {

    private final ClothingItemService service;

    @PostMapping
    public ResponseEntity<ClothingItemResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ClothingItemRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ClothingItemResponse>> getAll(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String status) {
        UUID userId = UUID.fromString(jwt.getSubject());

        if (status != null) {
            ClothingStatus clothingStatus = ClothingStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(service.getByStatus(userId, clothingStatus));
        }

        return ResponseEntity.ok(service.getAllByUser(userId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClothingItemResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody ClothingItemRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(service.update(userId, id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ClothingItemResponse> updateStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(jwt.getSubject());
        ClothingStatus newStatus = ClothingStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(service.updateStatus(userId, id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
