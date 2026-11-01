"use client"

/*
 * Mapa de lugares: el contorno real de Ibiza y Formentera (Natural Earth) con la villa de Cala Molí
 * y las zonas de clubs y beach clubs. Elegir una zona en la lista la enciende en el mapa y dibuja
 * la ruta desde la villa con la distancia en línea recta.
 */
import * as React from "react"
import { FORMENTERA_PATH, IBIZA_PATH, MAP_H, MAP_W, project } from "@/lib/geo"
import { VILLA, ZONES, contactHref } from "@/lib/data"

function km(a: { lon: number; lat: number }, b: { lon: number; lat: number }) {
  const r = Math.PI / 180
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function IslandMap() {
  const [active, setActive] = React.useState(ZONES[0].id)
  const zone = ZONES.find((z) => z.id === active)!
  const v = project(VILLA.lon, VILLA.lat)
  const z = project(zone.lon, zone.lat)

  return (
    <div className="map">
      <div className="map-figure">
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={`Map of Ibiza: the villa in Cala Molí and ${zone.name}, ${km(VILLA, zone).toFixed(0)} km away`}>
          <defs>
            <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#53AECC" />
              <stop offset=".4" stopColor="#2342B5" />
              <stop offset=".7" stopColor="#7A30C4" />
              <stop offset="1" stopColor="#D044DC" />
            </linearGradient>
          </defs>
          <path className="map-land" d={IBIZA_PATH} />
          <path className="map-land" d={FORMENTERA_PATH} />
          <line className="map-route" x1={v.x} y1={v.y} x2={z.x} y2={z.y} key={active} />
          {ZONES.map((p) => {
            const q = project(p.lon, p.lat)
            return (
              <g key={p.id} className="map-zone" data-kind={p.kind} data-on={p.id === active || undefined} transform={`translate(${q.x} ${q.y})`}>
                <circle className="map-pulse" r="22" />
                <circle r="8" />
              </g>
            )
          })}
          <g className="map-villa" transform={`translate(${v.x} ${v.y})`}>
            <circle r="17" fill="url(#holo)" />
            <circle r="7" className="map-villa-core" />
          </g>
        </svg>
        <p className="map-caption">The villa in Cala Molí to {zone.name}: {km(VILLA, zone).toFixed(0)} km in a straight line</p>
      </div>

      <ul className="map-list">
        {ZONES.map((p) => (
          <li key={p.id} data-on={p.id === active || undefined}>
            <button type="button" onClick={() => setActive(p.id)} onMouseEnter={() => setActive(p.id)} onFocus={() => setActive(p.id)} aria-pressed={p.id === active}>
              <span className="map-name">{p.name}</span>
              <span className="map-kind">{p.kind === "club" ? "Clubs" : "Beach clubs"} · {km(VILLA, p).toFixed(0)} km</span>
            </button>
            <div className="map-venues">
              <p>{p.venues.join(", ")}</p>
              <a href={contactHref(`Hello Mey Society, I would like a reservation in ${p.name} (${p.venues.join(", ")}).`)}>Reserve in {p.name}</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
