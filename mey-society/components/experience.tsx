"use client"

/*
 * La experiencia completa: un lienzo 3D fijo (lib/world.ts) que el scroll recorre, y encima la
 * interfaz: menú en cápsula, titular, columna "What are you looking for?" con los servicios,
 * ficha del servicio, barra para escribir lo que necesitas y cierre de contacto.
 */
import * as React from "react"
import Lenis from "lenis"
import { ArrowRight, ArrowUpRight, X } from "lucide-react"
import { BRAND, SERVICES, contactHref, type Service } from "@/lib/data"
import { SEG, createWorld, type World } from "@/lib/world"

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
/** visibilidad de un tramo con fundidos suaves en los bordes */
const band = (p: number, a: number, b: number, f = 0.025) => clamp01((p - a) / f) * clamp01((b - p) / f)

export function Experience() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const worldRef = React.useRef<World | null>(null)
  const lenisRef = React.useRef<Lenis | null>(null)
  const layers = React.useRef<Record<string, HTMLElement | null>>({})
  const [active, setActive] = React.useState(0)
  const [open, setOpen] = React.useState<Service | null>(null)
  const [ask, setAsk] = React.useState("")
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    const lowPower = matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4
    const lenis = reduced ? null : new Lenis({ lerp: 0.08, wheelMultiplier: 0.85 })
    lenisRef.current = lenis
    let raf = 0
    const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop) }
    if (lenis) raf = requestAnimationFrame(loop)

    let cancelled = false
    let lastActive = -1
    const display = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif"

    const progress = () => {
      const tr = trackRef.current!
      return clamp01(scrollY / Math.max(1, tr.offsetHeight - innerHeight))
    }
    const show = (k: string, v: number) => {
      const el = layers.current[k]
      if (!el) return
      el.style.opacity = v.toFixed(3)
      el.style.visibility = v < 0.01 ? "hidden" : ""
      el.toggleAttribute("inert", v < 0.5)
    }
    const onScroll = () => {
      const p = progress()
      worldRef.current?.setProgress(p)
      show("intro", 1 - clamp01((p - 0.05) / 0.03))
      show("hero", band(p, SEG.coin[0] + 0.01, SEG.coin[1] + 0.005))
      show("list", band(p, SEG.tunnel[0] + 0.01, SEG.tunnel[1]))
      show("end", clamp01((p - SEG.end[0] - 0.02) / 0.03))
      const w = worldRef.current
      if (w) {
        let best = 0, d = Infinity
        SERVICES.forEach((_, i) => { const dd = Math.abs(w.cardProgress(i) - p); if (dd < d) { d = dd; best = i } })
        if (best !== lastActive) { lastActive = best; setActive(best) }
      }
    }
    const onPointer = (e: PointerEvent) => worldRef.current?.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)

    createWorld(canvasRef.current!, SERVICES, { reduced, lowPower, display })
      .then((w) => {
        if (cancelled) return w.destroy()
        worldRef.current = w
        setReady(true)
        onScroll()
      })
      .catch((e) => { console.warn(e); setReady(true) })

    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("pointermove", onPointer, { passive: true })
    onScroll()
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      removeEventListener("scroll", onScroll)
      removeEventListener("pointermove", onPointer)
      lenis?.destroy()
      worldRef.current?.destroy()
      worldRef.current = null
    }
  }, [])

  const goTo = (p: number) => {
    const tr = trackRef.current!
    const y = p * (tr.offsetHeight - innerHeight)
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 2.4 })
    else scrollTo({ top: y })
  }
  const choose = (i: number) => {
    const w = worldRef.current
    goTo(w ? w.cardProgress(i) : SEG.tunnel[0] + (i + 0.5) * ((SEG.tunnel[1] - SEG.tunnel[0]) / SERVICES.length))
    setOpen(SERVICES[i])
  }
  const reg = (k: string) => (el: HTMLElement | null) => { layers.current[k] = el }

  return (
    <>
      <canvas ref={canvasRef} className="world" aria-hidden="true" />
      <div className={`loader${ready ? " done" : ""}`} aria-hidden="true"><span /></div>

      <header className="pill-nav">
        <a href="#top" className="pill-brand" onClick={(e) => { e.preventDefault(); goTo(0) }} aria-label={`${BRAND.name}, back to the start`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="" width={28} height={28} />
        </a>
        <nav className="pill" aria-label="Main">
          <a href="#services" onClick={(e) => { e.preventDefault(); goTo(SEG.tunnel[0] + 0.02) }}>Services</a>
          <span className="pill-line" aria-hidden="true" />
          <a href="#contact" onClick={(e) => { e.preventDefault(); goTo(1) }}>Contact</a>
        </nav>
      </header>

      <div ref={trackRef} className="track" id="top">
        <div className="hud">
          <section ref={reg("intro")} className="layer intro" aria-label="Mey Society">
            <p className="intro-name">Mey Society</p>
            <p className="intro-hint">Scroll to enter</p>
          </section>

          <section ref={reg("hero")} className="layer hero" aria-labelledby="h1">
            <h1 id="h1" className="display">Ibiza, privately arranged</h1>
            <div className="mono hero-copy">
              <p>Private concierge in Ibiza, from the moment you land.</p>
              <p>A villa in Cala Molí, yachts, jet skis, cars, beach clubs and every guest list on the island, arranged in one conversation.</p>
            </div>
          </section>

          <section ref={reg("list")} className="layer list" id="services" aria-labelledby="look">
            {open ? (
              <article className="detail mono" aria-live="polite">
                <button type="button" className="detail-close" onClick={() => setOpen(null)} aria-label="Close details"><X size={16} aria-hidden="true" /></button>
                <h2 className="detail-name">{open.name}</h2>
                <p className="detail-meta">{open.meta}</p>
                <p className="detail-text">{open.details}</p>
                <a className="detail-cta" href={contactHref(open.message)}>Book {open.name} <ArrowUpRight size={14} aria-hidden="true" /></a>
              </article>
            ) : null}
            <h2 id="look" className="mono look">What are you looking for?</h2>
            <ul className="mono look-list">
              {SERVICES.map((s, i) => (
                <li key={s.id}>
                  <button type="button" data-on={i === active || undefined} onClick={() => choose(i)}>
                    <ArrowRight size={13} strokeWidth={2} aria-hidden="true" /> {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section ref={reg("end")} className="layer end" id="contact" aria-labelledby="end-title">
            <h2 id="end-title" className="display">Tell us your dates</h2>
            <p className="mono end-copy">We reply personally with options and prices. You confirm, and the island is arranged.</p>
            <a className="end-mail mono" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <p className="mono end-base">{BRAND.base}</p>
          </section>
        </div>
      </div>

      <form className="ask" onSubmit={(e) => { e.preventDefault(); if (ask.trim()) location.href = contactHref(`Hello Mey Society, ${ask.trim()}`) }}>
        <label htmlFor="ask-input" className="sr-only">Tell us what you need</label>
        <input id="ask-input" className="mono" type="text" placeholder="Tell us what you need…" value={ask} onChange={(e) => setAsk(e.target.value)} autoComplete="off" />
        <button type="submit" aria-label="Send" disabled={!ask.trim()}><ArrowRight size={16} aria-hidden="true" /></button>
      </form>
    </>
  )
}
