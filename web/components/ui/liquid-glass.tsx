"use client"

/*
 * Cristal líquido: refracción de borde como una lente gruesa.
 *
 * Para cada tamaño de elemento se dibuja (una vez, en un canvas a media resolución) un
 * mapa de desplazamiento: dentro de una franja junto al borde, cada píxel empuja la
 * muestra hacia dentro según la normal del borde redondeado, más fuerte cuanto más
 * cerca del canto. Un filtro SVG feDisplacementMap aplica ese mapa a lo que hay detrás
 * (backdrop-filter: url(#id)), algo que hoy solo Chromium soporta; Safari y Firefox se
 * quedan con el cristal esmerilado de .lg, que se ve bien por sí solo.
 */

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const maps = new Map<string, string>()

function displacementMap(w: number, h: number, radius: number, bezel: number) {
  const key = `${w}x${h}x${radius}x${bezel}`
  const hit = maps.get(key)
  if (hit) return hit
  const s = 0.5
  const W = Math.max(4, Math.round(w * s))
  const H = Math.max(4, Math.round(h * s))
  const R = Math.min(radius, h / 2, w / 2) * s
  const B = Math.max(1, bezel * s)
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""
  const img = ctx.createImageData(W, H)
  const d = img.data
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x + 0.5 - W / 2
      const py = y + 0.5 - H / 2
      const qx = Math.abs(px) - (W / 2 - R)
      const qy = Math.abs(py) - (H / 2 - R)
      // distancia al borde (positiva dentro) y normal hacia fuera
      let nx: number, ny: number, inside: number
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1
        nx = qx / l
        ny = qy / l
        inside = R - l
      } else if (qx > qy) {
        nx = 1; ny = 0; inside = R - qx
      } else {
        nx = 0; ny = 1; inside = R - qy
      }
      nx *= Math.sign(px) || 1
      ny *= Math.sign(py) || 1
      const t = Math.min(1, Math.max(0, 1 - inside / B))
      const m = t * t * (3 - 2 * t) // lente convexa: casi nada en el centro, fuerte en el canto
      const i = (y * W + x) * 4
      d[i] = 128 - nx * m * 127
      d[i + 1] = 128 - ny * m * 127
      d[i + 2] = 128
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const url = canvas.toDataURL()
  maps.set(key, url)
  return url
}

let refractSupport: boolean | null = null
function supportsRefraction() {
  if (refractSupport !== null) return refractSupport
  if (typeof window === "undefined") return false
  const ua = navigator.userAgent
  const chromium = /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\/|FxiOS|CriOS/.test(ua)
  const reduced = window.matchMedia?.("(prefers-reduced-transparency: reduce)").matches
  refractSupport = chromium && !reduced && !!CSS.supports?.("backdrop-filter", "url(#a)")
  return refractSupport
}

type GlassOptions = { radius?: number; bezel?: number; scale?: number; disabled?: boolean }

/** Devuelve las props para el elemento de cristal y el <svg> con su filtro. */
export function useLiquidGlass<T extends HTMLElement>(opts: GlassOptions = {}) {
  const { radius = 999, bezel = 18, scale = 46, disabled = false } = opts
  const ref = React.useRef<T>(null)
  const id = React.useId().replace(/:/g, "")
  const [map, setMap] = React.useState<{ url: string; w: number; h: number } | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (disabled) {
      setMap(null)
      return
    }
    if (!el || !supportsRefraction()) return
    let t = 0
    const measure = () => {
      const w = Math.round(el.offsetWidth)
      const h = Math.round(el.offsetHeight)
      if (!w || !h) return
      setMap((m) => (m && m.w === w && m.h === h ? m : { url: displacementMap(w, h, radius, bezel), w, h }))
    }
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(measure, 120) // espera a que termine la animación de tamaño
    })
    ro.observe(el)
    measure()
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [radius, bezel, disabled])

  const onPointerMove = React.useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el || e.pointerType !== "mouse") return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }, [])

  const on = !!map?.url
  const filterId = `lg-${id}`
  const svg = on ? (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute", pointerEvents: "none" }}>
      <filter id={filterId} x="0" y="0" width={map!.w} height={map!.h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage href={map!.url} x="0" y="0" width={map!.w} height={map!.h} preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={scale} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  ) : null

  return {
    ref,
    svg,
    props: {
      "data-refract": on ? "on" : "off",
      style: on ? ({ "--lg": `url(#${filterId})` } as React.CSSProperties) : undefined,
      onPointerMove,
    },
  }
}

type GlassButtonProps = {
  href?: string
  tone?: "dark" | "light" | "solid"
  size?: "default" | "small"
  className?: string
  children: React.ReactNode
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> &
  Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">

export function GlassButton({ href, tone = "dark", size = "default", className, children, target, rel, ...rest }: GlassButtonProps) {
  const glass = useLiquidGlass<HTMLElement>({ bezel: size === "small" ? 12 : 16, scale: size === "small" ? 34 : 44 })
  const cls = cn("lg lg-btn", tone === "light" && "lg-light", tone === "dark" && "lg-dark", tone === "solid" && "solid", size === "small" && "small", className)
  const inner = (
    <>
      {glass.svg}
      <span className="lg-label">{children}</span>
    </>
  )
  const style = { ...glass.props.style, ...rest.style }
  if (href) {
    const anchorProps = { ...glass.props, style, className: cls, target, rel, onClick: rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>, "aria-label": rest["aria-label"] }
    return href.startsWith("/") ? (
      <Link href={href} ref={glass.ref as React.Ref<HTMLAnchorElement>} {...anchorProps}>{inner}</Link>
    ) : (
      <a href={href} ref={glass.ref as React.Ref<HTMLAnchorElement>} {...anchorProps}>{inner}</a>
    )
  }
  return (
    <button type="button" {...rest} {...glass.props} style={style} ref={glass.ref as React.Ref<HTMLButtonElement>} className={cls}>
      {inner}
    </button>
  )
}
