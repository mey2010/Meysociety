/*
 * Orquestación del recorrido: scroll (GSAP ScrollTrigger) → progreso → cámara, luz,
 * capa comercial, minimapa y constelación. El HTML lo pinta React (components/journey);
 * aquí solo se cambian clases y variables CSS.
 */
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SCENES, type Camera } from "@/lib/content"
import { project } from "@/lib/geo"
import { createWorld, lerpCamera, loadCesium, type World } from "@/lib/journey/world"

declare global {
  interface Window {
    ConciergeJourney?: { goTo: (id: string) => void; current: () => string | null }
  }
}

type Segment = { type: "travel"; from: number; to: number; start: number; len: number } | { type: "hold"; scene: number; start: number; len: number }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
// smootherstep: la cámara arranca y frena suave, y queda quieta en cada hold
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

export function startJourney(): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T & Element>(sel) as T | null
  const track = $<HTMLElement>("#world-track")
  if (!track) return () => {}

  const params = new URLSearchParams(location.search)
  const apiKey = params.get("key") || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
  const lowPower = matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4

  // --- línea de tiempo: segmentos travel/hold medidos en pantallas de scroll ---
  const segments: Segment[] = []
  let total = 0
  SCENES.forEach((s, i) => {
    if (i > 0 && s.travel) {
      segments.push({ type: "travel", from: i - 1, to: i, start: total, len: s.travel })
      total += s.travel
    }
    segments.push({ type: "hold", scene: i, start: total, len: s.hold })
    total += s.hold
  })
  const holdOf = (i: number) => segments.find((s) => s.type === "hold" && s.scene === i)!
  track.style.height = `${(total + 1) * 100}vh`

  function stateAt(units: number): { cam: Camera; light: number; seg: Segment } {
    const seg = segments.find((s) => units < s.start + s.len) || segments[segments.length - 1]
    if (seg.type === "hold") {
      const s = SCENES[seg.scene]
      return { cam: s.camera, light: s.light, seg }
    }
    const t = clamp01((units - seg.start) / seg.len)
    const a = SCENES[seg.from], b = SCENES[seg.to]
    const e = reduced ? Math.round(t) : ease(t)
    return { cam: lerpCamera(a.camera, b.camera, e), light: a.light + (b.light - a.light) * e, seg }
  }

  const panels = Array.from(document.querySelectorAll<HTMLElement>(".panel[data-scene]"))
  const plates = Array.from(document.querySelectorAll<HTMLElement>(".plate[data-scene]"))
  const marks = Array.from(document.querySelectorAll<SVGElement>("#minimap [data-scene]"))
  const railItems = Array.from(document.querySelectorAll<HTMLElement>("#rail li[data-scene]"))
  const railFill = $<HTMLElement>("#rail-fill")
  const dot = $<SVGGElement>("#mm-dot")
  const stage = $<HTMLElement>("#stage")
  const svg = $<SVGSVGElement>("#constellation")
  const finaleIdx = SCENES.findIndex((s) => s.constellation)

  let world: World | null = null
  let lastProgress = 0
  let lastSection: string | null = null
  let journeyVisible = true

  function emitSection(id: string) {
    if (id === lastSection) return
    lastSection = id
    window.dispatchEvent(new CustomEvent("journey:section", { detail: id }))
  }

  function render(progress: number) {
    lastProgress = progress
    const units = progress * total
    const { cam, light, seg } = stateAt(units)
    world?.setCamera(cam)
    world?.setLight(light)
    stage?.style.setProperty("--light", Math.min(1, light).toFixed(3))
    stage?.style.setProperty("--night", clamp01(light - 1).toFixed(3))
    document.body.classList.toggle("journey-started", progress > 0.015)

    // texto y foto visibles solo durante el hold de su escena
    const active = seg.type === "hold" ? seg.scene : -1
    for (const p of panels) p.classList.toggle("on", Number(p.dataset.scene) === active)
    for (const p of plates) p.classList.toggle("on", Number(p.dataset.scene) === active)

    // raíl y minimapa
    let current = 0
    for (const li of railItems) {
      const i = Number(li.dataset.scene)
      const reached = units >= holdOf(i).start - 0.5
      li.classList.toggle("on", reached)
      if (reached) current = i
    }
    for (const m of marks) m.classList.toggle("on", Number(m.dataset.scene) === current)
    if (railFill) railFill.style.transform = `scaleY(${progress.toFixed(4)})`
    if (dot) {
      const { x, y } = project(cam.lon, cam.lat)
      dot.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${cam.heading.toFixed(1)})`)
      dot.style.setProperty("--alt", clamp01(Math.log10(cam.height / 100) / 3).toFixed(3))
    }
    if (journeyVisible) emitSection(SCENES[current].id)

    // constelación: aparece en el último vuelo y se completa en el hold final
    if (svg && finaleIdx >= 0) {
      const fh = holdOf(finaleIdx)
      const c = clamp01((units - (fh.start - 1.2)) / (1.2 + fh.len * 0.6))
      svg.style.setProperty("--c", c.toFixed(3))
      svg.classList.toggle("on", c > 0)
      document.body.classList.toggle("finale", c > 0.05)
    }
  }

  // el recorrido deja de emitir capítulos cuando ya no se ve
  const io = new IntersectionObserver(([e]) => {
    journeyVisible = e.isIntersecting
    if (journeyVisible) render(lastProgress)
  })
  io.observe(track)

  window.ConciergeJourney = {
    current: () => lastSection,
    goTo(id) {
      const i = SCENES.findIndex((s) => s.id === id)
      if (i < 0) return
      const h = holdOf(i)
      const units = h.start + h.len * 0.35
      const top = track.offsetTop + (units / total) * (track.offsetHeight - innerHeight)
      if (window.__lenis) window.__lenis.scrollTo(top, { duration: 2.2, immediate: reduced })
      else window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" })
    },
  }

  gsap.registerPlugin(ScrollTrigger)
  const state = { p: 0 }
  const tween = gsap.to(state, {
    p: 1,
    ease: "none",
    onUpdate: () => render(state.p),
    scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: reduced ? true : 1.1 },
  })
  render(0)

  // --- mapa 3D ---
  let cancelled = false
  const status = $<HTMLElement>("#status")
  const liftIntro = () => document.body.classList.add("ready")
  const introTimer = window.setTimeout(liftIntro, 2400) // nunca bloquear la página por el mapa

  const hasWebGL = (() => {
    try { return !!document.createElement("canvas").getContext("webgl2") } catch { return false }
  })()

  const editorial = (msg: string) => {
    document.body.classList.add("no-3d")
    if (status) status.textContent = msg
    liftIntro()
  }

  if (!hasWebGL || params.get("map") === "off") {
    editorial("")
  } else {
    const cesiumBase = params.get("cesium") || undefined
    loadCesium(cesiumBase)
      .then(async (C) => {
        if (cancelled) return
        const container = $<HTMLElement>("#cesium")!
        const credits = $<HTMLElement>("#credits")!
        world = await createWorld(C, container, credits, { apiKey, lowPower })
        if (cancelled) { world.destroy(); world = null; return }
        document.body.classList.add("has-3d")
        if (world.mode === "satellite" && status) status.textContent = "Preview · satellite imagery. Photorealistic 3D switches on with a Google Maps key."
        render(lastProgress)
        world.ready().then(() => window.setTimeout(liftIntro, 500))
      })
      .catch((err) => {
        console.warn(err)
        if (!cancelled) editorial("")
      })
  }

  return () => {
    cancelled = true
    window.clearTimeout(introTimer)
    io.disconnect()
    tween.scrollTrigger?.kill()
    tween.kill()
    world?.destroy()
    world = null
    delete window.ConciergeJourney
    document.body.classList.remove("has-3d", "no-3d", "finale", "journey-started")
  }
}
