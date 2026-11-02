"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { BRAND, CONSTELLATION, MEDIA, PLACES, SCENES } from "@/lib/content"
import { FORMENTERA_PATH, IBIZA_PATH, MAP_H, MAP_W, formatIbizaTime, project, sunTimes } from "@/lib/geo"
import { startJourney } from "@/lib/journey/run"
import { Media } from "@/components/media"
import { GlassButton } from "@/components/ui/liquid-glass"
import { scrollToTarget } from "@/components/providers"

export function SunsetToday({ place = "comte" }: { place?: string }) {
  const [time, setTime] = React.useState<string | null>(null)
  const p = PLACES.find((x) => x.id === place) ?? PLACES[0]
  React.useEffect(() => {
    setTime(formatIbizaTime(sunTimes(new Date(), p.lat, p.lon).sunset))
  }, [p.lat, p.lon])
  return (
    <span className="sunset">
      Sunset at {p.name} today <b suppressHydrationWarning>{time ?? "—"}</b>
    </span>
  )
}

const N = CONSTELLATION.length
const NODES = CONSTELLATION.map((label, k) => {
  const a = -Math.PI / 2 + (k / N) * Math.PI * 2
  return { label, x: 500 + Math.cos(a) * 360, y: 500 + Math.sin(a) * 330 }
})

export function Journey() {
  React.useEffect(() => startJourney(), [])

  return (
    <>
      {/* Intro: se levanta cuando la primera vista del mapa está lista */}
      <div id="intro" aria-hidden="true">
        <p className="intro-logo">{BRAND.name}</p>
        <span className="intro-line" />
      </div>

      {/* Capa geográfica (real) */}
      <div id="stage" aria-hidden="true">
        <div id="cesium" />
        {/* intro: cielo, nubes 3D y ventanilla del avión, ligados al primer tramo de scroll */}
        <div id="sky-haze" />
        <div id="sky" />
        <div id="porthole"><span className="porthole-glass" /></div>
        <div id="grade" />
        <div id="night" />
        <div className="vignette" />

        <div id="minimap">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="presentation">
            <path className="mm-land" d={IBIZA_PATH} />
            <path className="mm-land" d={FORMENTERA_PATH} />
            {SCENES.map((s, i) =>
              s.number && s.number > 1 && s.number < 8 ? (
                <g key={s.id} data-scene={i} className="mm-mark" transform={`translate(${project(s.camera.lon, s.camera.lat).x} ${project(s.camera.lon, s.camera.lat).y})`}>
                  <circle r="7" />
                  <text x="16" y="5">{s.label}</text>
                </g>
              ) : null,
            )}
            <g id="mm-dot">
              <path d="M0 -26 L9 6 L0 0 L-9 6Z" className="mm-cone" />
              <circle r="8" />
            </g>
          </svg>
        </div>

        <div className="plates">
          {SCENES.map((s, i) =>
            s.plate ? (
              <figure key={s.id} className="plate" data-scene={i} data-cards={s.cards ? "" : undefined}>
                <div className="plate-frame arch">
                  <Media k={s.plate} sizes="(max-width: 760px) 70vw, 30vw" caption={MEDIA[s.plate].alt} />
                </div>
                <figcaption>{s.place}</figcaption>
              </figure>
            ) : null,
          )}
        </div>

        <svg id="constellation" viewBox="0 0 1000 1000" role="presentation">
          <g className="ring">
            {NODES.map((n, k) => {
              const m = NODES[(k + 1) % N]
              return <line key={k} pathLength={1} x1={n.x} y1={n.y} x2={m.x} y2={m.y} style={{ ["--k" as string]: k }} />
            })}
          </g>
          <g className="spokes">
            {NODES.map((n, k) => (
              <line key={k} pathLength={1} x1={500} y1={500} x2={n.x} y2={n.y} style={{ ["--k" as string]: k }} />
            ))}
          </g>
          <g className="nodes">
            {NODES.map((n, k) => (
              <g key={k} className="node" style={{ ["--k" as string]: k }} transform={`translate(${n.x} ${n.y})`}>
                <circle r="7" />
                <circle className="halo" r="16" />
                <text y={n.y < 500 ? -30 : 44} textAnchor="middle">{n.label}</text>
              </g>
            ))}
          </g>
          <g className="core">
            <circle r="76" />
            <text y="-6" textAnchor="middle">One</text>
            <text y="26" textAnchor="middle">concierge</text>
          </g>
        </svg>
      </div>
      <div id="credits" aria-label="Map data attribution" />
      <p id="status" role="status" />

      {/* Capa comercial */}
      <section id="journey" data-ground="dark" data-chapter="Ibiza" aria-label="A journey across Ibiza">
        <div id="world-track">
          <div className="sticky">
            <div id="panels">
              {SCENES.map((s, i) =>
                s.title ? (
                  <article key={s.id} id={s.id} className={`panel${i === 0 ? " panel-hero on" : ""}${s.constellation ? " panel-finale" : ""}`} data-scene={i}>
                    {i === 0 ? (
                      <h1 className="display">{s.title}</h1>
                    ) : (
                      <h2 className="h2">{s.title}</h2>
                    )}
                    <p className="lead">{s.body}</p>
                    {(s.place || s.sunset) && (
                      <p className="panel-meta">
                        {s.place && <span>{s.place}</span>}
                        {!s.verified && <span className="pending">Location pending validation</span>}
                        {s.sunset && <SunsetToday />}
                      </p>
                    )}
                    {s.cards && (
                      <div className="cards">
                        {s.cards.map((c, k) => (
                          <article className="card" key={k}>
                            <Media k={c.media} className="card-media" sizes="(max-width: 760px) 60vw, 280px" caption={c.name} />
                            <div className="card-body">
                              <h3>{c.name}</h3>
                              <p className="card-meta">{c.meta}{c.licence ? ` · ${c.licence}` : ""}</p>
                              <ul>{c.features.map((f) => <li key={f}>{f}</li>)}</ul>
                              <GlassButton href="#builder" size="small" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("builder:add", { detail: c.service })); scrollToTarget("#builder") }}>
                                Enquire
                              </GlassButton>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    {s.cta && (
                      <div className="panel-actions">
                        <GlassButton href={s.cta.href} tone={s.cta.primary ? "solid" : "dark"} onClick={(e) => { e.preventDefault(); scrollToTarget(s.cta!.href) }}>
                          {s.cta.label}
                        </GlassButton>
                        {i === 0 && (
                          <GlassButton href="#villas" onClick={(e) => { e.preventDefault(); window.ConciergeJourney?.goTo("villas") }}>
                            Begin the journey <ArrowDown size={16} strokeWidth={1.6} aria-hidden="true" />
                          </GlassButton>
                        )}
                      </div>
                    )}
                  </article>
                ) : null,
              )}
            </div>

            <nav className="rail-wrap" aria-label="Journey chapters">
              <span className="rail-track"><span id="rail-fill" /></span>
              <ol id="rail">
                {SCENES.map((s, i) =>
                  s.number ? (
                    <li key={s.id} data-scene={i}>
                      <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); window.ConciergeJourney?.goTo(s.id) }}>{s.label}</a>
                    </li>
                  ) : null,
                )}
              </ol>
              <a className="rail-skip" href="#services" onClick={(e) => { e.preventDefault(); scrollToTarget("#services") }}>Skip the journey</a>
            </nav>
            <p className="scroll-hint" aria-hidden="true"><span />Scroll</p>
          </div>
        </div>
      </section>
    </>
  )
}
