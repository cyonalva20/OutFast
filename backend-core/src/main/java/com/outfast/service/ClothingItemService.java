package com.outfast.service;

import com.outfast.dto.ClothingItemRequest;
import com.outfast.dto.ClothingItemResponse;
import com.outfast.model.ClothingItem;
import com.outfast.model.enums.ClothingStatus;
import com.outfast.repository.ClothingItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio con la lógica de negocio para prendas de ropa.
 *
 * La anotación @Service marca esta clase como un componente de Spring
 * que contiene lógica de negocio. Spring la inyecta automáticamente
 * en los Controllers que la necesiten.
 *
 * @RequiredArgsConstructor (Lombok) genera un constructor con todos
 * los campos 'final', que Spring usa para inyectar las dependencias.
 */
@Service
@RequiredArgsConstructor
public class ClothingItemService {

    private final ClothingItemRepository repository;

    /** Crear una prenda nueva */
    public ClothingItemResponse create(UUID userId, ClothingItemRequest request) {
        ClothingItem item = ClothingItem.builder()
                .userId(userId)
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .color(request.getColor())
                .styleTags(request.getStyleTags())
                .status(ClothingStatus.LIMPIO)
                .build();

        ClothingItem saved = repository.save(item);
        return toResponse(saved);
    }

    /** Obtener todas las prendas de un usuario */
    public List<ClothingItemResponse> getAllByUser(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Obtener prendas filtradas por estado */
    public List<ClothingItemResponse> getByStatus(UUID userId, ClothingStatus status) {
        return repository.findByUserIdAndStatus(userId, status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Cambiar estado de una prenda (limpio/sucio) */
    public ClothingItemResponse updateStatus(UUID userId, UUID itemId, ClothingStatus newStatus) {
        ClothingItem item = repository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Prenda no encontrada"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para modificar esta prenda");
        }

        item.setStatus(newStatus);
        if (newStatus == ClothingStatus.SUCIO) {
            item.setLastWornAt(LocalDateTime.now());
        }

        return toResponse(repository.save(item));
    }

    /** Actualizar campos editables de una prenda */
    public ClothingItemResponse update(UUID userId, UUID itemId, ClothingItemRequest request) {
        ClothingItem item = repository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Prenda no encontrada"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para modificar esta prenda");
        }

        if (request.getCategory() != null) item.setCategory(request.getCategory());
        if (request.getColor() != null) item.setColor(request.getColor());
        if (request.getStyleTags() != null) item.setStyleTags(request.getStyleTags());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());

        return toResponse(repository.save(item));
    }

    /** Eliminar una prenda */
    public void delete(UUID userId, UUID itemId) {
        ClothingItem item = repository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Prenda no encontrada"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para eliminar esta prenda");
        }

        repository.delete(item);
    }

    /** Convierte una entidad JPA a un DTO de respuesta */
    private ClothingItemResponse toResponse(ClothingItem item) {
        return ClothingItemResponse.builder()
                .id(item.getId())
                .imageUrl(item.getImageUrl())
                .category(item.getCategory())
                .color(item.getColor())
                .styleTags(item.getStyleTags())
                .status(item.getStatus())
                .lastWornAt(item.getLastWornAt())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
