/*
 * Concierge Ibiza — todo el contenido de la web en un solo sitio.
 *
 * ⚠️ = dato pendiente del cliente (teléfono, licencias, fotos propias, zonas de actividad).
 * Las coordenadas son reales y aproximadas (±300 m); verifícalas en Google Maps antes de publicar.
 */

export type Camera = { lon: number; lat: number; height: number; heading: number; pitch: number }

export type MediaKey = keyof typeof MEDIA

export type Scene = {
  id: string
  number?: number
  label: string
  /** false = keyframe provisional: se muestra "Location pending validation" */
  verified: boolean
  camera: Camera
  /** pantallas de scroll del vuelo desde la escena anterior */
  travel: number
  /** pantallas de scroll en las que la cámara se detiene para leer */
  hold: number
  /** 0 mediodía · 1 hora dorada · 2 noche */
  light: number
  title?: string
  body?: string
  place?: string
  plate?: MediaKey
  cards?: { name: string; meta: string; features: string[]; media: MediaKey; service: string; licence?: string }[]
  cta?: { label: string; href: string; primary?: boolean }
  sunset?: boolean
  constellation?: boolean
}

export const BRAND = {
  name: "Concierge Ibiza",
  // ⚠️ número real en formato internacional sin "+" ni espacios
  whatsapp: "34600000000",
  phoneDisplay: "+34 600 000 000",
  email: "hello@concierge-ibiza.com",
  hours: "Every day, 09:00–23:00 · on WhatsApp around the clock for guests on the island",
  base: "Eivissa, Illes Balears",
  // ⚠️ datos legales (Aviso legal, LSSI-CE art. 10)
  legal: {
    company: "Company name S.L. — pending",
    taxId: "NIF pending",
    address: "Registered address pending",
    registry: "Registro Mercantil de Ibiza — pending",
    // Organizador de los viajes combinados: agencia propia con licencia o agencia socia.
    packageOrganiser: "Licensed travel agency — licence number pending",
  },
} as const

/* -------------------------------------------------------------------------- */
/* Imágenes                                                                    */
/* -------------------------------------------------------------------------- */

