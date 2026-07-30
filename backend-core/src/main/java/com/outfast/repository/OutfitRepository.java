package com.outfast.repository;

import com.outfast.model.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutfitRepository extends JpaRepository<Outfit, UUID> {

    List<Outfit> findByUserId(UUID userId);

    List<Outfit> findByUserIdAndIsFavoriteTrue(UUID userId);

    /** Buscar el outfit del día vigente (creado después de cierta hora) */
    Optional<Outfit> findByUserIdAndIsOutfitOfTheDayTrueAndCreatedAtAfter(
            UUID userId, LocalDateTime after);

    /** Buscar outfits personalizados (no daily) creados después de cierta hora */
    List<Outfit> findByUserIdAndIsOutfitOfTheDayFalseAndCreatedAtAfterOrderByCreatedAtDesc(
            UUID userId, LocalDateTime after);
}
