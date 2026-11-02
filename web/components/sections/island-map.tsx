"use client"

/*
 * La isla, a escala: contorno real de Ibiza y Formentera (Natural Earth) con los lugares
 * en sus coordenadas. El mapa se inclina en 3D siguiendo al ratón, con capas a distinta
 * profundidad (mar, tierra, ruta, chinchetas, etiquetas), así que todo se mueve al ritmo
 * del cursor. Elegir un lugar dibuja la ruta desde el aeropuerto con la distancia real.
 */

import * as React from "react"
import { useReducedMotion } from "framer-motion"
import { PLACES, type Place } from "@/lib/content"
import { FORMENTERA_PATH, IBIZA_PATH, MAP_H, MAP_W, formatIbizaTime, project, sunTimes } from "@/lib/geo"

const KINDS: { id: Place["kind"] | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "sea", label: "Sea" },
  { id: "sunset", label: "Sunset" },
  { id: "night", label: "Night" },
  { id: "heritage", label: "Old town" },
  { id: "nature", label: "Nature" },
  { id: "arrival", label: "Arrivals" },
]

const AIRPORT = PLACES.find((p) => p.id === "airport")!
// 10 km en unidades del mapa (1° de latitud ≈ 111 km), como % del ancho
const TEN_KM = ((project(0, 0).y - project(0, 10 / 111).y) / MAP_W) * 100

function km(a: Place, b: Place) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function IslandMap() {
  const [kind, setKind] = React.useState<(typeof KINDS)[number]["id"]>("all")
  const [sel, setSel] = React.useState<Place>(PLACES.find((p) => p.id === "comte")!)
  const [sunset, setSunset] = React.useState<string | null>(null)
  const stage = React.useRef<HTMLDivElement>(null)
  const tilt = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    setSunset(formatIbizaTime(sunTimes(new Date(), sel.lat, sel.lon).sunset))
  }, [sel])

  // inclinación con inercia: el objetivo lo marca el ratón, el render lo persigue
  React.useEffect(() => {
    if (reduce) return
    const el = stage.current, t = tilt.current
    if (!el || !t) return
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }
    let raf = 0, visible = false
    const frame = () => {
      cur.x += (target.x - cur.x) * 0.08
      cur.y += (target.y - cur.y) * 0.08
      t.style.setProperty("--rx", `${(18 - cur.y * 12).toFixed(2)}deg`)
      t.style.setProperty("--ry", `${(cur.x * 16).toFixed(2)}deg`)
      t.style.setProperty("--px", cur.x.toFixed(3))
      t.style.setProperty("--py", cur.y.toFixed(3))
      if (visible && (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001)) raf = requestAnimationFrame(frame)
      else raf = 0
    }
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame) }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const r = el.getBoundingClientRect()
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2
      kick()
    }
    const leave = () => { target.x = 0; target.y = 0; kick() }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick() })
    io.observe(el)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerleave", leave)
    }
  }, [reduce])

  const shown = PLACES.filter((p) => kind === "all" || p.kind === kind)
  const a = project(AIRPORT.lon, AIRPORT.lat)
  const b = project(sel.lon, sel.lat)
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.25 }
  const route = `M${a.x} ${a.y} Q${mid.x} ${mid.y} ${b.x} ${b.y}`
  const pct = (p: Place) => {
    const { x, y } = project(p.lon, p.lat)
    return { left: `${(x / MAP_W) * 100}%`, top: `${(y / MAP_H) * 100}%` }
  }
  const dist = km(AIRPORT, sel)

  return (
    <section id="island" className="isl" data-ground="dark" data-chapter="The island" aria-labelledby="isl-title">
      <div className="wrap isl-grid">
        <div className="isl-copy">
          <h2 id="isl-title" className="h2" data-reveal>Know the island before you land.</h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
            Forty kilometres end to end, and every corner within an hour. The real coastline, the real places — choose one to see how far it is from your arrival gate.
          </p>

          <div className="isl-kinds" role="group" aria-label="Filter places" data-reveal style={{ ["--d" as string]: 2 }}>
            {KINDS.map((k) => (
              <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
                {k.label}
              </button>
            ))}
          </div>

          <ul className="isl-list" data-reveal style={{ ["--d" as string]: 3 }}>
            {shown.map((p) => (
              <li key={p.id}>
                <button type="button" aria-pressed={sel.id === p.id} onClick={() => setSel(p)}>
                  <span>{p.name}</span>
                  <small>{p.area}</small>
                </button>
              </li>
            ))}
          </ul>

          <div className="isl-card" aria-live="polite">
            <h3 className="h3">{sel.name}</h3>
            <p>{sel.line}</p>
            <p className="isl-facts">
              {sel.id === "airport" ? (
                <span>Your arrival gate</span>
              ) : (
                <span><b>{dist.toFixed(0)} km</b> from the airport, as the crow flies</span>
              )}
              {(sel.kind === "sunset" || sel.kind === "sea") && (
                <span suppressHydrationWarning>Sunset today <b>{sunset ?? "—"}</b></span>
              )}
            </p>
          </div>
        </div>

        <div ref={stage} className="isl-stage" aria-hidden="true">
          <div ref={tilt} className="isl-tilt">
            <div className="isl-layer isl-sea" />
            <svg className="isl-layer isl-land" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
              <path className="isl-shadow" d={IBIZA_PATH} />
              <path className="isl-shadow" d={FORMENTERA_PATH} />
              <path className="isl-shape" d={IBIZA_PATH} />
              <path className="isl-shape" d={FORMENTERA_PATH} />
              {/* Es Vedrà: islote demasiado pequeño para el contorno a esta escala */}
              <circle className="isl-shape" cx={project(1.197, 38.8676).x} cy={project(1.197, 38.8676).y} r="5" />
            </svg>
            <svg className="isl-layer isl-route" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
              {sel.id !== "airport" && <path key={sel.id} d={route} pathLength={1} />}
            </svg>
            <div className="isl-layer isl-pins">
              {PLACES.map((p) => (
                <span
                  key={p.id}
                  className="isl-pin"
                  data-kind={p.kind}
                  data-on={sel.id === p.id || undefined}
                  data-dim={(kind !== "all" && p.kind !== kind) || undefined}
                  style={pct(p)}
                />
              ))}
            </div>
            <div className="isl-layer isl-scale" style={{ width: `${TEN_KM}%` }}>
              <span>10 km</span>
            </div>
            <div className="isl-layer isl-labels">
              {PLACES.map((p) => (
                <span key={p.id} className="isl-label" data-on={sel.id === p.id || undefined} data-dim={(kind !== "all" && p.kind !== kind) || undefined} style={pct(p)}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
