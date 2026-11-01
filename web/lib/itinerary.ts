/*
 * Itinerario de demostración del área privada.
 *
 * El viaje empieza siempre dos días antes de "hoy" (hora de Ibiza), así que el panel se ve
 * a mitad de estancia: días completados, un día en curso con eventos hechos, uno en vivo y
 * los siguientes. Los locales son genéricos a propósito: nombrar un club o restaurante real
 * implica representarlo. En producción esto vendrá de la base de datos de reservas.
 */

export type EventType = "transfer" | "villa" | "yacht" | "water" | "car" | "dining" | "beach" | "night" | "wellness" | "boat"
export type Status = "done" | "live" | "next" | "upcoming"

type Raw = { time: string; minutes: number; type: EventType; title: string; place: string; placeId?: string; detail: string; contact?: string; confirmed?: boolean }

const DAYS: { title: string; events: Raw[] }[] = [
  {
    title: "Arrival",
    events: [
      { time: "14:10", minutes: 35, type: "transfer", title: "Private transfer to the villa", place: "Ibiza Airport → Sant Josep", placeId: "airport", detail: "Your driver waits at arrivals with your name. Flight tracked.", contact: "Driver" },
      { time: "15:00", minutes: 60, type: "villa", title: "Villa check-in & welcome", place: "Villa · Sant Josep", placeId: "hort", detail: "Villa manager walks you through the house. Fridge stocked to your list." },
      { time: "20:30", minutes: 150, type: "dining", title: "Dinner under the bastions", place: "Restaurant · Dalt Vila", placeId: "daltvila", detail: "Terrace table for 4 held in your name." },
    ],
  },
  {
    title: "Sea day",
    events: [
      { time: "10:00", minutes: 420, type: "yacht", title: "Yacht day charter", place: "Marina Botafoch → Es Vedrà", placeId: "botafoch", detail: "Skipper and crew, lunch on board, swim stop at Cala d’Hort.", contact: "Captain" },
      { time: "19:30", minutes: 60, type: "beach", title: "Sunset drinks", place: "Cala Comte", placeId: "comte", detail: "Front-row seats facing the islets." },
      { time: "21:30", minutes: 150, type: "dining", title: "Private chef at the villa", place: "Villa · Sant Josep", placeId: "hort", detail: "Mediterranean tasting menu, wine pairing." },
    ],
  },
  {
    title: "Water & night",
    events: [
      { time: "10:30", minutes: 90, type: "water", title: "Guided jet ski route", place: "Badia de Sant Antoni", placeId: "santantoni", detail: "With an authorised monitor. Bring swimwear and ID.", contact: "Operator" },
      { time: "13:30", minutes: 180, type: "beach", title: "Beach club lunch", place: "Beach club · Cala Jondal", placeId: "jondal", detail: "Daybed for 4, lunch table at 14:30." },
      { time: "18:00", minutes: 90, type: "wellness", title: "Massage at the villa", place: "Villa · Sant Josep", placeId: "hort", detail: "Two therapists, 60 minutes each." },
      { time: "23:30", minutes: 240, type: "night", title: "Club night · VIP table", place: "Club · Platja d’en Bossa", placeId: "bossa", detail: "Host meets you at the door. Minimum spend confirmed in writing.", contact: "Night host", confirmed: false },
    ],
  },
  {
    title: "Slow north",
    events: [
      { time: "10:00", minutes: 60, type: "wellness", title: "Yoga on the terrace", place: "Villa · Sant Josep", placeId: "hort", detail: "Private teacher, mats provided." },
      { time: "13:00", minutes: 120, type: "dining", title: "Long lunch by the marina", place: "Santa Eulària", placeId: "santaeularia", detail: "Table on the promenade." },
      { time: "17:30", minutes: 150, type: "car", title: "Convertible to the north coast", place: "Sant Joan de Labritja", detail: "Open-top car delivered to the villa." },
    ],
  },
  {
    title: "Formentera",
    events: [
      { time: "09:30", minutes: 40, type: "boat", title: "Fast boat to Formentera", place: "Eivissa port → La Savina", placeId: "savina", detail: "Priority boarding. Tickets in Documents." },
      { time: "13:30", minutes: 150, type: "dining", title: "Lunch on the beach", place: "Formentera", placeId: "savina", detail: "Table for 4 at 13:30." },
      { time: "19:00", minutes: 40, type: "boat", title: "Return to Ibiza", place: "La Savina → Eivissa port", placeId: "botafoch", detail: "Driver waiting at the port." },
    ],
  },
  {
    title: "Last night",
    events: [
      { time: "15:00", minutes: 240, type: "beach", title: "Beach club afternoon", place: "Platja d’en Bossa", placeId: "bossa", detail: "Daybeds, DJ from 17:00." },
      { time: "21:00", minutes: 120, type: "dining", title: "Dinner at the marina", place: "Marina Botafoch", placeId: "botafoch", detail: "Table facing Dalt Vila." },
      { time: "00:30", minutes: 180, type: "night", title: "Guest list · club night", place: "Club · Eivissa", placeId: "daltvila", detail: "Your names on the partner guest list. Entry at the venue’s discretion, 18+.", confirmed: false },
    ],
  },
  {
    title: "Departure",
    events: [
      { time: "11:00", minutes: 90, type: "villa", title: "Late checkout", place: "Villa · Sant Josep", placeId: "hort", detail: "Arranged until 12:30." },
      { time: "12:30", minutes: 35, type: "transfer", title: "Transfer to the airport", place: "Villa → Ibiza Airport", placeId: "airport", detail: "Driver at the door at 12:30.", contact: "Driver" },
    ],
  },
]

