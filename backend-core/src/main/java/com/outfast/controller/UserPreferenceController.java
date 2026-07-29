package com.outfast.controller;

import com.outfast.model.UserPreference;
import com.outfast.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceService service;

    @GetMapping
    public ResponseEntity<UserPreference> get(@RequestHeader("X-User-Id") UUID userId) {
        return service.getByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<UserPreference> saveOrUpdate(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, String[]> body) {
        String[] styles = body.get("preferred_styles");
        return ResponseEntity.ok(service.saveOrUpdate(userId, styles));
    }
}
