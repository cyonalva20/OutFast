package com.outfast.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Cliente HTTP que se comunica con el microservicio de IA (FastAPI).
 *
 * Este servicio actúa como "puente" entre Spring Boot y FastAPI.
 * Spring Boot NUNCA habla directamente con la API de Gemini/Claude;
 * siempre delega al microservicio de Python.
 *
 * @Slf4j (Lombok) genera automáticamente un logger llamado 'log'.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiClientService {

    @Value("${app.ai-service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Envía una imagen al microservicio de IA para clasificarla.
     * @param imageUrl URL de la imagen en Supabase Storage
     * @return Mapa con: category, color, styleTags
     */
    public Map<String, Object> classifyImage(String imageUrl) {
        String url = aiServiceUrl + "/classify";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = Map.of("image_url", imageUrl);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }

            log.warn("El microservicio de IA devolvió un estado inesperado: {}", response.getStatusCode());
            return getDefaultClassification();

        } catch (Exception e) {
            log.error("Error al comunicarse con el microservicio de IA: {}", e.getMessage());
            return getDefaultClassification();
        }
    }

    /**
     * Clasificación por defecto si la IA falla.
     * El usuario podrá editar manualmente desde el frontend.
     */
    private Map<String, Object> getDefaultClassification() {
        return Map.of(
                "category", "otro",
                "color", "sin definir",
                "style_tags", new String[]{"casual"}
        );
    }

    /**
     * Solicita a la IA la generación de outfits basados en prendas disponibles.
     * @param items Lista de prendas limpias representadas como Map
     * @return Lista de sugerencias (lista de Maps, cada uno con item_ids y reasoning)
     */
    public List<Map<String, Object>> generateOutfits(List<Map<String, Object>> items) {
        String url = aiServiceUrl + "/generate-outfit";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // El payload esperado por FastAPI es {"items": [...], "preferred_styles": null, "base_item_id": null}
            Map<String, Object> body = Map.of("items", items);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // response.getBody() devuelve un mapa con la llave "suggestions" que es una lista
                Object suggestionsObj = response.getBody().get("suggestions");
                if (suggestionsObj instanceof List) {
                    return (List<Map<String, Object>>) suggestionsObj;
                }
            }
            
            log.warn("La IA no devolvió sugerencias válidas. Estado: {}", response.getStatusCode());
            throw new RuntimeException("No se pudieron generar sugerencias válidas");
            
        } catch (Exception e) {
            log.error("Error al generar outfits con la IA: {}", e.getMessage());
            // Lanzamos una excepción controlada para que OutfitService la maneje (Fallback)
            throw new RuntimeException("El servicio de IA falló al generar outfits", e);
        }
    }

    /** Verifica si el microservicio de IA está activo */
    public boolean isHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiServiceUrl + "/health", Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("El microservicio de IA no está disponible: {}", e.getMessage());
            return false;
        }
    }
}
