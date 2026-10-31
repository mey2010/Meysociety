"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { BRAND, FAQ } from "@/lib/content"

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0)
  return (
    <section id="faq" className="fq" data-ground="light" data-chapter="Questions" aria-labelledby="fq-title">
      <div className="wrap fq-grid">
        <div className="fq-head">
          <h2 id="fq-title" className="h2" data-reveal>Questions, answered.</h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
            Licences, guest lists, cancellations, taxes. If yours is not here, ask us on{" "}
            <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
          </p>
        </div>
        <div className="fq-list">
          {FAQ.map((f, i) => {
            const on = open === i
            return (
              <div key={f.q} className="fq-item" data-open={on || undefined} data-reveal style={{ ["--d" as string]: i % 3 }}>
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`fq-${i}`} id={`fq-q-${i}`} onClick={() => setOpen(on ? null : i)}>
                    <span>{f.q}</span>
                    <Plus className="fq-icon" size={20} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </h3>
                <div className="fq-panel" id={`fq-${i}`} role="region" aria-labelledby={`fq-q-${i}`} inert={!on || undefined}>
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
