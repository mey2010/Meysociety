"use client"

import * as React from "react"
import { Car, CarFront, Check, Flower2, House, Music, Sailboat, Ship, Umbrella, UtensilsCrossed, Waves } from "lucide-react"
import type { EventType, TripDay, TripEvent } from "@/lib/itinerary"

const ICONS: Record<EventType, typeof Car> = {
  transfer: Car,
  villa: House,
  yacht: Sailboat,
  water: Waves,
  car: CarFront,
  dining: UtensilsCrossed,
  beach: Umbrella,
  night: Music,
  wellness: Flower2,
  boat: Ship,
}

const STATUS: Record<TripEvent["status"], string> = { done: "Done", live: "Happening now", next: "Next", upcoming: "Planned" }

const duration = (m: number) => (m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60}` : `${m / 60} h`)

/** Línea del día: el trazo se rellena hasta "ahora" y cada evento cambia de estado solo. */
export function Timeline({ day, compact = false, now }: { day: TripDay; compact?: boolean; now?: Date }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(r)
  }, [day.index])

  const t = (now ?? new Date()).getTime()
  const n = day.events.length
  // posición de "ahora" en la línea: eventos completos + fracción del que está en curso
  let fill = 0
  day.events.forEach((e, i) => {
    if (e.status === "done") fill = (i + 1) / n
    if (e.status === "live") fill = (i + Math.min(1, (t - e.start.getTime()) / (e.end.getTime() - e.start.getTime()))) / n
  })

  return (
    <ol className={`tl${compact ? " tl-compact" : ""}`} style={{ ["--fill" as string]: mounted ? fill : 0 }} key={day.index}>
      {day.events.map((e, i) => {
        const Icon = ICONS[e.type]
        return (
          <li key={e.id} className="tl-item" data-status={e.status} style={{ ["--i" as string]: i }}>
            <span className="tl-node" aria-hidden="true">
              {e.status === "done" ? <Check size={15} strokeWidth={2.4} /> : <Icon size={15} strokeWidth={1.8} />}
            </span>
            <div className="tl-body">
              <p className="tl-time">
                <time dateTime={e.start.toISOString()}>{e.time}</time> · {duration(e.minutes)}
              </p>
              <h4 className="tl-title">{e.title}</h4>
              <p className="tl-place">{e.place}</p>
              {!compact && <p className="tl-detail">{e.detail}</p>}
              <p className="tl-tags">
                <span className="tl-status">{STATUS[e.status]}</span>
                {!e.confirmed && <span className="tl-pending">Awaiting venue confirmation</span>}
                {!compact && e.contact && <span>{e.contact} on WhatsApp</span>}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
