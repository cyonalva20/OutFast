package com.outfast.model.enums;

/**
 * Tipo de generación de un outfit.
 *
 * DAILY_AUTO:      Generado automáticamente al abrir la app ("outfit del día").
 * MANUAL_REQUEST:  El usuario pidió explícitamente "¿Qué me pongo?".
 * FROM_BASE_ITEM:  Generado a partir de una prenda base elegida por el usuario.
 */
public enum GenerationType {
    DAILY_AUTO,
    MANUAL_REQUEST,
    FROM_BASE_ITEM
}
