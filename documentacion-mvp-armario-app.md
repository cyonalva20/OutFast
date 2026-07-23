# Documentación Técnica — MVP "OutFast" (App de Armario Inteligente)

> Nombre de trabajo: **OutFast**. Puede cambiarse más adelante sin impacto técnico; se usa aquí solo como referencia del proyecto.

## 1. Contexto y objetivo del producto

Aplicación web que permite al usuario catalogar su ropa digitalmente, marcar qué prendas están limpias o sucias, y recibir sugerencias automáticas de outfits generadas por IA a partir de las prendas disponibles.

**Objetivo del MVP:** validar si los usuarios encuentran valor en catalogar su ropa y recibir recomendaciones automáticas, antes de invertir en funciones sociales o de personalización avanzada.

**Fuera de alcance en este MVP (no construir todavía):**
- Feed social / outfits creados por otros usuarios / votos
- Sistema de "me gusta" con recomendación por similitud
- Recomendaciones basadas en clima o ubicación
- Marketplace o venta de prendas
- Notificaciones push (el "outfit del día" se dispara al abrir la app, no por push, en este MVP)

**Sí incluidas en este MVP (agregado tras validar el caso de uso real: mañanas con prisa antes de la universidad):**
- Outfit del día generado automáticamente al abrir la app (sin que el usuario tenga que pedirlo)
- Generar outfit a partir de una prenda base elegida por el usuario

---

## 2. Stack tecnológico recomendado

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React (Vite) | SPA simple, responsive, mobile-first |
| Backend Core | Spring Boot (Java) | API REST principal, manejo de DB, reglas de negocio, y máxima seguridad (Spring Security) |
| Backend AI | FastAPI (Python) | Microservicio interno rápido para inferencia de modelos, preparado para alojar CNNs propios a futuro |
| Base de datos | PostgreSQL vía Supabase | Incluye auth y storage de imágenes |
| Autenticación | Supabase Auth | Email + password para MVP |
| Storage de imágenes | Supabase Storage | Bucket público o firmado para fotos de prendas |
| Clasificación de imágenes | API de visión de un modelo LLM (Claude o Gemini, vía API con soporte de imágenes) | No se entrena modelo propio |
| Hosting frontend | Vercel | Free tier |
| Hosting backend | Render o Railway | Free tier |

---

## 3. Modelo de datos

### Tabla `users`
Gestionada por Supabase Auth (no se crea manualmente, se usa `auth.users`).

### Tabla `clothing_items`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid, PK | Identificador único |
| user_id | uuid, FK -> auth.users | Dueño de la prenda |
| image_url | text | URL de la foto en Storage |
| category | text | camisa, pantalón, zapatos, chaqueta, accesorio, etc. |
| color | text | Color principal detectado |
| style_tags | text[] | ej. ['casual', 'formal', 'deportivo'] |
| status | text | 'limpio' \| 'sucio' — default 'limpio' |
| last_worn_at | timestamp, nullable | Última vez usada |
| created_at | timestamp | Default now() |

### Tabla `outfits`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid, PK | Identificador único |
| user_id | uuid, FK | Dueño |
| created_at | timestamp | Default now() |
| is_favorite | boolean | Default false |
| generated_by | text | 'ai' \| 'manual' |
| generation_type | text | 'daily_auto' \| 'manual_request' \| 'from_base_item' |
| base_item_id | uuid, nullable, FK -> clothing_items | Si se generó a partir de una prenda base |
| is_outfit_of_the_day | boolean | Default false — marca si fue el outfit del día vigente |

### Tabla `user_preferences`
| Campo | Tipo | Descripción |
|---|---|---|
| user_id | uuid, PK, FK -> auth.users | |
| preferred_styles | text[] | ej. ['casual', 'formal'] — elegido en onboarding |
| updated_at | timestamp | |

### Tabla `outfit_items` (relación N:N)
| Campo | Tipo | Descripción |
|---|---|---|
| outfit_id | uuid, FK -> outfits | |
| item_id | uuid, FK -> clothing_items | |

---

## 4. Endpoints de la API (backend)

### Auth
- Gestionado directo por Supabase Auth SDK en frontend (no requiere backend propio para login/registro)

