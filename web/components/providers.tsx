"use client"

import * as React from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/*
 * Scroll suave (Lenis) sincronizado con GSAP ScrollTrigger, y entradas [data-reveal].
 * Con prefers-reduced-motion no hay suavizado: el scroll es el nativo.
 */

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

export function scrollToTarget(target: string | HTMLElement | number, opts: { immediate?: boolean; offset?: number } = {}) {
  const lenis = window.__lenis
  if (lenis) {
    lenis.scrollTo(target, { offset: opts.offset ?? 0, immediate: opts.immediate, duration: 1.6 })
    return
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const behavior: ScrollBehavior = opts.immediate || reduce ? "auto" : "smooth"
  if (typeof target === "number") window.scrollTo({ top: target, behavior })
  else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView({ behavior })
}

export function lockScroll(locked: boolean) {
  const lenis = window.__lenis
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? "hidden" : ""
}

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let lenis: Lenis | undefined
    const tick = (time: number) => lenis?.raf(time * 1000)
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.085, anchors: { offset: 0, duration: 1.6 }, autoRaf: false })
      window.__lenis = lenis
      lenis.on("scroll", ScrollTrigger.update)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add("in")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    )
    const scan = () => document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      gsap.ticker.remove(tick)
      lenis?.destroy()
      delete window.__lenis
    }
  }, [])

  return <>{children}</>
}
