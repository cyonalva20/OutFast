"""
Configuración centralizada del microservicio de IA.

Usa Pydantic Settings para cargar variables de entorno
con valores por defecto seguros.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Variables de entorno del microservicio."""
    
    ai_api_key: str = ""
    ai_api_url: str = "https://generativelanguage.googleapis.com/v1beta"
    ai_model_name: str = "gemini-2.0-flash"
    port: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = False


# Singleton: se instancia una sola vez y se reutiliza
settings = Settings()