### Prendas
- `POST /api/items` — sube una prenda: recibe imagen, la guarda en Storage, llama a la API de visión, guarda resultado clasificado en `clothing_items`
- `GET /api/items` — lista todas las prendas del usuario autenticado
- `GET /api/items?status=limpio` — filtra por estado
- `PATCH /api/items/:id` — actualiza estado (limpio/sucio) o cualquier campo editable
- `DELETE /api/items/:id` — elimina una prenda

### Outfits
- `POST /api/outfits/generate` — genera sugerencia de outfit: trae prendas con `status=limpio` del usuario, las envía a la IA con un prompt de combinación, recibe 2-3 combinaciones sugeridas, las devuelve (sin guardar aún)
- `POST /api/outfits/generate-daily` — genera (o devuelve si ya existe) el outfit del día vigente; se llama automáticamente la primera vez que el usuario abre la app en el día. Si ya hay un `outfit_of_the_day` marcado como vigente para hoy, lo devuelve directo sin volver a llamar a la IA (ahorra costo)
- `POST /api/outfits/generate-from-item` — recibe `item_id` de una prenda base; genera 2-3 combinaciones que la incluyan, usando el resto de prendas limpias como complemento
- `POST /api/outfits` — guarda un outfit generado o armado manualmente (crea registro en `outfits` + `outfit_items`)
- `GET /api/outfits` — lista outfits guardados del usuario
- `PATCH /api/outfits/:id/favorite` — marca/desmarca como favorito

### Preferencias
- `GET /api/preferences` — obtiene preferencias de estilo del usuario
- `PUT /api/preferences` — guarda/actualiza estilos preferidos (usado en onboarding)

---

## 5. Lógica de integración con la API de visión (clasificación de prendas)

**Flujo:**
1. Usuario sube foto desde el frontend
2. Backend guarda la imagen en Supabase Storage y obtiene la URL pública
3. Backend envía la imagen (como base64 o URL) a la API de visión con un prompt del tipo:
   > "Analiza esta prenda de ropa y devuelve SOLO un JSON con los campos: category (una de: camisa, pantalón, zapatos, chaqueta, vestido, accesorio, otro), color (color principal en español), style_tags (array de hasta 3 tags entre: casual, formal, deportivo, elegante, playero)."
4. Backend parsea la respuesta JSON (quitar posibles ```json``` si vienen) y guarda en `clothing_items`
5. Si la API falla o no devuelve JSON válido, devolver categoría "otro" y permitir edición manual desde el frontend

## 6. Lógica de generación de outfits

**Flujo:**
1. Backend obtiene todas las prendas del usuario con `status = limpio`
2. Arma un prompt para la IA con la lista de prendas (category, color, style_tags de cada una) pidiendo que combine 2-3 outfits coherentes, devolviendo los `id` de las prendas usadas en cada combinación
3. Ejemplo de prompt:
   > "Tienes estas prendas disponibles: [lista]. Sugiere 3 combinaciones de outfit coherentes (cada una con 1 parte superior, 1 inferior y calzado si están disponibles). Devuelve SOLO un JSON: [{ 'outfit_items': ['id1','id2','id3'], 'style': 'casual' }, ...]"
4. Frontend recibe las combinaciones y las muestra como tarjetas con las fotos de las prendas involucradas
5. Usuario puede guardar la combinación que le guste (llamada a `POST /api/outfits`)

## 6.1 Lógica de "Outfit del día"

**Objetivo:** eliminar fricción en el momento real del problema (mañana, con prisa) mostrando una sugerencia sin que el usuario tenga que pedirla.

**Flujo:**
1. Al abrir la app, el frontend llama a `POST /api/outfits/generate-daily`
2. Backend revisa si ya existe un outfit con `is_outfit_of_the_day = true` creado en las últimas ~18 horas para ese usuario
   - Si existe → lo devuelve directo (no vuelve a llamar a la IA)
   - Si no existe → genera uno nuevo igual que `generate`, pero además considera `user_preferences.preferred_styles` en el prompt, lo guarda con `is_outfit_of_the_day = true` y lo devuelve
3. Frontend muestra esto como modal/pop-up apenas carga la pantalla principal, con dos botones: "Usar este" (marca como usado, cierra modal) o "Ver otra opción" (regenera, sin guardar la anterior como outfit del día)

