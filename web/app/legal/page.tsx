import type { Metadata } from "next"
import Link from "next/link"
import { BRAND } from "@/lib/content"

export const metadata: Metadata = { title: "Legal — Mey Society" }

// ⚠️ Plantilla: los textos definitivos los debe revisar un abogado (ver docs/estrategia-legal-paquetes.md).
export default function LegalPage() {
  const L = BRAND.legal
  return (
    <main className="legal">
      <div className="legal-inner">
        <Link className="si-back" href="/">← {BRAND.name}</Link>
        <h1 className="h2">Legal information</h1>
        <p className="lead">Draft texts pending legal review. Fields marked “pending” are completed with the company’s registered details before launch.</p>

        <section id="notice">
          <h2 className="h3">Legal notice</h2>
          <p>In compliance with Spanish Law 34/2002 on Information Society Services (LSSI-CE), this website is operated by {L.company}, tax ID {L.taxId}, registered office at {L.address}, {L.registry}. Contact: {BRAND.email}.</p>
          <p>Travel packages: {L.packageOrganiser}. Holiday rentals are offered only for properties registered for tourist use, and each listing shows its registration number.</p>
        </section>

        <section id="privacy">
          <h2 className="h3">Privacy</h2>
          <p>We process the details you send us (name, contact details, dates and preferences) only to answer your request and, if you book, to manage your stay, under the EU General Data Protection Regulation and Spanish Organic Law 3/2018. Requests sent through WhatsApp are also subject to WhatsApp’s own terms. We share your details only with the providers of the services you book. You can request access, correction, deletion, restriction, portability or object at {BRAND.email}, and complain to the Spanish Data Protection Agency (AEPD).</p>
        </section>

        <section id="cookies">
          <h2 className="h3">Cookies</h2>
          <p>This website uses one technical cookie to keep you signed in to your private area. It does not use analytics or advertising cookies. If that changes, a consent banner will ask before any are set.</p>
        </section>

        <section id="terms">
          <h2 className="h3">Booking terms</h2>
          <p>Each proposal lists every service with its provider, price, taxes and cancellation terms before you pay. Where several travel services are combined at one inclusive price, the package is organised under a travel agency licence and you receive the standard pre-contract information, with the rights of the Spanish consumer law on package travel, including insolvency protection and the right to cancel before departure against the stated termination fee.</p>
          <p>Complimentary perks have no cash value and are not sold separately. Guest-list access and entry to venues are always at the venue’s discretion, subject to door policy, capacity and minimum age (18+). Tables and tickets are booked through official channels; we do not resell tickets.</p>
        </section>
      </div>
    </main>
  )
}
