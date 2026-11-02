"use client"

/*
 * Monta el escenario fijo: la Ibiza real (Cesium + Google 3D Tiles), las nubes de la intro y el
 * anillo holográfico del logo, que se abre como una ventana. Las cámaras vienen de las secciones
 * con data-cam (ver app/page.tsx).
 */
import * as React from "react"
import { CHAPTERS, FINALE_CAMERA, INTRO_CAMERA } from "@/lib/data"
import { createWorld, type Camera } from "@/lib/cesium"
import { createSky } from "@/lib/sky"
import { createCoin, type Coin } from "@/lib/coin"
import { startStage, type Anchor } from "@/lib/stage"

const CAMERAS: Record<string, { camera: Camera; light: number; dim: number }> = {
  intro: { camera: INTRO_CAMERA, light: 0, dim: 0 },
  finale: { camera: FINALE_CAMERA, light: 2, dim: 0.55 },
  map: { camera: FINALE_CAMERA, light: 2, dim: 0.82 },
  ...Object.fromEntries(CHAPTERS.map((c) => [c.id, { camera: c.camera, light: c.light, dim: 0 }])),
}

export function Stage() {
  const stageRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current!
    const hero = document.getElementById("top")!
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches
    const lowPower = matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency || 8) <= 4
    const anchors: Anchor[] = Array.from(document.querySelectorAll<HTMLElement>("[data-cam]")).map((el) => ({
      el,
      ...CAMERAS[el.dataset.cam!],
    }))
    const ctl = startStage({
      stage,
      hero,
      anchors,
      reduced,
      onChapter: (id) => window.dispatchEvent(new CustomEvent("stage:chapter", { detail: id })),
    })
    ;(window as unknown as { __stage?: typeof ctl }).__stage = ctl

    let cancelled = false
    const key = new URLSearchParams(location.search).get("key") || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
    const webgl = (() => { try { return !!document.createElement("canvas").getContext("webgl2") } catch { return false } })()
    if (webgl) {
      createWorld(stage.querySelector<HTMLElement>(".stage-world")!, key, lowPower)
        .then((w) => {
          if (cancelled) return w.destroy()
          ctl.setWorld(w)
          document.documentElement.dataset.world = w.mode
        })
        .catch((e) => { console.warn(e); document.documentElement.dataset.world = "none" })
      if (!reduced)
        createSky(stage.querySelector<HTMLElement>(".stage-sky")!, { lowPower })
          .then((s) => (cancelled ? s.destroy() : ctl.setSky(s)))
          .catch((e) => console.warn(e))
    } else {
      document.documentElement.dataset.world = "none"
    }

    // el logo 3D en el centro del anillo; responde a la columna de servicios de la intro
    let coin: Coin | null = null
    const onFocus = (e: Event) => coin?.focus((e as CustomEvent<number>).detail)
    const onScroll = () => coin?.setVisible(scrollY < hero.offsetHeight * 0.75)
    if (webgl) {
      createCoin(stage.querySelector<HTMLElement>(".ring-coin")!, { reduced, lowPower })
        .then((c) => { if (cancelled) return c.destroy(); coin = c; onScroll() })
        .catch((e) => console.warn(e))
      addEventListener("coin:focus", onFocus)
      addEventListener("scroll", onScroll, { passive: true })
    }
    return () => {
      cancelled = true
      removeEventListener("coin:focus", onFocus)
      removeEventListener("scroll", onScroll)
      coin?.destroy()
      ctl.destroy()
    }
  }, [])

  return (
    <div ref={stageRef} className="stage" aria-hidden="true">
      <div className="stage-world" />
      <div className="stage-grade" />
      <div className="stage-haze" />
      <div className="stage-sky" />
      <div className="stage-ring"><span className="ring-holo" /><span className="ring-chrome" /><div className="ring-coin" /></div>
      <div className="stage-scrim" />
    </div>
  )
}