**Regla de negocio importante:** solo puede existir un outfit del día vigente por usuario a la vez. Al generar uno nuevo, el anterior de ese día se desmarca (`is_outfit_of_the_day = false`), no se elimina.

## 6.2 Lógica de "Generar desde prenda base"

**Objetivo:** cuando el usuario ya sabe qué prenda quiere usar y solo necesita ayuda para completar el resto.

**Flujo:**
1. Desde el detalle de una prenda en "Mi Armario", botón "Armar outfit con esta prenda"
2. Frontend llama a `POST /api/outfits/generate-from-item` con el `item_id`
3. Backend arma el prompt incluyendo los detalles de esa prenda como fija y el resto de prendas limpias como opciones, pidiendo a la IA que la combine
4. Se muestran las combinaciones igual que en el flujo normal, con opción de guardar

---

## 7. Pantallas del frontend (MVP)

1. **Login / Registro** — Supabase Auth UI o formulario simple
2. **Onboarding** (solo primera vez) — pide elegir 2-3 estilos preferidos (guarda en `user_preferences`) y guía a subir las primeras prendas
3. **Mi Armario** — grid de fotos de prendas, filtro por estado (todas/limpias/sucias), botón flotante "+ Añadir prenda". Estado vacío con mensaje guía si no hay prendas
4. **Añadir prenda** — formulario de subida de foto + preview de clasificación automática (editable). Estado de error si la IA no logra clasificar (permite completar manualmente)
5. **Pop-up "Outfit del día"** — aparece automáticamente al abrir la app (si no se ha mostrado ya en el día), con botones "Usar este" / "Ver otra opción"
6. **¿Qué me pongo?** — botón principal que dispara `POST /api/outfits/generate`, muestra 2-3 tarjetas de combinaciones con opción de "Guardar" o "Regenerar". Estado de error si no hay suficientes prendas limpias
7. **Detalle de prenda** — vista individual con botón "Armar outfit con esta prenda" (dispara `generate-from-item`)
8. **Mis Outfits guardados** — lista de outfits guardados, marcados como favoritos

---

## 8. Estructura de carpetas sugerida

```
/frontend
  /src
    /components
      UploadForm.jsx
      ClosetGrid.jsx
      ClothingCard.jsx
      OutfitCard.jsx
    /pages
      Login.jsx
      Closet.jsx
      AddItem.jsx
      OutfitSuggestion.jsx
      SavedOutfits.jsx
    /api
      itemsApi.js
      outfitsApi.js
    /lib
      supabaseClient.js
    App.jsx
    main.jsx

/backend-core (Spring Boot)
  /src/main/java/com/outfast
    /controllers
    /services
    /models
    /repositories
  pom.xml
  application.properties

/backend-ai (FastAPI)
  /app
    main.py     # Endpoints de IA invocados por Spring Boot
    /models     # Donde vivirán los modelos CNN / PyTorch en el futuro
  requirements.txt
  .env.example
```

---

