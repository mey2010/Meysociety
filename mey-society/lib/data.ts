/*
 * Mey Society: todo el contenido editable de la web en un solo sitio.
 * Coordenadas: verificadas sobre Google Photorealistic 3D Tiles (render de cada cámara) o
 * facilitadas por el cliente (villa). Lo que no está verificado se marca.
 */
import type { Camera } from "@/lib/cesium"

export const BRAND = {
  name: "Mey Society",
  email: "meysociety@protonmail.com",
  // ⚠️ PENDIENTE: número de WhatsApp en formato internacional sin "+" ni espacios (p. ej. 34611222333)
  whatsapp: "",
  base: "Ibiza, Illes Balears",
} as const

/** Enlace de contacto: WhatsApp si hay número, si no un email con el mismo texto. */
export function contactHref(message: string) {
  const text = encodeURIComponent(message)
  if (BRAND.whatsapp) return `https://wa.me/${BRAND.whatsapp}?text=${text}`
  return `mailto:${BRAND.email}?subject=${encodeURIComponent("Mey Society · request")}&body=${text}`
}

export const VILLA = { lon: 1.23127, lat: 38.92674, name: "Cala Molí" }

export type Service = { name: string; line: string; message: string }
export type Chapter = {
  id: string
  camera: Camera
  /** 0 mediodía · 1 hora dorada · 2 noche (etalonaje sobre el 3D) */
  light: number
  nav: string
  title: string
  place: string
  body: string
  services: Service[]
}

export const CHAPTERS: Chapter[] = [
  {
    id: "arrival",
    camera: { lon: 1.27, lat: 38.78, height: 9000, heading: 25, pitch: -28 },
    light: 0,
    nav: "Arrival",
    title: "Met at the aircraft door.",
    place: "Ibiza Airport, with the whole island in view",
    body: "A driver waiting at arrivals, the car cooled, your bags handled. Fifteen minutes to Eivissa, twenty-five to the west coast.",
    services: [
      { name: "Private transfers", line: "Airport, port and every night out", message: "Hello Mey Society, I would like a private transfer." },
      { name: "Luxury cars", line: "Delivered to your villa for the week", message: "Hello Mey Society, I would like to rent a luxury car." },
    ],
  },
  {
    id: "villa",
    camera: { lon: 1.2174, lat: 38.9255, height: 300, heading: 83, pitch: -12 },
    light: 0.35,
    nav: "The villa",
    title: "Your villa above Cala Molí.",
    place: "Cala Molí, Sant Josep de sa Talaia, on the west coast",
    body: "Six hundred and fifty metres from the sea on the island's sunset coast. We prepare it before you land and look after it until you leave.",
    services: [
      { name: "The Cala Molí villa", line: "Our own house on the west coast", message: "Hello Mey Society, I would like to book the villa in Cala Molí." },
      { name: "Private chef", line: "Breakfast to late dinner, at home", message: "Hello Mey Society, I would like a private chef at the villa." },
    ],
  },
  {
    id: "sea",
    camera: { lon: 1.205, lat: 38.952, height: 380, heading: 40, pitch: -12 },
    light: 0.55,
    nav: "The sea",
    title: "The coast is best seen from the deck.",
    place: "Cala Comte and its islets, on the west coast",
    body: "Day charters with skipper and crew, sunset sails, and jet skis where the water allows. You choose the cove; we arrange everything around it.",
    services: [
      { name: "Yacht charter", line: "Day or week, with skipper and crew", message: "Hello Mey Society, I would like to charter a yacht." },
      { name: "Jet skis", line: "Guided routes in authorised zones", message: "Hello Mey Society, I would like to book jet skis." },
    ],
  },
  {
    id: "beach",
    camera: { lon: 1.395, lat: 38.858, height: 900, heading: 20, pitch: -20 },
    light: 0.85,
    nav: "Beach clubs",
    title: "Afternoons at the water's edge.",
    place: "Platja d'en Bossa, the island's longest beach",
    body: "The right bed at the right beach club, the table that faces the sunset, and the restaurant that is full for everyone else.",
    services: [
      { name: "Beach clubs", line: "Beds and tables at every beach club", message: "Hello Mey Society, I would like a beach club reservation." },
      { name: "Restaurants", line: "The tables that are hard to get", message: "Hello Mey Society, I would like a restaurant reservation." },
    ],
  },
  {
    id: "night",
    camera: { lon: 1.452, lat: 38.895, height: 700, heading: 313, pitch: -18 },
    light: 2,
    nav: "The night",
    title: "Every club. Every night.",
    place: "Dalt Vila and the port of Eivissa",
    body: "Guest lists and VIP tables at every club on the island, the car waiting outside, and someone to call if plans change at two in the morning.",
    services: [
      { name: "Guest lists", line: "Every club on the island", message: "Hello Mey Society, I would like to be on a guest list." },
      { name: "VIP tables", line: "Tables, bottles and arrival handled", message: "Hello Mey Society, I would like a VIP table." },
    ],
  },
]

