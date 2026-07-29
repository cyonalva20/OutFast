"""
Schemas Pydantic para clasificación de prendas.

Pydantic valida automáticamente los datos de entrada/salida.
Si el frontend envía un campo faltante o con tipo incorrecto,
FastAPI devuelve un error 422 con detalles claros.
"""

from pydantic import BaseModel
from typing import List, Optional


class ClassifyRequest(BaseModel):
    """Datos que envía Spring Boot para clasificar una prenda."""
    image_url: str


class ClassifyResponse(BaseModel):
    """Resultado de la clasificación de la IA."""
    category: str          # camisa, pantalón, zapatos, etc.
    color: str             # color principal en español
    style_tags: List[str]  # ej: ['casual', 'formal']
    confidence: Optional[float] = None  # confianza de la predicción (0-1)
