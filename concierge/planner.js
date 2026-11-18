/* "Diseña tu semana en Ibiza": four quick steps (dates, group, style, must-haves) and the page draws a day-by-day
   plan built only from Mey Society's own services, each one a tap away, with the guestlists it unlocks. The plan goes
   to the concierge in one message. Nothing here is a price or a promise of availability: it is a proposal to confirm. */
import { getLang } from "./i18n.js";

const L = {
  es: {
    eyebrow: "Planificador", title: "Diseña tu semana en Ibiza.", lede: "Cuatro preguntas y tienes tu viaje dibujado día a día. Lo afinamos juntos por WhatsApp.",
    steps: ["Fechas", "Grupo", "Estilo", "Imprescindibles"], from: "Llegada", to: "Salida", people: "Personas", kids: "Viajamos con niños",
    styleQ: "¿Qué buscáis? (elige uno o varios)", mustQ: "¿Qué no puede faltar?",
    styles: { relax: "Relax y calas", party: "Fiesta", food: "Gastronomía", celeb: "Celebración", family: "Familia", sea: "Aventura en el mar" },
    musts: { villas: "Villa", yates: "Barco", formentera: "Formentera Experience", motos: "Motos de agua", vip: "Mesa VIP", dining: "Chef privado", dj: "DJ", coches: "Coche", transfers: "Transfer" },
    next: "Siguiente", back: "Atrás", make: "Crear mi plan", again: "Cambiar respuestas", send: "Enviar mi plan a Mey Society", see: "Ver",
    day: "Día", nights: n => `${n} ${n === 1 ? "noche" : "noches"}`, guests: n => `${n} ${n === 1 ? "persona" : "personas"}`,
    gift: n => n === 1 ? "Este plan desbloquea 1 guestlist de cortesía" : `Este plan desbloquea ${n} guestlists de cortesía`,
    giftFine: "Sujetas a disponibilidad del club. Mayores de 18.", note: "Es una propuesta: te confirmamos horarios y disponibilidad de cada servicio por escrito.",
    errDates: "Elige tu llegada y tu salida.", errStyle: "Elige al menos un estilo.",
    slots: { m: "Mañana", a: "Tarde", e: "Atardecer", n: "Noche" },
    items: {
      arrive: ["Llegada y transfer privado", "Te recogemos en el aeropuerto o el puerto y te llevamos a tu alojamiento."],
      checkin: ["Check-in en tu villa", "La casa lista y la nevera llena antes de que llegues."],
      welcome: ["Cena de bienvenida", "Mesa reservada en un restaurante con vistas para empezar el viaje."],
      boat: ["Día de barco por las calas", "Patrón, calas de agua turquesa y comida a bordo o en un chiringuito."],
      formentera: ["Formentera Experience", "12 horas todo incluido: Espalmador, Ses Illetes, 6 horas libres y sunset party."],
      jetski: ["Ruta en moto de agua", "Con monitor si no tienes licencia; libre si la tienes."],
      beach: ["Comida en beach club", "Cama balinesa y comida con los pies en la arena."],
      sunset: ["Atardecer en el oeste", "Cala Comte o Es Vedrà a la hora dorada; te decimos dónde según el viento."],
      club: ["Noche en club con mesa VIP", "Mesa en el club que quieras según el line-up de esa noche."],
      chef: ["Cena con chef privado", "Menú a medida en tu villa, sin moverte de casa."],
      dj: ["Fiesta privada con DJ", "Un DJ profesional en tu villa o a bordo."],
      car: ["Ruta en coche por el norte", "Calas del norte, pueblos y un almuerzo payés."],
      daltvila: ["Paseo por Dalt Vila", "La ciudad amurallada al caer la tarde y cena en el puerto."],
      free: ["Día libre", "Descanso en la villa: estamos a un mensaje si se te antoja algo."],
      depart: ["Salida y transfer", "Te llevamos al aeropuerto o al puerto a tu hora."],
    },
    waHead: "Hola, he diseñado mi viaje en vuestra web:",
  },
  en: {
    eyebrow: "Planner", title: "Design your week in Ibiza.", lede: "Four questions and your trip is drawn day by day. We fine-tune it together on WhatsApp.",
    steps: ["Dates", "Group", "Style", "Must-haves"], from: "Arrival", to: "Departure", people: "People", kids: "Travelling with children",
    styleQ: "What are you after? (pick one or more)", mustQ: "What can't be missing?",
    styles: { relax: "Relax & coves", party: "Party", food: "Food", celeb: "Celebration", family: "Family", sea: "Sea adventure" },
    musts: { villas: "Villa", yates: "Boat", formentera: "Formentera Experience", motos: "Jet skis", vip: "VIP table", dining: "Private chef", dj: "DJ", coches: "Car", transfers: "Transfer" },
    next: "Next", back: "Back", make: "Create my plan", again: "Change answers", send: "Send my plan to Mey Society", see: "See",
    day: "Day", nights: n => `${n} ${n === 1 ? "night" : "nights"}`, guests: n => `${n} ${n === 1 ? "person" : "people"}`,
    gift: n => n === 1 ? "This plan unlocks 1 complimentary guestlist" : `This plan unlocks ${n} complimentary guestlists`,
    giftFine: "Subject to club availability. 18+ only.", note: "This is a proposal: we confirm times and availability of each service in writing.",
    errDates: "Choose your arrival and departure.", errStyle: "Choose at least one style.",
    slots: { m: "Morning", a: "Afternoon", e: "Sunset", n: "Night" },
    items: {
      arrive: ["Arrival and private transfer", "We pick you up at the airport or port and take you to your stay."],
      checkin: ["Check-in at your villa", "The house ready and the fridge stocked before you arrive."],
      welcome: ["Welcome dinner", "A table at a restaurant with a view to start the trip."],
      boat: ["Boat day around the coves", "Skipper, turquoise coves and lunch on board or at a beach bar."],
      formentera: ["Formentera Experience", "12 hours all inclusive: Espalmador, Ses Illetes, 6 free hours and a sunset party."],
      jetski: ["Jet ski ride", "With an instructor if you have no licence; on your own if you do."],
      beach: ["Lunch at a beach club", "A Balinese bed and lunch with your feet in the sand."],
      sunset: ["Sunset in the west", "Cala Comte or Es Vedrà at golden hour; we tell you where, depending on the wind."],
      club: ["Club night with a VIP table", "A table at the club you choose, depending on that night's line-up."],
      chef: ["Private chef dinner", "A bespoke menu at your villa, without leaving home."],
      dj: ["Private party with a DJ", "A professional DJ at your villa or on board."],
      car: ["Road trip to the north", "Northern coves, villages and a country lunch."],
      daltvila: ["Evening in Dalt Vila", "The walled town at dusk and dinner by the harbour."],
      free: ["Free day", "Rest at the villa: we're one message away if you fancy something."],
      depart: ["Departure and transfer", "We take you to the airport or port on time."],
    },
    waHead: "Hi, I designed my trip on your website:",
  },
  it: {
    eyebrow: "Pianificatore", title: "Disegna la tua settimana a Ibiza.", lede: "Quattro domande e il tuo viaggio è pronto giorno per giorno. Lo perfezioniamo insieme su WhatsApp.",
    steps: ["Date", "Gruppo", "Stile", "Irrinunciabili"], from: "Arrivo", to: "Partenza", people: "Persone", kids: "Viaggiamo con bambini",
    styleQ: "Cosa cercate? (scegline uno o più)", mustQ: "Cosa non può mancare?",
    styles: { relax: "Relax e calette", party: "Festa", food: "Gastronomia", celeb: "Celebrazione", family: "Famiglia", sea: "Avventura in mare" },
    musts: { villas: "Villa", yates: "Barca", formentera: "Formentera Experience", motos: "Moto d'acqua", vip: "Tavolo VIP", dining: "Chef privato", dj: "DJ", coches: "Auto", transfers: "Transfer" },
    next: "Avanti", back: "Indietro", make: "Crea il mio piano", again: "Cambia risposte", send: "Invia il mio piano a Mey Society", see: "Vedi",
    day: "Giorno", nights: n => `${n} ${n === 1 ? "notte" : "notti"}`, guests: n => `${n} ${n === 1 ? "persona" : "persone"}`,
    gift: n => n === 1 ? "Questo piano sblocca 1 guestlist di cortesia" : `Questo piano sblocca ${n} guestlist di cortesia`,
    giftFine: "Soggette a disponibilità del club. Solo maggiorenni.", note: "È una proposta: ti confermiamo orari e disponibilità di ogni servizio per iscritto.",
    errDates: "Scegli arrivo e partenza.", errStyle: "Scegli almeno uno stile.",
    slots: { m: "Mattina", a: "Pomeriggio", e: "Tramonto", n: "Notte" },
    items: {
      arrive: ["Arrivo e transfer privato", "Ti veniamo a prendere in aeroporto o al porto e ti portiamo al tuo alloggio."],
      checkin: ["Check-in in villa", "La casa pronta e il frigo pieno prima del tuo arrivo."],
      welcome: ["Cena di benvenuto", "Un tavolo in un ristorante con vista per iniziare il viaggio."],
      boat: ["Giornata in barca tra le calette", "Skipper, calette turchesi e pranzo a bordo o in un chiringuito."],
      formentera: ["Formentera Experience", "12 ore all-inclusive: Espalmador, Ses Illetes, 6 ore libere e sunset party."],
      jetski: ["Giro in moto d'acqua", "Con istruttore se non hai la patente; libero se ce l'hai."],
      beach: ["Pranzo in un beach club", "Letto balinese e pranzo con i piedi nella sabbia."],
      sunset: ["Tramonto a ovest", "Cala Comte o Es Vedrà all'ora d'oro; ti diciamo dove in base al vento."],
      club: ["Serata in club con tavolo VIP", "Un tavolo nel club che preferisci, in base al line-up della serata."],
      chef: ["Cena con chef privato", "Menù su misura in villa, senza uscire di casa."],
      dj: ["Festa privata con DJ", "Un DJ professionista in villa o a bordo."],
      car: ["Giro in auto al nord", "Calette del nord, paesini e un pranzo tipico."],
      daltvila: ["Passeggiata a Dalt Vila", "La città murata al tramonto e cena al porto."],
      free: ["Giornata libera", "Relax in villa: siamo a un messaggio se ti viene voglia di qualcosa."],
      depart: ["Partenza e transfer", "Ti portiamo in aeroporto o al porto in orario."],
    },
    waHead: "Ciao, ho disegnato il mio viaggio sul vostro sito:",
  },
  fr: {
    eyebrow: "Planificateur", title: "Dessinez votre semaine à Ibiza.", lede: "Quatre questions et votre voyage est tracé jour par jour. On l'affine ensemble sur WhatsApp.",
    steps: ["Dates", "Groupe", "Style", "Indispensables"], from: "Arrivée", to: "Départ", people: "Personnes", kids: "Nous voyageons avec des enfants",
    styleQ: "Que cherchez-vous ? (un ou plusieurs)", mustQ: "Qu'est-ce qui ne peut pas manquer ?",
    styles: { relax: "Détente et criques", party: "Fête", food: "Gastronomie", celeb: "Célébration", family: "Famille", sea: "Aventure en mer" },
    musts: { villas: "Villa", yates: "Bateau", formentera: "Formentera Experience", motos: "Jet-ski", vip: "Table VIP", dining: "Chef privé", dj: "DJ", coches: "Voiture", transfers: "Transfert" },
    next: "Suivant", back: "Retour", make: "Créer mon plan", again: "Modifier mes réponses", send: "Envoyer mon plan à Mey Society", see: "Voir",
    day: "Jour", nights: n => `${n} ${n === 1 ? "nuit" : "nuits"}`, guests: n => `${n} ${n === 1 ? "personne" : "personnes"}`,
    gift: n => n === 1 ? "Ce plan débloque 1 guestlist offerte" : `Ce plan débloque ${n} guestlists offertes`,
    giftFine: "Selon disponibilité du club. Réservé aux plus de 18 ans.", note: "C'est une proposition : nous confirmons par écrit les horaires et la disponibilité de chaque service.",
    errDates: "Choisissez votre arrivée et votre départ.", errStyle: "Choisissez au moins un style.",
    slots: { m: "Matin", a: "Après-midi", e: "Coucher du soleil", n: "Nuit" },
    items: {
      arrive: ["Arrivée et transfert privé", "Nous venons vous chercher à l'aéroport ou au port et vous conduisons à votre logement."],
      checkin: ["Check-in à la villa", "La maison prête et le frigo rempli avant votre arrivée."],
      welcome: ["Dîner de bienvenue", "Une table avec vue pour commencer le voyage."],
      boat: ["Journée en bateau dans les criques", "Skipper, criques turquoise et déjeuner à bord ou dans un chiringuito."],
      formentera: ["Formentera Experience", "12 heures tout compris : Espalmador, Ses Illetes, 6 heures libres et sunset party."],
      jetski: ["Balade en jet-ski", "Avec moniteur sans permis ; en liberté si vous l'avez."],
      beach: ["Déjeuner en beach club", "Lit balinais et déjeuner les pieds dans le sable."],
      sunset: ["Coucher de soleil à l'ouest", "Cala Comte ou Es Vedrà à l'heure dorée ; on vous dit où selon le vent."],
      club: ["Soirée en club avec table VIP", "Une table dans le club de votre choix selon le line-up du soir."],
      chef: ["Dîner avec chef privé", "Un menu sur mesure à la villa, sans bouger."],
      dj: ["Fête privée avec DJ", "Un DJ professionnel à la villa ou à bord."],
      car: ["Virée en voiture au nord", "Criques du nord, villages et déjeuner de campagne."],
      daltvila: ["Balade à Dalt Vila", "La vieille ville au crépuscule et dîner sur le port."],
      free: ["Journée libre", "Repos à la villa : nous sommes à un message si une envie vous prend."],
      depart: ["Départ et transfert", "Nous vous conduisons à l'aéroport ou au port à l'heure."],
    },
    waHead: "Bonjour, j'ai dessiné mon voyage sur votre site :",
  },
  de: {
    eyebrow: "Planer", title: "Plane deine Woche auf Ibiza.", lede: "Vier Fragen und deine Reise steht Tag für Tag. Den Feinschliff machen wir zusammen per WhatsApp.",
    steps: ["Daten", "Gruppe", "Stil", "Must-haves"], from: "Ankunft", to: "Abreise", people: "Personen", kids: "Wir reisen mit Kindern",
    styleQ: "Was sucht ihr? (eins oder mehrere)", mustQ: "Was darf nicht fehlen?",
    styles: { relax: "Entspannung & Buchten", party: "Party", food: "Kulinarik", celeb: "Feier", family: "Familie", sea: "Abenteuer auf dem Meer" },
    musts: { villas: "Villa", yates: "Boot", formentera: "Formentera Experience", motos: "Jetski", vip: "VIP-Tisch", dining: "Privatkoch", dj: "DJ", coches: "Auto", transfers: "Transfer" },
    next: "Weiter", back: "Zurück", make: "Meinen Plan erstellen", again: "Antworten ändern", send: "Plan an Mey Society senden", see: "Ansehen",
    day: "Tag", nights: n => `${n} ${n === 1 ? "Nacht" : "Nächte"}`, guests: n => `${n} ${n === 1 ? "Person" : "Personen"}`,
    gift: n => n === 1 ? "Dieser Plan schaltet 1 kostenlose Guestlist frei" : `Dieser Plan schaltet ${n} kostenlose Guestlists frei`,
    giftFine: "Je nach Verfügbarkeit des Clubs. Ab 18.", note: "Das ist ein Vorschlag: Zeiten und Verfügbarkeit jedes Services bestätigen wir schriftlich.",
    errDates: "Wähle Ankunft und Abreise.", errStyle: "Wähle mindestens einen Stil.",
    slots: { m: "Morgen", a: "Nachmittag", e: "Sonnenuntergang", n: "Nacht" },
    items: {
      arrive: ["Ankunft und privater Transfer", "Wir holen dich am Flughafen oder Hafen ab und bringen dich zu deiner Unterkunft."],
      checkin: ["Check-in in deiner Villa", "Das Haus fertig und der Kühlschrank voll, bevor du ankommst."],
      welcome: ["Begrüßungsdinner", "Ein Tisch mit Aussicht zum Start der Reise."],
      boat: ["Bootstag durch die Buchten", "Skipper, türkise Buchten und Mittagessen an Bord oder im Strandlokal."],
      formentera: ["Formentera Experience", "12 Stunden all inclusive: Espalmador, Ses Illetes, 6 freie Stunden und Sunset-Party."],
      jetski: ["Jetski-Tour", "Mit Guide ohne Führerschein; frei, wenn du einen hast."],
      beach: ["Mittagessen im Beach Club", "Balinesisches Bett und Essen mit den Füßen im Sand."],
      sunset: ["Sonnenuntergang im Westen", "Cala Comte oder Es Vedrà zur goldenen Stunde; wo genau, sagen wir dir je nach Wind."],
      club: ["Clubnacht mit VIP-Tisch", "Ein Tisch im Club deiner Wahl, je nach Line-up des Abends."],
      chef: ["Dinner mit Privatkoch", "Ein Menü nach Maß in deiner Villa, ohne das Haus zu verlassen."],
      dj: ["Private Party mit DJ", "Ein professioneller DJ in deiner Villa oder an Bord."],
      car: ["Autotour in den Norden", "Buchten im Norden, Dörfer und ein ländliches Mittagessen."],
      daltvila: ["Abend in Dalt Vila", "Die Altstadt in der Dämmerung und Dinner am Hafen."],
      free: ["Freier Tag", "Entspannen in der Villa: Wir sind nur eine Nachricht entfernt."],
      depart: ["Abreise und Transfer", "Wir bringen dich pünktlich zum Flughafen oder Hafen."],
    },
    waHead: "Hallo, ich habe meine Reise auf eurer Website geplant:",
  },
};
// what each plan item is, when it happens, which styles it suits and which service it books
const ITEMS = {
  boat:      { slot: "m", tags: ["relax", "sea", "celeb", "family"], svc: "yates", go: "fleet:open", day: true },
  formentera:{ slot: "m", tags: ["relax", "party", "sea", "celeb"], svc: "formentera", go: "fx", day: true },
  jetski:    { slot: "a", tags: ["sea", "party"], svc: "motos", go: "fleet:moto-agua" },
  beach:     { slot: "a", tags: ["relax", "party", "food", "celeb"], svc: null, go: "map:beachclub" },
  car:       { slot: "m", tags: ["relax", "family"], svc: "coches", go: "fleet:coche", day: true },
  sunset:    { slot: "e", tags: ["relax", "celeb", "family", "food"], svc: null, go: "map:beach" },
  daltvila:  { slot: "e", tags: ["family", "food", "relax"], svc: null, go: null },
  club:      { slot: "n", tags: ["party", "celeb"], svc: "vip", go: "agenda", adult: true },
  chef:      { slot: "e", tags: ["food", "celeb", "family"], svc: "dining", go: "svc:dining" },
  dj:        { slot: "n", tags: ["celeb", "party"], svc: "dj", go: "svc:dj", adult: true },
};
const GIFT_SVC = new Set(["yates", "motos", "moto", "coches", "villas", "vip", "dining", "transfers", "dj", "formentera"]);
const giftFor = k => k >= 3 ? 4 : k === 2 ? 3 : k === 1 ? 1 : 0;   // the same ladder as the form
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function initPlanner(root, { onGo, onSend, icons = {} } = {}) {
  const st = { step: 0, from: "", to: "", people: 4, kids: false, styles: new Set(), musts: new Set(["transfers"]), plan: null };
  const tx = () => L[getLang()] || L.es;
  const today = new Date(); today.setHours(12);
  const iso = d => d.toISOString().slice(0, 10);
  const fmt = d => d.toLocaleDateString(getLang(), { weekday: "short", day: "numeric", month: "short" });

  function build() {
    const t = tx(), D = [], start = new Date(st.from + "T12:00"), end = new Date(st.to + "T12:00");
    const nights = Math.max(1, Math.round((end - start) / 864e5));
    for (let i = 0; i <= nights; i++) D.push({ date: new Date(start.getTime() + i * 864e5), items: [] });
    const add = (d, key) => d.items.push({ key, ...(ITEMS[key] || {}) });
    // first and last day
    D[0].items.push({ key: "arrive", slot: "a", svc: "transfers", go: "fleet:transfer" });
    if (st.musts.has("villas")) D[0].items.push({ key: "checkin", slot: "a", svc: "villas", go: "villa" });
    D[0].items.push({ key: "welcome", slot: "n", svc: null, go: null });
    D[D.length - 1].items.push({ key: "depart", slot: "m", svc: "transfers", go: "fleet:transfer" });
    // the middle days: must-haves first, then what suits the chosen styles, never the same thing twice in a row
    const middle = D.slice(1, -1);
    const pool = Object.keys(ITEMS).filter(k => !(st.kids && ITEMS[k].adult));
    const want = [];
    const mustMap = { yates: "boat", formentera: "formentera", motos: "jetski", vip: "club", dining: "chef", dj: "dj", coches: "car" };
    st.musts.forEach(m => { const k = mustMap[m]; if (k && pool.includes(k)) want.push(k); });
    const score = k => ITEMS[k].tags.filter(x => st.styles.has(x)).length;
    pool.filter(k => !want.includes(k)).sort((a, b) => score(b) - score(a)).forEach(k => { if (score(k) > 0) want.push(k); });
    if (!want.length) want.push("boat", "beach", "sunset");
    // each day gets one daytime block (a full-day outing, or two half-day plans together) and one evening/night
    // moment; must-haves come first, long stays repeat the favourites and keep one slow day in the middle
    const full = want.filter(k => ITEMS[k].day), half = want.filter(k => ITEMS[k].slot === "a"), eve = want.filter(k => ["e", "n"].includes(ITEMS[k].slot));
    const blocks = full.map(k => [k]);
    for (let i = 0; i < half.length; i += 2) blocks.splice(Math.min(blocks.length, 1 + i), 0, half.slice(i, i + 2));
    const slow = middle.length >= 6 ? Math.floor(middle.length / 2) : -1;
    let bi = 0, ei = 0;
    middle.forEach((d, i) => {
      if (i === slow) add(d, "free");
      else if (blocks.length) blocks[bi++ % blocks.length].forEach(k => add(d, k));
      // Formentera fills the whole day and ends with its own sunset party: nothing else is planned that night
      if (eve.length && !d.items.some(it => it.key === "formentera")) add(d, eve[ei++ % eve.length]);
      if (!d.items.length) add(d, "free");
    });
    if (!middle.length && want.length) add(D[0], want.find(k => ["e", "n"].includes(ITEMS[k].slot)) || want[0]);
    const order = { m: 0, a: 1, e: 2, n: 3 };
    D.forEach(d => d.items.sort((a, b) => order[a.slot] - order[b.slot]));
    const svcs = new Set(); D.forEach(d => d.items.forEach(it => it.svc && svcs.add(it.svc))); st.musts.forEach(m => svcs.add(m));
    return { days: D, nights, svcs: [...svcs], gifts: giftFor([...svcs].filter(s => GIFT_SVC.has(s)).length) };
  }

  function text() {
    const t = tx(), p = st.plan; if (!p) return "";
    const lines = [t.waHead, `${fmt(p.days[0].date)} → ${fmt(p.days[p.days.length - 1].date)} · ${t.nights(p.nights)} · ${t.guests(st.people)}${st.kids ? " · " + t.kids : ""}`];
    p.days.forEach((d, i) => lines.push(`${t.day} ${i + 1} (${fmt(d.date)}): ${d.items.map(it => (t.items[it.key] || [it.key])[0]).join(" · ")}`));
    return lines.join("\n");
  }

  function render() {
    const t = tx();
    const chip = (group, key, label, on) => `<button type="button" class="pl__chip" data-${group}="${key}" aria-pressed="${on}">${esc(label)}</button>`;
    const stepper = `<ol class="pl__steps">${t.steps.map((s, i) => `<li class="${i === st.step ? "is-on" : i < st.step ? "is-done" : ""}"><span>${i + 1}</span>${esc(s)}</li>`).join("")}</ol>`;
    let body = "";
    if (st.plan) {
      const p = st.plan;
      body = `<div class="pl__result">
        <p class="pl__sum">${esc(fmt(p.days[0].date))} → ${esc(fmt(p.days[p.days.length - 1].date))} · ${esc(t.nights(p.nights))} · ${esc(t.guests(st.people))}</p>
        <ol class="pl__days">${p.days.map((d, i) => `<li class="pl__day" style="--i:${i}">
          <header><b>${esc(t.day)} ${i + 1}</b><span>${esc(fmt(d.date))}</span></header>
          <ul>${d.items.map(it => `<li><span class="pl__slot">${esc(t.slots[it.slot] || "")}</span><div><strong>${esc((t.items[it.key] || [it.key])[0])}</strong><p>${esc((t.items[it.key] || ["", ""])[1])}</p></div>${it.go ? `<button type="button" class="pl__see" data-go="${it.go}">${esc(t.see)}</button>` : ""}</li>`).join("")}</ul></li>`).join("")}</ol>
        ${p.gifts ? `<div class="pl__gift"><b>🎁 ${esc(t.gift(p.gifts))}</b><small>${esc(t.giftFine)}</small></div>` : ""}
        <p class="pl__note">${esc(t.note)}</p>
        <div class="pl__actions"><button type="button" class="btn btn--primary" data-act="send">${esc(t.send)}</button><button type="button" class="btn pl__ghost" data-act="again">${esc(t.again)}</button></div></div>`;
    } else if (st.step === 0) {
      body = `<div class="pl__grid2"><label>${esc(t.from)}<input type="date" data-f="from" value="${st.from}" min="${iso(today)}"></label><label>${esc(t.to)}<input type="date" data-f="to" value="${st.to}" min="${st.from || iso(today)}"></label></div>`;
    } else if (st.step === 1) {
      body = `<div class="pl__count"><span>${esc(t.people)}</span><div><button type="button" data-act="minus" aria-label="−">−</button><output>${st.people}</output><button type="button" data-act="plus" aria-label="+">+</button></div></div>
        <label class="pl__check"><input type="checkbox" data-f="kids" ${st.kids ? "checked" : ""}> ${esc(t.kids)}</label>`;
    } else if (st.step === 2) {
      body = `<p class="pl__q">${esc(t.styleQ)}</p><div class="pl__chips">${Object.entries(t.styles).filter(([k]) => !(st.kids && k === "party")).map(([k, v]) => chip("style", k, v, st.styles.has(k))).join("")}</div>`;
    } else {
      body = `<p class="pl__q">${esc(t.mustQ)}</p><div class="pl__chips">${Object.entries(t.musts).filter(([k]) => !(st.kids && (k === "vip" || k === "dj"))).map(([k, v]) => chip("must", k, v, st.musts.has(k))).join("")}</div>`;
    }
    const nav = st.plan ? "" : `<p class="pl__err" role="alert"></p><div class="pl__nav">${st.step ? `<button type="button" class="btn pl__ghost" data-act="back">${esc(t.back)}</button>` : "<span></span>"}<button type="button" class="btn btn--primary" data-act="${st.step < 3 ? "next" : "make"}">${esc(st.step < 3 ? t.next : t.make)}</button></div>`;
    root.querySelector(".pl__card").innerHTML = (st.plan ? "" : stepper) + `<div class="pl__body">${body}</div>` + nav;
    root.querySelector(".pl__eyebrow").textContent = t.eyebrow; root.querySelector(".pl__title").textContent = t.title; root.querySelector(".pl__lede").textContent = t.lede;
  }
  const err = msg => { const e = root.querySelector(".pl__err"); if (e) e.textContent = msg; };

  root.innerHTML = `<div class="wrap pl"><div class="sec__head"><p class="eyebrow pl__eyebrow"></p><h2 class="display pl__title"></h2><p class="lede pl__lede"></p></div><div class="pl__card"></div></div>`;
  root.addEventListener("input", e => { const f = e.target.dataset.f; if (!f) return; if (f === "kids") st.kids = e.target.checked; else { st[f] = e.target.value; if (f === "from" && st.to && st.to <= st.from) { st.to = ""; render(); } } });
  root.addEventListener("click", e => {
    const t = tx(), b = e.target.closest("button"); if (!b) return;
    if (b.dataset.style) { const k = b.dataset.style; st.styles.has(k) ? st.styles.delete(k) : st.styles.add(k); b.setAttribute("aria-pressed", st.styles.has(k)); return; }
    if (b.dataset.must) { const k = b.dataset.must; st.musts.has(k) ? st.musts.delete(k) : st.musts.add(k); b.setAttribute("aria-pressed", st.musts.has(k)); return; }
    if (b.dataset.go) { onGo?.(b.dataset.go); return; }
    const a = b.dataset.act;
    if (a === "minus" || a === "plus") { st.people = Math.min(40, Math.max(1, st.people + (a === "plus" ? 1 : -1))); root.querySelector(".pl__count output").textContent = st.people; return; }
    if (a === "next") {
      if (st.step === 0 && (!st.from || !st.to || st.to <= st.from)) return err(t.errDates);
      if (st.step === 2 && !st.styles.size) return err(t.errStyle);
      st.step++; render(); return;
    }
    if (a === "back") { st.step--; render(); return; }
    if (a === "make") { st.plan = build(); render(); root.querySelector(".pl__card").scrollIntoView({ block: "start", behavior: "instant" }); onGo?.("track:plan"); return; }
    if (a === "again") { st.plan = null; st.step = 0; render(); return; }
    if (a === "send") onSend?.({ text: text(), from: st.from, to: st.to, people: st.people, services: st.plan.svcs });
  });
  document.addEventListener("langchange", render);
  render();
  return { prefill({ from, to } = {}) { if (from) st.from = from; if (to) st.to = to; st.plan = null; st.step = from && to ? 1 : 0; render(); } };
}
