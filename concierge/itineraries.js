/* Itinerary records: data, templates and live status.
   Storage is this browser's localStorage, behind a tiny adapter so it can be
   swapped for a real database (e.g. Supabase) without touching the UI. */

const KEY = "mey-itineraries-v1";

// Package templates. place = key of a known location (see PLACES in app.js).
export const TEMPLATES = {
  "Arrival": [
    { title: "Llegada", events: [["14:30", "Transfer privado", "airport", "car"], ["16:00", "Check-in en la villa", "cubells", "home"], ["21:00", "Cena del chef privado", "cubells", "dish"]] },
  ],
  "Sea & Sun": [
    { title: "Llegada", events: [["13:00", "Transfer privado", "airport", "car"], ["14:30", "Check-in en la villa", "cubells", "home"], ["20:30", "Cena al atardecer", "eivissa", "dish"]] },
    { title: "Mar", events: [["10:30", "Salida en barco", "botafoch", "boat"], ["13:30", "Comida a bordo", "savina", "dish"], ["19:30", "Regreso a puerto", "botafoch", "boat"]] },
    { title: "Costa oeste", events: [["11:00", "Ruta en moto de agua", "bassa", "wave"], ["15:00", "Beach club", "salines", "sun"], ["20:00", "Atardecer", "santantoni", "sun"]] },
  ],
  "Night Edition": [
    { title: "Llegada", events: [["18:00", "Transfer privado", "airport", "car"], ["19:30", "Check-in en la villa", "cubells", "home"], ["23:30", "Mesa VIP", "eivissa", "star"]] },
    { title: "Noche", events: [["17:00", "Beach club", "bossa", "sun"], ["23:30", "Mesa VIP", "bossa", "star"], ["04:00", "Chófer de vuelta", "cubells", "car"]] },
    { title: "Salida", events: [["12:00", "Check-out", "cubells", "home"], ["13:30", "Transfer al aeropuerto", "airport", "car"]] },
  ],
  "Completo": [
    { title: "Llegada", events: [["14:30", "Transfer privado", "airport", "car"], ["16:00", "Check-in en la villa", "cubells", "home"], ["21:00", "Cena del chef privado", "cubells", "dish"]] },
    { title: "Mar", events: [["10:30", "Salida en barco", "botafoch", "boat"], ["13:30", "Comida a bordo", "savina", "dish"], ["19:30", "Regreso a puerto", "botafoch", "boat"]] },
    { title: "Costa oeste", events: [["11:00", "Ruta en moto de agua", "bassa", "wave"], ["15:00", "Beach club", "salines", "sun"], ["20:00", "Atardecer", "santantoni", "sun"]] },
    { title: "Interior", events: [["10:00", "Coche descapotable", "cubells", "car"], ["12:30", "Mirador de Es Vedrà", "hort", "sun"], ["21:00", "Cena al atardecer", "eivissa", "dish"]] },
    { title: "Noche", events: [["17:00", "Beach club", "bossa", "sun"], ["23:30", "Mesa VIP", "bossa", "star"], ["04:00", "Chófer de vuelta", "cubells", "car"]] },
    { title: "Salida", events: [["11:00", "Check-out", "cubells", "home"], ["13:00", "Transfer al aeropuerto", "airport", "car"]] },
  ],
};

const iso = d => d.toISOString().slice(0, 10);
const daysFromToday = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return iso(d); };
export function fromTemplate(name, start) {
  return TEMPLATES[name].map(d => ({ title: d.title, events: d.events.map(([time, title, place, icon]) => ({ time, title, place, icon })) }));
}
export const newCode = () => "MEY-" + Math.floor(1000 + Math.random() * 9000);

function seed() {
  return [
    { id: "c1", name: "Laura Martín", email: "laura@example.com", code: "MEY-2711", guests: 4, pack: "Completo", start: daysFromToday(-2), days: fromTemplate("Completo"), notes: "Celebración de cumpleaños el día 4." },
    { id: "c2", name: "James Carter", email: "james@example.com", code: "MEY-2804", guests: 6, pack: "Night Edition", start: daysFromToday(5), days: fromTemplate("Night Edition"), notes: "Grupo de amigos, mesa para 6." },
    { id: "c3", name: "Sofia Rossi", email: "sofia@example.com", code: "MEY-2620", guests: 2, pack: "Sea & Sun", start: daysFromToday(-12), days: fromTemplate("Sea & Sun"), notes: "" },
    { id: "demo", name: "Invitado", email: "", code: "MEY-DEMO", guests: 2, pack: "Completo", start: daysFromToday(-2), days: fromTemplate("Completo"), notes: "Itinerario de demostración.", demo: true },
  ];
}

// ---- storage adapter (swap these two functions for a real backend) ----
export function loadAll() {
  try { const r = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(r) && r.length) return r; } catch {}
  const s = seed(); saveAll(s); return s;
}
export function saveAll(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} }

export function findForClient(email, code) {
  const list = loadAll(), c = (code || "").trim().toUpperCase(), e = (email || "").trim().toLowerCase();
  return list.find(r => r.code.toUpperCase() === c && (r.demo || r.email.toLowerCase() === e)) || null;
}

// ---- live status ----
// An event's moment is start date + day index + time; times before 06:00 belong to the night of that day.
export function eventDate(rec, d, time) {
  const [h, m] = time.split(":").map(Number); const t = new Date(rec.start + "T00:00:00");
  t.setDate(t.getDate() + d + (h < 6 ? 1 : 0)); t.setHours(h, m, 0, 0); return t;
}
export function timeline(rec, now = new Date()) {
  const flat = [];
  rec.days.forEach((day, d) => day.events.forEach((ev, i) => flat.push({ ...ev, d, i, at: eventDate(rec, d, ev.time) })));
  flat.sort((a, b) => a.at - b.at);
  let current = -1; flat.forEach((e, k) => { if (e.at <= now) current = k; });
  const lastEnd = flat.length ? new Date(flat[flat.length - 1].at.getTime() + 2 * 3600e3) : now;
  flat.forEach((e, k) => { e.status = k < current ? "done" : k === current ? (now > lastEnd ? "done" : "now") : "next"; });
  const done = flat.filter(e => e.status === "done").length;
  const state = !flat.length || now < flat[0].at ? "upcoming" : now > lastEnd ? "finished" : "active";
  const today = clampDay(rec, now);
  return { flat, done, total: flat.length, pct: flat.length ? Math.round((done + (current >= 0 && flat[current].status === "now" ? .5 : 0)) / flat.length * 100) : 0, state, current: flat[current] || null, next: flat[current + 1] || null, today };
}
function clampDay(rec, now) {
  const s = new Date(rec.start + "T00:00:00"); const d = Math.floor((now - s) / 864e5);
  return Math.max(0, Math.min(rec.days.length - 1, d));
}
