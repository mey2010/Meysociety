# Mey Society — Design System (MASTER)

Fuente de verdad del diseño de la web nueva (`mey-society/`). Sintetizado con la skill **ui-ux-pro-max** (`--design-system`, dials variance 6 · motion 9 · density 3) y búsquedas de color, tipografía, landing y GSAP. Donde la base de datos devolvía algo genérico se ha adaptado; cada adaptación se indica.

## Producto
Concierge privado en Ibiza: villas (villa propia en Cala Molí), yates y barcos, motos de agua, coches de lujo, restaurantes, beach clubs, clubs y guest lists. Público: viajeros de alto poder adquisitivo, mayoritariamente en móvil, decidiendo rápido. Objetivo: contacto por WhatsApp en un toque.

## Patrón de página — Scroll-Triggered Storytelling (DB: `landing`)
Intro (gancho) → capítulos → clímax → CTA final, con una mini-CTA al final de cada capítulo e indicador de progreso.

1. **Intro**: vuelo saliendo de las nubes hacia la Ibiza real (Google Photorealistic 3D Tiles).
2. **Capítulos de servicio** (uno por parada del vuelo): villa en Cala Molí → mar (yates, motos de agua) → carretera (coches) → atardecer (restaurantes, beach clubs) → noche (clubs y guest lists).
3. **Clímax — Guest lists**: calendario de noches con disponibilidad real y pack "Night out".
4. **Mapa de lugares**: todos los clubs, beach clubs y la villa.
5. **CTA final**: concierge en una conversación.

Reglas del patrón: la narrativa se entiende sin efectos de scroll; con reduced motion cada capítulo se muestra en su estado final y sin scrub; los efectos se pausan fuera de pantalla.
Adaptación: el patrón de la DB pedía testimonios. **No se usan hasta tener testimonios reales verificados.**

## Estilo — Liquid Glass (DB: `style`)
Solo para el cromo (menú en cápsula, botones flotantes, hojas inferiores, chips del mapa) sobre medios a sangre completa. Nunca para bloques de lectura largos. Requisitos de la DB: texto con contraste 4.5:1 sobre el vidrio, teclado, foco visible, reduced motion.

## Color (adaptado: la DB devolvió navy/oro en claro; la web es nocturna y cinematográfica)
Contraste medido contra `bg` y `surface`.

| Token | Hex | Uso | Contraste bg / surface |
|---|---|---|---|
| `--bg` | `#07111A` | Mar de noche, fondo | — |
| `--surface` | `#0E1B26` | Tarjetas, hojas | — |
| `--fg` | `#F4EFE6` | Texto principal (arena) | 16.6 / 15.2 |
| `--muted` | `#A9B4BE` | Texto secundario | 9.0 / 8.3 |
| `--gold` | `#C9A15B` | Acento, CTA principal (texto `--bg` encima: 7.9) | 7.9 / 7.3 |
| `--sea` | `#45C1D3` | Turquesa Ibiza: mapa, estados vivos | 8.9 / 8.2 |
| `--ok` | `#5CC38A` | Guest list disponible | 8.7 / 8.0 |
| `--warn` | `#E7B44C` | Pocas plazas (siempre con texto, nunca solo color) | 10.0 / 9.2 |

## Tipografía — Luxury Serif (DB: `typography`)
- Display: **Cormorant** 300–500, titulares grandes, tracking ligeramente negativo.
- UI y texto: **Montserrat** 300–600; base 16 px, interlineado 1.5.
- Etiquetas: Montserrat 500, mayúsculas, tracking amplio, 12–13 px.

## Espaciado
Densidad 3 (amplio): escala 24 · 32 · 48 · 64 · 96 px. Gutter móvil 20 px.

## Movimiento (DB: `gsap`, `ux` §7)
- Scroll con scrub 0.5–1.5, nunca saltos. Lenis para scroll suave, desactivado con reduced motion.
- Como mucho 1–2 secciones fijadas (pin). Parallax solo en capas de fondo (yPercent 5–15), nunca en texto.
- Solo `transform` y `opacity`. `will-change` solo durante la animación.
- Entradas 400–700 ms con `expo.out`; salidas más rápidas que entradas. Microinteracciones 150–300 ms.
- Un único bucle de animación que guía Cesium, three.js y GSAP.

## Anti-patrones (DB)
- Fotos pobres: solo fotografía y vídeo de calidad. Material del cliente para villa, barcos y coches.
- Reserva compleja: todo termina en WhatsApp con el mensaje rellenado.
- Emojis como iconos (usar Lucide). Escasez o reseñas inventadas.

## Checklist antes de entregar (DB)
- [ ] Sin emojis como iconos; SVG Lucide
- [ ] Hover y foco visibles, 150–300 ms
- [ ] Contraste ≥ 4.5:1 (medido arriba)
- [ ] prefers-reduced-motion respetado
- [ ] Responsive 375 · 768 · 1024 · 1440 px, sin scroll horizontal
- [ ] Objetivos táctiles ≥ 44×44 px
