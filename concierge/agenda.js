/* Club agenda: pick your nights and your clubs, see the line-ups as they are announced, and ask for a VIP table
   or a guestlist in one tap. Only official line-ups go in EVENTS: until a club announces its night, the date shows
   "line-up por anunciar" and the visitor can leave an alert instead. Nothing here is invented. */
import { getLang } from "./i18n.js";

/* Club cards as "Parallax Ticket" (DesignBookmark Motion Studies): each card tilts toward the pointer with depth
   (the photo and the title move by their own amount), a glare follows the pointer, it floats gently when nobody
   touches it, and when the club is picked it flips on a spring to its back: the ticket stub with a code.
   The row of cards arrives like "Fan Cards": stacked under the first one, then fanned out into place.
   One small spring engine, running only while something moves. */
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const S = (x, k, c) => ({ x, v: 0, t: x, k, c: REDUCED ? 2 * Math.sqrt(k) : c });
const step = (s, dt) => { const a = -s.k * (s.x - s.t) - s.c * s.v; s.v += a * dt; s.x += s.v * dt; };
const still = s => Math.abs(s.x - s.t) < .01 && Math.abs(s.v) < .01;
const TILT = 14, DEPTH = 12;

// a code-looking pattern for the stub: three finder squares and a stable pseudo-random field (seeded per club)
function qr(seed) {
  const N = 25; let s = seed, cells = "";
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#0b0930"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#0b0930"/>`;
  const inF = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inF(x, y) && rnd() > .52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" aria-hidden="true"><g fill="#0b0930">${cells}</g>${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</svg>`;
}
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 233280, 7);

