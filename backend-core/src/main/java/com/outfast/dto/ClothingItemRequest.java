package com.outfast.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO de entrada para crear o editar una prenda.
 *
 * Un DTO (Data Transfer Object) es un objeto que solo transporta datos
 * entre el frontend y el backend. A diferencia de la Entidad JPA,
 * NO se mapea a la base de datos. Esto evita exponer campos internos
 * (como el id o createdAt) al cliente.
 *
 * Las anotaciones @NotBlank vienen de Spring Validation y aseguran
 * que el campo no sea null ni vacío. Si falla, Spring devuelve
 * automáticamente un error 400 Bad Request.
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingItemRequest {

    /** URL de la imagen subida a Supabase Storage */
    private String imageUrl;

    /** Categoría de la prenda (puede venir de la IA o editada manualmente) */
    @NotBlank(message = "La categoría es obligatoria")
    private String category;

    /** Color principal */
    private String color;

    /** Tags de estilo: casual, formal, deportivo, etc. */
    private String[] styleTags;
}