export const INTRO_CAMERA: Camera = { lon: 1.42, lat: 38.86, height: 115000, heading: 0, pitch: -89 }
export const FINALE_CAMERA: Camera = { lon: 1.4, lat: 38.8, height: 62000, heading: 8, pitch: -58 }

/*
 * Zonas de ocio para el mapa. Los puntos son centros de zona (barrio o playa), no la puerta de un local.
 * ⚠️ Verificar cada centro y la lista de locales antes de publicar; añadir aquí los que falten.
 */
export type Zone = { id: string; name: string; lon: number; lat: number; kind: "club" | "beach"; venues: string[] }
export const ZONES: Zone[] = [
  { id: "bossa", name: "Platja d'en Bossa", lon: 1.412, lat: 38.882, kind: "club", venues: ["Hï Ibiza", "Ushuaïa", "Bora Bora"] },
  { id: "rafel", name: "Sant Rafel", lon: 1.405, lat: 38.95, kind: "club", venues: ["Amnesia", "UNVRS"] },
  { id: "eivissa", name: "Eivissa marina", lon: 1.446, lat: 38.914, kind: "club", venues: ["Pacha", "Lío"] },
  { id: "dc10", name: "Sant Jordi", lon: 1.394, lat: 38.874, kind: "club", venues: ["DC-10"] },
  { id: "jondal", name: "Cala Jondal", lon: 1.317, lat: 38.866, kind: "beach", venues: ["Blue Marlin", "Casa Jondal", "Tropicana"] },
  { id: "salines", name: "Ses Salines", lon: 1.394, lat: 38.835, kind: "beach", venues: ["Experimental Beach", "Sa Trinxa"] },
  { id: "santantoni", name: "Sant Antoni", lon: 1.3036, lat: 38.9806, kind: "beach", venues: ["Café del Mar", "Mambo", "Ocean Beach"] },
  { id: "santaeularia", name: "Santa Eulària", lon: 1.5339, lat: 38.9847, kind: "beach", venues: ["Nikki Beach"] },
]

/*
 * Guest lists: noches editables. Vacío fuera de temporada (los clubs abren de mayo a octubre).
 * Formato: { date: "2027-06-04", venue: "Pacha", night: "nombre de la fiesta", status: "open" | "few" | "full" }
 * La disponibilidad solo sale de aquí: nunca se inventa escasez.
 */
export type Night = { date: string; venue: string; night: string; status: "open" | "few" | "full" }
export const NIGHTS: Night[] = []

export const FAQ = [
  { q: "How do I book?", a: "Send us a message. We reply with options and prices, you confirm, and we arrange the rest: one conversation from arrival to departure." },
  { q: "When are the clubs open?", a: "Ibiza's club season runs from May to October. Outside it we still arrange villas, boats, cars and restaurants." },
  { q: "Do guest lists cost anything?", a: "It depends on the club and the night. We tell you the conditions before you confirm, so there are no surprises at the door." },
  { q: "Can you plan the whole stay?", a: "Yes. Tell us the dates and the group, and we put the villa, transfers, boat days, tables and nights out together as one plan." },
  { q: "Where do jet skis run?", a: "Only in the marked zones authorised by the harbour authority. We confirm the meeting point when you book." },
]
