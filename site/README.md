# Concierge Ibiza — prototipo Fase 2 (escenas 01 → 02)

Recorrido por la Ibiza real guiado por el scroll:

- **Mapa:** CesiumJS + Google Photorealistic 3D Tiles.
- **Cámara:** GSAP ScrollTrigger.
- **3D propio:** three.js r187, cargado desde jsDelivr mediante un import map en `index.html`. Úsalo desde cualquier `<script type="module">` con `import * as THREE from 'three'` y `import { OrbitControls } from 'three/addons/controls/OrbitControls.js'`.
- **Contenido:** capa comercial en HTML, formulario concierge multiservicio y WhatsApp.

Storyboard y validación geográfica: [`../docs/fase-1-storyboard.md`](../docs/fase-1-storyboard.md).

## Ver en local

```bash
cd site && python3 -m http.server 8000
# http://localhost:8000/?key=TU_GOOGLE_MAPS_KEY
```

Sin `?key=` se carga una vista previa con OpenStreetMap. La geografía es real, pero sin relieve 3D.

## Configuración (`js/config.js`)

- `googleMapsApiKey`: key con **Map Tiles API** activada. En producción, restringe la key por dominio.
- `whatsapp`, `email`: ⚠️ ahora mismo son placeholders.
- `scenes[]`: keyframes de cámara (lon, lat, altura, heading, pitch).
  - `travel` = pantallas de scroll que dura el vuelo.
  - `hold` = pantallas de scroll en las que la cámara se detiene para leer.
  - `verified: false` muestra el aviso "Location pending validation".

## Pendiente

- Fotos y vídeo reales de las villas: `.card-media` y `#villa-mask .villa-media`.
- Zona real de las villas: sustituye el keyframe provisional sobre Cala d'Hort.
- Escenas 03–08, que se añadirán una a una según la metodología.

## Analizar el vuelo de cámara (`tools/camera_path.py`)

Script de Python que reproduce la interpolación de la web (`stateAt` + `lerpCamera`), la muestrea con [Numba](https://numba.pydata.org/) y muestra, por cada tramo `travel`, los picos de velocidad por pantalla de scroll: km sobre el suelo, factor de zoom, giro y pitch.

```bash
pip install -r tools/requirements.txt
python3 tools/camera_path.py            # umbrales por defecto (amplios)
python3 tools/camera_path.py --max-heading 90 --max-pitch 45   # más estricto
```

Úsalo al cambiar keyframes en `js/config.js`: si un tramo sale marcado con `!`, sube su `travel` o acerca los keyframes. Sale con código 1 si algún tramo supera un umbral. Necesita Node.js para leer `config.js`.
