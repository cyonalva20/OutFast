# ============================================================
# Dockerfile para el microservicio de IA (FastAPI)
# ============================================================
# Usa una imagen ligera de Python (slim) para reducir el
# tamaño del contenedor. Instala las dependencias y ejecuta
# el servidor Uvicorn.
# ============================================================

FROM python:3.11-slim

WORKDIR /app

# Copiar dependencias primero (aprovecha el cache de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY ./app ./app

# Puerto donde escuchará FastAPI
EXPOSE 8000

# Comando para arrancar el servidor
# --host 0.0.0.0 permite que Docker reciba conexiones externas
# --reload activa hot-reload (solo para desarrollo)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
