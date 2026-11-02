# Mey Society — web

Next.js 15 (App Router) · TypeScript · Tailwind CSS · estructura shadcn/ui · Framer Motion · GSAP ScrollTrigger · Lenis · CesiumJS.

- Storyboard y validación geográfica: [`../docs/fase-1-storyboard.md`](../docs/fase-1-storyboard.md)
- Estrategia legal de paquetes, listas y ventajas: [`../docs/estrategia-legal-paquetes.md`](../docs/estrategia-legal-paquetes.md)

## Páginas

| Ruta | Qué es |
|---|---|
| `/` | Recorrido 3D por la Ibiza real (escenas 01 → 08), servicios, mapa de la isla, configurador de estancia, área privada, cómo trabajamos, preguntas, contacto |
| `/login` | Acceso al área privada (sesión de **demostración**) |
| `/panel` | Panel del cliente: itinerario día a día que se completa solo con la hora de Ibiza |
| `/legal` | Aviso legal, privacidad, cookies y condiciones (plantilla pendiente de revisión legal) |

## Dónde se edita cada cosa

| Archivo | Contenido |
|---|---|
| `lib/content.ts` | **Todo el contenido**: marca, WhatsApp, datos legales, imágenes, escenas y cámaras, servicios, paquetes, ventajas, lugares del mapa, preguntas |
| `lib/itinerary.ts` | Itinerario de demostración del panel (en producción, desde la base de datos de reservas) |
| `lib/auth.ts`, `app/api/session/route.ts`, `middleware.ts` | Sesión de demostración (sustituir por Supabase Auth, Clerk o Auth.js) |
| `lib/geo.ts`, `lib/island-geo.ts` | Proyección del mapa, contorno real de la isla y cálculo de la puesta de sol |
| `lib/journey/` | Recorrido 3D: Cesium + Google Photorealistic 3D Tiles y la cámara guiada por el scroll |
| `components/capsule-menu.tsx` | Menú cápsula de cristal líquido que se pliega al hacer scroll y se despliega en panel |
| `components/ui/liquid-glass.tsx` | Cristal líquido con refracción real (Chromium) y `GlassButton` |
| `components/ui/liquid-glass-navbar.tsx` | Barra de agua líquida (pestañas del panel en móvil) |
| `components/sections/` | Secciones de la home |
| `components/dashboard/` | Inicio de sesión, panel y línea de tiempo |
| `app/globals.css`, `app/styles/` | Tokens de marca y estilos por zona |

## Desarrollo

```bash
cd web
npm install
npm run dev        # http://localhost:3000/?key=TU_GOOGLE_MAPS_KEY
npm run build
```

### Variables de entorno

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Key de Google Maps Platform con **Map Tiles API**. Restríngela a tu dominio. Sin key se ve satélite de Esri (vista previa). |
| `NEXT_PUBLIC_CESIUM_BASE` | Opcional: otra ruta para Cesium (por defecto, jsDelivr 1.120.0) |
| `DEMO_EMAIL`, `DEMO_CODE` | Opcional: acceso de demostración del área privada (por defecto `demo@concierge-ibiza.com` / `IBIZA2026`) |

Parámetros de URL útiles: `?key=…` (key de Google para probar), `?map=off` (modo editorial sin 3D).

### Contorno de la isla

`lib/island-geo.ts` se genera desde Natural Earth 10m (dominio público):

```bash
curl -L -o /tmp/ne_10m_land.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
node scripts/build-island.mjs /tmp/ne_10m_land.geojson
```

## Imágenes

Las fotos de `MEDIA` en `lib/content.ts` son de Unsplash (licencia Unsplash) y **representativas**:
no muestran villas, barcos ni locales concretos. Sustitúyelas por las fotos propias poniendo el
archivo en `public/media/` y su ruta en `src`. Si una imagen no carga, se ve un campo de color con
su pie, nunca un icono roto.

## Pendiente antes de publicar

- ⚠️ WhatsApp, teléfono, email y datos legales en `BRAND` (`lib/content.ts`).
- ⚠️ Fotos propias y número de registro de cada villa.
- ⚠️ Zona real de las villas, puerto base de la flota, zona autorizada de motos de agua y ruta de coches (escenas 02–05, `verified: false`).
- ⚠️ Sesión real y base de datos de reservas para `/panel`.
- ⚠️ Revisión legal de `/legal` y de la estrategia de paquetes.

## three.js

`three` (r187) está instalado como dependencia para escenas 3D propias en componentes de cliente:

```tsx
"use client"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
```

## Analizar el vuelo de cámara

`../tools/camera_path.py` lee las escenas de `lib/content.ts`, reproduce la interpolación de `lib/journey/run.ts` + `world.ts` y muestra, por cada
tramo `travel`, los picos por pantalla de scroll (km, zoom, giro, pitch). Úsalo al cambiar keyframes:

```bash
pip install -r ../tools/requirements.txt
python3 ../tools/camera_path.py
```

Si un tramo sale marcado con `!`, sube su `travel` o acerca los keyframes.

## Publicar en Vercel

Importa el repositorio y pon **Root Directory: `web`**. Añade `NEXT_PUBLIC_GOOGLE_MAPS_KEY` en las variables de entorno.
