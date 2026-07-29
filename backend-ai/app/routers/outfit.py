"""
Router de generación de outfits.
Endpoint invocado por Spring Boot (OutfitService).
"""

from fastapi import APIRouter
from app.schemas.outfit import OutfitGenerateRequest, OutfitGenerateResponse, OutfitSuggestion
from app.services.outfit_service import generate_outfits

router = APIRouter()


@router.post("/generate-outfit", response_model=OutfitGenerateResponse)
async def generate(request: OutfitGenerateRequest):
    """
    Recibe prendas disponibles y devuelve sugerencias de outfits.
    Invocado internamente por Spring Boot.
    """
    items_data = [item.model_dump() for item in request.items]

    suggestions = await generate_outfits(
        items=items_data,
        preferred_styles=request.preferred_styles,
        base_item_id=request.base_item_id
    )

    return OutfitGenerateResponse(
        suggestions=[OutfitSuggestion(**s) for s in suggestions]
    )
