/*
 * El escenario: una vista 3D fija detrás de toda la página. Cada sección marcada con
 * data-cam tiene una cámara; el scroll interpola entre ellas (altura en escala logarítmica,
 * rumbo por el camino corto, smootherstep) y se detiene en cada una mientras se lee.
 * También reparte --intro (nubes), --light/--night (etalonaje) y --dim (oscurecer el fondo).
 */
import Lenis from "lenis"
import type { Camera, World } from "@/lib/cesium"
import type { Sky } from "@/lib/sky"

export type Anchor = { el: HTMLElement; camera: Camera; light: number; dim: number }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
  const l = (x: number, y: number) => x + (y - x) * t
  const dh = ((b.heading - a.heading + 540) % 360) - 180
  return {
    lon: l(a.lon, b.lon),
    lat: l(a.lat, b.lat),
    height: Math.exp(l(Math.log(a.height), Math.log(b.height))),
    heading: a.heading + dh * t,
    pitch: l(a.pitch, b.pitch),
  }
}

type Opts = {
  stage: HTMLElement
  hero: HTMLElement
  anchors: Anchor[]
  reduced: boolean
  onChapter?: (id: string | null) => void
}

export function startStage({ stage, hero, anchors, reduced, onChapter }: Opts) {
  let world: World | null = null
  let sky: Sky | null = null
  let raf = 0
  let lastId: string | null = null
  let centers: number[] = []
  let holds: number[] = []
  const card = reduced ? null : hero.querySelector<HTMLElement>(".hero-card")

  const lenis = reduced ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })

  function measure() {
    centers = anchors.map((a) => {
      const r = a.el.getBoundingClientRect()
      return r.top + scrollY + r.height / 2
    })
    // cada sección se queda quieta en su tercio central
    holds = anchors.map((a) => a.el.offsetHeight * 0.18)
  }

  function frame() {
    raf = 0
    const y = scrollY + innerHeight / 2
    let i = 0
    while (i < anchors.length - 1 && y > centers[i + 1]) i++
    let cam = anchors[i].camera
    let light = anchors[i].light
    let dim = anchors[i].dim
    if (i < anchors.length - 1 && y > centers[i]) {
      const from = centers[i] + holds[i]
      const to = centers[i + 1] - holds[i + 1]
      const raw = clamp01((y - from) / Math.max(1, to - from))
      const t = reduced ? Math.round(raw) : smoother(raw)
      cam = lerpCamera(anchors[i].camera, anchors[i + 1].camera, t)
      light = anchors[i].light + (anchors[i + 1].light - anchors[i].light) * t
      dim = anchors[i].dim + (anchors[i + 1].dim - anchors[i].dim) * t
    }
    world?.setCamera(cam)

    const intro = clamp01(scrollY / Math.max(1, hero.offsetHeight - innerHeight * 0.6))
    sky?.setProgress(intro)
    const s = stage.style
    s.setProperty("--intro", intro.toFixed(4))
    s.setProperty("--light", Math.min(1, light).toFixed(3))
    s.setProperty("--night", clamp01(light - 1).toFixed(3))
    s.setProperty("--dim", dim.toFixed(3))
    // la tarjeta de la intro se mueve con su propio transform (no con una variable heredada)
    if (card) {
      const k = clamp01(intro / 0.4)
      card.style.opacity = (1 - k).toFixed(3)
      card.style.transform = `translate3d(0, ${(-k * 8).toFixed(2)}vh, 0) scale(${(1 - k * 0.06).toFixed(4)})`
      card.style.visibility = k >= 1 ? "hidden" : ""
    }

    const nearest = anchors[y - centers[i] > (centers[i + 1] ?? Infinity) - y ? i + 1 : i]
    const id = nearest.el.dataset.chapter ?? null
    if (id !== lastId) {
      lastId = id
      onChapter?.(id)
    }
  }
  const request = () => { if (!raf) raf = requestAnimationFrame(frame) }

  function loop(time: number) {
    lenis?.raf(time)
    lenisRaf = requestAnimationFrame(loop)
  }
  let lenisRaf = lenis ? requestAnimationFrame(loop) : 0

  const ro = new ResizeObserver(() => { measure(); request() })
  ro.observe(document.body)
  addEventListener("scroll", request, { passive: true })
  measure()
  request()

  return {
    setWorld(w: World) { world = w; request() },
    setSky(s: Sky) { sky = s; request() },
    scrollTo(el: HTMLElement) {
      if (lenis) lenis.scrollTo(el, { duration: 2.2 })
      else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
    },
    destroy() {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(lenisRaf)
      ro.disconnect()
      removeEventListener("scroll", request)
      lenis?.destroy()
      sky?.destroy()
      world?.destroy()
    },
  }
}
