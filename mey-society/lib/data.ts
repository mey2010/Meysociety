/*
 * Mey Society: todo el contenido editable de la web en un solo sitio.
 */

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

export type Service = {
  id: string
  /** nombre corto para la columna y el panel 3D */
  name: string
  /** una línea bajo el nombre */
  line: string
  /** ficha: qué incluye */
  details: string
  /** datos en una línea, separados por " / " */
  meta: string
  message: string
}

export const SERVICES: Service[] = [
  {
    id: "villa",
    name: "Villa Cala Molí",
    line: "Our own house on the west coast",
    meta: "West coast / Sunset side / 650 m from the sea",
    details: "A private villa above Cala Molí, prepared before you land and looked after until you leave. Chef, housekeeping and transfers arranged around your days.",
    message: "Hello Mey Society, I would like to book the villa in Cala Molí.",
  },
  {
    id: "yachts",
    name: "Yachts",
    line: "Day and week charters with crew",
    meta: "Skipper and crew / Sunset sails / Formentera days",
    details: "Motor yachts and catamarans for a day, a sunset or the whole week. You choose the cove; we arrange the boat, the crew, the lunch on board and the tender.",
    message: "Hello Mey Society, I would like to charter a yacht.",
  },
  {
    id: "jetskis",
    name: "Jet skis",
    line: "Guided routes in authorised zones",
    meta: "Licensed operators / All levels / Meeting point confirmed",
    details: "Jet ski routes run only in the marked zones authorised by the harbour authority. We confirm the meeting point and the guide when you book.",
    message: "Hello Mey Society, I would like to book jet skis.",
  },
  {
    id: "cars",
    name: "Cars",
    line: "Luxury cars and private drivers",
    meta: "Delivered to the villa / Airport transfers / Night drivers",
    details: "The car waiting at arrivals, a convertible delivered to the villa for the week, and a driver for every night out so nobody has to think about it.",
    message: "Hello Mey Society, I would like a car or a driver.",
  },
  {
    id: "beach",
    name: "Beach clubs",
    line: "Beds and tables at every beach club",
    meta: "Sun beds / Lunch tables / Sunset tables",
    details: "The right bed at the right beach club, the lunch that runs into the afternoon, and the table that faces the sunset.",
    message: "Hello Mey Society, I would like a beach club reservation.",
  },
  {
    id: "guestlists",
    name: "Guest lists",
    line: "Every club, every night",
    meta: "Guest lists / VIP tables / Season May to October",
    details: "Your name on the list at every club on the island, VIP tables when you want them, and the car outside when you leave. We confirm the conditions before you go.",
    message: "Hello Mey Society, I would like to be on a guest list.",
  },
]
