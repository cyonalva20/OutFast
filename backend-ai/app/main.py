from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OutFast AI Microservice",
    description="Microservicio interno para clasificación de prendas y generación de outfits.",
    version="0.1.0"
)

# Permitir CORS temporalmente para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """
    Endpoint de monitoreo usado por Spring Boot y Docker
    para verificar que el servicio de IA está vivo.
    """
    return {"status": "ok", "service": "backend-ai"}
