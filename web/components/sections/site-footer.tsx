import Link from "next/link"
import { BRAND } from "@/lib/content"

export function SiteFooter() {
  const year = 2026
  return (
    <footer className="ft" data-ground="dark" data-chapter="Contact">
      <div className="wrap">
        <div className="ft-cols">
          <nav aria-label="Explore">
            <p className="ft-title">Explore</p>
            <a href="#services">Services</a>
            <a href="#island">The island</a>
            <a href="#builder">Build your stay</a>
            <a href="#faq">Questions</a>
          </nav>
          <nav aria-label="Guests">
            <p className="ft-title">Guests</p>
            <Link href="/login">Sign in to your stay</Link>
            <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
          </nav>
          <nav aria-label="Legal">
            <p className="ft-title">Legal</p>
            <Link href="/legal#notice">Legal notice</Link>
            <Link href="/legal#privacy">Privacy</Link>
            <Link href="/legal#cookies">Cookies</Link>
            <Link href="/legal#terms">Booking terms</Link>
          </nav>
          <div className="ft-legal">
            <p className="ft-title">Company</p>
            <p>{BRAND.legal.company} · {BRAND.legal.taxId}</p>
            <p>{BRAND.legal.address}</p>
            <p>Packages: {BRAND.legal.packageOrganiser}</p>
          </div>
        </div>
        <p className="ft-name" aria-hidden="true">{BRAND.name}</p>
        <div className="ft-base">
          <p>© {year} {BRAND.name}. {BRAND.base}.</p>
          <p>
            Island outline: Natural Earth (public domain). 3D map: Google Photorealistic 3D Tiles or Esri World Imagery, credited on the map.
            Photography: Unsplash, representative images.
          </p>
        </div>
      </div>
    </footer>
  )
}
