"""
Servicio de generación de outfits usando IA.

Recibe una lista de prendas limpias y las preferencias del usuario,
y pide al LLM que seleccione combinaciones que combinen bien.

En el futuro: se reemplazará por un modelo de recomendación propio.
"""

import json
import httpx
import logging
import os
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


def _build_prompt(items_text: str, preferred_styles: Optional[List[str]], base_item_id: Optional[str]) -> str:
    """Construye el prompt para el LLM según el contexto."""

    style_hint = ""
    if preferred_styles:
        style_hint = f"\nEl usuario prefiere estos estilos: {', '.join(preferred_styles)}."

    base_hint = ""
    if base_item_id:
        base_hint = f"\nEl outfit DEBE incluir la prenda con id '{base_item_id}' como pieza central."

    return f"""Eres un estilista profesional. Tienes estas prendas disponibles:

{items_text}
{style_hint}{base_hint}

Reglas estrictas para armar el outfit:
1. MINIMO 2 PRENDAS: Debes incluir al menos una parte superior (ej. camisa, polo, camiseta) y una parte inferior (ej. pantalón, short, falda).
2. CAPAS (LAYERING): Puedes combinar múltiples partes superiores si tiene sentido estilístico (ej. una camiseta básica con una chaqueta encima, o un polo con una camisa abierta).
3. CALZADO Y ACCESORIOS: Inclúyelos si están disponibles y combinan.

Genera 2 opciones de outfits completos. Devuelve SOLO un JSON válido con este formato:
{{
  "suggestions": [
    {{
      "item_ids": ["id1", "id2", "id3"],
      "reasoning": "breve explicación de por qué combinan y cómo se deben usar las capas"
    }}
  ]
}}
No incluyas explicaciones fuera del JSON."""


async def generate_outfits(
    items: List[Dict[str, Any]],
    preferred_styles: Optional[List[str]] = None,
    base_item_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Genera sugerencias de outfits usando el LLM.
    """
    api_key = os.getenv("AI_API_KEY")
    api_url = os.getenv("AI_API_URL", "https://generativelanguage.googleapis.com/v1beta")
    model_name = os.getenv("AI_MODEL_NAME", "gemini-2.0-flash")

    if not api_key:
        logger.error("AI_API_KEY no configurada")
        return _fallback_outfits(items)

    # Construir texto descriptivo de las prendas
    items_text = "\n".join([
        f"- id: {item['id']}, categoría: {item['category']}, color: {item['color']}, estilos: {item.get('style_tags', [])}"
        for item in items
    ])

    prompt = _build_prompt(items_text, preferred_styles, base_item_id)

    try:
        url = f"{api_url}/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()

        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]

        # Limpiar markdown
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        parsed = json.loads(text)
        return parsed.get("suggestions", [])

    except Exception as e:
        logger.error(f"Error al generar outfits: {e}")
        return _fallback_outfits(items)


def _fallback_outfits(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Fallback: devolver las primeras 3 prendas como outfit."""
    if len(items) < 2:
        return []

    return [{
        "item_ids": [item["id"] for item in items[:3]],
        "reasoning": "Sugerencia básica (la IA no está disponible en este momento)"
    }]
