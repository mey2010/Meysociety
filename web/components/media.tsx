"use client"

import * as React from "react"
import { MEDIA, type MediaKey } from "@/lib/content"
import { cn } from "@/lib/utils"

const WIDTHS = [480, 800, 1200, 1600, 2200]

/**
 * Foto con srcset del CDN de Unsplash (o ruta local) y un fallback de color con su pie
 * si la imagen no carga, para que nunca se vea un icono de imagen rota.
 */
export function Media({
  k,
  sizes = "100vw",
  className,
  priority = false,
  caption,
  style,
}: {
  k: MediaKey
  sizes?: string
  className?: string
  priority?: boolean
  caption?: string
  style?: React.CSSProperties
}) {
  const m = MEDIA[k]
  const [failed, setFailed] = React.useState(false)
  const img = React.useRef<HTMLImageElement>(null)
  const remote = m.src.startsWith("http")
  const srcSet = remote ? WIDTHS.map((w) => `${m.src}&w=${w} ${w}w`).join(", ") : undefined

  // un error anterior a la hidratación no dispara onError: se comprueba al montar
  React.useEffect(() => {
    const el = img.current
    if (el && el.complete && el.naturalWidth === 0) setFailed(true)
  }, [])

  return (
    <div className={cn("media", className)} style={{ ...style, ["--tone" as string]: m.tone }}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- srcset propio del CDN de imágenes
        <img
          ref={img}
          src={remote ? `${m.src}&w=1600` : m.src}
          srcSet={srcSet}
          sizes={sizes}
          alt={m.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="media-fallback" role="img" aria-label={m.alt}>
          <span>{caption ?? m.alt}</span>
        </div>
      )}
    </div>
  )
}
