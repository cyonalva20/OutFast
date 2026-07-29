"""
Servicio de clasificación de prendas usando la API de visión (Gemini).

Este servicio recibe una URL de imagen, la envía al LLM de visión
y parsea la respuesta JSON con la categoría, color y tags de estilo.

En el futuro, este archivo se reemplazará por inferencia local
usando modelos CNN propios (PyTorch/TensorFlow).
"""

import json
import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Prompt que se envía al LLM junto con la imagen
CLASSIFY_PROMPT = """Analiza esta prenda de ropa y devuelve SOLO un JSON válido con estos campos:
{
  "category": "<una de: camisa, pantalón, zapatos, chaqueta, vestido, falda, short, accesorio, otro>",
  "color": "<color principal en español>",
  "style_tags": ["<hasta 3 tags entre: casual, formal, deportivo, elegante, playero>"]
}
No incluyas explicaciones, solo el JSON."""


async def classify_image(image_url: str, api_key: str, api_url: str, model_name: str) -> Dict[str, Any]:
    """
    Envía una imagen al LLM de visión para clasificarla.
    
    Args:
        image_url: URL pública de la imagen en Supabase Storage
        api_key: API key del proveedor de IA
        api_url: URL base de la API
        model_name: Nombre del modelo a usar
        
    Returns:
        Dict con category, color, style_tags
    """
    try:
        # Construir el payload para la API de Gemini
        url = f"{api_url}/models/{model_name}:generateContent?key={api_key}"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": CLASSIFY_PROMPT},
                    {"inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_url  # En producción: descargar y convertir a base64
                    }}
                ]
            }]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()

        # Extraer el texto de la respuesta
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]

        # Limpiar posibles marcadores de código markdown
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        parsed = json.loads(text)
        
        return {
            "category": parsed.get("category", "otro"),
            "color": parsed.get("color", "sin definir"),
            "style_tags": parsed.get("style_tags", ["casual"]),
        }

    except Exception as e:
        logger.error(f"Error al clasificar imagen: {e}")
        # Fallback: devolver valores por defecto para edición manual
        return {
            "category": "otro",
            "color": "sin definir",
            "style_tags": ["casual"],
        }
