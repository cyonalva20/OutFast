from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import classify, outfit

# Cargar variables de entorno desde .env
load_dotenv()

app = FastAPI(
    title="OutFast AI Microservice",
    description="Microservicio interno para clasificación de prendas y generación de outfits.",
    version="0.1.0"
)

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(classify.router, tags=["Clasificación"])
app.include_router(outfit.router, tags=["Outfits"])


@app.get("/health")
async def health_check():
    """Endpoint de monitoreo."""
    return {"status": "ok", "service": "backend-ai"}
