package com.outfast.controller;

import com.outfast.dto.OutfitResponse;
import com.outfast.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

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
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(service.getAllByUser(userId));
    }

    @PostMapping("/generate-daily")
    public ResponseEntity<OutfitResponse> generateDaily(
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(service.getOrGenerateDaily(userId));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<OutfitResponse> toggleFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(service.toggleFavorite(userId, id));
    }
}
