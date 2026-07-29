"""
Schemas Pydantic para generación de outfits.
"""

from pydantic import BaseModel
from typing import List, Optional


class ClothingItemData(BaseModel):
    """Datos de una prenda enviados por Spring Boot."""
    id: str
    category: str
    color: str
    style_tags: List[str]
    image_url: Optional[str] = None


class OutfitGenerateRequest(BaseModel):
    """Datos para solicitar la generación de un outfit."""
    items: List[ClothingItemData]                 # Prendas disponibles (limpias)
    preferred_styles: Optional[List[str]] = None  # Estilos del usuario
    base_item_id: Optional[str] = None            # Prenda base (opcional)


class OutfitSuggestion(BaseModel):
    """Un outfit sugerido por la IA."""
    item_ids: List[str]   # IDs de las prendas seleccionadas
    reasoning: str        # Explicación breve de por qué combinan


class OutfitGenerateResponse(BaseModel):
    """Respuesta con sugerencias de outfits."""
    suggestions: List[OutfitSuggestion]
