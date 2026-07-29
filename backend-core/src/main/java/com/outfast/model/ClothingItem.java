package com.outfast.model;

import com.outfast.model.enums.ClothingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entidad JPA que representa una prenda de ropa en el armario del usuario.
 *
 * Cada prenda tiene una foto, una clasificación automática generada por IA
 * (categoría, color, tags de estilo) y un estado limpio/sucio que determina
 * si puede ser incluida en sugerencias de outfits.
 *
 * La anotación @Entity le dice a JPA que esta clase se mapea a una tabla
 * en PostgreSQL. @Table define el nombre exacto de la tabla.
 */
@Entity
@Table(name = "clothing_items")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** ID del usuario dueño de esta prenda (viene de Supabase Auth) */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /** URL de la foto almacenada en Supabase Storage */
    @Column(name = "image_url")
    private String imageUrl;

    /** Categoría detectada por IA: camisa, pantalón, zapatos, etc. */
    @Column(nullable = false)
    private String category;

    /** Color principal detectado por IA */
    private String color;

    /**
     * Tags de estilo detectados por IA: casual, formal, deportivo, etc.
     * Se almacena como un array de texto en PostgreSQL.
     */
    @Column(name = "style_tags", columnDefinition = "text[]")
    private String[] styleTags;

    /** Estado actual de la prenda: LIMPIO o SUCIO */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ClothingStatus status = ClothingStatus.LIMPIO;

    /** Última vez que se usó esta prenda */
    @Column(name = "last_worn_at")
    private LocalDateTime lastWornAt;

    /** Fecha de creación (se genera automáticamente) */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
