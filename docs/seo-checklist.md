# Mey Society · SEO y checklist de publicación

Lo que ya está hecho en la web y lo que solo puedes hacer tú (con tu cuenta, tu dominio o tus datos).

## Hecho en el código

| Bloque | Punto | Estado |
|---|---|---|
| Legal | Aviso legal, privacidad y cookies | Páginas en `legal/` (rellena los campos amarillos: nombre/sociedad, NIF, domicilio) |
| Legal | Aviso de cookies | Solo aparece si activas Google Analytics; Plausible no lo necesita |
| Legal | Forzar HTTPS | `.htaccess` (Apache), `_headers` (Netlify/Cloudflare), `vercel.json`, con HSTS |
| Google | Título y descripción | En 5 idiomas, cambian con el idioma (`?lang=en`, `it`, `fr`, `de`) |
| Google | Datos estructurados | Organization + LocalBusiness, servicios, WebSite, WebPage y FAQ (8 preguntas) |
| Google | Sitemap y robots | `sitemap.xml` (con hreflang e imágenes) y `robots.txt` |
| Google | Favicon | `favicon.ico`, PNG, icono Apple, manifest e icono adaptable |
| Google | H1 con palabra clave | «Concierge privado en Ibiza» (traducido en cada idioma) |
| Vista | Textos alternativos | Todas las imágenes tienen alt descriptivo con palabras clave |
| Vista | Imágenes comprimidas | Servicios en WebP (de 1,9 MB a 0,5 MB); carruseles en miniaturas WebP |
| Vista | Velocidad | Precarga de fuente y logo, carga diferida, mapa sin bloquear |
| Vista | Imagen al compartir | `assets/og-image.jpg` 1200×630 (WhatsApp, Instagram, Facebook, X) |
| Funciona | Página 404 | `404.html` |
| Funciona | Enlaces rotos | Revisados: 0 rotos |
| Funciona | Anti-spam | Campo trampa invisible + bloqueo de envíos en menos de 2,5 s |
| Funciona | Botón WhatsApp | Flotante, abajo a la derecha |
| Funciona | Analítica | Lista para activar (ver abajo) |

## Lo que tienes que hacer tú

1. **Dominio** (imprescindible). Cuando lo tengas: `node tools/set-domain.mjs https://www.tudominio.com`.
   Rellena la dirección en canonical, hreflang, sitemap, Open Graph y datos estructurados. Sin esto, Google no sabe cuál es la dirección oficial.
2. **Número de WhatsApp**: en `app.js`, `CONFIG.whatsapp: "34600111222"` (sin +). Activa el botón flotante y el formulario por WhatsApp.
3. **Datos legales**: completa los campos amarillos de `legal/` y revísalos con tu gestoría.
4. **Analítica**: `CONFIG.analytics.plausible = "tudominio.com"` (sin cookies, recomendado) o `ga4 = "G-XXXX"`.
5. **Google Search Console**: verifica el dominio y envía `https://tudominio.com/sitemap.xml`. Pide la indexación de la portada y de `?lang=en`.
6. **Perfil de Empresa en Google** (Google Maps): categoría «Servicio de conserjería» o «Agencia de viajes»; zona de servicio Ibiza y Formentera, sin mostrar dirección si trabajas sin oficina. Fotos reales, horario, web y WhatsApp. Pide reseñas a cada cliente: es el factor nº 1 para salir en el mapa.
7. **Reseñas reales**: cuando las tengas, sustituye las de ejemplo y se puede añadir su marcado de valoración. Nunca marques reseñas inventadas: Google penaliza.
8. **Enlaces de calidad**: Instagram y TikTok con enlace a la web (añádelos luego a `sameAs` en los datos estructurados). Fichas en directorios de Ibiza y en partners (villas, chárter, beach clubs) que enlacen a tu web.
9. **Contenido**: una página o artículo por búsqueda importante. Por ejemplo «alquiler de yates en Ibiza», «mesa VIP Ushuaïa», «villa de lujo Ibiza con chef», «concierge Ibiza despedida». Es lo que más posiciona a medio plazo; puedo crearlas cuando quieras.
