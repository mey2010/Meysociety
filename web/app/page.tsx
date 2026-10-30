import { SiteNav } from "@/components/site-nav"
import { JourneyScripts } from "@/components/journey-scripts"

export default function Home() {
  return (
    <>
      {/* Intro cinematográfica: se levanta cuando la primera vista del mapa está lista */}
      <div id="intro" aria-hidden="true">
        <p className="intro-logo">Concierge <em>Ibiza</em></p>
        <span className="intro-line" />
      </div>

      <a className="skip" href="#concierge">Skip to the concierge form</a>

      <header className="topbar">
        <a className="logo" href="#top" aria-label="Concierge Ibiza, back to top">Concierge <em>Ibiza</em></a>
        <div className="nav-slot">
          <SiteNav />
        </div>
        <p id="counter" aria-hidden="true" />
        <a className="btn small cta-top" href="#concierge">Create your experience</a>
      </header>

      {/* Capa geográfica (real) */}
      <div id="stage" aria-hidden="true">
        <div id="cesium" />
        <div id="grade" />
        <div className="vignette" />
        {/* Transición piscina → mar: aquí irá el vídeo real de la villa */}
        <div id="villa-mask"><div className="villa-media"><span>Authentic villa footage · pending</span></div></div>
        <svg id="constellation" viewBox="0 0 1000 1000" role="presentation" />
      </div>
      <div id="credits" aria-label="Map data attribution" />
      <p id="status" role="status" />

      {/* Capa comercial */}
      <main id="top">
        <div id="world-track">
          <div className="sticky">
            <div id="panels" />
            <nav className="rail-wrap" aria-label="Journey">
              <span className="rail-track"><span id="rail-fill" /></span>
              <ol id="rail" />
            </nav>
            <p className="scroll-hint" aria-hidden="true"><span />Scroll</p>
          </div>
        </div>
        <div id="world-end" />

        <section id="concierge" className="concierge" aria-labelledby="concierge-title">
          <div className="concierge-inner">
            <p className="eyebrow">Private Concierge</p>
            <h2 id="concierge-title">YOUR IBIZA EXPERIENCE STARTS HERE.</h2>
            <p className="body">Tell us what you have in mind. One concierge will design and coordinate every detail.</p>
            <form id="concierge-form" noValidate>
              <fieldset aria-describedby="services-error">
                <legend>Services <span className="req">— choose one or more</span></legend>
                <div id="services" className="chips" />
                <p id="services-error" className="error" role="alert" hidden>Please choose at least one service.</p>
              </fieldset>
              <div className="grid">
                <label>Arrival<input type="date" name="from" /></label>
                <label>Departure<input type="date" name="to" /></label>
                <label>Guests<input type="number" name="guests" min={1} max={50} inputMode="numeric" /></label>
                <label>Name<input type="text" name="name" required autoComplete="name" /></label>
              </div>
              <label>Anything we should know?<textarea name="notes" rows={3} /></label>
              <button className="btn" type="submit">CREATE YOUR PRIVATE EXPERIENCE</button>
              <p className="form-note">Your request opens in WhatsApp, ready to send. A concierge replies personally.</p>
            </form>
            <p className="direct">Or reach us directly · <a data-wa href="#">WhatsApp</a> · <a data-email href="#" /></p>
          </div>
        </section>
      </main>

      <a className="wa-float" data-wa href="#" aria-label="Chat with Concierge Ibiza on WhatsApp">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3Z" /></svg>
        <span>WhatsApp</span>
      </a>

      <JourneyScripts />
    </>
  )
}
