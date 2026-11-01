import { Media } from "@/components/media"

const POINTS = [
  { lead: "Licensed homes only.", text: "Every villa we offer is registered for holiday rental, and its registration number is on the listing." },
  { lead: "Licensed operators only.", text: "Charter vessels, jet ski operators, drivers and rent-a-car partners all hold the permits their activity needs." },
  { lead: "Every price itemised.", text: "Each service with its price and taxes, the tourist tax on its own line, and our fee shown, never hidden inside." },
  { lead: "Packages, protected.", text: "When we combine services at one price, the package is organised under a travel agency licence with insolvency cover." },
  { lead: "Official channels.", text: "Tables and tickets booked with the venues themselves. No resale, and no promises at the door we cannot keep." },
  { lead: "The island, respected.", text: "Boats anchor clear of the Posidonia meadows, and nothing motorised goes where it is not allowed." },
]

export function Standards() {
  return (
    <section id="standards" className="st" data-ground="light" data-chapter="How we work" aria-labelledby="st-title">
      <div className="wrap st-grid">
        <div className="st-copy">
          <h2 id="st-title" className="h2" data-reveal>Licensed, itemised, in writing.</h2>
          <p className="lead" data-reveal style={{ ["--d" as string]: 1 }}>
            Ibiza is strict about who may rent, sail and sell. So are we — it is what keeps your stay from going wrong.
          </p>
          <dl className="st-points">
            {POINTS.map((p, i) => (
              <div key={p.lead} data-reveal style={{ ["--d" as string]: i % 2 }}>
                <dt>{p.lead}</dt>
                <dd>{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="st-figure" data-reveal style={{ ["--d" as string]: 2 }}>
          <Media k="villaInterior" className="st-img arch" sizes="(max-width: 760px) 90vw, 40vw" />
          <figcaption>Every home inspected in person before it is listed.</figcaption>
        </figure>
      </div>
    </section>
  )
}