function ticketCards(row, labels, info) {
  const cards = [...row.querySelectorAll(".ag__fcard")].map((el, i) => {
    // front: photo layer, shade, text layer, glare; back: the stub (only for a club, which can be picked)
    const img = el.querySelector("img"); if (img && i < 2) img.fetchPriority = "low";
    const name = el.querySelector(".ag__fname"), sub = el.querySelector(".ag__fsub"), arrow = el.querySelector(".ag__arrow, .ag__pick");
    const front = document.createElement("span"); front.className = "tk__side tk__front";
    const bg = document.createElement("span"); bg.className = "tk__layer tk__bg"; if (img) bg.append(img);
    const txt = document.createElement("span"); txt.className = "tk__layer tk__txt";
    const meta = document.createElement("span"); meta.className = "tk__meta";
    // where the club is, and below it its hours (instead of a ticket number)
    const no = document.createElement("span"); no.className = "tk__where"; no.innerHTML = '<b class="tk__area"></b><small class="tk__hours"></small>';
    // a club card: the "tap ✓ to pick" hint sits top right, the name at the bottom with its number
    if (el.dataset.club) { sub.classList.add("tk__hint-top"); meta.append(no); } else meta.append(sub, no);
    txt.append(name, meta);
    const glare = document.createElement("span"); glare.className = "tk__glare";
    front.append(bg, Object.assign(document.createElement("span"), { className: "tk__shade" }), txt, glare); if (arrow) front.append(arrow);
    if (el.dataset.club) front.append(sub);
    el.prepend(front); el.classList.add("tk");
    let back = null;
    if (el.dataset.club) { const sel = document.createElement("span"); sel.className = "tk__sel"; front.append(sel); }
    if (false) {
      back = document.createElement("span"); back.className = "tk__side tk__back"; back.setAttribute("aria-hidden", "true");
      back.innerHTML = `<span class="tk__qr">${qr(hash(el.dataset.club))}</span><span class="tk__club"></span><span class="tk__seat"><span><i></i><b>2027</b></span><span><i></i><b>VIP</b></span><span><i></i><b>18+</b></span></span><span class="tk__hint"></span>`;
      el.append(back);
    }
    return { el, bg, txt, glare, back, rx: S(0, 220, 18), ry: S(0, 220, 18), f: S(0, 170, 15), g: S(0, 300, 26), lift: S(1, 300, 18), hover: false, nx: 0, ny: 0, vis: false, ph: Math.random() * 6 };
  });

  const paintLabels = () => cards.forEach(c => { const L = labels(), sel = c.el.querySelector(".tk__sel");
    const club = c.el.dataset.club, w = c.el.querySelector(".tk__where");
    if (w) { if (!club) w.hidden = true; else { const h = CLUB_HOURS[club];
      w.querySelector(".tk__area").textContent = (info?.(club)?.area) || "Ibiza";
      const hs = w.querySelector(".tk__hours"); hs.textContent = h ? `${h[2] ? L[h[2]] + " · " : ""}${h[1] ? h[0] + " – " + h[1] : L.from + " " + h[0]}` : L.byEvent; } } if (sel) sel.textContent = String(L.hint).split("·")[0].trim(); if (!c.back) return;
    c.back.querySelector(".tk__club").textContent = c.el.dataset.club;
    const seat = c.back.querySelectorAll(".tk__seat i"); seat[0].textContent = L.season; seat[1].textContent = L.access; seat[2].textContent = L.age;
    c.back.querySelector(".tk__hint").textContent = L.hint; });
  paintLabels();

  // one loop, alive only while a card moves (pointer, flip, float of the cards on screen)
  let raf = 0, last = 0, clock = 0;
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  function loop(now) {
    raf = 0; const dt = Math.min(.033, (now - last) / 1000); last = now; clock += dt; let busy = false;
    for (const c of cards) {
      c.f.t = 0;   // no turning over: a picked club keeps its face, with a ring and a badge
      if (c.hover) { c.rx.t = -c.ny * TILT; c.ry.t = c.nx * TILT; c.g.t = 1; }
      else if (c.vis && !REDUCED) { c.rx.t = Math.sin(clock * .9 + c.ph) * 3; c.ry.t = Math.cos(clock * .7 + c.ph) * 5; c.g.t = .22; busy = true; }
      else { c.rx.t = c.ry.t = 0; c.g.t = 0; }
      for (let k = 0; k < 4; k++) [c.rx, c.ry, c.f, c.g, c.lift].forEach(s => step(s, dt / 4));
      if (!(still(c.rx) && still(c.ry) && still(c.f) && still(c.g) && still(c.lift))) busy = true;
      c.el.style.transform = `rotateX(${c.rx.x.toFixed(2)}deg) rotateY(${(c.ry.x + c.f.x).toFixed(2)}deg) scale(${c.lift.x.toFixed(4)})`;
      const ox = c.ry.x / TILT, oy = -c.rx.x / TILT;
      c.bg.style.transform = `translate3d(${(ox * DEPTH * .25).toFixed(2)}px, ${(oy * DEPTH * .25).toFixed(2)}px, 0) scale(1.08)`;
      c.txt.style.transform = `translate3d(${(ox * DEPTH * .9).toFixed(2)}px, ${(oy * DEPTH * .9).toFixed(2)}px, 0)`;
      c.glare.style.opacity = Math.max(0, Math.min(1, c.g.x)).toFixed(3);
      if (!c.hover) { c.glare.style.setProperty("--gx", (50 + ox * 30).toFixed(1) + "%"); c.glare.style.setProperty("--gy", (30 + oy * 30).toFixed(1) + "%"); }
    }
    if (busy) raf = requestAnimationFrame(loop);
  }

  cards.forEach(c => {
    const at = e => { const r = c.el.getBoundingClientRect(); c.nx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1)); c.ny = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      c.glare.style.setProperty("--gx", ((c.nx + 1) * 50).toFixed(1) + "%"); c.glare.style.setProperty("--gy", ((c.ny + 1) * 50).toFixed(1) + "%"); };
    if (FINE) {
      c.el.addEventListener("pointermove", e => { if (e.target.closest(".ag__pick")) return; at(e); c.hover = true; kick(); });
      c.el.addEventListener("pointerleave", () => { c.hover = false; kick(); });
    }
    c.el.addEventListener("pointerdown", e => { if (e.target.closest(".ag__pick")) { c.el.dataset.pickDown = String(performance.now()); return; } delete c.el.dataset.pickDown; c.lift.t = .97; if (!FINE) { at(e); c.hover = true; } kick(); });
    const up = () => { c.lift.t = 1; if (!FINE) c.hover = false; kick(); };
    c.el.addEventListener("pointerup", up); c.el.addEventListener("pointercancel", up);
    // picked or unpicked (by a tap here, or from anywhere else): flip with a little bounce
    new MutationObserver(() => { c.lift.v += 1.5; kick(); }).observe(c.el, { attributes: true, attributeFilter: ["aria-pressed"] });
  });
  // only the cards on screen float (and hold a GPU layer); the rest stay flat and still
  const io = new IntersectionObserver(es => { es.forEach(e => { const c = cards.find(x => x.el === e.target); if (c) { c.vis = e.isIntersecting; c.el.classList.toggle("is-vis", c.vis); } }); kick(); }, { threshold: .05 });
  cards.forEach(c => io.observe(c.el));

  /* the row moves like the fleet's ribbon: the card in the middle faces you, the ones beside it turn away and step
     back, mirrored on both sides; it snaps card by card onto the centre. Driven by the row's own native scroll. */
  const lis = [...row.children]; let fanning = false, cfRaf = 0;
  const gap = () => parseFloat(getComputedStyle(row).columnGap) || 14;
  // card width from the row's full width (a % basis would shrink with the side padding that centres the first card)
  const centre = () => { const W = row.clientWidth; if (!W) return;
    const w = Math.round(matchMedia("(max-width: 760px)").matches ? W * .7 : Math.min(290, Math.max(230, W * .24))), p = Math.max(0, Math.round((W - w) / 2));
    lis.forEach(li => { li.style.flexBasis = w + "px"; }); row.style.paddingInline = p + "px"; row.style.scrollPaddingInline = p + "px"; };
  function pose(li) {
    const w = li.offsetWidth || 1, d = (li.offsetLeft + w / 2 - row.scrollLeft - row.clientWidth / 2) / (w + gap());
    const k = Math.min(Math.abs(d), 2.4), kk = Math.min(k, 1), sg = Math.sign(d);
    const pull = row.clientWidth < 600 ? .3 : .08;   // on a phone the neighbours slide in under the middle card, so both sides show
    return { t: `perspective(1200px) translate3d(${(-sg * (kk * w * pull + Math.max(0, k - 1) * w * (.14 + pull))).toFixed(1)}px, 0, ${(-(kk * 120 + Math.max(0, k - 1) * 70)).toFixed(1)}px) rotateY(${(-sg * kk * 32).toFixed(2)}deg)`,
      o: (1 - Math.min(k, 2) * .16).toFixed(3), z: String(100 - Math.round(k * 10)) };
  }
  function cover() { cfRaf = 0; if (fanning || REDUCED) return; for (const li of lis) { const q = pose(li); li.style.transform = q.t; li.style.opacity = q.o; li.style.zIndex = q.z; } }
  if (!REDUCED) {
    row.classList.add("is-cover"); centre(); cover();
    row.addEventListener("scroll", () => { if (!cfRaf) cfRaf = requestAnimationFrame(cover); }, { passive: true });
    let lastW = 0; new ResizeObserver(() => { if (row.clientWidth === lastW) return; lastW = row.clientWidth; centre(); cover(); }).observe(row);
  }
  // Fan Cards entrance: the first time the row comes into view the cards start stacked under the first one, a
  // little turned, and fan out into their places one after another (a spring with a small overshoot)
  if (!REDUCED) {
    lis.forEach((li, i) => { li.style.transform = `translate3d(0, 40px, 0) rotate(${(i % 2 ? 1 : -1) * 4}deg)`; li.style.opacity = "0"; });
    fanning = true;
    const fanIo = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return; fanIo.disconnect(); centre();
      const x0 = lis[0].offsetLeft;
      lis.forEach((li, i) => {
        const dx = x0 - li.offsetLeft, d = Math.min(i, 5);
        li.style.transition = "none"; li.style.zIndex = String(50 - i);
        li.style.transform = `translate3d(${dx + d * 10}px, ${d * 8}px, 0) rotate(${d * -4 + 2}deg) scale(${1 - d * .03})`; li.style.opacity = "1";
      });
      row.offsetWidth;   // the stacked pose is drawn before the fan starts
      requestAnimationFrame(() => lis.forEach((li, i) => {
        li.style.transition = `transform 820ms cubic-bezier(.2, 1.28, .38, 1) ${120 + i * 70}ms`;
        li.style.transform = pose(li).t; li.style.opacity = pose(li).o;
        li.addEventListener("transitionend", () => { li.style.transition = ""; if (i === lis.length - 1) { fanning = false; cover(); } }, { once: true });
      }));
    }, { threshold: .25 });
    fanIo.observe(row);
  }
  kick();
  return { relabel: paintLabels, step: dir => { const w = (lis[0]?.offsetWidth || 0) + gap(); row.scrollBy({ left: dir * w, behavior: "smooth" }); } };
}

