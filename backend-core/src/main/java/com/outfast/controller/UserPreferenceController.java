package com.outfast.controller;

import com.outfast.model.UserPreference;
import com.outfast.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceService service;

    @GetMapping
    public ResponseEntity<UserPreference> get(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return service.getByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<UserPreference> saveOrUpdate(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String[]> body) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String[] styles = body.get("preferred_styles");
        return ResponseEntity.ok(service.saveOrUpdate(userId, styles));
    }
}
