# OutFast — Armario Inteligente 👔

> Aplicación web que digitaliza tu armario, rastrea el estado de tus prendas (limpio/sucio) y genera recomendaciones de outfits con Inteligencia Artificial.

## 🏗️ Arquitectura

OutFast utiliza una **arquitectura de microservicios** con dos backends especializados:

```
┌─────────────┐     HTTP      ┌──────────────────┐     HTTP      ┌─────────────────┐
│   Frontend   │ ────────────▶ │   Backend Core   │ ────────────▶ │   Backend AI    │
│  React/Vite  │ ◀──────────── │  Spring Boot     │ ◀──────────── │   FastAPI       │
│  (Mobile-    │               │  (Java)          │               │   (Python)      │
│   first UI)  │               │                  │               │                 │
└─────────────┘               │  • REST API      │               │  • Clasificación│
                               │  • Seguridad     │               │    de prendas   │
                               │  • Reglas de     │               │  • Generación   │
                               │    negocio       │               │    de outfits   │
                               │  • JPA/DB        │               │  • Modelos ML   │
                               └────────┬─────────┘               └─────────────────┘
                                        │
                                        ▼
                               ┌──────────────────┐
                               │    Supabase      │
                               │  (PostgreSQL +   │
                               │   Auth + Storage)│
                               └──────────────────┘
```

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| Frontend | React (Vite) | SPA mobile-first |
| Backend Core | Spring Boot (Java) | API REST, seguridad, reglas de negocio |
| Backend AI | FastAPI (Python) | Clasificación de prendas y generación de outfits con IA |
| Base de datos | PostgreSQL (Supabase) | Almacenamiento relacional |
| Autenticación | Supabase Auth | Login/Registro de usuarios |
| Storage | Supabase Storage | Fotos de prendas |

## 📁 Estructura del Proyecto

```
OutFast/
├── frontend/          # React + Vite (SPA mobile-first)
├── backend-core/      # Spring Boot (Java) — API principal
├── backend-ai/        # FastAPI (Python) — Microservicio de IA
├── docs/              # Documentación técnica
└── docker-compose.yml # Orquestación local
```

## 🚀 Requisitos Previos

- **Java 17+** (para Spring Boot)
- **Python 3.11+** (para FastAPI)
- **Node.js 18+** (para React/Vite)
- **Docker** (opcional, para ejecutar todo con docker-compose)

## ⚙️ Instalación y Ejecución Local

Existen dos formas de ejecutar OutFast localmente: usando Docker Compose (recomendado) o corriendo cada servicio manualmente.

### Opción 1: Docker Compose (Recomendado)

Esta es la forma más rápida, ya que levanta la base de datos PostgreSQL, el backend Core, el backend AI y el Frontend en un solo comando.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/cyonalva20/OutFast.git
   cd OutFast
   ```

2. Configura las variables de entorno de la IA:
   Copia el archivo `.env.example` en `backend-ai/`:
   ```bash
   cp backend-ai/.env.example backend-ai/.env
   ```
   Edita `backend-ai/.env` y añade tu `AI_API_KEY` (Gemini API Key).

3. Levanta los contenedores:
   ```bash
   docker compose up --build
   ```

4. Accede a la aplicación:
   - Frontend (UI): [http://localhost:5173](http://localhost:5173)
   - Backend Core (API): [http://localhost:8080](http://localhost:8080)
   - Backend AI (Docs): [http://localhost:8000/docs](http://localhost:8000/docs)

### Opción 2: Ejecución Manual

Si necesitas desarrollar o debuggear un servicio específico:

1. **Base de datos (PostgreSQL)**
   ```bash
   docker compose up postgres -d
   ```

2. **Backend AI (FastAPI)**
   ```bash
   cd backend-ai
   cp .env.example .env # Añade tu API KEY
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Backend Core (Spring Boot)**
   ```bash
   cd backend-core
   ./mvnw spring-boot:run
   ```

4. **Frontend (React/Vite)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📚 Documentación de la API

La aplicación principal se comunica con el **Backend Core** (Spring Boot).
Todas las peticiones para el MVP requieren el header: `X-User-Id: a1b2c3d4-e5f6-7890-abcd-ef1234567890`.

### Prendas (Clothing Items)
- `GET /api/items` - Lista todas las prendas del usuario
- `GET /api/items?status=LIMPIO` - Filtra por estado (LIMPIO/SUCIO)
- `POST /api/items` - Crea una prenda nueva
- `PATCH /api/items/{id}` - Actualiza una prenda (color, categoría, etc.)
- `PATCH /api/items/{id}/status` - Cambia el estado (LIMPIO/SUCIO)
- `DELETE /api/items/{id}` - Elimina una prenda

### Outfits
- `GET /api/outfits` - Lista los outfits guardados (favoritos)
- `POST /api/outfits/generate-daily` - Obtiene (o genera) el "outfit del día"
- `PATCH /api/outfits/{id}/favorite` - Marca o desmarca un outfit como favorito

### Preferencias
- `GET /api/preferences` - Obtiene las preferencias de estilo del usuario
- `PUT /api/preferences` - Actualiza las preferencias de estilo

## 📄 Licencia

Este proyecto es privado y propiedad de sus autores.
