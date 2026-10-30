"use client"

import * as React from "react"

const CESIUM = "https://cdn.jsdelivr.net/npm/cesium@1.120.0/Build/Cesium/"

// El recorrido (Cesium + GSAP + public/js) es JavaScript sin framework que trabaja sobre
// el DOM ya renderizado. Se carga una sola vez, en orden, después de hidratar la página.
const SCRIPTS = [
  `${CESIUM}Cesium.js`,
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
  "/js/config.js",
  "/js/world.js",
  "/js/app.js",
]

export function JourneyScripts() {
  React.useEffect(() => {
    const w = window as Window & { CESIUM_BASE_URL?: string; __journeyLoaded?: boolean }
    if (w.__journeyLoaded) return
    w.__journeyLoaded = true
    w.CESIUM_BASE_URL = CESIUM
    for (const src of SCRIPTS) {
      const s = document.createElement("script")
      s.src = src
      s.async = false // los scripts insertados con async=false se ejecutan en orden
      document.body.appendChild(s)
    }
  }, [])
  return null
}
