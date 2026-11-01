# Master prompt — Concierge Ibiza web

Pégalo en una sesión nueva de Claude Code del entorno **MeySocietyWEB**, con el repo **MEY-** seleccionado. Antes, rellena los campos entre corchetes.

```
## Objective
Convertir la web de Concierge Ibiza (repo MEY-, carpeta web/) en una experiencia de scroll cinematográfica de nivel premium (sensación de web de 20.000 €): un avión sale de las nubes, la cámara hace zoom continuo hacia la Ibiza real con fotorrealismo, y cada tramo del vuelo desemboca en un servicio y en una forma clara de reservarlo. El objetivo de negocio es generar contactos por WhatsApp y cerrar ventas, incluidas las guest lists de clubs.

## Context (carry forward)
- Negocio: concierge privado en Ibiza. Servicios: villas, yates/barcos, motos de agua, coches de lujo, restaurantes, beach clubs, clubs/VIP y guest lists.
- Stack existente: Next.js 15 (App Router) + TypeScript + Tailwind + estructura shadcn en web/. Mapa 3D con CesiumJS + Google Photorealistic 3D Tiles; scroll con GSAP ScrollTrigger; three.js 0.187 instalado.
- La rama concierge-experience-v2 ya tiene las 8 escenas sobre la Ibiza real, liquid glass, minimapa, gradación de luz de mediodía a noche y área de cliente (web/lib/content.ts, web/lib/journey/*). Parte SIEMPRE de esa rama; no rehagas lo que ya funciona.
- tools/camera_path.py analiza la velocidad de cámara por tramo; apúntalo a web/lib/content.ts si las escenas están ahí.
- Storyboard y validación geográfica: docs/fase-1-storyboard.md.
- Datos de marca: nombre Mey Society, email meysociety@protonmail.com, WhatsApp [NÚMERO INTERNACIONAL SIN +], idiomas [ES/EN/…]. Trabaja con todos los clubs y beach clubs de Ibiza. La villa está en Cala Molí (costa oeste); verifica sus coordenadas antes de usarlas.

## Skills que DEBES usar (léelas antes de la fase a la que aplican)
- Dirección de arte y composición: design-taste-frontend (incluye su inspector en navegador real y el bucle de capturas), ui-ux-pro-max, brand, design-system.
- Movimiento: animate (para cada animación nueva), apple-design (gestos, muelles, materiales translúcidos, botones flotantes), emil-design-eng (pulido y detalles invisibles).
- Rendimiento: animation-performance (solo transform/opacity, nada de layout en scroll).
- Revisión: review-animations e improve-animations para auditar, remove-animations para quitar lo que sobre, find-animation-opportunities solo para huecos concretos.
- Móvil y robustez: mobile-native (100vh, notch, tap highlight, zoom de inputs) y break-ui (datos extremos en tarjetas, listas y formulario).
- Agentes ECC para la revisión final: ecc:react-reviewer, ecc:performance-optimizer, ecc:a11y-architect, ecc:seo-specialist.
- scroll-world solo si te lo pido: genera vídeo con Higgsfield/Monid y tiene coste.

## Target State
1. Intro: al cargar, la cámara está dentro de un banco de nubes y el visitante ve un ala de avión. Con el scroll, las nubes se abren, el ala se va y aparece el Mediterráneo con Ibiza y Formentera. Las nubes deben ser volumétricas o de capas con parallax (three.js en un canvas superpuesto, sincronizado con el mismo progreso de scroll que Cesium), nunca un PNG plano.
2. Vuelo continuo hacia la isla en una sola toma, sin cortes. Cada escena del storyboard es una parada (hold) donde aparece su servicio:
   villas → yates → motos de agua → coches → restaurantes → beach clubs → clubs/guest lists → concierge final (constelación de servicios).
3. En cada servicio: titular corto, 2–3 tarjetas con foto, una CTA principal de WhatsApp con el mensaje ya rellenado según el servicio, y una sugerencia de venta cruzada (por ejemplo, villa → yate al atardecer).
4. Guest lists (estrategia de cierre):
   - Bloque propio en la escena de clubs: calendario de los próximos [N] días con club, noche/DJ y estado (disponible / pocas plazas / completo) leído de un archivo de datos editable (web/lib/guestlists.ts).
   - Al tocar una noche, se abre una hoja inferior estilo Apple con nombre, número de personas y fecha, que termina en WhatsApp con el mensaje rellenado.
   - Pack "Night out": guest list + coche con chófer + mesa VIP, con un solo botón para pedirlo.
   - La urgencia solo puede salir de datos reales del archivo. NUNCA inventes escasez, contadores falsos, reseñas o cifras.
5. Navegación: menú en cápsula de liquid glass que se condensa al hacer scroll. Botones flotantes estilo Apple: WhatsApp siempre visible, y "Reservar" que abre el planificador de paquetes. En móvil, barra inferior con zona segura.
6. Visual: limpio, mucho aire, tipografía editorial (Cormorant Garamond + Inter o mejor propuesta justificada), paleta de la marca; gradación de luz que pasa de mediodía a hora dorada y a noche en la escena de clubs.
7. Mapa de lugares: amplía web/components/sections/island-map.tsx con todos los clubs y beach clubs de Ibiza y la villa de Cala Molí como punto destacado. Filtros por tipo (clubs, beach clubs, villa, puertos, playas), chincheta animada, ficha con foto, zona y distancia desde la villa y el aeropuerto, y CTA de WhatsApp. Cada coordenada verificada con una fuente (OpenStreetMap o Google Maps); sin verificar, NO se publica.
8. Respaldo sin key de Google o con dispositivo de gama baja: vista por satélite y nubes simplificadas, con el mismo recorrido y los mismos servicios. prefers-reduced-motion: cortes suaves entre escenas, sin vuelo.

## Constraints
- Ibiza REAL: coordenadas verificadas en docs/fase-1-storyboard.md. Si una ubicación no está validada, márcala como pendiente; NUNCA inventes una.
- Fotos: usa solo imágenes que yo proporcione en web/public/media/ o marcadores neutros con nombre de archivo esperado. No uses fotos de stock con marcas, ni de otras empresas.
- Rendimiento: animaciones solo con transform/opacity; un único requestAnimationFrame que guía Cesium, three.js y GSAP; nada de scroll-jacking que bloquee la rueda o el gesto.
- Dependencias: pide permiso antes de añadir cualquiera nueva (ya están gsap, lenis, framer-motion y three).
- Haz solo lo que pide este brief. No añadas pagos online, login nuevo, blog ni CMS.

## Acceptance Criteria (comprueba cada punto con evidencia)
- [ ] npm run build pasa sin errores ni warnings de tipos.
- [ ] Traza de rendimiento (ecc chrome-devtools performance o Playwright) haciendo scroll de principio a fin en escritorio: ninguna long task > 100 ms durante el scroll; ≥ 55 fps de media en escritorio. Adjunta las cifras.
- [ ] Móvil 390×844 (emulado): el recorrido se completa sin trabarse y los textos son legibles; LCP < 2,5 s en la vista de respaldo.
- [ ] tools/camera_path.py pasa con los umbrales por defecto.
- [ ] Inspector de design-taste-frontend sin errores en 375, 768 y 1440 px; capturas de cada escena revisadas.
- [ ] Todas las CTA abren WhatsApp con el mensaje correcto del servicio (pruébalo leyendo el href).
- [ ] Teclado y lector de pantalla: menú, hoja de guest list y formulario usables; contraste AA.
- [ ] prefers-reduced-motion y la vista sin key funcionan.

## Action Boundaries
- Trabaja solo en web/, tools/ y docs/. NO toques open-generative-ai/ ni .claude/.
- Trabaja en una rama nueva creada desde concierge-experience-v2. Haz commits pequeños por fase.
- Para y pregúntame antes de: borrar archivos, añadir dependencias, usar servicios de pago (Higgsfield, Monid…), cambiar coordenadas validadas, o fusionar a main.
- Si te faltan datos de marca, fotos o la key de Google, sigue con marcadores y anótalos en una lista de pendientes; no te detengas por eso.

## Plan de trabajo (checkpoints)
1. Auditoría: lee web/, el storyboard y las skills; entrégame un plan corto con lo que reutilizas, lo que cambias y los riesgos de rendimiento. ESPERA mi OK.
2. Intro de nubes + avión, sincronizada con Cesium. Checkpoint con capturas y fps.
3. Escenas de servicios + guest lists + planificador. Checkpoint con capturas.
4. Menú liquid glass, botones flotantes y versión móvil.
5. Auditoría final: review-animations, break-ui, agentes ECC y criterios de aceptación con cifras.

## Progress Evidence
Informa solo en cada checkpoint: qué cambió (archivos), capturas, cifras medidas y pendientes. Cada "hecho" debe apoyarse en una salida de herramienta real.
```

🎯 Target: Claude Code (sesión nueva en MeySocietyWEB, repo MEY-). 💡 Parte del trabajo ya hecho en concierge-experience-v2, obliga a usar cada skill en su fase y mide la fluidez con cifras en vez de prometerla.

Este prompt es para una herramienta agéntica con acceso real al sistema. Revisa los límites de alcance, las acciones prohibidas y las condiciones de parada antes de pegarlo, y confirma que las rutas coinciden con el proyecto.
