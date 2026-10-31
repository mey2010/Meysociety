"use client"

import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { buildTrip, type Trip } from "@/lib/itinerary"
import { GlassButton } from "@/components/ui/liquid-glass"
import { Timeline } from "@/components/dashboard/timeline"

export function PrivateTeaser() {
  const [trip, setTrip] = React.useState<Trip | null>(null)
  React.useEffect(() => setTrip(buildTrip(new Date())), [])
  const day = trip?.days[trip.todayIndex]

  return (
    <section id="private" className="pv" data-ground="dark" data-chapter="Your private area" aria-labelledby="pv-title">
      <div className="wrap pv-grid">
        <div className="pv-copy">
          <h2 id="pv-title" className="h2" data-reveal>Your stay, live, day by day.</h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
            Once you book, your whole holiday lives in your private area: every transfer, table and boat, ticking off as the days go by.
          </p>
          <ul className="pv-points" data-reveal style={{ ["--d" as string]: 2 }}>
            <li><b>What is next, and when.</b> A live countdown to your next booking, with the place on the map.</li>
            <li><b>Everything confirmed in writing.</b> Vouchers, tickets and your package contract in one place.</li>
            <li><b>Your concierge, one tap away.</b> Change a table or add a boat day from the same screen.</li>
          </ul>
          <div className="pv-actions" data-reveal style={{ ["--d" as string]: 3 }}>
            <GlassButton href="/login" tone="solid">
              Sign in to your stay <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </GlassButton>
            <span className="pv-demo">Demo access on the sign-in page</span>
          </div>
        </div>

        <div className="pv-device" data-ui data-reveal style={{ ["--d" as string]: 2 }}>
          <div className="pv-device-head">
            <span>Day {day ? day.index + 1 : 3} of 7 · {day?.title ?? "Water & night"}</span>
            <span className="pv-progress" aria-label={trip ? `${trip.done} of ${trip.total} bookings completed` : undefined}>
              {trip ? `${trip.done}/${trip.total}` : "—"}
            </span>
          </div>
          {day ? <Timeline day={day} compact /> : <div className="pv-skeleton" />}
        </div>
      </div>
    </section>
  )
}
