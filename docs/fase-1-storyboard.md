# Concierge Ibiza — Fase 1: validación geográfica, storyboard y trayectorias de cámara

Estado: **escenas 01 → 08 implementadas** en `web/` (cámaras en `web/lib/content.ts`). Siguen como
provisionales (`verified: false`, con el aviso «Location pending validation»): **02 villas**,
**04 motos de agua** y **05 coches**, hasta tener la zona real de las villas, la zona autorizada
del operador y la ruta que usáis con clientes. La estrategia legal de paquetes está en
[`estrategia-legal-paquetes.md`](estrategia-legal-paquetes.md).
Todo lo marcado como ⚠️ **PENDIENTE** requiere validación tuya o de una fuente oficial antes de mostrarse como real.

---

## 1. Decisión técnica clave (leer primero)

El brief exige una **Ibiza real y verificable** (punto 2). Eso condiciona toda la arquitectura:

| Enfoque | Ibiza real | Cumple licencia Google | Comentario |
|---|---|---|---|
| **A. CesiumJS + Google Photorealistic 3D Tiles en vivo** (recomendado) | ✅ Sí | ✅ Sí, con atribución visible | La cámara vuela por la isla real renderizada en el navegador. El scroll controla la cámara (GSAP ScrollTrigger). |
| B. Vídeo IA pre-renderizado (pipeline del skill scroll-world) | ❌ No | — | Genera una isla "estilo Ibiza" inventada. Contradice el requisito absoluto del punto 2. Descartado para escenas geográficas. |
| C. Grabar vídeo de Google 3D Tiles y reproducirlo | ✅ | ❌ No | Las condiciones de Map Tiles API no permiten pre-capturar, almacenar ni redistribuir el contenido fuera del render en vivo. Descartado. |

**Arquitectura propuesta (enfoque A):**

- **Capa geográfica:** CesiumJS + Google Photorealistic 3D Tiles. Un único visor, sin Three.js (no mezclar sistemas sin necesidad, punto 6). Cesium carga modelos glTF (barcos, coches) directamente.
- **Control de cámara:** GSAP + ScrollTrigger animan una línea de tiempo de "keyframes geográficos" (lat, lon, altura, heading, pitch). Entre keyframes se interpola en coordenadas ECEF para curvas suaves. En los bloques comerciales la cámara frena (*linger*), una idea tomada del skill scroll-world.
- **Capa comercial:** HTML/CSS por encima del visor, con tarjetas, formulario concierge multiservicio y WhatsApp. Separada del mundo 3D (punto 6).
- **Contenido real del cliente:** fotos y vídeos propios de villas, flota, coches y experiencias. Aparecen con máscaras y transiciones dentro del recorrido. Nunca se usan imágenes generadas que se hagan pasar por reales.
- **Fallback** (móviles de gama baja, `prefers-reduced-motion`, sin WebGL): versión editorial con fotografía real y mapa estático con atribución. Sin 3D.

**Limitación honesta:** las 3D Tiles fotorrealistas llevan la **iluminación diurna "horneada"** en las texturas. Cesium puede mover el sol, añadir atmósfera, niebla y etalonaje, pero **no puede convertir de forma físicamente real esas texturas en noche**. Para las escenas 06–07 (atardecer → noche) propongo:

- etalonaje progresivo del visor;
- un fundido controlado hacia **vídeo nocturno real** de los locales asociados.

---

## 2. Validación geográfica (fuente: conocimiento cartográfico; coordenadas aproximadas a confirmar en Google Maps / Earth)

| Lugar | Municipio | Coordenadas aprox. | Uso en el recorrido | Estado |
|---|---|---|---|---|
| Eivissa: Dalt Vila (Patrimonio UNESCO) y puerto | Eivissa | 38.907 N, 1.436 E | Escena 01 (llegada), 07 | ✅ Lugar real verificable |
| Marina Ibiza / Marina Botafoch | Eivissa | 38.913 N, 1.445 E | Escena 03 (salida de barcos), 07 | ✅ Real · ⚠️ ¿desde qué puerto opera tu flota? |
| Es Vedrà y Cala d'Hort | Sant Josep | 38.867 N, 1.198 E | Escena 03 (ruta en yate), 08 | ✅ Real |
| Cala Bassa / Cala Comte | Sant Josep | 38.965 N, 1.23 E | Escena 04 o 06 (costa oeste, puesta de sol) | ✅ Real · ⚠️ uso de motos de agua por verificar |
| Badia de Sant Antoni | Sant Antoni | 38.980 N, 1.300 E | Escena 04 (motos de agua) y 06 (puesta de sol) | ✅ Real · ⚠️ zona de actividad por verificar |
| Ses Salines (Parque Natural) | Sant Josep | 38.835 N, 1.396 E | Vista aérea solamente | ✅ Real · **sin actividades motorizadas en el parque** |
| Platja d'en Bossa | Sant Josep | 38.880 N, 1.410 E | Escena 07 (vida nocturna, beach clubs) | ✅ Real · ⚠️ locales concretos solo con acuerdo |
| Santa Eulària des Riu (puerto deportivo) | Santa Eulària | 38.983 N, 1.537 E | Alternativa de base náutica | ✅ Real |
| Aeropuerto de Ibiza (IBZ) | Sant Josep | 38.873 N, 1.373 E | Escena 05 (traslados privados) | ✅ Real |