export const DEMO_GUEST = { name: "Alex", party: 4, villa: "Villa · Sant Josep (demo)" }

// --- hora de Ibiza ---------------------------------------------------------
const TZ = "Europe/Madrid"

function ibizaParts(d: Date) {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(d)
    .reduce<Record<string, number>>((o, x) => (x.type !== "literal" ? { ...o, [x.type]: Number(x.value) } : o), {})
  return { y: p.year, m: p.month, d: p.day, h: p.hour, min: p.minute }
}

/** instante UTC de una hora local de Ibiza */
function ibizaInstant(y: number, m: number, d: number, h: number, min: number) {
  const guess = Date.UTC(y, m - 1, d, h, min)
  const p = ibizaParts(new Date(guess))
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - guess
  return new Date(guess - offset)
}

export function ibizaClock(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d)
}

export type TripEvent = Raw & { id: string; day: number; start: Date; end: Date; status: Status; confirmed: boolean }
export type TripDay = { index: number; date: Date; title: string; events: TripEvent[]; done: number; status: "done" | "today" | "upcoming" }

export function buildTrip(now: Date) {
  const today = ibizaParts(now)
  const base = Date.UTC(today.y, today.m - 1, today.d) - 2 * 86400000
  const days: TripDay[] = DAYS.map((d, index) => {
    const day = new Date(base + index * 86400000)
    const [y, m, dd] = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()]
    const events = d.events.map((e, k) => {
      const [h, min] = e.time.split(":").map(Number)
      // pasada la medianoche, el evento pertenece a la noche del día anterior
      const start = h < 6 ? new Date(ibizaInstant(y, m, dd, h, min).getTime() + 86400000) : ibizaInstant(y, m, dd, h, min)
      const end = new Date(start.getTime() + e.minutes * 60000)
      const status: Status = now >= end ? "done" : now >= start ? "live" : "upcoming"
      return { ...e, id: `${index}-${k}`, day: index, start, end, status, confirmed: e.confirmed ?? true }
    })
    const done = events.filter((e) => e.status === "done").length
    return {
      index,
      date: ibizaInstant(y, m, dd, 12, 0),
      title: d.title,
      events,
      done,
      status: done === events.length ? "done" : index === 2 || events.some((e) => e.status !== "upcoming") ? "today" : "upcoming",
    }
  })
  const all = days.flatMap((d) => d.events)
  const next = all.find((e) => e.status === "upcoming")
  if (next) next.status = all.some((e) => e.status === "live") ? "upcoming" : "next"
  const live = all.find((e) => e.status === "live") ?? null
  const done = all.filter((e) => e.status === "done").length
  const todayIndex = Math.max(0, days.findIndex((d) => d.status === "today"))
  return { days, all, live, next: next ?? null, done, total: all.length, todayIndex }
}

export type Trip = ReturnType<typeof buildTrip>

export function formatDay(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" }).format(d)
}

export function untilLabel(ms: number) {
  if (ms <= 0) return "now"
  const m = Math.round(ms / 60000)
  if (m < 60) return `in ${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h < 24) return r ? `in ${h} h ${r} min` : `in ${h} h`
  const d = Math.round(h / 24)
  return `in ${d} ${d === 1 ? "day" : "days"}`
}
