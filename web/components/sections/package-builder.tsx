"use client"

/*
 * Configurador de estancia: el visitante elige servicios (o parte de un paquete), fechas y
 * grupo, y ve cómo se desbloquean ventajas sin coste a medida que combina. El resultado
 * se envía al concierge por WhatsApp o email, ya redactado.
 *
 * Estrategia legal (docs/estrategia-legal-paquetes.md): las ventajas no se venden ni
 * tienen valor monetario, el acceso a listas queda a criterio del local, y un paquete con
 * precio global se organiza bajo licencia de agencia de viajes.
 */

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { Check, Lock, MessageCircle } from "lucide-react"
import { BRAND, PACKAGES, PERKS, PERK_TERMS, SERVICES } from "@/lib/content"
import { Media } from "@/components/media"
import { GlassButton } from "@/components/ui/liquid-glass"

const nightsBetween = (a: string, b: string) => {
  if (!a || !b) return 0
  const n = Math.round((Date.parse(b) - Date.parse(a)) / 86400000)
  return n > 0 ? n : 0
}

export function PackageBuilder() {
  const [picked, setPicked] = React.useState<string[]>(["villas", "yachts"])
  const [preset, setPreset] = React.useState<string | null>(null)
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [guests, setGuests] = React.useState(4)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    const onAdd = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      setPreset(null)
      setPicked((p) => (p.includes(id) ? p : [...p, id]))
    }
    window.addEventListener("builder:add", onAdd)
    return () => window.removeEventListener("builder:add", onAdd)
  }, [])

  const toggle = (id: string) => {
    setPreset(null)
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  const choose = (id: string) => {
    const pk = PACKAGES.find((p) => p.id === id)!
    setPreset(id)
    setPicked(pk.services)
  }

  const count = picked.length
  const nights = nightsBetween(from, to)
  const unlocked = PERKS.filter((p) => count >= p.at)
  const next = PERKS.find((p) => count < p.at)
  const chosen = SERVICES.filter((s) => picked.includes(s.id))
  const pk = PACKAGES.find((p) => p.id === preset)

  const message = [
    `Hello ${BRAND.name}, I would like a proposal for my stay in Ibiza.`,
    pk ? `Package: ${pk.name} (${pk.nights} nights)` : "",
    `Services: ${chosen.map((s) => s.name).join(", ") || "—"}`,
    `Dates: ${from || "—"} → ${to || "—"}${nights ? ` (${nights} nights)` : ""}`,
    `Guests: ${guests}`,
    unlocked.length ? `Perks unlocked: ${unlocked.map((p) => p.name).join(", ")}` : "",
  ].filter(Boolean).join("\n")

  const wa = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`
  const mail = `mailto:${BRAND.email}?subject=${encodeURIComponent("Proposal for my stay in Ibiza")}&body=${encodeURIComponent(message)}`
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 36 }

  return (
    <section id="builder" className="bd" data-ground="light" data-chapter="Build your stay" aria-labelledby="bd-title">
      <div className="wrap bd-grid">
        <div className="bd-main">
          <h2 id="bd-title" className="h2" data-reveal>Build your stay.</h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
            Choose what you want and when. The more you combine, the more doors open — at no extra cost.
          </p>

          <div className="bd-presets" data-reveal style={{ ["--d" as string]: 2 }}>
            <p className="bd-label" id="bd-presets">Start from a signature stay</p>
            <div role="group" aria-labelledby="bd-presets" className="bd-preset-row">
              {PACKAGES.map((p) => (
                <button key={p.id} type="button" className="bd-preset" aria-pressed={preset === p.id} onClick={() => choose(p.id)}>
                  <span className="bd-preset-name">{p.name}</span>
                  <span className="bd-preset-meta">{p.nights} nights · {p.services.length} services</span>
                  <span className="bd-preset-line">{p.line}</span>
                </button>
              ))}
            </div>
          </div>

          <fieldset className="bd-services" data-reveal style={{ ["--d" as string]: 3 }}>
            <legend className="bd-label">Or choose service by service</legend>
            <div className="bd-svc-grid">
              {SERVICES.map((s) => {
                const on = picked.includes(s.id)
                return (
                  <label key={s.id} className="bd-svc" data-on={on || undefined}>
                    <input type="checkbox" checked={on} onChange={() => toggle(s.id)} />
                    <Media k={s.media} className="bd-svc-img arch" sizes="80px" caption={s.name} />
                    <span className="bd-svc-text">
                      <span className="bd-svc-name">{s.name}</span>
                      <small>{s.line}</small>
                    </span>
                    <span className="bd-check" aria-hidden="true"><Check size={14} strokeWidth={2.4} /></span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="bd-fields" data-reveal style={{ ["--d" as string]: 4 }}>
            <label>Arrival<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label>Departure<input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
            <label>
              Guests
              <span className="bd-stepper">
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="One guest fewer">−</button>
                <output aria-live="polite">{guests}</output>
                <button type="button" onClick={() => setGuests((g) => Math.min(40, g + 1))} aria-label="One guest more">+</button>
              </span>
            </label>
          </div>
        </div>

        <aside className="bd-summary" aria-label="Your stay so far">
          <div className="bd-card">
            <div className="bd-card-head">
              <h3 className="h3">{pk ? pk.name : "Your stay"}</h3>
              <p>
                {count} {count === 1 ? "service" : "services"}
                {nights ? ` · ${nights} nights` : pk ? ` · ${pk.nights} nights` : ""} · {guests} {guests === 1 ? "guest" : "guests"}
              </p>
            </div>

            <LayoutGroup>
              <motion.ul layout className="bd-chosen">
                <AnimatePresence initial={false}>
                  {chosen.map((s) => (
                    <motion.li
                      layout
                      key={s.id}
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                      transition={spring}
                    >
                      <span>{s.name}</span>
                      <button type="button" onClick={() => toggle(s.id)} aria-label={`Remove ${s.name}`}>×</button>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {!chosen.length && <li className="bd-empty">Nothing yet — pick a signature stay or a service.</li>}
              </motion.ul>

              <motion.div layout className="bd-perks">
                <p className="bd-perks-title">
                  {next ? (
                    <>Add {next.at - count} more {next.at - count === 1 ? "service" : "services"} to unlock <b>{next.name}</b></>
                  ) : (
                    <>Every perk unlocked</>
                  )}
                </p>
                <div className="bd-meter" aria-hidden="true">
                  {PERKS.map((p) => <span key={p.name} data-on={count >= p.at || undefined} />)}
                </div>
                <ol className="bd-perk-list">
                  {PERKS.map((p) => {
                    const on = count >= p.at
                    return (
                      <li key={p.name} data-on={on || undefined}>
                        <span className="bd-perk-icon" aria-hidden="true">{on ? <Check size={14} strokeWidth={2.4} /> : <Lock size={13} strokeWidth={1.8} />}</span>
                        <span>
                          <b>{p.name}</b>
                          <small>{on ? p.line : `With ${p.at} services`}</small>
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </motion.div>
            </LayoutGroup>

            <div className="bd-actions">
              <GlassButton href={wa} tone="solid" target="_blank" rel="noopener noreferrer" aria-label="Send this stay to your concierge on WhatsApp">
                <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" /> Send to my concierge
              </GlassButton>
              <a className="bd-mail" href={mail}>Or send it by email</a>
            </div>
            <p className="bd-terms">{PERK_TERMS} A package sold at one inclusive price is organised under a travel agency licence and protected as a package holiday.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
