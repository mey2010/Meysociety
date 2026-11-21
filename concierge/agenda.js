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
    eyebrow: "Agenda de clubs 2027", title: "Las fiestas que quieres,", em: "antes que nadie.",
    lede: "Dinos tus fechas y tus clubs. Te avisamos en cuanto salga cada line-up y te guardamos mesa antes de que vuele.",
    status: "Temporada 2027: los clubs anuncian sus line-ups entre enero y marzo. Los publicamos aquí en cuanto son oficiales.",
    from: "Primera noche", to: "Última noche", nights: "Tus noches", clubs: "Tus clubs", pick: "Toca los clubs que te interesan",
    tba: "Line-up por anunciar", soon: "Aviso activado al elegir el club", any: "Elige tus fechas para ver tus noches",
    alert: "Activar mi alerta de line-up", table: "Pedir mesa VIP o guestlist", picked: n => n ? `${n} ${n === 1 ? "club elegido" : "clubs elegidos"}` : "Ningún club elegido",
    fine: "Guestlists de cortesía sujetas a disponibilidad del club. Mayores de 18.", source: "Fuente oficial",
    msgAlert: "Hola Mey Society, quiero alerta de line-up", msgTable: "Hola Mey Society, quiero mesa VIP o guestlist", msgDates: "Fechas", msgClubs: "Clubs", msgOpen: "abierto a propuestas",
  },
  en: {
    eyebrow: "Club agenda 2027", title: "The parties you want,", em: "before anyone else.",
    lede: "Tell us your dates and your clubs. We let you know the moment each line-up drops and hold your table before it goes.",
    status: "2027 season: clubs announce their line-ups between January and March. We publish them here as soon as they're official.",
    from: "First night", to: "Last night", nights: "Your nights", clubs: "Your clubs", pick: "Tap the clubs you like",
    tba: "Line-up to be announced", soon: "Alert on once you pick the club", any: "Choose your dates to see your nights",
    alert: "Turn on my line-up alert", table: "Ask for a VIP table or guestlist", picked: n => n ? `${n} ${n === 1 ? "club picked" : "clubs picked"}` : "No club picked",
    fine: "Complimentary guestlists subject to club availability. 18+ only.", source: "Official source",
    msgAlert: "Hi Mey Society, I'd like a line-up alert", msgTable: "Hi Mey Society, I'd like a VIP table or guestlist", msgDates: "Dates", msgClubs: "Clubs", msgOpen: "open to suggestions",
  },
  it: {
    eyebrow: "Agenda dei club 2027", title: "Le feste che vuoi,", em: "prima di tutti.",
    lede: "Dicci le tue date e i tuoi club. Ti avvisiamo appena esce ogni line-up e ti teniamo il tavolo prima che vada esaurito.",
    status: "Stagione 2027: i club annunciano i line-up tra gennaio e marzo. Li pubblichiamo qui appena sono ufficiali.",
    from: "Prima notte", to: "Ultima notte", nights: "Le tue notti", clubs: "I tuoi club", pick: "Tocca i club che ti interessano",
    tba: "Line-up da annunciare", soon: "Avviso attivo scegliendo il club", any: "Scegli le date per vedere le tue notti",
    alert: "Attiva il mio avviso line-up", table: "Chiedi tavolo VIP o guestlist", picked: n => n ? `${n} ${n === 1 ? "club scelto" : "club scelti"}` : "Nessun club scelto",
    fine: "Guestlist di cortesia soggette a disponibilità del club. Solo maggiorenni.", source: "Fonte ufficiale",
    msgAlert: "Ciao Mey Society, vorrei l'avviso line-up", msgTable: "Ciao Mey Society, vorrei un tavolo VIP o guestlist", msgDates: "Date", msgClubs: "Club", msgOpen: "aperto a proposte",
  },
  fr: {
    eyebrow: "Agenda des clubs 2027", title: "Les fêtes que vous voulez,", em: "avant tout le monde.",
    lede: "Donnez-nous vos dates et vos clubs. Nous vous prévenons dès que chaque line-up sort et vous gardons une table avant qu'elle parte.",
    status: "Saison 2027 : les clubs annoncent leurs line-ups entre janvier et mars. Nous les publions ici dès qu'ils sont officiels.",
    from: "Première nuit", to: "Dernière nuit", nights: "Vos nuits", clubs: "Vos clubs", pick: "Touchez les clubs qui vous intéressent",
    tba: "Line-up à annoncer", soon: "Alerte activée en choisissant le club", any: "Choisissez vos dates pour voir vos nuits",
    alert: "Activer mon alerte line-up", table: "Demander table VIP ou guestlist", picked: n => n ? `${n} ${n === 1 ? "club choisi" : "clubs choisis"}` : "Aucun club choisi",
    fine: "Guestlists offertes selon disponibilité du club. Réservé aux plus de 18 ans.", source: "Source officielle",
    msgAlert: "Bonjour Mey Society, je veux une alerte line-up", msgTable: "Bonjour Mey Society, je veux une table VIP ou une guestlist", msgDates: "Dates", msgClubs: "Clubs", msgOpen: "ouvert aux propositions",
  },
  de: {
    eyebrow: "Club-Agenda 2027", title: "Die Partys, die du willst,", em: "vor allen anderen.",
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
  es: { clear: "Quitar todos", done: "Listo", go: "Ver mis noches", vip: "Mesas VIP", vipSub: "Pide la tuya en un mensaje", day: "Day clubs", daySub: "Fiestas de día y piscina", feat: "Toca para elegir" },
  en: { clear: "Clear all", done: "Done", go: "See my nights", vip: "VIP tables", vipSub: "Ask for yours in one message", day: "Day clubs", daySub: "Daytime and pool parties", feat: "Tap to pick" },
  it: { clear: "Togli tutti", done: "Fatto", go: "Vedi le mie notti", vip: "Tavoli VIP", vipSub: "Chiedi il tuo in un messaggio", day: "Day club", daySub: "Feste di giorno e in piscina", feat: "Tocca per scegliere" },
  fr: { clear: "Tout retirer", done: "Terminé", go: "Voir mes nuits", vip: "Tables VIP", vipSub: "Demandez la vôtre en un message", day: "Day clubs", daySub: "Fêtes de jour et pool parties", feat: "Touchez pour choisir" },
  de: { clear: "Alle entfernen", done: "Fertig", go: "Meine Nächte ansehen", vip: "VIP-Tische", vipSub: "Frag deinen mit einer Nachricht an", day: "Day Clubs", daySub: "Tages- und Poolpartys", feat: "Zum Auswählen tippen" },
};
const L3 = {
  es: { cal: "Calendario de fiestas 2027", calSub: "Toca tu primera noche y después la última. Los días con punto ya tienen line-up oficial.", prev: "Mes anterior", next: "Mes siguiente",
        legEv: "Line-up anunciado", legSel: "Tus noches", notify: "Avísame cuando salga el line-up", notifyOn: "Aviso activado: te lo enseñamos aquí en cuanto se anuncie", notifyOff: "Quitar aviso",
        ics: "Añadir a mi calendario", fresh: n => `${n} ${n === 1 ? "line-up nuevo" : "line-ups nuevos"} en tus noches`, see: "Ver", icsTitle: "Noche en Ibiza", icsNote: "Line-up y mesas: Mey Society" },
  en: { cal: "2027 party calendar", calSub: "Tap your first night, then your last. Days with a dot already have an official line-up.", prev: "Previous month", next: "Next month",
        legEv: "Line-up announced", legSel: "Your nights", notify: "Tell me when the line-up drops", notifyOn: "Alert on: we'll show it here the moment it's announced", notifyOff: "Turn alert off",
        ics: "Add to my calendar", fresh: n => `${n} new ${n === 1 ? "line-up" : "line-ups"} on your nights`, see: "See", icsTitle: "Night in Ibiza", icsNote: "Line-up and tables: Mey Society" },
  it: { cal: "Calendario feste 2027", calSub: "Tocca la prima notte e poi l'ultima. I giorni con il punto hanno già il line-up ufficiale.", prev: "Mese precedente", next: "Mese successivo",
        legEv: "Line-up annunciato", legSel: "Le tue notti", notify: "Avvisami quando esce il line-up", notifyOn: "Avviso attivo: te lo mostriamo qui appena viene annunciato", notifyOff: "Togli avviso",
        ics: "Aggiungi al mio calendario", fresh: n => `${n} ${n === 1 ? "nuovo line-up" : "nuovi line-up"} nelle tue notti`, see: "Vedi", icsTitle: "Notte a Ibiza", icsNote: "Line-up e tavoli: Mey Society" },
  fr: { cal: "Calendrier des fêtes 2027", calSub: "Touchez votre première nuit, puis la dernière. Les jours avec un point ont déjà leur line-up officiel.", prev: "Mois précédent", next: "Mois suivant",
        legEv: "Line-up annoncé", legSel: "Vos nuits", notify: "Prévenez-moi à la sortie du line-up", notifyOn: "Alerte activée : nous l'affichons ici dès son annonce", notifyOff: "Retirer l'alerte",
        ics: "Ajouter à mon calendrier", fresh: n => `${n} ${n === 1 ? "nouveau line-up" : "nouveaux line-ups"} sur vos nuits`, see: "Voir", icsTitle: "Nuit à Ibiza", icsNote: "Line-up et tables : Mey Society" },
  de: { cal: "Partykalender 2027", calSub: "Tippe auf deine erste Nacht, dann auf die letzte. Tage mit Punkt haben schon ein offizielles Line-up.", prev: "Vorheriger Monat", next: "Nächster Monat",
        legEv: "Line-up bekannt", legSel: "Deine Nächte", notify: "Sag mir, wenn das Line-up erscheint", notifyOn: "Alarm aktiv: Wir zeigen es dir hier, sobald es bekannt ist", notifyOff: "Alarm entfernen",
        ics: "Zu meinem Kalender", fresh: n => `${n} ${n === 1 ? "neues Line-up" : "neue Line-ups"} in deinen Nächten`, see: "Ansehen", icsTitle: "Nacht auf Ibiza", icsNote: "Line-up und Tische: Mey Society" },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KEY = "mey-agenda";
/* one card per club: the user's own photos where there are, otherwise freely licensed photos (credited on the card) */
const CLUB_CARDS = [
  { club: "Ushuaïa Ibiza", img: "data/clubs/ushuaia.webp" },
  { club: "Hï Ibiza", img: "data/clubs/hi-ibiza.webp" },
  { club: "Pacha", img: "data/clubs/pacha.webp" },
  { club: "[UNVRS]", img: "data/reviews/unvrs-noche.webp" },
  { club: "Amnesia", img: "data/clubs/amnesia.webp" },
  { club: "DC10", img: "data/clubs/dc10.webp" },
  { club: "O Beach", img: "data/clubs/o-beach.webp" },
  { club: "Ibiza Rocks", img: "data/clubs/ibiza-rocks.webp" },
  { club: "Lío Ibiza", img: "data/clubs/lio.webp" },
  { club: "Chinois Ibiza", img: "data/clubs/chinois.webp" },
  { club: "Tantra Ibiza", img: "data/clubs/tantra.webp" },
  { club: "Swag Ibiza", img: "data/clubs/swag.webp" },
  { club: "Destino Five Ibiza", img: "data/clubs/destino.webp" },
  { club: "Bora Bora Ibiza", img: "data/clubs/bora-bora.webp" },
  { club: "Eden", img: "data/clubs/eden.webp" },
  { club: "Es Paradis", img: "data/clubs/es-paradis.webp" },
];

export function initAgenda(root, { venues = [], onSend, onVenue } = {}) {
  const clubs = venues.filter(v => v.type === "club" || v.type === "dayclub");
  let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
  const st = { from: saved.from || "", to: saved.to || "", clubs: new Set((saved.clubs || []).filter(n => clubs.some(c => c.name === n))), alert: !!saved.alert, seen: new Set(saved.seen || []) };
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify({ from: st.from, to: st.to, clubs: [...st.clubs], alert: st.alert, seen: [...st.seen] })); } catch {} };
  const tx = () => L[getLang()] || L.es;
  const today = new Date().toISOString().slice(0, 10);
  const day = s => new Date(s + "T12:00");
  const fmt = (s, o = { weekday: "short", day: "numeric", month: "short" }) => day(s).toLocaleDateString(getLang(), o);

  // the photo cards on top: the clubs we have real photos of, then two quick ways in (VIP tables, day clubs)
  const FEAT = [
    ...CLUB_CARDS.filter(c => clubs.some(v => v.name === c.club)),
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
    <div class="ag__featwrap"><button type="button" class="ag__fnav" data-dir="-1" aria-label="‹" disabled>‹</button>
    <ul class="ag__feat" role="list">${FEAT.map(f => `<li><button type="button" class="ag__fcard" ${f.club ? `data-club="${esc(f.club)}" aria-pressed="false"` : `data-act="${f.act}"`}>
      <img src="${f.img}" alt="${f.club ? esc(f.club) + " Ibiza" : ""}" loading="lazy" decoding="async"><span class="ag__fname">${f.club ? esc(f.club) : ""}</span><span class="ag__fsub"></span><span class="ag__arrow" aria-hidden="true"></span></button></li>`).join("")}</ul>
    <button type="button" class="ag__fnav" data-dir="1" aria-label="›">›</button></div>
    <div class="ag__panel ag__cal">
      <p class="ag__fresh" hidden><span></span><button type="button" data-act="fresh"></button></p>
      <div class="ag__calhead"><button type="button" class="ag__nav" data-nav="-1"><i aria-hidden="true">‹</i></button><div><h3 class="ag__h ag__calt"></h3><p class="ag__calsub"></p></div><button type="button" class="ag__nav" data-nav="1"><i aria-hidden="true">›</i></button></div>
      <p class="ag__month" aria-live="polite"></p>
      <div class="ag__grid" role="grid"></div>
      <div class="ag__calfoot"><span class="ag__leg"><i class="is-ev"></i><span class="ag__legev"></span></span><span class="ag__leg"><i class="is-sel"></i><span class="ag__legsel"></span></span></div>
      <div class="ag__calcta"><button type="button" class="ag__notify" data-act="notify" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 3.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></button><button type="button" class="ag__ics" data-act="ics"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3.5v4M16 3.5v4M4 10h16M12 13v4M10 15h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span></span></button></div>
    </div>
    <div class="ag__panel ag__panel--nights">
      <h3 class="ag__h ag__h--nights"></h3>
      <div class="ag__drop">
        <button type="button" class="ag__dropbtn" aria-expanded="false" aria-controls="agDrop"><span class="ag__dropl"><b class="ag__h--clubs"></b><small class="ag__count"></small></span><span class="ag__chips"></span><i class="ag__chev" aria-hidden="true"></i></button>
        <div class="ag__dropbody" id="agDrop" hidden>
          <p class="ag__pick"></p>
          <ul class="ag__clubs">${clubs.map((c, i) => `<li><button type="button" class="ag__club" data-club="${esc(c.name)}" aria-pressed="false" style="--bg:${PASTEL[i % 4]}">
            <span class="ag__ctype">${c.type === "dayclub" ? "Day club" : "Club"}</span><span class="ag__cname">${esc(c.name)}</span><span class="ag__carea">${esc(c.area)}</span><span class="ag__tick" aria-hidden="true"></span></button></li>`).join("")}</ul>
          <div class="ag__dropfoot"><button type="button" class="ag__clear" data-act="clear"></button><button type="button" class="ag__done" data-act="done"></button></div>
        </div>
      </div>
      <ol class="ag__nights" aria-live="polite"></ol>
    </div>
    <div class="ag__cta"><button type="button" class="btn btn--primary btn--lg" data-act="table"></button><button type="button" class="btn ag__ghost" data-act="alert"></button></div>
    <p class="ag__fine"></p>
  </div>`;
  const $ = s => root.querySelector(s);
  { const row = root.querySelector(".ag__feat"), navs = root.querySelectorAll(".ag__fnav");
    const sync = () => { navs[0].disabled = row.scrollLeft < 8; navs[1].disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 8; };
    navs.forEach(b => b.addEventListener("click", () => row.scrollBy({ left: +b.dataset.dir * row.clientWidth * .8, behavior: "smooth" })));
    row.addEventListener("scroll", sync, { passive: true }); requestAnimationFrame(sync); }
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
  // ---- the season calendar: a month at a time, tap first and last night ----
  const tx3 = () => L3[getLang()] || L3.es;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const SEASON0 = "2027-05", SEASON1 = "2027-10", nowM = today.slice(0, 7);
  const firstM = nowM > SEASON0 ? nowM : SEASON0;
  let month = (st.from && st.from.slice(0, 7) >= nowM ? st.from.slice(0, 7) : firstM);
  const shiftM = (m, k) => { const d = new Date(m + "-15T12:00"); d.setMonth(d.getMonth() + k); return iso(d).slice(0, 7); };
  const lastM = SEASON1 > nowM ? SEASON1 : shiftM(nowM, 6);
  const matching = () => EVENTS.filter(e => (!st.clubs.size || st.clubs.has(e.club)) && (!st.from || (e.date >= st.from && e.date <= (st.to || st.from))));
  const evKey = e => e.date + "|" + e.club;
  function paintCal() {
    const t = tx3(), first = new Date(month + "-01T12:00"), lead = (first.getDay() + 6) % 7, n = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    $(".ag__calt").textContent = t.cal; $(".ag__calsub").textContent = t.calSub; $(".ag__legev").textContent = t.legEv; $(".ag__legsel").textContent = t.legSel;
    $(".ag__month").textContent = first.toLocaleDateString(getLang(), { month: "long", year: "numeric" });
    const [pv, nx] = root.querySelectorAll(".ag__nav"); pv.setAttribute("aria-label", t.prev); nx.setAttribute("aria-label", t.next);
    pv.disabled = month <= nowM; nx.disabled = month >= lastM;
    const wk = Array.from({ length: 7 }, (_, i) => new Date(2027, 1, 1 + i, 12).toLocaleDateString(getLang(), { weekday: "narrow" }));
    const to = st.to || st.from;
    let h = wk.map(w => `<span class="ag__wd" aria-hidden="true">${esc(w)}</span>`).join("") + "<span></span>".repeat(lead);
    for (let i = 1; i <= n; i++) {
      const d = month + "-" + String(i).padStart(2, "0"), evs = EVENTS.filter(e => e.date === d && (!st.clubs.size || st.clubs.has(e.club)));
      const sel = st.from && d >= st.from && d <= to, edge = d === st.from || d === to;
      h += `<button type="button" class="ag__d${sel ? " is-sel" : ""}${edge ? " is-edge" : ""}${evs.length ? " is-ev" : ""}${d === today ? " is-today" : ""}" data-d="${d}" ${d < today ? "disabled" : ""} aria-pressed="${!!sel}" aria-label="${esc(fmt(d, { weekday: "long", day: "numeric", month: "long" }))}${evs.length ? " · " + esc(evs.map(e => e.club).join(", ")) : ""}"><b>${i}</b>${evs.length ? `<i aria-hidden="true">${evs.length > 1 ? evs.length : ""}</i>` : ""}</button>`;
    }
    $(".ag__grid").innerHTML = h;
    const nb = $(".ag__notify"); nb.setAttribute("aria-pressed", st.alert); nb.querySelector("span").textContent = st.alert ? t.notifyOn : t.notify; nb.title = st.alert ? t.notifyOff : "";
    $(".ag__ics span").textContent = t.ics; $(".ag__ics").disabled = !st.from;
    const fresh = st.alert ? matching().filter(e => !st.seen.has(evKey(e))) : [], fb = $(".ag__fresh");
    fb.hidden = !fresh.length; if (fresh.length) { fb.querySelector("span").textContent = t.fresh(fresh.length); fb.querySelector("button").textContent = t.see; }
  }
  function ics() {
    const t = tx3(), from = st.from, to = st.to || st.from; if (!from) return;
    const d = s => s.replace(/-/g, ""), next = s => { const x = day(s); x.setDate(x.getDate() + 1); return iso(x); };
    const evs = EVENTS.filter(e => e.date >= from && e.date <= to && (!st.clubs.size || st.clubs.has(e.club)));
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mey Society//Agenda//ES", "CALSCALE:GREGORIAN"];
    const add = (uid, s, sum, desc) => lines.push("BEGIN:VEVENT", `UID:${uid}@meysociety`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTSTART;VALUE=DATE:${d(s)}`, `DTEND;VALUE=DATE:${d(next(s))}`, `SUMMARY:${sum.replace(/[,;]/g, " ")}`, `DESCRIPTION:${desc.replace(/[,;]/g, " ")}`, "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", `DESCRIPTION:${sum.replace(/[,;]/g, " ")}`, "END:VALARM", "END:VEVENT");
    for (let x = from; x <= to; x = next(x)) {
      const es = evs.filter(e => e.date === x);
      if (es.length) es.forEach(e => add(x + "-" + e.club.replace(/\W/g, ""), x, `${e.club} · ${e.title}`, `${(e.artists || []).join(" · ")} — ${t.icsNote}`));
      else add(x + "-night", x, `${t.icsTitle}${st.clubs.size ? " · " + [...st.clubs].join(" / ") : ""}`, `${tx().tba} — ${t.icsNote}`);
    }
    lines.push("END:VCALENDAR");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" })); a.download = "mey-society-ibiza-2027.ics";
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  root.addEventListener("click", e => {
    const nv = e.target.closest("[data-nav]"); if (nv) { month = shiftM(month, +nv.dataset.nav); paintCal(); return; }
    const c = e.target.closest(".ag__d"); if (!c || c.disabled) return;
    const d = c.dataset.d;
    if (!st.from || (st.to && st.to !== st.from) || d < st.from) { st.from = d; st.to = d; } else st.to = d;
    keep(); paint(); navigator.vibrate?.(4);
  });
  function paint() {
    const t = tx();
    $(".ag__eyebrow").textContent = t.eyebrow; $(".ag__title").textContent = t.title; $(".ag__em").textContent = t.em; $(".ag__lede").textContent = t.lede;
    $(".ag__status span").textContent = t.status; $(".ag__h--nights").textContent = t.nights; $(".ag__h--clubs").textContent = t.clubs;
    $(".ag__l-from").textContent = t.from; $(".ag__l-to").textContent = t.to; $(".ag__pick").textContent = t.pick;
    $('.ag__cta [data-act="alert"]').textContent = t.alert; $('.ag__cta [data-act="table"]').textContent = t.table; $(".ag__fine").textContent = t.fine;
    $(".ag__count").textContent = t.picked(st.clubs.size);
    $(".ag__chips").innerHTML = [...st.clubs].slice(0, 3).map(n => `<span>${esc(n)}</span>`).join("") + (st.clubs.size > 3 ? `<span>+${st.clubs.size - 3}</span>` : "");
    $(".ag__clear").textContent = (L2[getLang()] || L2.es).clear; $(".ag__done").textContent = (L2[getLang()] || L2.es).done;
    const X = L2[getLang()] || L2.es; $(".ag__go").textContent = X.go;
    root.querySelectorAll(".ag__fcard").forEach(c => {
      const a = c.dataset.act; if (a) { c.querySelector(".ag__fname").textContent = a === "table" ? X.vip : X.day; c.querySelector(".ag__fsub").textContent = a === "table" ? X.vipSub : X.daySub; }
      else c.querySelector(".ag__fsub").textContent = X.feat;
    });
    root.querySelectorAll("[data-club]").forEach(b => b.setAttribute("aria-pressed", st.clubs.has(b.dataset.club)));
    inFrom.value = st.from; inTo.value = st.to; inFrom.min = today; inTo.min = st.from || today;
    paintNights(); paintCal();
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
  const drop = open => { const b = $(".ag__dropbtn"), body = $(".ag__dropbody"); open = open ?? body.hidden; body.hidden = !open; b.setAttribute("aria-expanded", open); };
  root.addEventListener("click", e => { if (e.target.closest(".ag__dropbtn")) drop(); });
  root.addEventListener("click", e => {
    const c = e.target.closest("[data-club]");
    if (c) { const n = c.dataset.club; st.clubs.has(n) ? st.clubs.delete(n) : st.clubs.add(n); keep(); paint(); navigator.vibrate?.(4); return; }
    const a = e.target.closest("[data-act]")?.dataset.act;
    if (a === "go") { $(".ag__panel--nights").scrollIntoView({ behavior: "smooth", block: "start" }); if (!st.from) inFrom.showPicker?.(); return; }
    if (a === "day") { clubs.filter(v => v.type === "dayclub").forEach(v => st.clubs.add(v.name)); keep(); paint(); drop(true); $(".ag__panel--nights").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (a === "clear") { st.clubs.clear(); keep(); paint(); return; }
    if (a === "done") { drop(false); return; }
    if (a === "notify") { st.alert = !st.alert; if (st.alert) matching().forEach(x => st.seen.add(evKey(x))); keep(); paint(); navigator.vibrate?.(8); return; }
    if (a === "ics") { ics(); return; }
    if (a === "fresh") { matching().forEach(x => st.seen.add(evKey(x))); keep(); paint(); $(".ag__panel--nights").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
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
