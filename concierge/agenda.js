/* Club agenda: pick your nights and your clubs, see the line-ups as they are announced, and ask for a VIP table
   or a guestlist in one tap. Only official line-ups go in EVENTS: until a club announces its night, the date shows
   "line-up por anunciar" and the visitor can leave an alert instead. Nothing here is invented. */
import { getLang } from "./i18n.js";

/* Official line-ups, added as the clubs announce them. One entry per party night:
   { date: "2027-06-14", club: "Pacha", title: "Nombre de la fiesta", artists: ["DJ 1", "DJ 2"], url: "https://… (fuente oficial)" }
   The club name must match the map (Pacha, Hï Ibiza, Ushuaïa Ibiza, DC10, Amnesia, [UNVRS], Eden, Es Paradis…). */
export const EVENTS = [];

const L = {
  es: {
    eyebrow: "Agenda de clubs 2027", title: "Las noches que quieres,", em: "antes que nadie.",
    lede: "Dinos tus fechas y tus clubs. Te avisamos en cuanto salga cada line-up y te guardamos mesa antes de que vuele.",
    status: "Temporada 2027: los clubs anuncian sus line-ups entre enero y marzo. Los publicamos aquí en cuanto son oficiales.",
    from: "Primera noche", to: "Última noche", nights: "Tus noches", clubs: "Tus clubs", pick: "Toca los clubs que te interesan",
    tba: "Line-up por anunciar", soon: "Aviso activado al elegir el club", any: "Elige tus fechas para ver tus noches",
    alert: "Activar mi alerta de line-up", table: "Pedir mesa VIP o guestlist", picked: n => n ? `${n} ${n === 1 ? "club elegido" : "clubs elegidos"}` : "Ningún club elegido",
    fine: "Guestlists de cortesía sujetas a disponibilidad del club. Mayores de 18.", source: "Fuente oficial",
    msgAlert: "Hola Mey Society, quiero alerta de line-up", msgTable: "Hola Mey Society, quiero mesa VIP o guestlist", msgDates: "Fechas", msgClubs: "Clubs", msgOpen: "abierto a propuestas",
  },
  en: {
    eyebrow: "Club agenda 2027", title: "The nights you want,", em: "before anyone else.",
    lede: "Tell us your dates and your clubs. We let you know the moment each line-up drops and hold your table before it goes.",
    status: "2027 season: clubs announce their line-ups between January and March. We publish them here as soon as they're official.",
    from: "First night", to: "Last night", nights: "Your nights", clubs: "Your clubs", pick: "Tap the clubs you like",
    tba: "Line-up to be announced", soon: "Alert on once you pick the club", any: "Choose your dates to see your nights",
    alert: "Turn on my line-up alert", table: "Ask for a VIP table or guestlist", picked: n => n ? `${n} ${n === 1 ? "club picked" : "clubs picked"}` : "No club picked",
    fine: "Complimentary guestlists subject to club availability. 18+ only.", source: "Official source",
    msgAlert: "Hi Mey Society, I'd like a line-up alert", msgTable: "Hi Mey Society, I'd like a VIP table or guestlist", msgDates: "Dates", msgClubs: "Clubs", msgOpen: "open to suggestions",
  },
  it: {
    eyebrow: "Agenda dei club 2027", title: "Le notti che vuoi,", em: "prima di tutti.",
    lede: "Dicci le tue date e i tuoi club. Ti avvisiamo appena esce ogni line-up e ti teniamo il tavolo prima che vada esaurito.",
    status: "Stagione 2027: i club annunciano i line-up tra gennaio e marzo. Li pubblichiamo qui appena sono ufficiali.",
    from: "Prima notte", to: "Ultima notte", nights: "Le tue notti", clubs: "I tuoi club", pick: "Tocca i club che ti interessano",
    tba: "Line-up da annunciare", soon: "Avviso attivo scegliendo il club", any: "Scegli le date per vedere le tue notti",
    alert: "Attiva il mio avviso line-up", table: "Chiedi tavolo VIP o guestlist", picked: n => n ? `${n} ${n === 1 ? "club scelto" : "club scelti"}` : "Nessun club scelto",
    fine: "Guestlist di cortesia soggette a disponibilità del club. Solo maggiorenni.", source: "Fonte ufficiale",
    msgAlert: "Ciao Mey Society, vorrei l'avviso line-up", msgTable: "Ciao Mey Society, vorrei un tavolo VIP o guestlist", msgDates: "Date", msgClubs: "Club", msgOpen: "aperto a proposte",
  },
  fr: {
    eyebrow: "Agenda des clubs 2027", title: "Les nuits que vous voulez,", em: "avant tout le monde.",
    lede: "Donnez-nous vos dates et vos clubs. Nous vous prévenons dès que chaque line-up sort et vous gardons une table avant qu'elle parte.",
    status: "Saison 2027 : les clubs annoncent leurs line-ups entre janvier et mars. Nous les publions ici dès qu'ils sont officiels.",
    from: "Première nuit", to: "Dernière nuit", nights: "Vos nuits", clubs: "Vos clubs", pick: "Touchez les clubs qui vous intéressent",
    tba: "Line-up à annoncer", soon: "Alerte activée en choisissant le club", any: "Choisissez vos dates pour voir vos nuits",
    alert: "Activer mon alerte line-up", table: "Demander table VIP ou guestlist", picked: n => n ? `${n} ${n === 1 ? "club choisi" : "clubs choisis"}` : "Aucun club choisi",
    fine: "Guestlists offertes selon disponibilité du club. Réservé aux plus de 18 ans.", source: "Source officielle",
    msgAlert: "Bonjour Mey Society, je veux une alerte line-up", msgTable: "Bonjour Mey Society, je veux une table VIP ou une guestlist", msgDates: "Dates", msgClubs: "Clubs", msgOpen: "ouvert aux propositions",
  },
  de: {
    eyebrow: "Club-Agenda 2027", title: "Die Nächte, die du willst,", em: "vor allen anderen.",
    lede: "Sag uns deine Daten und deine Clubs. Wir melden uns, sobald jedes Line-up erscheint, und halten deinen Tisch, bevor er weg ist.",
    status: "Saison 2027: Die Clubs geben ihre Line-ups zwischen Januar und März bekannt. Wir veröffentlichen sie hier, sobald sie offiziell sind.",
    from: "Erste Nacht", to: "Letzte Nacht", nights: "Deine Nächte", clubs: "Deine Clubs", pick: "Tippe auf die Clubs, die dich interessieren",
    tba: "Line-up folgt", soon: "Alarm aktiv, sobald du den Club wählst", any: "Wähle deine Daten, um deine Nächte zu sehen",
    alert: "Meinen Line-up-Alarm aktivieren", table: "VIP-Tisch oder Guestlist anfragen", picked: n => n ? `${n} ${n === 1 ? "Club gewählt" : "Clubs gewählt"}` : "Kein Club gewählt",
    fine: "Kostenlose Guestlists je nach Verfügbarkeit des Clubs. Ab 18.", source: "Offizielle Quelle",
    msgAlert: "Hallo Mey Society, ich möchte einen Line-up-Alarm", msgTable: "Hallo Mey Society, ich möchte einen VIP-Tisch oder eine Guestlist", msgDates: "Daten", msgClubs: "Clubs", msgOpen: "offen für Vorschläge",
  },
};
const L2 = {
  es: { go: "Ver mis noches", vip: "Mesas VIP", vipSub: "Pide la tuya en un mensaje", day: "Day clubs", daySub: "Fiestas de día y piscina", feat: "Toca para elegir" },
  en: { go: "See my nights", vip: "VIP tables", vipSub: "Ask for yours in one message", day: "Day clubs", daySub: "Daytime and pool parties", feat: "Tap to pick" },
  it: { go: "Vedi le mie notti", vip: "Tavoli VIP", vipSub: "Chiedi il tuo in un messaggio", day: "Day club", daySub: "Feste di giorno e in piscina", feat: "Tocca per scegliere" },
  fr: { go: "Voir mes nuits", vip: "Tables VIP", vipSub: "Demandez la vôtre en un message", day: "Day clubs", daySub: "Fêtes de jour et pool parties", feat: "Touchez pour choisir" },
  de: { go: "Meine Nächte ansehen", vip: "VIP-Tische", vipSub: "Frag deinen mit einer Nachricht an", day: "Day Clubs", daySub: "Tages- und Poolpartys", feat: "Zum Auswählen tippen" },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KEY = "mey-agenda";

export function initAgenda(root, { venues = [], onSend, onVenue } = {}) {
  const clubs = venues.filter(v => v.type === "club" || v.type === "dayclub");
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
  const st = { from: saved.from || "", to: saved.to || "", clubs: new Set((saved.clubs || []).filter(n => clubs.some(c => c.name === n))) };
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify({ from: st.from, to: st.to, clubs: [...st.clubs] })); } catch {} };
  const tx = () => L[getLang()] || L.es;
  const today = new Date().toISOString().slice(0, 10);
  const day = s => new Date(s + "T12:00");
  const fmt = (s, o = { weekday: "short", day: "numeric", month: "short" }) => day(s).toLocaleDateString(getLang(), o);

  // the photo cards on top: the clubs we have real photos of, then two quick ways in (VIP tables, day clubs)
  const FEAT = [
    { club: "Ushuaïa Ibiza", img: "data/reviews/ushuaia-escenario.webp" },
    { club: "[UNVRS]", img: "data/reviews/unvrs-noche.webp" },
    { act: "table", img: "data/services/clubs.webp", key: "vip" },
    { act: "day", img: "data/reviews/pool-party.webp", key: "day" },
  ];
  const PASTEL = ["#e4defe", "#d9ecfa", "#f1dcfb", "#dcdffe"];   // the logo's violet, cyan, magenta and royal blue, as pastels
  root.innerHTML = `<div class="wrap ag">
    <header class="sec__head ag__head"><p class="eyebrow ag__eyebrow"></p><h2 class="display display--md"><span class="ag__title"></span> <em class="ag__em"></em></h2><p class="lede lede--dark ag__lede"></p></header>
    <div class="ag__search" role="group">
      <label><span class="ag__l-from"></span><input type="date" data-f="from"></label>
      <label><span class="ag__l-to"></span><input type="date" data-f="to"></label>
      <button type="button" class="ag__go" data-act="go"></button>
    </div>
    <p class="ag__status"><i aria-hidden="true"></i><span></span></p>
    <ul class="ag__feat" role="list">${FEAT.map(f => `<li><button type="button" class="ag__fcard" ${f.club ? `data-club="${esc(f.club)}" aria-pressed="false"` : `data-act="${f.act}"`}>
      <img src="${f.img}" alt="" loading="lazy" decoding="async"><span class="ag__fname">${f.club ? esc(f.club) : ""}</span><span class="ag__fsub"></span><span class="ag__arrow" aria-hidden="true"></span></button></li>`).join("")}</ul>
    <div class="ag__grid">
      <div class="ag__panel ag__panel--nights">
        <h3 class="ag__h ag__h--nights"></h3>
        <ol class="ag__nights" aria-live="polite"></ol>
      </div>
      <div class="ag__panel ag__panel--clubs">
        <div class="ag__clubhead"><h3 class="ag__h ag__h--clubs"></h3><p class="ag__count"></p></div>
        <p class="ag__pick"></p>
        <ul class="ag__clubs">${clubs.map((c, i) => `<li><button type="button" class="ag__club" data-club="${esc(c.name)}" aria-pressed="false" style="--bg:${PASTEL[i % 4]}">
          <span class="ag__ctype">${c.type === "dayclub" ? "Day club" : "Club"}</span><span class="ag__cname">${esc(c.name)}</span><span class="ag__carea">${esc(c.area)}</span><span class="ag__tick" aria-hidden="true"></span></button></li>`).join("")}</ul>
      </div>
    </div>
    <div class="ag__cta"><button type="button" class="btn btn--primary btn--lg" data-act="table"></button><button type="button" class="btn ag__ghost" data-act="alert"></button></div>
    <p class="ag__fine"></p>
  </div>`;
  const $ = s => root.querySelector(s);
  const inFrom = $('[data-f="from"]'), inTo = $('[data-f="to"]');

  function nights() {
    if (!st.from) return [];
    const out = [], a = day(st.from), b = day(st.to && st.to >= st.from ? st.to : st.from);
    for (let d = new Date(a); d <= b && out.length < 21; d.setDate(d.getDate() + 1)) out.push(d.toISOString().slice(0, 10));
    return out;
  }
  function paintNights() {
    const t = tx(), ns = nights(), list = $(".ag__nights");
    if (!ns.length) { list.innerHTML = `<li class="ag__empty">${esc(t.any)}</li>`; return; }
    list.innerHTML = ns.map(d => {
      const evs = EVENTS.filter(e => e.date === d && (!st.clubs.size || st.clubs.has(e.club)));
      const body = evs.length
        ? evs.map(e => `<div class="ag__ev"><b>${esc(e.club)}</b><span>${esc(e.title)}</span>${e.artists?.length ? `<small>${esc(e.artists.join(" · "))}</small>` : ""}${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(t.source)}</a>` : ""}</div>`).join("")
        : `<div class="ag__ev ag__ev--tba"><span>${esc(t.tba)}</span>${st.clubs.size ? `<small>${esc([...st.clubs].join(" · "))}</small>` : ""}</div>`;
      return `<li class="ag__night"><time datetime="${d}"><b>${esc(fmt(d, { day: "numeric" }))}</b><span>${esc(fmt(d, { weekday: "short", month: "short" }))}</span></time>${body}</li>`;
    }).join("");
  }
  function paint() {
    const t = tx();
    $(".ag__eyebrow").textContent = t.eyebrow; $(".ag__title").textContent = t.title; $(".ag__em").textContent = t.em; $(".ag__lede").textContent = t.lede;
    $(".ag__status span").textContent = t.status; $(".ag__h--nights").textContent = t.nights; $(".ag__h--clubs").textContent = t.clubs;
    $(".ag__l-from").textContent = t.from; $(".ag__l-to").textContent = t.to; $(".ag__pick").textContent = t.pick;
    $('.ag__cta [data-act="alert"]').textContent = t.alert; $('.ag__cta [data-act="table"]').textContent = t.table; $(".ag__fine").textContent = t.fine;
    $(".ag__count").textContent = t.picked(st.clubs.size);
    const X = L2[getLang()] || L2.es; $(".ag__go").textContent = X.go;
    root.querySelectorAll(".ag__fcard").forEach(c => {
      const a = c.dataset.act; if (a) { c.querySelector(".ag__fname").textContent = a === "table" ? X.vip : X.day; c.querySelector(".ag__fsub").textContent = a === "table" ? X.vipSub : X.daySub; }
      else c.querySelector(".ag__fsub").textContent = X.feat;
    });
    root.querySelectorAll("[data-club]").forEach(b => b.setAttribute("aria-pressed", st.clubs.has(b.dataset.club)));
    inFrom.value = st.from; inTo.value = st.to; inFrom.min = today; inTo.min = st.from || today;
    paintNights();
  }
  const message = kind => {
    const t = tx(), dates = st.from ? `${fmt(st.from)}${st.to && st.to !== st.from ? " → " + fmt(st.to) : ""}` : "";
    return [kind === "alert" ? t.msgAlert : t.msgTable, dates && `${t.msgDates}: ${dates}`, `${t.msgClubs}: ${st.clubs.size ? [...st.clubs].join(", ") : t.msgOpen}`].filter(Boolean).join("\n");
  };
  root.addEventListener("input", e => {
    const f = e.target.dataset.f; if (!f) return;
    st[f] = e.target.value; if (f === "from" && (!st.to || st.to < st.from)) st.to = st.from;
    keep(); paint();
  });
  root.addEventListener("click", e => {
    const c = e.target.closest("[data-club]");
    if (c) { const n = c.dataset.club; st.clubs.has(n) ? st.clubs.delete(n) : st.clubs.add(n); keep(); paint(); navigator.vibrate?.(4); return; }
    const a = e.target.closest("[data-act]")?.dataset.act;
    if (a === "go") { $(".ag__panel--nights").scrollIntoView({ behavior: "smooth", block: "start" }); if (!st.from) inFrom.showPicker?.(); return; }
    if (a === "day") { clubs.filter(v => v.type === "dayclub").forEach(v => st.clubs.add(v.name)); keep(); paint(); $(".ag__panel--clubs").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (a) onSend?.({ kind: a, text: message(a), from: st.from, to: st.to || st.from, clubs: [...st.clubs] });
  });
  root.addEventListener("dblclick", e => { const c = e.target.closest(".ag__club"); if (c) onVenue?.(clubs.find(v => v.name === c.dataset.club)); });
  document.addEventListener("langchange", paint);
  paint();

  // search engines read every announced night as an Event (only real, announced line-ups ever reach this)
  if (EVENTS.length) {
    const s = document.createElement("script"); s.type = "application/ld+json";
    s.textContent = JSON.stringify(EVENTS.map(e => {
      const v = venues.find(x => x.name === e.club);
      return { "@context": "https://schema.org", "@type": "MusicEvent", name: `${e.title} · ${e.club}`, startDate: e.date, eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", performer: (e.artists || []).map(n => ({ "@type": "MusicGroup", name: n })),
        location: { "@type": "Place", name: e.club, address: { "@type": "PostalAddress", addressLocality: v?.area || "Ibiza", addressRegion: "Illes Balears", addressCountry: "ES" } },
        ...(e.url ? { url: e.url } : {}) };
    }));
    document.head.appendChild(s);
  }
  return { get state() { return { ...st, clubs: [...st.clubs] }; } };
}
