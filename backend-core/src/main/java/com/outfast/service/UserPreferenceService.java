package com.outfast.service;

import com.outfast.model.UserPreference;
import com.outfast.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Servicio para gestionar las preferencias de estilo del usuario.
 * Se usa durante el onboarding y para personalizar el outfit del día.
 */
@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserPreferenceRepository repository;

    /** Obtener preferencias del usuario */
    public Optional<UserPreference> getByUserId(UUID userId) {
        return repository.findById(userId);
    }

    /** Crear o actualizar preferencias (upsert) */
    public UserPreference saveOrUpdate(UUID userId, String[] preferredStyles) {
        UserPreference pref = repository.findById(userId)
                .orElse(UserPreference.builder().userId(userId).build());

        pref.setPreferredStyles(preferredStyles);
        return repository.save(pref);
    }
}