// Fotografías de Unsplash (licencia Unsplash, uso comercial permitido) como imágenes
// representativas hasta tener las fotos propias del cliente. Ninguna se presenta como
// una propiedad, barco o local concreto. Sustituye `src` por /media/tu-foto.jpg.
// ⚠️ No se han podido previsualizar desde el entorno de desarrollo: revísalas antes de publicar.
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80`

export const MEDIA = {
  villaPool: { src: unsplash("1613490493576-7fde63acd811"), alt: "White villa with an infinity pool facing the sea", tone: "#2f6f8f" },
  villaDusk: { src: unsplash("1600596542815-ffad4c1539a9"), alt: "Contemporary villa lit up at dusk", tone: "#3b3a3f" },
  villaInterior: { src: unsplash("1600607687939-ce8a6c25118c"), alt: "Bright living room with neutral stone tones", tone: "#b9ab95" },
  poolSea: { src: unsplash("1520250497591-112f2f40a3f4"), alt: "Infinity pool merging with the sea at sunset", tone: "#1d5878" },
  yacht: { src: unsplash("1567899378494-47b22a2ae96a"), alt: "Motor yacht at anchor in clear water", tone: "#145a7c" },
  sea: { src: unsplash("1507525428034-b723cf961d3e"), alt: "Turquoise water over a pale sand seabed", tone: "#2c8aa6" },
  waterAerial: { src: unsplash("1505881502353-a1986add3762"), alt: "Aerial view of waves breaking on a shore", tone: "#24718f" },
  car: { src: unsplash("1503376780353-7e6692767b70"), alt: "Sports car on an open road", tone: "#3a3a3c" },
  plane: { src: unsplash("1436491865332-7a61a109cc05"), alt: "Aircraft wing above the clouds", tone: "#6d8299" },
  dining: { src: unsplash("1414235077428-338989a2e8c0"), alt: "Plated dish in a fine dining restaurant", tone: "#4a3b30" },
  restaurant: { src: unsplash("1517248135467-4c7edcad34c4"), alt: "Restaurant interior in warm evening light", tone: "#5a4636" },
  beach: { src: unsplash("1519046904884-53103b34b206"), alt: "Sand and sea on a quiet beach", tone: "#c8b089" },
  dj: { src: unsplash("1470225620780-dba8ba36b745"), alt: "DJ at the decks in a darkened club", tone: "#1e1b2b" },
  crowd: { src: unsplash("1514525253161-7a46d19cd819"), alt: "Crowd under stage lights at night", tone: "#2a1f33" },
} satisfies Record<string, { src: string; alt: string; tone: string }>

/* -------------------------------------------------------------------------- */
/* Recorrido 3D (Cesium) — escenas 01 → 08 del storyboard                      */
/* -------------------------------------------------------------------------- */

export const TOTAL_SCENES = 8

export const SCENES: Scene[] = [
  {
    id: "above",
    number: 1,
    label: "Ibiza",
    verified: true, // vista cenital de las Pitiusas
    camera: { lon: 1.42, lat: 38.86, height: 115000, heading: 0, pitch: -89 },
    travel: 0,
    hold: 1.1,
    light: 0,
    title: "IBIZA, WITHOUT LIMITS.",
    body: "Private stays. Extraordinary experiences. One dedicated concierge.",
    cta: { label: "Create your private experience", href: "#builder", primary: true },
  },
  {
    id: "approach",
    label: "South-west coast",
    verified: true, // aproximación oblicua desde el sur, mirando al noreste
    camera: { lon: 1.27, lat: 38.78, height: 9000, heading: 25, pitch: -28 },
    travel: 1.4,
    hold: 0.3,
    light: 0.1,
  },
  {
    id: "villas",
    number: 2,
    label: "Private villas",
    // ⚠️ Zona PROVISIONAL: sobre Cala d'Hort mirando a Es Vedrà. Sustituir por la zona real de las villas.
    verified: false,
    camera: { lon: 1.2335, lat: 38.8935, height: 320, heading: 238, pitch: -11 },
    travel: 1.6,
    hold: 1.5,
    light: 0.25,
    place: "Cala d'Hort · Sant Josep de sa Talaia",
    title: "Where the pool meets the sea.",
    body: "A private collection of villas on the island’s quietest coastlines. Every one inspected by us, every one with its tourist licence number on the listing.",
    plate: "poolSea",
    cards: [
      { name: "Villa — pending", meta: "South-west coast", features: ["6 bedrooms", "Infinity pool", "Sea view"], media: "villaPool", service: "villas", licence: "ETV pending" },
      { name: "Villa — pending", meta: "West coast", features: ["5 bedrooms", "Sunset terrace", "Chef on request"], media: "villaDusk", service: "villas", licence: "ETV pending" },
    ],
  },
  {
    id: "yachts",
    number: 3,
    label: "Yachts",
    verified: true, // en el mar, al oeste de Cala d'Hort, mirando a Es Vedrà
    camera: { lon: 1.17, lat: 38.89, height: 160, heading: 137, pitch: -7 },
    travel: 1.3,
    hold: 1.4,
    light: 0.4,
    place: "Es Vedrà, from the sea",
    title: "The island, from the water.",
    body: "Day charters with licensed operators: skipper and crew included, coves you can only reach by sea, anchoring always clear of the Posidonia meadows.",
    plate: "yacht",
    cards: [
      { name: "Motor yacht · day charter", meta: "Base port pending", features: ["Up to 12 guests", "Skipper & crew", "Tender & paddle boards"], media: "yacht", service: "yachts" },
      { name: "Catamaran · sunset sail", meta: "Base port pending", features: ["Up to 20 guests", "Open bar on request", "Golden-hour route"], media: "sea", service: "yachts" },
    ],
  },
  {
    id: "water",
    number: 4,
    label: "Jet skis",
    // ⚠️ Zona de actividad PENDIENTE: solo canales balizados del operador autorizado.
    verified: false,
    camera: { lon: 1.255, lat: 38.985, height: 250, heading: 205, pitch: -14 },
    travel: 1.2,
    hold: 1.2,
    light: 0.5,
    place: "Badia de Sant Antoni · operating zone pending",
    title: "Faster than the afternoon.",
    body: "Guided jet ski routes with authorised operators, in marked channels. No licence needed with a monitor; solo rides need the navigation licence.",
    plate: "waterAerial",
  },
  {
    id: "cars",
    number: 5,
    label: "Cars & transfers",
    // ⚠️ Ruta PENDIENTE: confirmar la carretera costera que usáis con clientes.
    verified: false,
    camera: { lon: 1.25, lat: 38.905, height: 600, heading: 290, pitch: -20 },
    travel: 1.3,
    hold: 1.2,
    light: 0.7,
    place: "West coast roads · route pending",
    title: "Every road, privately driven.",
    body: "Arrivals met at the gate, flights tracked, evenings chauffeured. Licensed drivers and rent-a-car partners only — convertibles for the coast roads.",
    plate: "car",
  },
  {
    id: "dining",
    number: 6,
    label: "Fine dining",
    verified: true, // Cala Comte, orientada a poniente
    camera: { lon: 1.235, lat: 38.958, height: 120, heading: 290, pitch: -4 },
    travel: 1.3,
    hold: 1.3,
    light: 1,
    place: "Cala Comte · Sant Josep de sa Talaia",
    title: "Dinner at the hour of gold.",
    body: "Tables where the sun drops into the sea, chefs who cook at your villa, and the reservation nobody else could get for tonight.",
    plate: "dining",
    sunset: true,
  },
  {
    id: "nightlife",
    number: 7,
    label: "Nightlife & VIP",
    verified: true, // Dalt Vila y el puerto de Eivissa desde el sureste
    camera: { lon: 1.452, lat: 38.895, height: 700, heading: 313, pitch: -18 },
    travel: 1.6,
    hold: 1.4,
    light: 2,
    place: "Dalt Vila & the port · Eivissa",
    title: "When the island turns the lights on.",
    body: "Beach clubs by day, tables by night. Reserved through official channels, with guest-list access for the groups who plan their stay with us.",
    plate: "dj",
  },
  {
    id: "concierge",
    number: 8,
    label: "Your concierge",
    verified: true, // retroceso panorámico sobre la isla
    camera: { lon: 1.4, lat: 38.8, height: 62000, heading: 8, pitch: -58 },
    travel: 1.8,
    hold: 1.8,
    light: 1.4,
    constellation: true,
    title: "YOUR IBIZA EXPERIENCE STARTS HERE.",
    body: "Villas, yachts, cars, tables and nights out — arranged by one person who knows the island.",
    cta: { label: "CREATE YOUR PRIVATE EXPERIENCE", href: "#builder", primary: true },
  },
]

export const CONSTELLATION = ["Villas", "Yachts", "Jet skis", "Cars", "Dining", "Beach clubs", "VIP", "Bespoke"]

/* -------------------------------------------------------------------------- */
/* Servicios                                                                   */
/* -------------------------------------------------------------------------- */

export type Service = {
  id: string
  name: string
  line: string
  details: string[]
  media: MediaKey
  /** escena del recorrido que lo presenta */
  scene?: string
  /** requisito legal que mostramos al cliente */
  note: string
}

export const SERVICES: Service[] = [
  {
    id: "villas",
    name: "Private villas",
    line: "Sea-view homes, inspected by us, licensed for holiday rental.",
    details: ["Weekly or short stays", "Housekeeping & villa manager", "Chef, nanny and wellness at home"],
    media: "villaPool",
    scene: "villas",
    note: "Every listing shows its tourist registration number.",
  },
  {
    id: "yachts",
    name: "Yacht charter",
    line: "Motor yachts, catamarans and sailing boats by the day or week.",
    details: ["Skipper & crew included", "Formentera & Es Vedrà routes", "Catering on board"],
    media: "yacht",
    scene: "yachts",
    note: "Licensed charter vessels only. No anchoring on Posidonia.",
  },
  {
    id: "water",
    name: "Jet skis & water",
    line: "Guided jet ski routes, paddle, diving and seabobs.",
    details: ["Guided routes with monitor", "Diving & snorkelling", "Seabob & e-foil"],
    media: "waterAerial",
    scene: "water",
    note: "Authorised operators, marked channels, age and licence rules apply.",
  },
  {
    id: "cars",
    name: "Cars & transfers",
    line: "Airport meet-and-greet, chauffeurs and convertibles.",
    details: ["Flight tracking", "Chauffeur by the hour", "Convertibles & SUVs"],
    media: "car",
    scene: "cars",
    note: "Licensed drivers (VTC/taxi) and rent-a-car partners.",
  },
  {
    id: "dining",
    name: "Restaurants & chefs",
    line: "The sunset table, the hard-to-get booking, the chef at your villa.",
    details: ["Sunset tables", "Private chefs", "Wine & cellar pairings"],
    media: "dining",
    scene: "dining",
    note: "Reservations held in your name directly with the venue.",
  },
  {
    id: "beachclubs",
    name: "Beach clubs",
    line: "Daybeds and lunch tables on the island’s best sand.",
    details: ["Daybeds & front-row loungers", "Lunch tables", "Boat drop-off where allowed"],
    media: "beach",
    scene: "nightlife",
    note: "Minimum spends are the venue’s, shown before you confirm.",
  },
  {
    id: "nightlife",
    name: "Clubs & VIP tables",
    line: "Tables, tickets and guest lists for the nights that matter.",
    details: ["VIP tables", "Official tickets", "Guest lists for our guests"],
    media: "dj",
    scene: "nightlife",
    note: "Official channels only. Entry at the venue’s discretion. 18+.",
  },
  {
    id: "bespoke",
    name: "Bespoke requests",
    line: "Birthdays, proposals, wellness weeks, last-minute anything.",
    details: ["Celebrations & proposals", "Wellness & yoga", "Photographers & florists"],
    media: "villaInterior",
    note: "If it is legal and on the island, we will find it.",
  },
]

/* -------------------------------------------------------------------------- */
/* Paquetes y ventajas (estrategia legal: docs/estrategia-legal-paquetes.md)    */
/* -------------------------------------------------------------------------- */

export type Package = { id: string; name: string; nights: number; line: string; services: string[]; days: string[] }

export const PACKAGES: Package[] = [
  {
    id: "arrival",
    name: "The Arrival",
    nights: 3,
    line: "A long weekend that starts at the aircraft door.",
    services: ["cars", "villas", "dining", "beachclubs"],
    days: ["Meet at arrivals, villa by mid-afternoon", "Beach club daybed, sunset dinner", "Late checkout and transfer"],
  },
  {
    id: "sea",
    name: "Sea & Sunset",
    nights: 5,
    line: "Most of it on the water, every evening facing west.",
    services: ["cars", "villas", "yachts", "water", "dining"],
    days: ["Arrival and villa", "Yacht day to Es Vedrà", "Jet ski route and beach lunch", "Formentera by boat", "Private chef at the villa"],
  },
  {
    id: "island",
    name: "The Whole Island",
    nights: 7,
    line: "Every side of Ibiza, day and night, one concierge throughout.",
    services: ["cars", "villas", "yachts", "water", "dining", "beachclubs", "nightlife"],
    days: ["Arrival and welcome dinner", "Yacht day", "Water morning, beach club", "Slow day in the north", "Formentera", "Club night, VIP table", "Departure"],
  },
]

// Ventajas sin coste que se desbloquean al combinar servicios.
// No se venden por separado ni tienen valor monetario (ver estrategia legal).
export const PERKS = [
  { at: 2, name: "Arrival welcome", line: "Met at the gate, drinks in the car, villa ready when you walk in." },
  { at: 3, name: "Guest-list priority", line: "Your group on partner guest lists for one night of your stay." },
  { at: 4, name: "Sunset table first", line: "First call on the sunset tables we hold with partner restaurants." },
  { at: 5, name: "Your night host", line: "A host meets your group at the door of one club night and stays on hand." },
] as const

export const PERK_TERMS =
  "Complimentary perks have no cash value and are not sold separately. Guest lists and entry are always at the venue’s discretion, subject to door policy and capacity. 18+ for clubs."

/* -------------------------------------------------------------------------- */
/* Mapa                                                                        */
/* -------------------------------------------------------------------------- */

export type Place = { id: string; name: string; area: string; lon: number; lat: number; kind: "heritage" | "sea" | "sunset" | "night" | "arrival" | "nature"; line: string }

export const PLACES: Place[] = [
  { id: "daltvila", name: "Dalt Vila", area: "Eivissa", lon: 1.4361, lat: 38.9067, kind: "heritage", line: "The walled old town, UNESCO World Heritage. Dinner under the bastions." },
  { id: "botafoch", name: "Marina Botafoch", area: "Eivissa", lon: 1.4497, lat: 38.9148, kind: "sea", line: "Where most day charters board, facing Dalt Vila." },
  { id: "airport", name: "Ibiza Airport", area: "Sant Josep", lon: 1.3731, lat: 38.8729, kind: "arrival", line: "Met at arrivals. About 15 minutes to Eivissa, 25 to the west coast." },
  { id: "vedra", name: "Es Vedrà", area: "Sant Josep", lon: 1.197, lat: 38.8676, kind: "sea", line: "The limestone islet off Cala d’Hort, best seen from the deck." },
  { id: "hort", name: "Cala d’Hort", area: "Sant Josep", lon: 1.224, lat: 38.8895, kind: "sunset", line: "The beach facing Es Vedrà. Villas in the hills behind." },
  { id: "comte", name: "Cala Comte", area: "Sant Josep", lon: 1.2219, lat: 38.9636, kind: "sunset", line: "Turquoise water, small islets, the island’s classic sunset." },
  { id: "bassa", name: "Cala Bassa", area: "Sant Josep", lon: 1.2442, lat: 38.9667, kind: "sea", line: "Pine-backed cove on the west coast." },
  { id: "santantoni", name: "Sant Antoni", area: "Sant Antoni de Portmany", lon: 1.3036, lat: 38.9806, kind: "sunset", line: "The bay of sunsets; water activities run from its marked zones." },
  { id: "santaeularia", name: "Santa Eulària", area: "Santa Eulària des Riu", lon: 1.5339, lat: 38.9847, kind: "sea", line: "Calm east-coast marina and long lunches." },
  { id: "jondal", name: "Cala Jondal", area: "Sant Josep", lon: 1.317, lat: 38.866, kind: "sea", line: "Pebble bay on the south coast lined with beach clubs." },
  { id: "bossa", name: "Platja d’en Bossa", area: "Sant Josep", lon: 1.412, lat: 38.882, kind: "night", line: "The longest beach, home to day-to-night clubs." },
  { id: "salines", name: "Ses Salines", area: "Natural Park", lon: 1.394, lat: 38.835, kind: "nature", line: "Salt flats and protected dunes. No motorised activity in the park." },
  { id: "savina", name: "La Savina", area: "Formentera", lon: 1.417, lat: 38.734, kind: "sea", line: "Formentera’s port, about 30 minutes by fast boat from Eivissa." },
]

/* -------------------------------------------------------------------------- */
/* Preguntas frecuentes                                                        */
/* -------------------------------------------------------------------------- */

export const FAQ = [
  {
    q: "How does planning a stay with you work?",
    a: "Tell us your dates, group and what you have in mind. We send a written proposal with each service itemised, you confirm with a deposit, and your itinerary appears in your private area, updating day by day while you are on the island.",
  },
  {
    q: "Are your villas legally licensed for holiday rental?",
    a: "Yes. We only offer properties registered for tourist rental, and every listing shows its registration number. If a home is not licensed, we do not offer it — Ibiza enforces this strictly, and it protects your stay.",
  },
  {
    q: "Do I need a licence for a jet ski or a boat?",
    a: "Not for guided jet ski routes with an authorised monitor, nor for a skippered charter. To ride solo or to take a boat without a skipper you need a valid navigation licence for that craft. Age limits apply; the operator confirms them when we book.",
  },
  {
    q: "Can you get us into clubs and on guest lists?",
    a: "We reserve VIP tables and official tickets directly with the venues. Guests who plan their stay with us also get guest-list access where our partners offer it. Entry is always at the venue’s discretion, 18+, and we never resell tickets.",
  },
  {
    q: "What does a package price include?",
    a: "Each service is listed with its price and taxes included. Where a package combines several travel services at one price, it is organised under a travel agency licence, which gives you the legal protections of a package holiday, including insolvency cover.",
  },
  {
    q: "What happens if I need to cancel?",
    a: "Every provider’s cancellation terms are in your proposal before you pay anything. For packages you can cancel before departure; the termination fee is stated in your contract.",
  },
  {
    q: "Is the Balearic tourist tax included?",
    a: "The Sustainable Tourism Tax applies per person and night to stays in tourist accommodation. We show it as its own line so you see exactly what it is.",
  },
  {
    q: "When is the best time to come?",
    a: "The season runs roughly May to October. Clubs open in late spring and hold closing parties in early autumn. June and September are warm, quieter and easier to book.",
  },
  {
    q: "Do you plan for families and children?",
    a: "Often. Villas with safe pools, nannies, calm beaches on the east coast, boat days paced for children.",
  },
  {
    q: "How do I see my itinerary once I have booked?",
    a: "Sign in with your booking email and the code in your confirmation. You will see every day of your stay, what is confirmed, what is next, and your concierge’s direct line.",
  },
]
