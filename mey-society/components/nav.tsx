"use client"

/*
 * Menú en cápsula de cristal líquido que se condensa al bajar y muestra el capítulo actual,
 * y botones flotantes estilo Apple (mensaje y guest list) siempre a mano del pulgar.
 */
import * as React from "react"
import Image from "next/image"
import { MessageCircle, Ticket, X, Menu } from "lucide-react"
import { BRAND, CHAPTERS, contactHref } from "@/lib/data"

const LINKS = [
  { href: "#villa", label: "The villa" },
  { href: "#sea", label: "The sea" },
  { href: "#night", label: "The night" },
  { href: "#map", label: "Map" },
  { href: "#contact", label: "Contact" },
]

function go(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const el = document.querySelector<HTMLElement>(href)
  if (!el) return
  e.preventDefault()
  const s = (window as unknown as { __stage?: { scrollTo: (el: HTMLElement) => void } }).__stage
  if (s) s.scrollTo(el)
  else el.scrollIntoView({ behavior: "smooth" })
  history.replaceState(null, "", href)
}

export function Nav() {
  const [condensed, setCondensed] = React.useState(false)
  const [chapter, setChapter] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const sheetRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onScroll = () => setCondensed(scrollY > innerHeight * 0.6)
    const onChapter = (e: Event) => setChapter((e as CustomEvent<string | null>).detail)
    onScroll()
    addEventListener("scroll", onScroll, { passive: true })
    addEventListener("stage:chapter", onChapter)
    return () => { removeEventListener("scroll", onScroll); removeEventListener("stage:chapter", onChapter) }
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    addEventListener("keydown", onKey)
    sheetRef.current?.querySelector<HTMLElement>("a")?.focus()
    return () => removeEventListener("keydown", onKey)
  }, [open])

  const current = CHAPTERS.find((c) => c.id === chapter)?.nav

  return (
    <>
      <header className="nav" data-condensed={condensed || undefined}>
        <a href="#top" className="nav-brand" onClick={(e) => go(e, "#top")} aria-label={`${BRAND.name}, back to the top`}>
          <Image src="/brand/logo.png" alt="" width={34} height={34} priority />
          <span>{BRAND.name}</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>{l.label}</a>
          ))}
        </nav>
        <span className="nav-chapter" aria-live="polite">{condensed ? current ?? "" : ""}</span>
        <a className="nav-action" href={contactHref("Hello Mey Society, I would like to plan a stay in Ibiza.")}>Plan your stay</a>
        <button className="nav-menu" type="button" aria-expanded={open} aria-controls="nav-sheet" onClick={() => setOpen(true)}>
          <Menu size={18} strokeWidth={1.8} aria-hidden="true" /> Menu
        </button>
      </header>

      <div id="nav-sheet" ref={sheetRef} className="sheet" data-open={open || undefined} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <button className="sheet-close" type="button" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => { go(e, l.href); setOpen(false) }}>{l.label}</a>
        ))}
        <a className="btn" href={contactHref("Hello Mey Society, I would like to plan a stay in Ibiza.")}>Plan your stay</a>
      </div>

      <div className="fabs">
        <a className="fab" href="#guestlist" onClick={(e) => go(e, "#guestlist")}>
          <Ticket size={18} strokeWidth={1.8} aria-hidden="true" /><span>Guest list</span>
        </a>
        <a className="fab fab-primary" href={contactHref("Hello Mey Society, I have a question.")} aria-label={BRAND.whatsapp ? "Message us on WhatsApp" : "Email us"}>
          <MessageCircle size={20} strokeWidth={1.8} aria-hidden="true" /><span>Message us</span>
        </a>
      </div>
    </>
  )
}
