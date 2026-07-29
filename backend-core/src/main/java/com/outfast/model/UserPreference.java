package com.outfast.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * Entidad JPA que almacena las preferencias de estilo del usuario.
 *
 * Se configura durante el onboarding (primera vez que el usuario
 * entra a la app) y se usa para personalizar el "outfit del día".
 *
 * La PK es el mismo userId (relación 1:1 con el usuario).
 */
@Entity
@Table(name = "user_preferences")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    /** El ID del usuario ES la primary key (relación 1:1) */
    @Id
    @Column(name = "user_id")
    private UUID userId;

    /**
     * Estilos preferidos elegidos en el onboarding.
     * Ej: ['casual', 'formal']
     * Se almacena como array de texto en PostgreSQL.
     */
    @Column(name = "preferred_styles", columnDefinition = "text[]")
    private String[] preferredStyles;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void updateTimestamp() {
        this.updatedAt = java.time.LocalDateTime.now();
    }
}
