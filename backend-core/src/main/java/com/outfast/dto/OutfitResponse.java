package com.outfast.dto;

import com.outfast.model.enums.GenerationType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO de salida para enviar datos de un outfit al frontend.
 * Incluye la lista de prendas que componen el outfit.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitResponse {

    private UUID id;
    private Boolean isFavorite;
    private String generatedBy;
    private GenerationType generationType;
    private UUID baseItemId;
    private Boolean isOutfitOfTheDay;
    private LocalDateTime createdAt;

    /** Lista de prendas que componen este outfit */
    private List<ClothingItemResponse> items;
}
