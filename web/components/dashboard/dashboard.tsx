"use client"

/*
 * Panel del cliente: el itinerario de su estancia, que se va completando solo con la hora
 * real de Ibiza. Anillo de progreso, días con su propio anillo, línea del día que se rellena
 * hasta "ahora", tarjeta de lo que viene con cuenta atrás y la ruta del día sobre la isla.
 */

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { CalendarDays, FileText, LogOut, Map as MapIcon, MapPin, MessageCircle, Sun } from "lucide-react"
import { BRAND, PLACES } from "@/lib/content"
import { FORMENTERA_PATH, IBIZA_PATH, MAP_H, MAP_W, formatIbizaTime, project, sunTimes } from "@/lib/geo"
import { buildTrip, formatDay, ibizaClock, untilLabel, type TripDay, type TripEvent } from "@/lib/itinerary"
import { Timeline } from "@/components/dashboard/timeline"
import { GlassButton } from "@/components/ui/liquid-glass"
import { LiquidNavbar, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar"

const icon = (Icon: typeof Sun) => <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
const TABS: (LiquidNavItem & { id: string })[] = [
  { id: "today", label: "Today", icon: icon(Sun), fx: "spin" },
  { id: "days", label: "Days", icon: icon(CalendarDays), fx: "pop" },
  { id: "route", label: "Route", icon: icon(MapIcon), fx: "glow" },
  { id: "documents", label: "Documents", icon: icon(FileText), fx: "wave" },
]

const DOCS = [
  { name: "Package contract & pre-contract information", status: "Signed" },
  { name: "Villa booking · registration number on voucher", status: "Ready" },
  { name: "Yacht charter voucher", status: "Ready" },
  { name: "Fast boat tickets · Formentera", status: "Ready" },
  { name: "Club table confirmation", status: "Awaiting venue" },
]

function Ring({ value, size = 120, stroke = 6, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const reduce = useReducedMotion()
  return (
    <svg className="db-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--sand)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={reduce ? { duration: 0 } : { duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

function RouteMap({ day }: { day: TripDay }) {
  const stops = day.events
    .map((e) => ({ e, p: PLACES.find((x) => x.id === e.placeId) }))
    .filter((s): s is { e: TripEvent; p: (typeof PLACES)[number] } => !!s.p)
  const pts = stops.map((s) => project(s.p.lon, s.p.lat))
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("")
  // encuadre: solo Ibiza, salvo que el día pase por Formentera
  const viewBox = stops.some((s) => s.p.area === "Formentera") ? `0 0 ${MAP_W} ${MAP_H}` : "60 10 680 610"
  const doneCount = stops.filter((s) => s.e.status === "done").length
  const donePath = pts.slice(0, Math.max(1, doneCount + (stops[doneCount]?.e.status === "live" ? 1 : 0))).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("")
  return (
    <svg className="db-map" viewBox={viewBox} role="img" aria-label={`Route for ${day.title}: ${stops.map((s) => s.p.name).join(", ")}`}>
      <path className="db-land" d={IBIZA_PATH} />
      <path className="db-land" d={FORMENTERA_PATH} />
      {pts.length > 1 && <path className="db-route" d={path} />}
      {pts.length > 1 && <path key={day.index} className="db-route-done" d={donePath} pathLength={1} />}
      {stops.map((s, i) => (
        <g key={s.e.id} transform={`translate(${pts[i].x} ${pts[i].y})`} className="db-stop" data-status={s.e.status}>
          <circle r="10" />
          <text x="18" y="6">{s.p.name}</text>
        </g>
      ))}
    </svg>
  )
}

export function Dashboard({ name, now: initialNow }: { name: string; now: number }) {
  const router = useRouter()
  const [now, setNow] = React.useState(() => new Date(initialNow))
  const trip = React.useMemo(() => buildTrip(now), [now])
  const [selected, setSelected] = React.useState(trip.todayIndex)
  const [tab, setTab] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(id)
  }, [])

  const day = trip.days[selected]
  const focus = trip.live ?? trip.next
  const hour = Number(ibizaClock(now).slice(0, 2))
  const greeting = hour < 12 ? "Good morning" : hour < 19 ? "Good afternoon" : "Good evening"
  const sunset = formatIbizaTime(sunTimes(now, 38.95, 1.35).sunset)

  const signOut = async () => {
    await fetch("/api/session", { method: "DELETE" })
    router.push("/")
  }
  const goTab = (i: number) => {
    setTab(i)
    document.getElementById(`db-${TABS[i].id}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })
  }

  return (
    <div className="db">
      <header className="db-top">
        <Link href="/" className="db-brand">{BRAND.name}</Link>
        <p className="db-clock" suppressHydrationWarning>Ibiza <b>{ibizaClock(now)}</b> · sunset {sunset}</p>
        <div className="db-top-actions">
          <GlassButton href={`https://wa.me/${BRAND.whatsapp}`} size="small" target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} strokeWidth={1.6} aria-hidden="true" /> Concierge
          </GlassButton>
          <button type="button" className="db-signout" onClick={signOut}>
            <LogOut size={16} strokeWidth={1.6} aria-hidden="true" /> Sign out
          </button>
        </div>
      </header>

      <main className="db-main">
        <section id="db-today" className="db-hero" aria-labelledby="db-title">
          <div className="db-hero-copy">
            <h1 id="db-title" className="h2 db-title">{greeting}, {name}.</h1>
            <p className="lead">
              Day {trip.todayIndex + 1} of {trip.days.length} · {trip.days[trip.todayIndex].title}. {trip.done} of {trip.total} bookings done, everything else confirmed and waiting.
            </p>
          </div>
          <div className="db-progress">
            <Ring value={trip.done / trip.total} size={148} stroke={7} label={`${trip.done} of ${trip.total} bookings completed`} />
            <div className="db-progress-num"><b>{Math.round((trip.done / trip.total) * 100)}%</b><span>of your stay</span></div>
          </div>

          {focus && (
            <motion.article className="db-focus" data-status={focus.status} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <p className="db-focus-when" suppressHydrationWarning>
                {focus.status === "live" ? <><span className="db-live" /> Happening now</> : <>Next · {formatDay(focus.start)} at {focus.time} · {untilLabel(focus.start.getTime() - now.getTime())}</>}
              </p>
              <h2 className="h3">{focus.title}</h2>
              <p className="db-focus-place"><MapPin size={15} strokeWidth={1.6} aria-hidden="true" /> {focus.place}</p>
              <p className="db-focus-detail">{focus.detail}</p>
              {focus.contact && <p className="db-focus-contact">{focus.contact} will message you on WhatsApp before it starts.</p>}
            </motion.article>
          )}
        </section>

        <section id="db-days" className="db-days" aria-label="Days of your stay">
          <div className="db-strip" role="tablist" aria-label="Choose a day">
            {trip.days.map((d) => (
              <button
                key={d.index}
                type="button"
                role="tab"
                aria-selected={selected === d.index}
                className="db-day"
                data-status={d.status}
                onClick={() => setSelected(d.index)}
              >
                <Ring value={d.done / d.events.length} size={44} stroke={3} />
                <span className="db-day-text">
                  <small suppressHydrationWarning>{formatDay(d.date)}</small>
                  <span>{d.title}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="db-grid">
            <div className="db-panel" role="tabpanel" aria-label={`${formatDay(day.date)} · ${day.title}`}>
              <div className="db-panel-head">
                <h2 className="h3">Day {day.index + 1} · {day.title}</h2>
                <span>{day.done}/{day.events.length} done</span>
              </div>
              <Timeline day={day} now={now} />
            </div>

            <div className="db-side">
              <div id="db-route" className="db-panel">
                <div className="db-panel-head">
                  <h2 className="h3">Route of the day</h2>
                </div>
                <RouteMap day={day} />
              </div>

              <div id="db-documents" className="db-panel">
                <div className="db-panel-head">
                  <h2 className="h3">Documents</h2>
                </div>
                <ul className="db-docs">
                  {DOCS.map((d) => (
                    <li key={d.name}>
                      <FileText size={16} strokeWidth={1.6} aria-hidden="true" />
                      <span>{d.name}</span>
                      <small data-pending={d.status === "Awaiting venue" || undefined}>{d.status}</small>
                    </li>
                  ))}
                </ul>
                <p className="db-note">Deposit received. Balance due 14 days before arrival. Demo data — your real stay replaces it.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="db-tabbar">
        <LiquidNavbar items={TABS} active={tab} tone="dark" onChange={goTab} compact />
      </div>
    </div>
  )
}