## 9. Variables de entorno necesarias

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # solo backend
AI_API_KEY=                   # clave de la API de visión usada
AI_API_URL=
PORT=3000
```

---

## 10. Orden de construcción recomendado (para ir avanzando por etapas)

1. Setup de Supabase: crear proyecto, tablas (incluyendo `user_preferences`), bucket de storage, políticas de acceso (RLS: cada usuario solo ve sus propias prendas y outfits)
2. Auth: login/registro funcionando en frontend
3. Onboarding: selección de estilos preferidos + guía inicial
4. CRUD básico de prendas SIN IA todavía (subir foto, ver grid, marcar limpio/sucio, eliminar), con estado vacío cuando no hay prendas
5. Integrar API de visión para clasificación automática al subir, con manejo de error si falla
6. Endpoint y pantalla de generación de outfits (`generate`), con estado de error si no hay suficientes prendas limpias
7. Outfit del día (`generate-daily`) + pop-up automático al abrir la app
8. Generar desde prenda base (`generate-from-item`) desde el detalle de una prenda
9. Guardar y listar outfits favoritos
10. Pulido general de UI y manejo de errores (fotos que fallan, IA que no responde, etc.)

---

## 11. Criterios de aceptación del MVP

- [ ] Un usuario puede registrarse e iniciar sesión
- [ ] Un usuario elige sus estilos preferidos en el onboarding
- [ ] Un usuario puede subir una foto de una prenda y ver su clasificación automática
- [ ] Un usuario puede editar manualmente la clasificación si la IA se equivoca
- [ ] Un usuario puede marcar una prenda como sucia/limpia
- [ ] Un usuario puede pedir una sugerencia de outfit y solo recibe combinaciones con prendas limpias
- [ ] Al abrir la app, el usuario ve automáticamente su "outfit del día" sin tener que pedirlo
- [ ] El outfit del día no se vuelve a generar innecesariamente si ya existe uno vigente para hoy
- [ ] Un usuario puede elegir una prenda específica y pedir que se arme un outfit alrededor de ella
- [ ] Un usuario puede guardar un outfit sugerido como favorito
- [ ] Si no hay suficientes prendas limpias, la app muestra un mensaje claro en vez de fallar
- [ ] Cada usuario solo puede ver y modificar sus propias prendas y outfits (seguridad a nivel de fila)

---

## 12. Notas para fases futuras (no construir aún, solo referencia)

- **Fase 2:** sistema de "me gusta" a outfits generados, con recomendación por similitud de atributos (color, categoría, estilo) — no requiere ML pesado, es comparación de tags
- **Fase 3:** función social — feed de outfits creados por otros usuarios, sistema de votos, ranking de outfits más populares

## 13. Guía visual (design tokens) para el frontend

**Concepto de dirección:** "etiqueta de ropa" — inspirado en las etiquetas de cuidado/talla que trae toda prenda, combinado con la urgencia de decidir rápido en la mañana. Coherente con el nombre OutFast (outfit + rápido).

### Paleta de colores
| Token | Hex | Uso |
|---|---|---|
| `bg-base` | `#F5F6F4` | Fondo general de la app — gris cálido claro |
| `ink` | `#1B2430` | Texto principal, azul-negro tipo tinta |
| `accent-primary` | `#FF5A36` | Coral de mañana — CTAs principales, botón "Outfit del día" |
| `accent-secondary` | `#3E5C76` | Azul mezclilla — elementos secundarios, links, iconos |
| `status-clean` | `#8FBF6F` | Indicador visual de prenda "limpia" |
| `status-dirty` | `#C9C2B8` (gris cálido apagado) | Indicador visual de prenda "sucia" — no usar rojo, no es un error |

No usar fondo crema (#F4F1EA) ni acento terracota (#D97757) — son los defaults genéricos de diseño con IA, evitar para que OutFast no se vea como "otra app hecha con IA".

### Tipografía
- **Display (títulos, nombre de la app):** sans condensada bold — ej. Archivo Black o Barlow Condensed. Usar con moderación, solo en headers y CTAs grandes
- **Cuerpo (texto general, descripciones):** sans humanista — ej. Inter. Legible, neutra
- **Utilitaria (categorías, contadores, timestamps, "outfit del día"):** monoespaciada — ej. IBM Plex Mono. Refuerza la idea de "etiqueta impresa"

### Layout
- Mobile-first estricto — el caso de uso real es el celular en la mano, saliendo de casa
- Tarjetas de prendas y outfits en grid de 2 columnas en mobile
- El pop-up de "Outfit del día" ocupa la pantalla casi completa al abrir la app, con las prendas sugeridas grandes y legibles, y los dos botones ("Usar este" / "Ver otra opción") fijos abajo, alcanzables con el pulgar

### Elemento distintivo (signature)
Las tarjetas de prenda y de outfit tienen forma de "hangtag": rectángulo con esquinas redondeadas (radius ~12px) y un pequeño círculo recortado en la esquina superior izquierda, simulando el agujero de una etiqueta de ropa colgada. Se usa únicamente en estas tarjetas — el resto de la interfaz (botones, inputs, modales) se mantiene limpio y sin esta forma, para que el detalle no pierda fuerza por repetirse en todos lados.

### Accesibilidad y calidad base
- Contraste de texto sobre `bg-base` debe cumplir AA mínimo
- Focus visible en todos los elementos interactivos (importante para navegación por teclado en la versión web)
- Respetar `prefers-reduced-motion` si se agregan animaciones (ej. transición del pop-up de outfit del día)

