"use client"

import * as React from "react"
import { Compass, House, MessageCircle, Sparkles } from "lucide-react"
import { LiquidNavbar, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar"

declare global {
  interface Window {
    ConciergeJourney?: { goTo: (id: string) => void; current: () => string | null }
  }
}

const icon = (Icon: typeof Compass) => <Icon size={18} strokeWidth={1.8} aria-hidden="true" />

// Cada botón apunta a una sección del recorrido (ids de public/js/config.js) o al formulario.
const SECTIONS: (LiquidNavItem & { id: string })[] = [
  { id: "above", label: "Island", icon: icon(Compass), fx: "spin" },
  { id: "villas", label: "Villas", icon: icon(House), fx: "glow" },
  { id: "concierge", label: "Services", icon: icon(Sparkles), fx: "pop" },
  { id: "contact", label: "Contact", icon: icon(MessageCircle), fx: "wave" },
]

export function SiteNav() {
  const [active, setActive] = React.useState(0)
  const [tone, setTone] = React.useState<"light" | "dark">("dark")
  // Mientras la página se desplaza hacia el destino elegido, no seguimos las secciones intermedias.
  const target = React.useRef<{ id: string; until: number } | null>(null)

  React.useEffect(() => {
    const onSection = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      const t = target.current
      if (t && Date.now() < t.until && id !== t.id) return
      target.current = null
      const i = SECTIONS.findIndex((s) => s.id === id)
      if (i >= 0) setActive(i)
    }
    window.addEventListener("journey:section", onSection)

    // Agua clara sobre el formulario (fondo marfil), oscura sobre el mapa.
    const sync = () => setTone(document.body.classList.contains("on-light") ? "light" : "dark")
    const mo = new MutationObserver(sync)
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] })
    sync()
    return () => {
      window.removeEventListener("journey:section", onSection)
      mo.disconnect()
    }
  }, [])

  return (
    <LiquidNavbar
      className="site-nav"
      items={SECTIONS}
      active={active}
      tone={tone}
      onChange={(i) => {
        const { id } = SECTIONS[i]
        setActive(i)
        target.current = { id, until: Date.now() + 2500 }
        window.ConciergeJourney?.goTo(id)
      }}
    />
  )
}
