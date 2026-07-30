package com.outfast.model;

import com.outfast.model.enums.GenerationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entidad JPA que representa un outfit (combinación de prendas).
 *
 * Un outfit puede ser generado por la IA o armado manualmente.
 * Tiene una relación muchos-a-muchos con ClothingItem a través
 * de la tabla intermedia outfit_items.
 */
@Entity
@Table(name = "outfits")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outfit {

    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** Si el usuario marcó este outfit como favorito */
    @Column(name = "is_favorite")
    @Builder.Default
    private Boolean isFavorite = false;

    /** Quién generó el outfit: 'ai' o 'manual' */
    @Column(name = "generated_by", nullable = false)
    private String generatedBy;

    /** Tipo de generación: DAILY_AUTO, MANUAL_REQUEST, FROM_BASE_ITEM */
    @Enumerated(EnumType.STRING)
    @Column(name = "generation_type")
    private com.outfast.model.enums.GenerationType generationType;

    /** Si se generó desde una prenda base, referencia a esa prenda */
    @Column(name = "base_item_id")
    private UUID baseItemId;

    /** Indica si este outfit es el "outfit del día" vigente */
    @Column(name = "is_outfit_of_the_day")
    @Builder.Default
    private Boolean isOutfitOfTheDay = false;

    /** Contexto de ocasión proporcionado por el usuario (solo custom outfits) */
    @Column(name = "occasion_context")
    private String occasionContext;

    /**
     * Relación muchos-a-muchos con ClothingItem.
     * Un outfit contiene varias prendas, y una prenda puede
     * pertenecer a varios outfits guardados.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "outfit_items",
        joinColumns = @JoinColumn(name = "outfit_id"),
        inverseJoinColumns = @JoinColumn(name = "item_id")
    )
    @Builder.Default
    private List<ClothingItem> items = new ArrayList<>();
}
