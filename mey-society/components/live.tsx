"use client"

/* Piezas pequeñas de cliente: la puesta de sol de hoy en Cala Molí y las entradas al hacer scroll. */
import * as React from "react"
import { VILLA } from "@/lib/data"
import { formatIbizaTime, sunTimes } from "@/lib/geo"

export function SunsetToday() {
  const [t, setT] = React.useState<string | null>(null)
  React.useEffect(() => setT(formatIbizaTime(sunTimes(new Date(), VILLA.lat, VILLA.lon).sunset)), [])
  return (
    <p className="sunset">
      Sunset at {VILLA.name} today <b suppressHydrationWarning>{t ?? "—"}</b>
    </p>
  )
}

/** Entrada escalonada: cada [data-reveal] sube y aparece una vez al entrar en pantalla. */
export function Reveal() {
  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
    document.documentElement.classList.add("reveal-ready")
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add("in")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