/* Official line-ups, added as the clubs announce them. One entry per party night:
   { date: "2027-06-14", club: "Pacha", title: "Nombre de la fiesta", artists: ["DJ 1", "DJ 2"], url: "https://… (fuente oficial)" }
   The club name must match the map (Pacha, Hï Ibiza, Ushuaïa Ibiza, DC10, Amnesia, [UNVRS], Eden, Es Paradis…). */
export const EVENTS = [];

const L = {
  es: {
    eyebrow: "Agenda de clubs 2027", title: "Las fiestas que quieres,", em: "antes que nadie.",
    lede: "Dinos tus clubs y tus fechas. Te avisamos en cuanto salga cada line-up y te guardamos mesa o entrada antes de que vuele.",
    status: "Temporada 2027: los clubs anuncian sus line-ups entre enero y marzo. Los publicamos aquí en cuanto son oficiales.",
    pickHint: "Selecciona una o varias opciones", from: "Primera noche", to: "Última noche", nights: "Tus noches", clubs: "Tus clubs", pick: "Toca los clubs que te interesan",
    tba: "Line-up por anunciar", soon: "Aviso activado al elegir el club", any: "Elige tus fechas para ver tus noches",
    alert: "Activar mi alerta de line-up", table: "Pedir mesa VIP o guestlist", picked: n => n ? `${n} ${n === 1 ? "club elegido" : "clubs elegidos"}` : "Ningún club elegido",
    fine: "Guestlists de cortesía sujetas a disponibilidad del club. Mayores de 18.", source: "Fuente oficial",
    msgAlert: "Hola Mey Society, quiero alerta de line-up", msgTable: "Hola Mey Society, quiero mesa VIP o guestlist", msgDates: "Fechas", msgClubs: "Clubs", msgOpen: "abierto a propuestas",
  },
  en: {
    eyebrow: "Club agenda 2027", title: "The parties you want,", em: "before anyone else.",
    lede: "Tell us your clubs and your dates. We let you know the moment each line-up drops and hold your table or ticket before it goes.",
    status: "2027 season: clubs announce their line-ups between January and March. We publish them here as soon as they're official.",
    pickHint: "Select one or more options", from: "First night", to: "Last night", nights: "Your nights", clubs: "Your clubs", pick: "Tap the clubs you like",
    tba: "Line-up to be announced", soon: "Alert on once you pick the club", any: "Choose your dates to see your nights",
    alert: "Turn on my line-up alert", table: "Ask for a VIP table or guestlist", picked: n => n ? `${n} ${n === 1 ? "club picked" : "clubs picked"}` : "No club picked",
    fine: "Complimentary guestlists subject to club availability. 18+ only.", source: "Official source",
    msgAlert: "Hi Mey Society, I'd like a line-up alert", msgTable: "Hi Mey Society, I'd like a VIP table or guestlist", msgDates: "Dates", msgClubs: "Clubs", msgOpen: "open to suggestions",
  },
  it: {
    eyebrow: "Agenda dei club 2027", title: "Le feste che vuoi,", em: "prima di tutti.",
    lede: "Dicci i tuoi club e le tue date. Ti avvisiamo appena esce ogni line-up e ti teniamo il tavolo o l'ingresso prima che vada esaurito.",
    status: "Stagione 2027: i club annunciano i line-up tra gennaio e marzo. Li pubblichiamo qui appena sono ufficiali.",
    pickHint: "Seleziona una o più opzioni", from: "Prima notte", to: "Ultima notte", nights: "Le tue notti", clubs: "I tuoi club", pick: "Tocca i club che ti interessano",
    tba: "Line-up da annunciare", soon: "Avviso attivo scegliendo il club", any: "Scegli le date per vedere le tue notti",
    alert: "Attiva il mio avviso line-up", table: "Chiedi tavolo VIP o guestlist", picked: n => n ? `${n} ${n === 1 ? "club scelto" : "club scelti"}` : "Nessun club scelto",
    fine: "Guestlist di cortesia soggette a disponibilità del club. Solo maggiorenni.", source: "Fonte ufficiale",
    msgAlert: "Ciao Mey Society, vorrei l'avviso line-up", msgTable: "Ciao Mey Society, vorrei un tavolo VIP o guestlist", msgDates: "Date", msgClubs: "Club", msgOpen: "aperto a proposte",
  },
  fr: {
    eyebrow: "Agenda des clubs 2027", title: "Les fêtes que vous voulez,", em: "avant tout le monde.",
    lede: "Donnez-nous vos clubs et vos dates. Nous vous prévenons dès que chaque line-up sort et vous gardons une table ou une entrée avant qu'elle parte.",
    status: "Saison 2027 : les clubs annoncent leurs line-ups entre janvier et mars. Nous les publions ici dès qu'ils sont officiels.",
    pickHint: "Sélectionnez une ou plusieurs options", from: "Première nuit", to: "Dernière nuit", nights: "Vos nuits", clubs: "Vos clubs", pick: "Touchez les clubs qui vous intéressent",
    tba: "Line-up à annoncer", soon: "Alerte activée en choisissant le club", any: "Choisissez vos dates pour voir vos nuits",
    alert: "Activer mon alerte line-up", table: "Demander table VIP ou guestlist", picked: n => n ? `${n} ${n === 1 ? "club choisi" : "clubs choisis"}` : "Aucun club choisi",
    fine: "Guestlists offertes selon disponibilité du club. Réservé aux plus de 18 ans.", source: "Source officielle",
    msgAlert: "Bonjour Mey Society, je veux une alerte line-up", msgTable: "Bonjour Mey Society, je veux une table VIP ou une guestlist", msgDates: "Dates", msgClubs: "Clubs", msgOpen: "ouvert aux propositions",
  },
  de: {
    eyebrow: "Club-Agenda 2027", title: "Die Partys, die du willst,", em: "vor allen anderen.",
    lede: "Sag uns deine Clubs und deine Daten. Wir melden uns, sobald jedes Line-up erscheint, und halten deinen Tisch oder dein Ticket, bevor alles weg ist.",
    status: "Saison 2027: Die Clubs geben ihre Line-ups zwischen Januar und März bekannt. Wir veröffentlichen sie hier, sobald sie offiziell sind.",
    pickHint: "Wähle eine oder mehrere Optionen", from: "Erste Nacht", to: "Letzte Nacht", nights: "Deine Nächte", clubs: "Deine Clubs", pick: "Tippe auf die Clubs, die dich interessieren",
    tba: "Line-up folgt", soon: "Alarm aktiv, sobald du den Club wählst", any: "Wähle deine Daten, um deine Nächte zu sehen",
    alert: "Meinen Line-up-Alarm aktivieren", table: "VIP-Tisch oder Guestlist anfragen", picked: n => n ? `${n} ${n === 1 ? "Club gewählt" : "Clubs gewählt"}` : "Kein Club gewählt",
    fine: "Kostenlose Guestlists je nach Verfügbarkeit des Clubs. Ab 18.", source: "Offizielle Quelle",
    msgAlert: "Hallo Mey Society, ich möchte einen Line-up-Alarm", msgTable: "Hallo Mey Society, ich möchte einen VIP-Tisch oder eine Guestlist", msgDates: "Daten", msgClubs: "Clubs", msgOpen: "offen für Vorschläge",
  },
};
const L2 = {
  es: { clear: "Quitar todos", done: "Listo", go: "Ver mis noches", vip: "Mesas VIP", vipSub: "Pide la tuya en un mensaje", day: "Day clubs", daySub: "Fiestas de día y piscina", feat: "Pulsa ✓ para elegir", tk: { from: "Desde las", byEvent: "Horario según evento", mon: "Lunes", monThu: "Lunes y jueves", tue: "Martes", season: "Temporada", access: "Acceso", age: "Edad", hint: "En tu selección · toca para quitar" } },
  en: { clear: "Clear all", done: "Done", go: "See my nights", vip: "VIP tables", vipSub: "Ask for yours in one message", day: "Day clubs", daySub: "Daytime and pool parties", feat: "Tap ✓ to pick", tk: { from: "From", byEvent: "Hours depend on the event", mon: "Mondays", monThu: "Mondays & Thursdays", tue: "Tuesdays", season: "Season", access: "Access", age: "Age", hint: "In your picks · tap to remove" } },
  it: { clear: "Togli tutti", done: "Fatto", go: "Vedi le mie notti", vip: "Tavoli VIP", vipSub: "Chiedi il tuo in un messaggio", day: "Day club", daySub: "Feste di giorno e in piscina", feat: "Tocca ✓ per scegliere", tk: { from: "Dalle", byEvent: "Orario secondo l'evento", mon: "Lunedì", monThu: "Lunedì e giovedì", tue: "Martedì", season: "Stagione", access: "Accesso", age: "Età", hint: "Nella tua selezione · tocca per togliere" } },
  fr: { clear: "Tout retirer", done: "Terminé", go: "Voir mes nuits", vip: "Tables VIP", vipSub: "Demandez la vôtre en un message", day: "Day clubs", daySub: "Fêtes de jour et pool parties", feat: "Touchez ✓ pour choisir", tk: { from: "Dès", byEvent: "Horaires selon l'événement", mon: "Lundi", monThu: "Lundi et jeudi", tue: "Mardi", season: "Saison", access: "Accès", age: "Âge", hint: "Dans votre sélection · touchez pour retirer" } },
  de: { clear: "Alle entfernen", done: "Fertig", go: "Meine Nächte ansehen", vip: "VIP-Tische", vipSub: "Frag deinen mit einer Nachricht an", day: "Day Clubs", daySub: "Tages- und Poolpartys", feat: "Tippe ✓ zum Auswählen", tk: { from: "Ab", byEvent: "Zeiten je nach Event", mon: "Montags", monThu: "Montags & donnerstags", tue: "Dienstags", season: "Saison", access: "Zugang", age: "Alter", hint: "In deiner Auswahl · zum Entfernen tippen" } },
};
const L3 = {
  es: { cal: "Calendario de fiestas 2027", calSub: "Toca tu primera noche y después la última. Los días con punto ya tienen line-up oficial.", prev: "Mes anterior", next: "Mes siguiente",
        legEv: "Line-up anunciado", legSel: "Tus noches", notify: "Avísame cuando salga el line-up", notifyOn: "Aviso activado: te lo enseñamos aquí en cuanto se anuncie", notifyOff: "Quitar aviso",
        ics: "Añadir a mi calendario", icsPick: "Primero elige tus noches en el calendario", icsDone: "Listo: revisa tu calendario", fresh: n => `${n} ${n === 1 ? "line-up nuevo" : "line-ups nuevos"} en tus noches`, see: "Ver", icsTitle: "Noche en Ibiza", icsNote: "Line-up y mesas: Mey Society" },
  en: { cal: "2027 party calendar", calSub: "Tap your first night, then your last. Days with a dot already have an official line-up.", prev: "Previous month", next: "Next month",
        legEv: "Line-up announced", legSel: "Your nights", notify: "Tell me when the line-up drops", notifyOn: "Alert on: we'll show it here the moment it's announced", notifyOff: "Turn alert off",
        ics: "Add to my calendar", icsPick: "First pick your nights on the calendar", icsDone: "Done: check your calendar", fresh: n => `${n} new ${n === 1 ? "line-up" : "line-ups"} on your nights`, see: "See", icsTitle: "Night in Ibiza", icsNote: "Line-up and tables: Mey Society" },
  it: { cal: "Calendario feste 2027", calSub: "Tocca la prima notte e poi l'ultima. I giorni con il punto hanno già il line-up ufficiale.", prev: "Mese precedente", next: "Mese successivo",
        legEv: "Line-up annunciato", legSel: "Le tue notti", notify: "Avvisami quando esce il line-up", notifyOn: "Avviso attivo: te lo mostriamo qui appena viene annunciato", notifyOff: "Togli avviso",
        ics: "Aggiungi al mio calendario", icsPick: "Prima scegli le tue notti nel calendario", icsDone: "Fatto: controlla il tuo calendario", fresh: n => `${n} ${n === 1 ? "nuovo line-up" : "nuovi line-up"} nelle tue notti`, see: "Vedi", icsTitle: "Notte a Ibiza", icsNote: "Line-up e tavoli: Mey Society" },
  fr: { cal: "Calendrier des fêtes 2027", calSub: "Touchez votre première nuit, puis la dernière. Les jours avec un point ont déjà leur line-up officiel.", prev: "Mois précédent", next: "Mois suivant",
        legEv: "Line-up annoncé", legSel: "Vos nuits", notify: "Prévenez-moi à la sortie du line-up", notifyOn: "Alerte activée : nous l'affichons ici dès son annonce", notifyOff: "Retirer l'alerte",
        ics: "Ajouter à mon calendrier", icsPick: "Choisissez d'abord vos nuits dans le calendrier", icsDone: "C'est fait : vérifiez votre calendrier", fresh: n => `${n} ${n === 1 ? "nouveau line-up" : "nouveaux line-ups"} sur vos nuits`, see: "Voir", icsTitle: "Nuit à Ibiza", icsNote: "Line-up et tables : Mey Society" },
  de: { cal: "Partykalender 2027", calSub: "Tippe auf deine erste Nacht, dann auf die letzte. Tage mit Punkt haben schon ein offizielles Line-up.", prev: "Vorheriger Monat", next: "Nächster Monat",
        legEv: "Line-up bekannt", legSel: "Deine Nächte", notify: "Sag mir, wenn das Line-up erscheint", notifyOn: "Alarm aktiv: Wir zeigen es dir hier, sobald es bekannt ist", notifyOff: "Alarm entfernen",
        ics: "Zu meinem Kalender", icsPick: "Wähle zuerst deine Nächte im Kalender", icsDone: "Fertig: schau in deinen Kalender", fresh: n => `${n} ${n === 1 ? "neues Line-up" : "neue Line-ups"} in deinen Nächten`, see: "Ansehen", icsTitle: "Nacht auf Ibiza", icsNote: "Line-up und Tische: Mey Society" },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KEY = "mey-agenda";
/* one card per club: the user's own photos where there are, otherwise freely licensed photos (credited on the card) */
/* usual season hours, from the clubs' own pages and the main ticket sellers (2025-26); they change by night, so they are a guide only. Bora Bora has no reliable schedule: it says "depends on the event". */
const CLUB_HOURS = {
  "[UNVRS]": ["23:30", ""], "Ushuaïa Ibiza": ["17:00", "23:00"], "Hï Ibiza": ["23:30", "06:30"], "Pacha": ["23:00", "06:00"], "Amnesia": ["23:00", "06:00"],
  "Cova Santa": ["20:30", ""], "DC10": ["18:00", "", "monThu"], "O Beach": ["13:00", "23:00"], "Ibiza Rocks": ["14:00", "21:00", "tue"], "Lío Ibiza": ["20:30", "06:00"],
  "Chinois Ibiza": ["23:30", "06:30"], "Tantra Ibiza": ["21:00", ""], "Swag Ibiza": ["00:00", "06:30"], "Destino Five Ibiza": ["12:00", ""], "Eden": ["00:00", "06:00"], "Es Paradis": ["00:00", "06:30"],
};
const CLUB_CARDS = [
  { club: "[UNVRS]", img: "data/services/clubs.webp" },
  { club: "Ushuaïa Ibiza", img: "data/clubs/ushuaia.webp" },
  { club: "Hï Ibiza", img: "data/clubs/hi-ibiza.webp" },
  { club: "Pacha", img: "data/clubs/pacha.webp" },
  { club: "Amnesia", img: "data/clubs/amnesia.webp" },
  { club: "Cova Santa", img: "data/photos/cova-santa.jpg" },
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
    { act: "table", img: "data/reviews/unvrs-noche.webp", key: "vip" },
  ];
  const PASTEL = ["#e4defe", "#d9ecfa", "#f1dcfb", "#dcdffe"];   // the logo's violet, cyan, magenta and royal blue, as pastels
  root.innerHTML = `<div class="wrap ag">
    <header class="sec__head ag__head"><p class="eyebrow ag__eyebrow"></p><h2 class="display display--md"><span class="ag__title"></span> <em class="ag__em"></em></h2><p class="lede lede--dark ag__lede"></p></header>
    <div class="ag__search" role="group" hidden>
      <label><span class="ag__l-from"></span><input type="date" data-f="from"></label>
      <label><span class="ag__l-to"></span><input type="date" data-f="to"></label>
      <button type="button" class="ag__go" data-act="go"></button>
    </div>
    <p class="ag__status"><i aria-hidden="true"></i><span></span></p>
    <div class="ag__panel ag__panel--nights">
      <h3 class="ag__h ag__h--nights"></h3>
      <p class="ag__hint"></p>
    <div class="ag__featwrap"><button type="button" class="ag__fnav" data-dir="-1" aria-label="‹" disabled>‹</button>
    <ul class="ag__feat" role="list">${FEAT.map(f => `<li><button type="button" class="ag__fcard" ${f.club ? `data-club="${esc(f.club)}" aria-pressed="false"` : `data-act="${f.act}"`}>
      <img src="${f.img}" alt="${f.club ? esc(f.club) + " Ibiza" : ""}" loading="lazy" decoding="async"><span class="ag__fname">${f.club ? esc(f.club) : ""}</span><span class="ag__fsub"></span>${f.club ? `<span class="ag__pick" role="checkbox" tabindex="0" aria-checked="false" aria-label="${esc(f.club)}"></span>` : '<span class="ag__arrow" aria-hidden="true"></span>'}</button></li>`).join("")}</ul>
    <button type="button" class="ag__fnav" data-dir="1" aria-label="›">›</button></div>
    </div>
    <div class="ag__panel ag__cal">
      <p class="ag__fresh" hidden><span></span><button type="button" data-act="fresh"></button></p>
      <div class="ag__calhead"><button type="button" class="ag__nav" data-nav="-1"><i aria-hidden="true">‹</i></button><div><h3 class="ag__h ag__calt"></h3><p class="ag__calsub"></p></div><button type="button" class="ag__nav" data-nav="1"><i aria-hidden="true">›</i></button></div>
      <p class="ag__month" aria-live="polite"></p>
      <div class="ag__grid" role="grid"></div>
      <div class="ag__calfoot"><span class="ag__leg"><i class="is-ev"></i><span class="ag__legev"></span></span><span class="ag__leg"><i class="is-sel"></i><span class="ag__legsel"></span></span></div>
      <div class="ag__calcta"><button type="button" class="ag__notify" data-act="notify" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 3.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></button><button type="button" class="ag__ics" data-act="ics"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 3.5v4M16 3.5v4M4 10h16M12 13v4M10 15h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span></span></button></div>
    </div>
    <div class="ag__panel ag__panel--list"><ol class="ag__nights" aria-live="polite"></ol></div>
    <div class="ag__cta"><button type="button" class="btn btn--primary btn--lg" data-act="table"></button><button type="button" class="btn ag__ghost" data-act="alert"></button></div>
    <p class="ag__fine"></p>
  </div>`;
  const $ = s => root.querySelector(s);
  // the club cards are tickets: tilt with depth, glare, gentle float, flip to the stub when picked, fan-out entrance
  const tickets = ticketCards(root.querySelector(".ag__feat"), () => (L2[getLang()] || L2.es).tk, name => clubs.find(v => v.name === name));
  { const row = root.querySelector(".ag__feat"), navs = root.querySelectorAll(".ag__fnav");
    const sync = () => { navs[0].disabled = row.scrollLeft < 8; navs[1].disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 8; };
    navs.forEach(b => b.addEventListener("click", () => tickets.step(+b.dataset.dir)));
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
    if (!$(".ag__ics").dataset.msg) $(".ag__ics span").textContent = t.ics; $(".ag__ics").classList.toggle("is-idle", !st.from);
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
    saveIcs(lines.join("\r\n"), "mey-society-ibiza-2027.ics").then(ok => ok && flashIcs(t.icsDone));
  }
  // a short message on the button itself (no dates yet, or added)
  function flashIcs(text) { const b = $(".ag__ics"), sp = b.querySelector("span"); b.dataset.msg = "1"; sp.textContent = text; clearTimeout(b._t); b._t = setTimeout(() => { delete b.dataset.msg; sp.textContent = tx3().ics; }, 2600); }
  /* the calendar file reaches the visitor's calendar on every device: inside claude.ai through the viewer's own
     download prompt; on iPhone/iPad by opening the file, which Safari hands straight to Calendar ("Add all");
     elsewhere as a download that the phone or computer opens with its calendar app */
  async function saveIcs(text, filename) {
    const dl = window.claude?.use ? await Promise.race([window.claude.use("downloads").catch(() => null), new Promise(r => setTimeout(() => r(null), 2500))]) : null;
    if (dl) { try { await dl.save({ filename, data: new Blob([text], { type: "text/calendar" }) }); return true; } catch (err) { if (err?.code === "declined") return false; } }
    if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) { location.href = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" })); return true; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" })); a.download = filename;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true;
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
    $(".ag__status span").textContent = t.status; $(".ag__h--nights").textContent = t.clubs; $(".ag__hint").textContent = t.pickHint;
    $(".ag__l-from").textContent = t.from; $(".ag__l-to").textContent = t.to; 
    $('.ag__cta [data-act="alert"]').textContent = t.alert; $('.ag__cta [data-act="table"]').textContent = t.table; $(".ag__fine").textContent = t.fine;
    const X = L2[getLang()] || L2.es; $(".ag__go").textContent = X.go;
    root.querySelectorAll(".ag__fcard").forEach(c => {
      const a = c.dataset.act; if (a) { c.querySelector(".ag__fname").textContent = a === "table" ? X.vip : X.day; c.querySelector(".ag__fsub").textContent = a === "table" ? X.vipSub : X.daySub; }
      else c.querySelector(".ag__fsub").textContent = X.feat;
    });
    root.querySelectorAll("[data-club]").forEach(b => { const on = st.clubs.has(b.dataset.club); b.setAttribute("aria-pressed", on); b.querySelector(".ag__pick")?.setAttribute("aria-checked", on); });
    tickets.relabel();
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
  root.addEventListener("click", e => {
    const c = e.target.closest("[data-club]"), down = c && +c.dataset.pickDown, tick = e.target.closest(".ag__pick") || (down && performance.now() - down < 900);
    if (c) delete c.dataset.pickDown;
    if (c && !tick && e.detail !== 0) return;   // a tap on the card itself: just the 3D move
    if (c) { const n = c.dataset.club; st.clubs.has(n) ? st.clubs.delete(n) : st.clubs.add(n); keep(); paint(); navigator.vibrate?.(4); return; }
    const a = e.target.closest("[data-act]")?.dataset.act;
    if (a === "go") { $(".ag__panel--nights").scrollIntoView({ behavior: "smooth", block: "start" }); if (!st.from) inFrom.showPicker?.(); return; }
    if (a === "day") { clubs.filter(v => v.type === "dayclub").forEach(v => st.clubs.add(v.name)); keep(); paint(); $(".ag__panel--nights").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (a === "clear") { st.clubs.clear(); keep(); paint(); return; }
    if (a === "notify") { st.alert = !st.alert; if (st.alert) matching().forEach(x => st.seen.add(evKey(x))); keep(); paint(); navigator.vibrate?.(8); return; }
    if (a === "ics") { if (!st.from) { flashIcs(tx3().icsPick); $(".ag__grid").scrollIntoView({ behavior: "smooth", block: "center" }); $(".ag__grid").classList.remove("is-nudge"); void $(".ag__grid").offsetWidth; $(".ag__grid").classList.add("is-nudge"); return; } ics(); return; }
    if (a === "fresh") { matching().forEach(x => st.seen.add(evKey(x))); keep(); paint(); $(".ag__panel--list").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (a) onSend?.({ kind: a, text: message(a), from: st.from, to: st.to || st.from, clubs: [...st.clubs] });
  });
  root.addEventListener("keydown", e => { const k = e.target.closest?.(".ag__pick"); if (k && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); k.click(); } });
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
