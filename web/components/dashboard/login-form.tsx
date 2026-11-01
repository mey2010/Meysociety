"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { BRAND } from "@/lib/content"
import { FORMENTERA_PATH, IBIZA_PATH, MAP_H, MAP_W } from "@/lib/geo"
import { Media } from "@/components/media"
import { GlassButton } from "@/components/ui/liquid-glass"

const DEMO = { email: "demo@concierge-ibiza.com", code: "IBIZA2026" }

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const reduce = useReducedMotion()
  const [email, setEmail] = React.useState("")
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !code) {
      setError("Enter the email you booked with and the code from your confirmation.")
      return
    }
    setBusy(true)
    const res = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || "We could not sign you in. Try again or message your concierge.")
      return
    }
    const next = params.get("next")
    router.push(next && next.startsWith("/panel") ? next : "/panel")
  }

  const t = (d: number) => (reduce ? { duration: 0 } : { duration: 0.9, delay: d, ease: [0.16, 1, 0.3, 1] as const })

  return (
    <main className="si-page">
      <div className="si-visual" aria-hidden="true">
        <motion.div className="si-photo arch" initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }} transition={t(0.1)}>
          <Media k="poolSea" priority sizes="(max-width: 900px) 80vw, 40vw" />
        </motion.div>
        <svg className="si-island" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
          <path d={IBIZA_PATH} />
          <path d={FORMENTERA_PATH} />
        </svg>
      </div>

      <motion.section className="si-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={t(0.25)} aria-labelledby="si-title">
        <Link className="si-back" href="/"><ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" /> {BRAND.name}</Link>
        <h1 id="si-title" className="h2">Welcome back to the island.</h1>
        <p className="lead">Sign in with the email you booked with and the code in your confirmation to see your stay, day by day.</p>

        <form className="si-form" onSubmit={submit} noValidate>
          <label>
            Booking email
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "si-error" : undefined} />
          </label>
          <label>
            Booking code
            <input type="text" autoComplete="one-time-code" autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "si-error" : undefined} />
          </label>
          {error && <p className="si-error" id="si-error" role="alert">{error}</p>}
          <GlassButton type="submit" tone="solid" disabled={busy}>
            {busy ? "Opening your stay…" : "Open my stay"} <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </GlassButton>
        </form>

        <div className="si-demo">
          <p>
            <b>Demo access</b> — {DEMO.email} · {DEMO.code}
          </p>
          <button type="button" onClick={() => { setEmail(DEMO.email); setCode(DEMO.code); setError("") }}>Fill in the demo access</button>
        </div>
        <p className="si-help">
          Lost your code? <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">Message your concierge</a>.
        </p>
      </motion.section>
    </main>
  )
}
