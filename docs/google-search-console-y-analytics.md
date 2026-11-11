# Conectar la web con Google

La web ya está preparada. Faltan dos datos que solo puedes obtener tú con tu cuenta de Google y el dominio publicado. Ninguno es una contraseña: son identificadores públicos.

Orden: primero el dominio, después Search Console, después Analytics.

## 0. Dominio

```
node tools/set-domain.mjs https://www.tudominio.com
```

## 1. Search Console — que Google encuentre la web

1. Entra en https://search.google.com/search-console y pulsa «Añadir propiedad».
2. Elige «Prefijo de la URL» y escribe la dirección completa, con https.
3. En los métodos de verificación abre «Etiqueta HTML». Copia el código que aparece dentro de `content="…"`.
4. En la carpeta de la web:
   ```
   node tools/connect-google.mjs --gsc EL_CODIGO
   ```
5. Sube la web al alojamiento y pulsa «Verificar» en Search Console.
6. Menú «Sitemaps»: escribe `sitemap.xml` y envía.
7. Arriba, en «Inspección de URLs», pega la dirección de la portada y pulsa «Solicitar indexación». Es lo que acelera la primera aparición.

Si tu dominio está en un proveedor que lo permite, la verificación por «Dominio» (registro DNS TXT) cubre también las variantes con y sin www. No necesita tocar la web.

Plazo realista: la portada suele aparecer en días. Posicionar por búsquedas como «concierge Ibiza» lleva meses y depende de enlaces y reseñas (ver `seo-checklist.md`).

## 2. Analytics 4 — de dónde viene el tráfico

1. Entra en https://analytics.google.com, crea una cuenta y una propiedad. Zona horaria: España. Moneda: euro.
2. Crea un flujo de datos «Web» con tu dominio. Copia el «ID de medición», con forma `G-XXXXXXXXXX`.
3. En la carpeta de la web:
   ```
   node tools/connect-google.mjs --ga G-XXXXXXXXXX
   ```
4. Sube la web. Ábrela, acepta las cookies y comprueba en Analytics, «Informes › Tiempo real», que apareces.
5. En Analytics, «Administrar › Vinculaciones con productos › Search Console»: vincula las dos. Así ves en un solo sitio qué búsquedas traen visitas.
6. En «Administrar › Eventos», marca `generate_lead` como evento clave. Es tu conversión.

### Qué se mide

| Evento | Cuándo | Datos |
|---|---|---|
| `generate_lead` | Alguien envía el formulario de contacto | canal (whatsapp o email), idioma |
| `contact_click` | Toca el botón flotante, un enlace de WhatsApp o de correo | canal, lugar |
| `view_item` | Abre la ficha de un barco | nombre del barco |
| `villa_tour_open` | Abre el recorrido de Villa Cala Molí | villa |
| `language_change` | Cambia de idioma | idioma |

No se envía ningún dato personal: ni nombres, ni teléfonos, ni el texto de los mensajes.

### Dónde mirar el origen del tráfico

«Informes › Adquisición › Adquisición de tráfico». Verás Google, Instagram, directo, etc.

Para distinguir tus propias campañas, añade etiquetas a los enlaces que compartas:

| Dónde pones el enlace | Enlace |
|---|---|
| Biografía de Instagram | `https://www.tudominio.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Historias de Instagram | `…/?utm_source=instagram&utm_medium=social&utm_campaign=stories` |
| Estado o firma de WhatsApp | `…/?utm_source=whatsapp&utm_medium=mensaje&utm_campaign=firma` |
| Tarjeta o QR impreso | `…/?utm_source=qr&utm_medium=impreso&utm_campaign=tarjeta` |
| Un colaborador (hotel, club) | `…/?utm_source=nombre-del-hotel&utm_medium=partner` |

## Consentimiento y límites

- Analytics instala cookies, así que la web pide permiso antes y solo mide a quien acepta. Es obligatorio en España. Con visitantes europeos es normal que acepte entre la mitad y dos tercios: las cifras de Analytics serán menores que las visitas reales.
- Search Console no depende de las cookies y cuenta todas las búsquedas.
- Si quieres contar todas las visitas sin aviso de cookies, Plausible (de pago, sin cookies) ya está soportado: se activa con el campo `plausible` de `app.js`.
- La política de cookies (`legal/cookies.html`) ya describe Google Analytics. Revísala cuando lo actives.
- En la vista previa de claude.ai Analytics no carga; solo funciona en el dominio real.
