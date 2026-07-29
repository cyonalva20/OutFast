"""
Middleware de manejo de errores para FastAPI.

Captura excepciones no manejadas y devuelve respuestas JSON
consistentes al cliente (Spring Boot), en lugar de errores HTML.
"""

import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Middleware que envuelve cada request en un try/except global.
    Si algo falla de forma inesperada, devuelve un JSON limpio.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            logger.error(f"Error no manejado en {request.method} {request.url}: {e}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Error interno del microservicio de IA",
                    "detail": str(e) if logger.isEnabledFor(logging.DEBUG) else None
                }
            )
