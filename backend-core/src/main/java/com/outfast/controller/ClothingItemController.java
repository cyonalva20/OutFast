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
 * Nota: El userId se recibe por header (X-User-Id) temporalmente.
 * Cuando integremos Supabase Auth, se extraerá del token JWT.
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ClothingItemController {

    private final ClothingItemService service;

    @PostMapping
    public ResponseEntity<ClothingItemResponse> create(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ClothingItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ClothingItemResponse>> getAll(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(required = false) String status) {

        if (status != null) {
            ClothingStatus clothingStatus = ClothingStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(service.getByStatus(userId, clothingStatus));
        }

        return ResponseEntity.ok(service.getAllByUser(userId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClothingItemResponse> update(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @RequestBody ClothingItemRequest request) {
        return ResponseEntity.ok(service.update(userId, id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ClothingItemResponse> updateStatus(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        ClothingStatus newStatus = ClothingStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(service.updateStatus(userId, id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        service.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
