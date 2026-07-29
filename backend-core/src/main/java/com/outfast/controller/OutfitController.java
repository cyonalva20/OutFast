package com.outfast.controller;

import com.outfast.dto.OutfitResponse;
import com.outfast.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller REST para generar y gestionar outfits.
 */
@RestController
@RequestMapping("/api/outfits")
@RequiredArgsConstructor
public class OutfitController {

    private final OutfitService service;

    @GetMapping
    public ResponseEntity<List<OutfitResponse>> getAll(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.getAllByUser(userId));
    }

    @PostMapping("/generate-daily")
    public ResponseEntity<OutfitResponse> generateDaily(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(service.getOrGenerateDaily(userId));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<OutfitResponse> toggleFavorite(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(service.toggleFavorite(userId, id));
    }
}
