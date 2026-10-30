# Concierge Ibiza — web

Next.js 15 (App Router) · TypeScript · Tailwind CSS · estructura shadcn/ui.

Storyboard y validación geográfica: [`../docs/fase-1-storyboard.md`](../docs/fase-1-storyboard.md).

## Estructura

| Ruta | Qué es |
|---|---|
| `app/page.tsx` | Página: intro, escenario 3D, capa comercial, formulario |
| `app/concierge.css` | Estilos de la marca (paleta, tipografía, recorrido) |
| `components/ui/` | Componentes de interfaz al estilo shadcn (`liquid-glass-navbar.tsx`) |
| `components/site-nav.tsx` | Menú de cristal líquido conectado al recorrido |
| `components/journey-scripts.tsx` | Carga en orden Cesium, GSAP y `public/js` |
| `public/js/config.js` | Escenas, cámara, servicios, WhatsApp — **lo que se edita** |
| `public/js/world.js`, `public/js/app.js` | Mapa (Cesium + Google 3D Tiles) y scroll |

`components.json` sigue el formato de shadcn, así que `npx shadcn add <componente>` instala
en `components/ui`. Esa carpeta es la que esperan los componentes copiados (`@/components/ui/...`).

## Desarrollo

```bash
cd web
npm install
npm run dev        # http://localhost:3000/?key=TU_GOOGLE_MAPS_KEY
npm run build
```

Sin `?key=` se ve una vista previa con fotografía de satélite. En producción, pon la key en
`public/js/config.js` (`googleMapsApiKey`) y restríngela a tu dominio.

## Publicar en Vercel

Importa el repositorio y pon **Root Directory: `web`**. Vercel detecta Next.js solo.
