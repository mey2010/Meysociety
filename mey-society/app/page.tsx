import Image from "next/image"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { Stage } from "@/components/stage"
import { Nav } from "@/components/nav"
import { GuestList } from "@/components/guest-list"
import { IslandMap } from "@/components/island-map"
import { Reveal, SunsetToday } from "@/components/live"
import { BRAND, CHAPTERS, FAQ, contactHref } from "@/lib/data"

const GROUPS = [
  { name: "Stay", items: ["The Cala Molí villa", "Private chef", "Villa preparation", "Housekeeping"] },
  { name: "Sea", items: ["Yacht charter", "Sunset sails", "Jet skis", "Boat days to Formentera"] },
  { name: "Road", items: ["Airport transfers", "Luxury cars", "Drivers for the night"] },
  { name: "Night", items: ["Guest lists", "VIP tables", "Beach clubs", "Restaurants"] },
]

export default function Home() {
  return (
    <>
      <Stage />
      <Nav />
      <Reveal />

      <main>
        {/* Intro: la ventana del logo sobre las nubes; al bajar se abre y aparece la isla */}
        <section id="top" className="hero" data-cam="intro">
          <div className="hero-hold">
            <div className="hero-card">
              <h1 className="hero-title"><span>Mey</span> <span>Society</span> <span>Ibiza</span></h1>
              <div className="hero-body">
                <p className="hero-facts">Private concierge<br />A villa in Cala Molí<br />Yachts, cars and every club</p>
                <p className="hero-lede">One conversation for the whole island: the villa, the boat, the car and your name on the list.</p>
              </div>
              <div className="hero-foot">
                <p className="hero-credit">The real island, live in 3D</p>
                <a className="btn" href={contactHref("Hello Mey Society, I would like to plan a stay in Ibiza.")}>Plan your stay</a>
                <a className="link" href="#arrival">Begin the flight <ArrowDown size={16} strokeWidth={1.6} aria-hidden="true" /></a>
              </div>
            </div>
          </div>
        </section>

        {CHAPTERS.map((c) => (
          <section key={c.id} id={c.id} className="chapter" data-cam={c.id} data-chapter={c.id} aria-labelledby={`${c.id}-title`}>
            <div className="chapter-hold">
              <div className="chapter-text">
                <h2 id={`${c.id}-title`} data-reveal>{c.title}</h2>
                <p className="chapter-place" data-reveal>{c.place}</p>
                <p className="chapter-body" data-reveal>{c.body}</p>
                {c.id === "villa" ? <div data-reveal><SunsetToday /></div> : null}
                <ul className="offer" data-reveal>
                  {c.services.map((s) => (
                    <li key={s.name}>
                      <a href={contactHref(s.message)}>
                        <span className="offer-name">{s.name}</span>
                        <span className="offer-line">{s.line}</span>
                        <ArrowUpRight className="offer-arrow" size={20} strokeWidth={1.4} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        <section id="guestlist" className="section guestlist" data-cam="night" data-chapter="night" aria-labelledby="gl-title">
          <h2 id="gl-title" data-reveal>Your name on the list</h2>
          <p className="section-lede" data-reveal>Choose the club, the night and the group. You see the exact request before it is sent, and we confirm the conditions before you go.</p>
          <div data-reveal><GuestList /></div>
        </section>

        <section id="map" className="section" data-cam="map" aria-labelledby="map-title">
          <h2 id="map-title" data-reveal>Where the island goes out</h2>
          <p className="section-lede" data-reveal>The villa on the west coast, and every zone of clubs and beach clubs we book, with the distance from your door.</p>
          <div data-reveal><IslandMap /></div>
        </section>

        <section id="services" className="section services" data-cam="map" aria-labelledby="services-title">
          <h2 id="services-title" data-reveal>Everything we arrange</h2>
          <div className="services-cols">
            {GROUPS.map((g) => (
              <div key={g.name} className="services-col" data-reveal>
                <h3>{g.name}</h3>
                <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="section faq" data-cam="map" aria-labelledby="faq-title">
          <div className="faq-text">
            <h2 id="faq-title" data-reveal>Before you write</h2>
            <p className="faq-facts" data-reveal>Based in Ibiza all year<br />Bookings by message, answered personally<br />Club season from May to October</p>
            <div className="faq-list" data-reveal>
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <a className="btn" href={contactHref("Hello Mey Society, I have a question.")} data-reveal>Ask us anything</a>
          </div>
          <figure className="faq-figure" data-reveal>
            <div className="coin">
              <Image src="/brand/logo.png" alt="The Mey Society monogram: chrome M and S inside a holographic ring" width={256} height={256} />
            </div>
          </figure>
        </section>

        <section id="contact" className="contact" data-cam="finale" aria-labelledby="contact-title">
          <h2 id="contact-title" className="contact-sentence" data-reveal>Tell us your dates and who is coming. We will do the rest.</h2>
          <a className="contact-email" href={`mailto:${BRAND.email}`} data-reveal>
            meysociety@<wbr />protonmail.com
          </a>
          <p className="contact-corner" data-reveal>{BRAND.base}</p>
        </section>
      </main>

      <footer className="footer" data-cam="finale">
        <nav className="footer-links" aria-label="Footer">
          <a href="#villa">The villa</a>
          <a href="#sea">The sea</a>
          <a href="#night">The night</a>
          <a href="#map">Map</a>
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        </nav>
        <p className="footer-name" aria-hidden="true">Mey Society</p>
        <p className="footer-legal">© {new Date().getFullYear()} {BRAND.name} · {BRAND.base} · 3D imagery © Google · Island outline: Natural Earth</p>
      </footer>
    </>
  )
}
