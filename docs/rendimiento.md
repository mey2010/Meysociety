# Análisis de rendimiento — Mey Society

Fecha: 11 de noviembre de 2026 · Página medida: inicio · Dispositivo simulado: iPhone 13

## Resumen

La portada descarga un 42 % menos de datos y el nombre de la marca termina de encenderse a los 4,4 segundos en lugar de a los 8, con una conexión 4G normal. Sigue por encima del objetivo de Google (2,5 segundos); con mala cobertura tarda 7,4 segundos. La página se ve desde el primer segundo, pero la animación de entrada retrasa lo que Google cuenta como contenido principal.

## Medidas

Laboratorio: Chrome sin interfaz con red limitada, servidor local sin compresión. Los valores reales en un móvil con un alojamiento bien configurado serán mejores que estos; sirven para comparar antes y después, no como cifra absoluta.

### 4G normal (9 Mbit/s, 60 ms de latencia)

| Medida | Antes | Ahora | Objetivo de Google |
|---|---|---|---|
| Primer contenido visible (FCP) | 1,0 s | 0,8 s | menos de 1,8 s |
| Contenido principal visible (LCP) | 8,0 s | 4,4 s | menos de 2,5 s |
| Saltos de diseño (CLS) | 0,004 | 0,004 | menos de 0,1 |
| Tiempo con la página bloqueada (TBT) | 3 386 ms | 1 502 ms | menos de 200 ms |
| Peticiones al cargar | 63 | 58 | — |
| Datos descargados | 5 235 KB | 3 033 KB | — |

### 4G lento (1,6 Mbit/s, 150 ms de latencia)

| Medida | Antes | Ahora | Objetivo de Google |
|---|---|---|---|
| Primer contenido visible (FCP) | 3,0 s | 2,5 s | menos de 1,8 s |
| Contenido principal visible (LCP) | 11,9 s | 7,4 s | menos de 2,5 s |
| Saltos de diseño (CLS) | 0,004 | 0,004 | menos de 0,1 |
| Datos descargados | 2 539 KB | 1 678 KB | — |

El TBT está inflado en el laboratorio porque la máquina de pruebas no tiene tarjeta gráfica y dibuja las animaciones con el procesador; en un móvil real será bastante menor, pero hay que confirmarlo con la prueba real. Por eso no se compara en la tabla lenta.

## Qué se ha cambiado

1. El motor 3D del mapa (unos 700 KB) ya no bloquea la entrada: se descarga aparte, después de que la página sea visible.
2. El logo animado usa una versión de 49 KB en lugar de la de 153 KB.
3. Los vídeos de las reseñas no descargan nada hasta que se reproducen.
4. El nombre «Mey Society» se enciende medio segundo antes. Es lo que Google cuenta como contenido principal.

## Qué falta y de quién depende

| Acción | Efecto esperado | Quién |
|---|---|---|
| Alojamiento con compresión Brotli o gzip | Los tres archivos de texto principales (343 KB) bajan a unos 85 KB. Es la mejora más grande en redes lentas | Alojamiento. Vercel, Netlify y Cloudflare Pages lo hacen solos; `.htaccess`, `_headers` y `vercel.json` ya están preparados |
| Caché larga para imágenes y fuentes | La segunda visita carga casi al instante | Alojamiento, mismos archivos |
| Probar en un móvil real | Confirma las cifras | Tú: abre https://pagespeed.web.dev con el dominio cuando esté publicado |
| Acortar la pantalla de carga y la animación de entrada del nombre | Es lo que más acerca el LCP al objetivo de 2,5 s. Cambia el estilo de la entrada, así que es decisión tuya | Tú decides; trabajo de una tarde |
| Trocear `styles.css` (150 KB) y `app.js` (105 KB) | Baja el primer contenido visible con mala cobertura | Trabajo pendiente, si la prueba real lo pide |
| Logo de la pantalla de carga en WebP | Ahorra unos 90 KB | Trabajo pendiente, menor |

## Partes pesadas que no afectan a la entrada

- Recorrido de Villa Cala Molí: 20 a 40 MB. Solo se descarga al pulsar «Recorrer Villa Cala Molí», y por partes.
- Mapa 3D y fotos de la flota en alta resolución: se descargan al abrirlos.

## Cómo repetir la medida

Con el dominio publicado, https://pagespeed.web.dev da estas mismas medidas con datos de móviles reales. En Search Console, el informe «Core Web Vitals» las muestra por página a partir de unas semanas de tráfico.
