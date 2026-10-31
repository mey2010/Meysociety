"use client"

/*
 * Menú "cápsula": una sola pieza de cristal líquido arriba en el centro.
 *  - rest     arriba del todo: marca, enlaces, acceso y botón principal.
 *  - compact  al hacer scroll: se contrae a la marca + capítulo actual + anillo de progreso.
 *             Al pasar el ratón por encima vuelve a abrirse en barra.
 *  - open     el mismo cristal se despliega (animación de layout con muelle) en un panel
 *             con los capítulos del recorrido, una vista previa en arco y contacto directo.
 * Escape, clic fuera o elegir un destino lo vuelve a plegar.
 */

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, MessageCircle, X } from "lucide-react"
import { BRAND, SCENES, type MediaKey } from "@/lib/content"
import { Media } from "@/components/media"
import { useLiquidGlass } from "@/components/ui/liquid-glass"
import { lockScroll, scrollToTarget } from "@/components/providers"

type Dest = { id: string; label: string; media: MediaKey; line: string; scene?: boolean }

const SECTIONS: Dest[] = [
  { id: "services", label: "Services", media: "villaPool", line: "Villas, yachts, cars, tables" },
  { id: "island", label: "The island", media: "sea", line: "Where everything is" },
  { id: "builder", label: "Build your stay", media: "poolSea", line: "Combine and unlock perks" },
  { id: "private", label: "Your private area", media: "restaurant", line: "Your itinerary, live" },
  { id: "faq", label: "Questions", media: "beach", line: "Licences, lists, cancellations" },
  { id: "contact", label: "Contact", media: "yacht", line: "Talk to your concierge" },
]

const JOURNEY: Dest[] = SCENES.filter((s) => s.number).map((s) => ({
  id: s.id,
  label: s.label,
  media: s.plate ?? (s.id === "above" ? "sea" : "poolSea"),
  line: s.place ?? "",
  scene: true,
}))

const LINKS = [
  { id: "services", label: "Services" },
  { id: "island", label: "Island" },
  { id: "builder", label: "Packages" },
  { id: "faq", label: "FAQ" },
]

const spring = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const

