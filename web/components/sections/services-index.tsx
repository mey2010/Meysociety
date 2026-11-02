"use client"

/*
 * Índice de servicios: nombres en grande; al pasar el ratón, una foto en arco sigue al
 * cursor con un muelle (se inclina según la velocidad) y cambia con cada servicio.
 * En pantallas táctiles cada fila lleva su miniatura y no hay foto flotante.
 */

import * as React from "react"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SERVICES } from "@/lib/content"
import { Media } from "@/components/media"
import { scrollToTarget } from "@/components/providers"

export function addToStay(id: string) {
  window.dispatchEvent(new CustomEvent("builder:add", { detail: id }))
  scrollToTarget("#builder")
}

export function ServicesIndex() {
  const list = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState<number | null>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 })
  const vx = useVelocity(sx)
  const rotate = useTransform(vx, [-2400, 0, 2400], [-9, 0, 9], { clamp: true })

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !list.current) return
    const r = list.current.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }

  return (
    <section id="services" className="sv" data-ground="light" data-chapter="Services" aria-labelledby="sv-title">
      <div className="wrap sv-head">
        <h2 id="sv-title" className="h2" data-reveal>Eight ways into the island.</h2>
        <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
          One concierge for all of it. Pick one service or combine several — the more you combine, the more of Ibiza opens up.
        </p>
      </div>

      <div ref={list} className="sv-stage wrap" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
        <ol className="sv-list">
          {SERVICES.map((s, i) => (
            <li key={s.id} data-reveal style={{ ["--d" as string]: i % 4 }}>
              <button
                type="button"
                className="sv-row"
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => addToStay(s.id)}
                aria-describedby={`sv-${s.id}`}
              >
                <Media k={s.media} className="sv-thumb arch" sizes="96px" caption={s.name} />
                <span className="sv-name">{s.name}</span>
                <span className="sv-copy" id={`sv-${s.id}`}>
                  <span>{s.line}</span>
                  <small>{s.details.join(" · ")}</small>
                </span>
                <span className="sv-add">
                  Add to my stay <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* foto que sigue al cursor */}
        <motion.div className="sv-float" aria-hidden="true" style={{ x: sx, y: sy, rotate: reduce ? 0 : rotate }}>
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key={SERVICES[active].id}
                className="sv-float-img arch"
                initial={{ opacity: 0, scale: 0.86, clipPath: "inset(100% 0% 0% 0%)" }}
                animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
                transition={{ duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <Media k={SERVICES[active].media} sizes="340px" caption={SERVICES[active].name} />
                <span className="sv-float-note">{SERVICES[active].note}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
