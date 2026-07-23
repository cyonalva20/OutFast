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

## ⚙️ Instalación y Ejecución

> ⚠️ Instrucciones detalladas próximamente. El proyecto está en fase de desarrollo activo.

## 📄 Licencia

Este proyecto es privado y propiedad de sus autores.
