package com.outfast.repository;

import com.outfast.model.ClothingItem;
import com.outfast.model.enums.ClothingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para la tabla clothing_items.
 *
 * Al extender JpaRepository, Spring genera automáticamente
 * los métodos CRUD básicos (save, findById, findAll, delete).
 * Los métodos custom se generan por convención de nombres:
 * "findBy + NombreCampo" → Spring crea la query SQL automáticamente.
 */
@Repository
public interface ClothingItemRepository extends JpaRepository<ClothingItem, UUID> {

    /** Obtener todas las prendas de un usuario */
    List<ClothingItem> findByUserId(UUID userId);

    /** Obtener prendas de un usuario filtradas por estado (LIMPIO/SUCIO) */
    List<ClothingItem> findByUserIdAndStatus(UUID userId, ClothingStatus status);

    /** Contar cuántas prendas limpias tiene un usuario */
    long countByUserIdAndStatus(UUID userId, ClothingStatus status);
}