export function CapsuleMenu({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [open, setOpen] = React.useState(false)
  const [compact, setCompact] = React.useState(false)
  const [hover, setHover] = React.useState(false)
  const [chapter, setChapter] = React.useState("Ibiza")
  const [progress, setProgress] = React.useState(0)
  const [preview, setPreview] = React.useState<Dest>(SECTIONS[0])
  const [onLight, setOnLight] = React.useState(tone === "light")
  const reduce = useReducedMotion()
  const menuBtn = React.useRef<HTMLButtonElement>(null)
  const panel = React.useRef<HTMLDivElement>(null)
  const glass = useLiquidGlass<HTMLDivElement>({ radius: 30, bezel: 18, scale: 40, disabled: open })

  // estado compacto, progreso y capítulo actual
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setCompact(y > 64)
      setProgress(max > 0 ? Math.min(1, y / max) : 0)
    }
    const onSection = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      const s = SCENES.find((x) => x.id === id)
      if (s) setChapter(s.label)
    }
    // capítulos fuera del recorrido y tono del fondo bajo la cápsula
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const el = e.target as HTMLElement
          if (el.dataset.chapter) setChapter(el.dataset.chapter)
          setOnLight(el.dataset.ground === "light")
        }
      },
      { rootMargin: "0px 0px -94% 0px" },
    )
    document.querySelectorAll<HTMLElement>("[data-ground]").forEach((el) => io.observe(el))
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("journey:section", onSection)
    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("journey:section", onSection)
    }
  }, [])

  // abrir / cerrar: bloqueo de scroll, foco y Escape
  React.useEffect(() => {
    if (!open) return
    const trigger = menuBtn.current
    lockScroll(true)
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>("a,button")?.focus(), 260)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a,button")
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      lockScroll(false)
      setHover(false)
      window.clearTimeout(t)
      window.removeEventListener("keydown", onKey)
      trigger?.focus({ preventScroll: true })
    }
  }, [open])

  const go = (d: { id: string; scene?: boolean }) => {
    setOpen(false)
    // espera a que se desbloquee el scroll antes de desplazarse
    window.setTimeout(() => {
      if (d.scene && window.ConciergeJourney) window.ConciergeJourney.goTo(d.id)
      else scrollToTarget(`#${d.id}`)
    }, 60)
  }

  const state = open ? "open" : compact && !hover ? "compact" : "rest"
  const t = reduce ? { duration: 0 } : spring
  const C = 2 * Math.PI * 9

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            className="cap-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="cap-wrap" data-state={state} data-on-light={onLight && !open ? "true" : undefined}>
        <motion.div
          ref={glass.ref}
          layout
          transition={t}
          className="cap lg"
          style={{ borderRadius: 30, ...glass.props.style }}
          data-refract={glass.props["data-refract"]}
          onPointerMove={glass.props.onPointerMove}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          {glass.svg}
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.div
                key="bar"
                layout="position"
                className="cap-bar"
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.12 } }}
                transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.08 }}
              >
                <motion.a layout="position" href="#top" className="cap-brand" onClick={(e) => { e.preventDefault(); scrollToTarget(0) }} aria-label={`${BRAND.name}, back to the top`}>
                  <span className="cap-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--sand)" strokeWidth="1.5" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 12 12)" strokeLinecap="round" />
                      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="cap-name">{BRAND.name}</span>
                </motion.a>

                <AnimatePresence mode="popLayout" initial={false}>
                  {state === "compact" ? (
                    <motion.span
                      key="chapter"
                      className="cap-chapter"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                      aria-live="polite"
                    >
                      {chapter}
                    </motion.span>
                  ) : (
                    <motion.nav
                      key="links"
                      className="cap-links"
                      aria-label="Main"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                    >
                      {LINKS.map((l) => (
                        <a key={l.id} href={`#${l.id}`} onClick={(e) => { e.preventDefault(); go(l) }}>
                          {l.label}
                        </a>
                      ))}
                      <Link href="/login" className="cap-signin">Sign in</Link>
                      <a href="#builder" className="cap-cta" onClick={(e) => { e.preventDefault(); go({ id: "builder" }) }}>Plan my stay</a>
                    </motion.nav>
                  )}
                </AnimatePresence>

                <motion.button
                  layout="position"
                  ref={menuBtn}
                  type="button"
                  className="cap-menu"
                  aria-expanded={open}
                  aria-controls="cap-panel"
                  onClick={() => setOpen(true)}
                >
                  <span className="cap-burger" aria-hidden="true"><i /><i /></span>
                  <span>Menu</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="panel"
                id="cap-panel"
                ref={panel}
                className="cap-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : 0.12 }}
              >
                <div className="cap-panel-head">
                  <span className="cap-name">{BRAND.name}</span>
                  <button type="button" className="cap-close" onClick={() => setOpen(false)} aria-label="Close menu">
                    <X size={18} strokeWidth={1.6} />
                  </button>
                </div>

                <div className="cap-grid">
                  <nav className="cap-main" aria-label="Sections">
                    {SECTIONS.map((d, i) => (
                      <motion.a
                        key={d.id}
                        href={`#${d.id}`}
                        className="cap-big"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...(reduce ? { duration: 0 } : spring), delay: reduce ? 0 : 0.14 + i * 0.045 }}
                        onPointerEnter={() => setPreview(d)}
                        onFocus={() => setPreview(d)}
                        onClick={(e) => { e.preventDefault(); go(d) }}
                      >
                        <span>{d.label}</span>
                        <small>{d.line}</small>
                      </motion.a>
                    ))}
                  </nav>

                  <div className="cap-side">
                    <div className="cap-preview arch" aria-hidden="true">
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={preview.id}
                          className="cap-preview-img"
                          initial={{ opacity: 0, scale: 1.08 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Media k={preview.media} sizes="320px" caption={preview.label} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    <div className="cap-journey">
                      <p className="cap-journey-title">The journey</p>
                      <ul>
                        {JOURNEY.map((d) => (
                          <li key={d.id}>
                            <a
                              href={`#${d.id}`}
                              onPointerEnter={() => setPreview(d)}
                              onFocus={() => setPreview(d)}
                              onClick={(e) => { e.preventDefault(); go(d) }}
                            >
                              {d.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="cap-foot">
                  <a className="btn ivory" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} strokeWidth={1.6} aria-hidden="true" /> WhatsApp your concierge
                  </a>
                  <Link className="cap-foot-link" href="/login">
                    Sign in to your stay <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
                  </Link>
                  <a className="cap-foot-link" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
    </>
  )
}
