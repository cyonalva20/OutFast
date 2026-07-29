"""
Router de clasificación de prendas.
Endpoint invocado por Spring Boot (AiClientService).
"""

import os
from fastapi import APIRouter, HTTPException
from app.schemas.clothing import ClassifyRequest, ClassifyResponse
from app.services.vision_service import classify_image

router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest):
    """
    Recibe la URL de una imagen y devuelve su clasificación.
    Invocado internamente por Spring Boot, NO por el frontend.
    """
    api_key = os.getenv("AI_API_KEY")
    api_url = os.getenv("AI_API_URL", "https://generativelanguage.googleapis.com/v1beta")
    model_name = os.getenv("AI_MODEL_NAME", "gemini-2.0-flash")

    if not api_key:
        raise HTTPException(status_code=500, detail="AI_API_KEY no configurada")

    result = await classify_image(
        image_url=request.image_url,
        api_key=api_key,
        api_url=api_url,
        model_name=model_name
    )

    return ClassifyResponse(**result)
