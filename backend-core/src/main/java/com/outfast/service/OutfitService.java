package com.outfast.service;

import com.outfast.dto.ClothingItemResponse;
import com.outfast.dto.OutfitResponse;
import com.outfast.model.ClothingItem;
import com.outfast.model.Outfit;
import com.outfast.model.enums.ClothingStatus;
import com.outfast.repository.ClothingItemRepository;
import com.outfast.repository.OutfitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio con la lógica de negocio para outfits.
 * Coordina la generación de outfits llamando al microservicio de IA
 * y gestiona el guardado, favoritos y la lógica del "outfit del día".
 */
@Service
@RequiredArgsConstructor
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final ClothingItemRepository clothingItemRepository;
    private final AiClientService aiClientService;

    /** Guardar un outfit (generado por IA o manual) */
    public OutfitResponse save(UUID userId, Outfit outfit) {
        outfit.setUserId(userId);
        Outfit saved = outfitRepository.save(outfit);
        return toResponse(saved);
    }

    /** Listar todos los outfits guardados del usuario */
    public List<OutfitResponse> getAllByUser(UUID userId) {
        return outfitRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Marcar/desmarcar un outfit como favorito */
    public OutfitResponse toggleFavorite(UUID userId, UUID outfitId) {
        Outfit outfit = outfitRepository.findById(outfitId)
                .orElseThrow(() -> new RuntimeException("Outfit no encontrado"));

        if (!outfit.getUserId().equals(userId)) {
            throw new RuntimeException("No tienes permiso para modificar este outfit");
        }

        outfit.setIsFavorite(!outfit.getIsFavorite());
        return toResponse(outfitRepository.save(outfit));
    }

    /**
     * Obtener o generar el outfit del día.
     * Si ya existe uno vigente (creado en las últimas 18 horas), lo devuelve.
     * Si no, genera uno nuevo llamando al microservicio de IA.
     */
    public OutfitResponse getOrGenerateDaily(UUID userId) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(18);

        Optional<Outfit> existing = outfitRepository
                .findByUserIdAndIsOutfitOfTheDayTrueAndCreatedAtAfter(userId, cutoff);

        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        // Obtener prendas limpias para generar
        List<ClothingItem> cleanItems = clothingItemRepository
                .findByUserIdAndStatus(userId, ClothingStatus.LIMPIO);

        if (cleanItems.size() < 2) {
            throw new RuntimeException("No tienes suficientes prendas limpias para generar un outfit. Marca algunas como limpias.");
        }

        // Construir el payload para Python
        List<Map<String, Object>> payload = cleanItems.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId().toString());
            map.put("category", item.getCategory());
            map.put("color", item.getColor());
            map.put("style_tags", item.getStyleTags() != null ? Arrays.asList(item.getStyleTags()) : new ArrayList<>());
            map.put("image_url", item.getImageUrl());
            return map;
        }).collect(Collectors.toList());

        List<ClothingItem> selectedItems = new ArrayList<>();
        
        try {
            // Llamar al microservicio de IA
            List<Map<String, Object>> suggestions = aiClientService.generateOutfits(payload);
            
            if (suggestions != null && !suggestions.isEmpty()) {
                Map<String, Object> bestSuggestion = suggestions.get(0);
                List<String> itemIds = (List<String>) bestSuggestion.get("item_ids");
                
                // Validar silenciosamente los IDs (Ignorar alucinaciones de la IA)
                if (itemIds != null) {
                    for (String strId : itemIds) {
                        try {
                            UUID uuid = UUID.fromString(strId);
                            clothingItemRepository.findById(uuid).ifPresent(selectedItems::add);
                        } catch (IllegalArgumentException e) {
                            // Ignorar IDs mal formateados que haya devuelto la IA
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Manejo robusto de errores si Gemini o Python fallan (timeout, 429, etc.)
            throw new RuntimeException("La Inteligencia Artificial no pudo generar tu outfit en este momento. Por favor intenta de nuevo en un minuto.");
        }
        
        if (selectedItems.isEmpty()) {
            throw new RuntimeException("La Inteligencia Artificial no devolvió prendas compatibles. Por favor añade más ropa a tu armario.");
        }

        Outfit daily = Outfit.builder()
                .userId(userId)
                .generatedBy("ai")
                .generationType(com.outfast.model.enums.GenerationType.DAILY_AUTO)
                .isOutfitOfTheDay(true)
                .items(selectedItems)
                .build();

        return toResponse(outfitRepository.save(daily));
    }

    /** Convertir entidad a DTO */
    private OutfitResponse toResponse(Outfit outfit) {
        List<ClothingItemResponse> itemResponses = outfit.getItems().stream()
                .map(item -> ClothingItemResponse.builder()
                        .id(item.getId())
                        .imageUrl(item.getImageUrl())
                        .category(item.getCategory())
                        .color(item.getColor())
                        .styleTags(item.getStyleTags())
                        .status(item.getStatus())
                        .lastWornAt(item.getLastWornAt())
                        .createdAt(item.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return OutfitResponse.builder()
                .id(outfit.getId())
                .isFavorite(outfit.getIsFavorite())
                .generatedBy(outfit.getGeneratedBy())
                .generationType(outfit.getGenerationType())
                .baseItemId(outfit.getBaseItemId())
                .isOutfitOfTheDay(outfit.getIsOutfitOfTheDay())
                .createdAt(outfit.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
