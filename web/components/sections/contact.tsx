"use client"

import * as React from "react"
import { Mail, MessageCircle, Phone } from "lucide-react"
import { BRAND, SERVICES } from "@/lib/content"
import { GlassButton } from "@/components/ui/liquid-glass"

export function Contact() {
  const form = React.useRef<HTMLFormElement>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const compose = () => {
    const d = new FormData(form.current!)
    const services = d.getAll("services") as string[]
    const next: Record<string, string> = {}
    if (!services.length) next.services = "Choose at least one service."
    if (!String(d.get("name") || "").trim()) next.name = "Tell us your name."
    if (!d.get("consent")) next.consent = "We need your consent to reply to you."
    setErrors(next)
    if (Object.keys(next).length) {
      form.current?.querySelector<HTMLElement>(`[data-field="${Object.keys(next)[0]}"] input`)?.focus()
      return null
    }
    return [
      `Hello ${BRAND.name}, I would like to create a private experience.`,
      `Services: ${services.join(", ")}`,
      `Dates: ${d.get("from") || "—"} → ${d.get("to") || "—"}`,
      `Guests: ${d.get("guests") || "—"}`,
      `Name: ${d.get("name")}`,
      d.get("email") ? `Email: ${d.get("email")}` : "",
      d.get("notes") ? `Notes: ${d.get("notes")}` : "",
    ].filter(Boolean).join("\n")
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = compose()
    if (text) window.open(`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener")
  }
  const byEmail = () => {
    const text = compose()
    if (text) window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent("My stay in Ibiza")}&body=${encodeURIComponent(text)}`
  }

  return (
    <section id="contact" className="ct" data-ground="dark" data-chapter="Contact" aria-labelledby="ct-title">
      <div className="wrap ct-grid">
        <div className="ct-copy">
          <h2 id="ct-title" className="h2" data-reveal>Talk to your concierge.</h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
            A person who lives on the island answers — not a call centre. Tell us what you have in mind and we will come back with a written proposal.
          </p>
          <div className="ct-direct" data-reveal style={{ ["--d" as string]: 2 }}>
            <GlassButton href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" /> WhatsApp
            </GlassButton>
            <a href={`tel:+${BRAND.whatsapp}`}><Phone size={16} strokeWidth={1.6} aria-hidden="true" /> {BRAND.phoneDisplay}</a>
            <a href={`mailto:${BRAND.email}`}><Mail size={16} strokeWidth={1.6} aria-hidden="true" /> {BRAND.email}</a>
          </div>
          <p className="ct-hours" data-reveal style={{ ["--d" as string]: 3 }}>{BRAND.hours}. Based in {BRAND.base}.</p>
        </div>

        <form ref={form} className="ct-form" noValidate onSubmit={onSubmit} data-reveal style={{ ["--d" as string]: 1 }}>
          <fieldset data-field="services" aria-describedby={errors.services ? "ct-e-services" : undefined}>
            <legend>What should we arrange?</legend>
            <div className="ct-chips">
              {SERVICES.map((s) => (
                <label key={s.id} className="ct-chip">
                  <input type="checkbox" name="services" value={s.name} />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
            {errors.services && <p className="ct-error" id="ct-e-services" role="alert">{errors.services}</p>}
          </fieldset>
          <div className="ct-row">
            <label>Arrival<input type="date" name="from" /></label>
            <label>Departure<input type="date" name="to" /></label>
            <label>Guests<input type="number" name="guests" min={1} max={60} inputMode="numeric" placeholder="4" /></label>
          </div>
          <div className="ct-row ct-row-2">
            <label data-field="name">
              Name
              <input type="text" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "ct-e-name" : undefined} />
              {errors.name && <span className="ct-error" id="ct-e-name" role="alert">{errors.name}</span>}
            </label>
            <label>Email<input type="email" name="email" autoComplete="email" /></label>
          </div>
          <label>Anything we should know?<textarea name="notes" rows={3} placeholder="A birthday, a proposal, a favourite beach…" /></label>
          <label className="ct-consent" data-field="consent">
            <input type="checkbox" name="consent" aria-describedby={errors.consent ? "ct-e-consent" : undefined} />
            <span>
              I agree that {BRAND.name} uses these details to answer my request, as described in the <a href="/legal#privacy">privacy policy</a>.
            </span>
          </label>
          {errors.consent && <p className="ct-error" id="ct-e-consent" role="alert">{errors.consent}</p>}
          <div className="ct-actions">
            <button className="btn ivory" type="submit">CREATE YOUR PRIVATE EXPERIENCE</button>
            <button className="ct-alt" type="button" onClick={byEmail}>Send by email instead</button>
          </div>
          <p className="ct-note">Your request opens in WhatsApp, ready to send. Nothing is stored on this website.</p>
        </form>
      </div>
    </section>
  )
}
