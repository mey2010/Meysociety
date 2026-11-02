"use client"
/* Página de prueba interna: renderiza un keyframe para comprobar Google 3D Tiles. */
import * as React from "react"
import { createWorld, type Camera } from "@/lib/cesium"

export default function Probe() {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const q = new URLSearchParams(location.search)
    const cam: Camera = JSON.parse(q.get("cam") || '{"lon":1.2174,"lat":38.9255,"height":300,"heading":83,"pitch":-12}')
    let w: Awaited<ReturnType<typeof createWorld>> | null = null
    createWorld(ref.current!, process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "", false).then((world) => {
      w = world
      world.setCamera(cam)
      document.body.dataset.mode = world.mode
      const t = setInterval(() => { if (world.tilesLoaded()) { document.body.dataset.ready = "1"; clearInterval(t) } }, 500)
    }).catch((e) => { document.body.dataset.error = String(e) })
    return () => w?.destroy()
  }, [])
  return <div ref={ref} style={{ position: "fixed", inset: 0 }} />
}
