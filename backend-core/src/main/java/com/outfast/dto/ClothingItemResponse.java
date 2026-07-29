package com.outfast.dto;

import com.outfast.model.enums.ClothingStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida para enviar datos de una prenda al frontend.
 * 
 * Solo expone los campos que el cliente necesita ver,
 * ocultando detalles internos de la entidad JPA.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingItemResponse {

    private UUID id;
    private String imageUrl;
    private String category;
    private String color;
    private String[] styleTags;
    private ClothingStatus status;
    private LocalDateTime lastWornAt;
    private LocalDateTime createdAt;
}