**Reglas que aplicaré:**

- **Motos de agua:** en Baleares solo operan en zonas y canales balizados autorizados (Capitanía Marítima) y está prohibido fondear sobre praderas de *Posidonia oceanica*. No mostraré motos de agua en ninguna cala hasta que me indiques **la zona exacta donde opera tu proveedor**, contrastada con la autorización.
- **Villas:** no se mostrará ninguna "villa real" que no sea una propiedad de tu cartera. Necesito ubicación aproximada (zona, no dirección exacta si es privada) y fotos autorizadas.
- **Restaurantes, beach clubs y clubs:** solo los que tengan relación comercial contigo. Nombrarlos implica representarlos.
- **Carretera costera:** ⚠️ **PENDIENTE**. Ibiza tiene pocas carreteras pegadas a la costa. Propón tú la ruta que usáis con clientes (por ejemplo, el acceso a Cala d'Hort con vista a Es Vedrà) y la verifico sobre el mapa.

---

## 3. Cobertura de Google Photorealistic 3D Tiles

⚠️ **PENDIENTE de comprobar con tu API key.** Google Earth muestra 3D fotogramétrico en Eivissa ciudad y buena parte de la costa, pero la cobertura de cada escena se verifica cargando el tileset en cada punto. Con la key haré una prueba técnica por escena e indicaré qué escenas tienen 3D de calidad y cuáles solo relieve y ortofoto.

Requisitos por tu parte:

- Proyecto en Google Cloud con **Map Tiles API** activada y facturación habilitada.
- API key restringida por dominio (HTTP referrer).

---

## 4. Storyboard (8 escenas · ~14 pantallas de scroll)

| # | Escena | Cámara (trayectoria real) | Luz | Contenido comercial | Dependencia |
|---|---|---|---|---|---|
| 01 | **IBIZA, WITHOUT LIMITS.** | Empieza a ~60 km de altura con las Pitiusas completas (Ibiza + Formentera). Desciende en espiral suave hacia el suroeste. | Mediodía | Titular + subtítulo + CTA secundario | API key |
| 02 | Private Villas | Baja hacia la costa suroeste (zona por confirmar) hasta ~300 m. Transición con máscara: el agua del mar enlaza con el **vídeo real de la piscina** de tu villa. | Mediodía → tarde | 2–3 villas (fotos reales, capacidad, zona) | ⚠️ villas + material |
| 03 | Yacht Experiences | Sale al mar y sigue la costa hacia Es Vedrà. Modelo glTF del barco **solo si está autorizado** (o etiquetado como "representativo"). | Tarde | Flota: eslora, plazas, base | ⚠️ flota + puerto base |
| 04 | Jet Ski & Water | Vuelo rasante hacia la zona autorizada. | Tarde | Motos de agua, tours, actividades | ⚠️ zona autorizada |
| 05 | Luxury Cars | Ascenso desde el mar a la carretera verificada; travelling lateral. | Golden hour temprana | Flota de coches + traslados al aeropuerto | ⚠️ ruta + flota |
| 06 | Fine Dining | Costa oeste (Sant Antoni / Cala Comte, orientada a poniente), terraza al atardecer. | Golden hour | Restaurantes asociados, chef privado | ⚠️ socios |
| 07 | Nightlife & VIP | Vuelo hacia Platja d'en Bossa / Marina Botafoch, con etalonaje progresivo a noche y fundido a vídeo nocturno real. | Atardecer → noche | Beach clubs, mesas VIP | ⚠️ socios + vídeo |
| 08 | **YOUR IBIZA EXPERIENCE STARTS HERE.** | Retroceso panorámico a toda la isla. | Noche suave / azul | **CREATE YOUR PRIVATE EXPERIENCE** → formulario multiservicio + WhatsApp | número WhatsApp |

**Ritmo:** en cada escena la cámara se mueve deprisa entre localizaciones y se **detiene casi por completo** mientras aparecen las tarjetas comerciales (requisito del punto 5).

---

## 5. Paleta y tipografía propuestas

| Token | Hex | Uso |
|---|---|---|
| Deep Mediterranean | `#0E3A5B` | Acento principal, botones |
| Warm Ivory | `#F6F1E7` | Fondos editoriales, texto sobre oscuro |
| Limestone | `#D9CDB8` | Separadores, tarjetas |
| Sand Beige | `#C8A97E` | Detalles, hover, eyebrows |
| Charcoal | `#1C1C1E` | Texto, fondo nocturno |

Tipografía: serif editorial para titulares (p. ej. *Cormorant Garamond*) + sans geométrica para interfaz (p. ej. *Inter*).

---

## 6. Lo que necesito de ti para pasar a la Fase 2 (prototipo de la escena 01 → 02)

1. **Google Maps API key** con Map Tiles API activada.
2. **Logo** y nombre comercial exacto ("Concierge Ibiza").
3. **Número de WhatsApp** y email de contacto.
4. **Villas:** fotos y vídeo autorizados de al menos 1 villa + zona aproximada.
5. **Puerto base** de los barcos y **zona autorizada** de las motos de agua.
6. Confirmar si es **solo landing** o web completa (catálogos, páginas de detalle, multidioma ES/EN).
