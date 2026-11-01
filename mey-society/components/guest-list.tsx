"use client"

/*
 * Lo interactivo de la página: el visitante elige club, noche y grupo, y ve el pase de guest list
 * que se va a pedir, con el mensaje exacto. Un toque lo envía por WhatsApp (o email sin número).
 * Las noches con disponibilidad salen de NIGHTS (lib/data.ts); nunca se inventan.
 */
import * as React from "react"
import { Minus, Plus, Send } from "lucide-react"
import { NIGHTS, ZONES, contactHref } from "@/lib/data"

const VENUES = ZONES.flatMap((z) => z.venues.map((v) => ({ venue: v, zone: z.name, kind: z.kind })))
const STATUS: Record<string, string> = { open: "Places open", few: "Few places left", full: "Full" }

function nextFriday() {
  const d = new Date()
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7))
  return d.toISOString().slice(0, 10)
}
const inSeason = (iso: string) => { const m = Number(iso.slice(5, 7)); return m >= 5 && m <= 10 }
const longDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

export function GuestList() {
  const [venue, setVenue] = React.useState(VENUES[0].venue)
  const [date, setDate] = React.useState(nextFriday)
  const [guests, setGuests] = React.useState(4)
  const [name, setName] = React.useState("")
  const [table, setTable] = React.useState(false)

  const zone = VENUES.find((v) => v.venue === venue)?.zone ?? ""
  const listed = NIGHTS.find((n) => n.venue === venue && n.date === date)
  const message =
    `Hello Mey Society, I would like the guest list for ${venue} on ${longDate(date)}` +
    `${listed ? ` (${listed.night})` : ""}, for ${guests} ${guests === 1 ? "person" : "people"}` +
    `${table ? ", with a VIP table" : ""}.${name ? ` Name for the list: ${name}.` : ""}`

  return (
    <div className="gl">
      <form className="gl-form" onSubmit={(e) => e.preventDefault()}>
        <label className="field">
          <span>Club or beach club</span>
          <select value={venue} onChange={(e) => setVenue(e.target.value)}>
            {ZONES.map((z) => (
              <optgroup key={z.id} label={z.name}>
                {z.venues.map((v) => <option key={v} value={v}>{v}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Night</span>
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <div className="field">
          <span id="gl-guests">Guests</span>
          <div className="stepper" role="group" aria-labelledby="gl-guests">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="One guest fewer"><Minus size={16} aria-hidden="true" /></button>
            <output aria-live="polite">{guests}</output>
            <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="One guest more"><Plus size={16} aria-hidden="true" /></button>
          </div>
        </div>
        <label className="field">
          <span>Name for the list</span>
          <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={table} onChange={(e) => setTable(e.target.checked)} />
          <span>Add a VIP table</span>
        </label>
      </form>

      <article className="pass" aria-label="Your guest list request">
        <div className="pass-holo" aria-hidden="true" />
        <p className="pass-venue">{venue}</p>
        <p className="pass-meta">{zone} · {longDate(date)}</p>
        <dl className="pass-rows">
          <div><dt>Guests</dt><dd>{guests}</dd></div>
          <div><dt>Name</dt><dd>{name || "—"}</dd></div>
          <div><dt>Table</dt><dd>{table ? "VIP table" : "Guest list"}</dd></div>
        </dl>
        <p className="pass-status">
          {listed ? STATUS[listed.status] : inSeason(date) ? "We confirm availability for this night" : "Out of season: we confirm when the club opens"}
        </p>
        <p className="pass-message">{message}</p>
        <a className="btn btn-block" href={contactHref(message)} aria-disabled={listed?.status === "full" || undefined}>
          <Send size={16} strokeWidth={1.8} aria-hidden="true" /> Send request
        </a>
      </article>
    </div>
  )
}
