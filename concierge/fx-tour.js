/* Formentera Experience — a full-screen page for the day trip: the film plays as a cinematic backdrop (full screen
   on a phone, a tall framed screen beside the text on a computer) while the chapters scroll over it: what is
   included, the open bar, life on board, the free time on the island, check-in and the timetable. Nothing is
   downloaded until the page is opened. */
import { getLang } from "./i18n.js";

const T = {
  es: {
    kicker: "Experiencia mediterránea todo incluido · 12 horas",
    lead: ["Mucho más que una excursión en barco: un día entero en el Mediterráneo, de Ibiza a la isla paradisíaca de Formentera.",
      "Navega entre aguas cristalinas, disfruta de buena comida, bebida ilimitada, música en directo, actividades acuáticas y unas 6 horas libres para explorar una de las islas más espectaculares de Europa.",
      "Pasa el día nadando, descansando y descubriendo playas escondidas, y cierra la experiencia con una fiesta al atardecer inolvidable de vuelta a Ibiza."],
    scroll: "Desliza para descubrir el día",
    sections: [
      { h: "Qué incluye", groups: [
        { t: "Desayuno buffet continental", li: ["Bollería recién hecha", "Embutidos españoles", "Pan, mermeladas y Nutella", "Fruta fresca", "Café y té", "Chocolate caliente", "Zumos de fruta"] },
        { t: "Almuerzo", li: ["Paella recién hecha por un catering local", "Opción vegetariana", "Platos alternativos para quien no quiera paella"] }] },
      { h: "Open bar ilimitado", p: "Durante toda la experiencia:", li: ["Cerveza", "Sangría", "Refrescos", "Agua", "Cava", "Prosecco"], p2: "Y además:", li2: ["Licor de hierbas ibicenco", "Chupitos de limoncello"] },
      { h: "A bordo", li: ["DJ en directo durante toda la excursión", "Equipo de sonido premium", "Paddle surf", "Equipo de snorkel", "Tobogán acuático", "Colchonetas flotantes", "Baños en aguas cristalinas", "Sunset party de vuelta a Ibiza"] },
      { h: "Explora Formentera", p: "Unas 6 horas libres para descubrir una de las islas más bonitas del Mediterráneo:", li: ["Relájate en sus playas más famosas", "Visita Ses Illetes", "Recorre la isla en bici o en scooter", "Disfruta de sus beach clubs y restaurantes", "Nada en aguas turquesas y cristalinas", "Descubre Formentera a tu ritmo"] },
      { h: "Check-in (obligatorio)", rows: [["Lugar", "Playa d'en Bossa, Ibiza"], ["Check-in", "08:15"], ["Embarque", "09:00"], ["Salida", "09:15"]], note: "Te recomendamos llegar puntual: quien llegue tarde puede quedarse sin embarcar." },
      { h: "Programa", plan: [
        ["09:15", "Salida desde Playa d'en Bossa"],
        ["1.ª parada", "Espalmador (unas 2 horas): baño, paddle surf, snorkel y actividades acuáticas"],
        ["2.ª parada", "Ses Illetes (unos 45 minutos): baño, relax y fotos panorámicas"],
        ["13:00–13:15", "Llegada a La Savina, Formentera"],
        ["Tiempo libre", "Unas 6 horas para explorar la isla"],
        ["19:15", "Embarque para la Sunset Party: DJ en directo, open bar, cava y prosecco y ambiente al atardecer"],
        ["≈ 21:00", "Regreso a Ibiza (según la época del año)"]] }],
    cta: "Reservar Formentera Experience", close: "Cerrar", play: "Reproducir vídeo",
  },
  en: {
    kicker: "All-inclusive Mediterranean experience · 12 hours",
    lead: ["Much more than a boat trip: a whole day on the Mediterranean, from Ibiza to the paradise island of Formentera.",
      "Sail through crystal-clear water and enjoy great food, unlimited drinks, live entertainment, water activities and around 6 hours of free time to explore one of the most spectacular islands in Europe.",
      "Spend the day swimming, relaxing and finding hidden beaches, and end it with an unforgettable sunset party on the way back to Ibiza."],
    scroll: "Scroll to discover the day",
    sections: [
      { h: "What's included", groups: [
        { t: "Continental breakfast buffet", li: ["Freshly baked pastries", "Spanish cold cuts", "Bread, jams and Nutella", "Fresh fruit", "Coffee and tea", "Hot chocolate", "Fruit juices"] },
        { t: "Lunch", li: ["Paella freshly made by a local caterer", "Vegetarian option available", "Alternative meals for anyone who doesn't want paella"] }] },
      { h: "Unlimited open bar", p: "Throughout the whole experience:", li: ["Beer", "Sangria", "Soft drinks", "Water", "Cava", "Prosecco"], p2: "Plus:", li2: ["Traditional Ibizan herb liqueur", "Limoncello shots"] },
      { h: "On board", li: ["Live DJ for the whole trip", "Premium sound system", "Paddle boards", "Snorkelling gear", "Water slide", "Floating mats", "Swims in crystal-clear water", "Sunset party on the way back"] },
      { h: "Explore Formentera", p: "Around 6 hours of free time to discover one of the most beautiful islands in the Mediterranean:", li: ["Relax on its most famous beaches", "Visit Ses Illetes", "Explore the island by bike or scooter", "Enjoy its beach clubs and restaurants", "Swim in turquoise, crystal-clear water", "Discover Formentera at your own pace"] },
      { h: "Check-in (required)", rows: [["Place", "Playa d'en Bossa, Ibiza"], ["Check-in", "08:15"], ["Boarding", "09:00"], ["Departure", "09:15"]], note: "Please be on time: late arrivals may not be allowed on board." },
      { h: "Schedule", plan: [
        ["09:15", "Departure from Playa d'en Bossa"],
        ["1st stop", "Espalmador (about 2 hours): swimming, paddle boarding, snorkelling and water activities"],
        ["2nd stop", "Ses Illetes (about 45 minutes): swimming, relaxing and panoramic photos"],
        ["13:00–13:15", "Arrival at La Savina, Formentera"],
        ["Free time", "About 6 hours to explore the island"],
        ["19:15", "Boarding for the Sunset Party: live DJ, open bar, cava and prosecco, sunset atmosphere"],
        ["≈ 21:00", "Back in Ibiza (depending on the time of year)"]] }],
    cta: "Book Formentera Experience", close: "Close", play: "Play video",
  },
  it: {
    kicker: "Esperienza mediterranea all-inclusive · 12 ore",
    lead: ["Più di una semplice gita in barca: vivi un'intera giornata nel Mediterraneo, da Ibiza fino alla paradisiaca isola di Formentera.",
      "Naviga tra acque cristalline, gusta ottimo cibo, bevande illimitate, intrattenimento dal vivo, attività acquatiche e circa 6 ore di tempo libero per esplorare una delle isole più spettacolari d'Europa.",
      "Trascorri la giornata nuotando, rilassandoti e scoprendo spiagge nascoste, e concludi l'esperienza con un indimenticabile party al tramonto durante il ritorno a Ibiza."],
    scroll: "Scorri per scoprire la giornata",
    sections: [
      { h: "Cosa è incluso", groups: [
        { t: "Buffet colazione continentale", li: ["Pasticceria fresca", "Affettati spagnoli", "Pane, marmellate e Nutella", "Frutta fresca", "Caffè e tè", "Cioccolata calda", "Succhi di frutta"] },
        { t: "Pranzo", li: ["Paella preparata fresca da un catering locale", "Opzione vegetariana disponibile", "Pasti alternativi per chi non desidera la paella"] }] },
      { h: "Open bar illimitato", p: "Per tutta la durata dell'esperienza:", li: ["Birra", "Sangria", "Bevande analcoliche", "Acqua", "Cava", "Prosecco"], p2: "Inoltre:", li2: ["Liquore tradizionale alle erbe di Ibiza", "Shot di limoncello"] },
      { h: "Esperienza a bordo", li: ["DJ dal vivo per tutta l'escursione", "Impianto audio premium", "Paddle board", "Attrezzatura per snorkeling", "Scivolo acquatico", "Materassini galleggianti", "Bagni in acque cristalline", "Sunset party durante il ritorno"] },
      { h: "Esplora Formentera", p: "Circa 6 ore di tempo libero per scoprire una delle isole più belle del Mediterraneo:", li: ["Rilassati sulle spiagge più famose", "Visita Ses Illetes", "Esplora l'isola in bici o scooter", "Goditi beach club e ristoranti locali", "Nuota in acque turchesi e cristalline", "Scopri Formentera al tuo ritmo"] },
      { h: "Check-in (obbligatorio)", rows: [["Luogo", "Playa d'en Bossa, Ibiza"], ["Check-in", "08:15"], ["Imbarco", "09:00"], ["Partenza", "09:15"]], note: "Ti consigliamo di arrivare puntuale: i ritardatari potrebbero non essere ammessi a bordo." },
      { h: "Programma", plan: [
        ["09:15", "Partenza da Playa d'en Bossa"],
        ["1ª fermata", "Espalmador (circa 2 ore): bagno, paddle board, snorkeling e attività acquatiche"],
        ["2ª fermata", "Ses Illetes (circa 45 minuti): bagno, relax e foto panoramiche"],
        ["13:00–13:15", "Arrivo a La Savina, Formentera"],
        ["Tempo libero", "Circa 6 ore per esplorare l'isola"],
        ["19:15", "Imbarco per il Sunset Party: DJ dal vivo, open bar, cava e prosecco, atmosfera al tramonto"],
        ["≈ 21:00", "Rientro a Ibiza (in base al periodo dell'anno)"]] }],
    cta: "Prenota Formentera Experience", close: "Chiudi", play: "Riproduci video",
  },
  fr: {
    kicker: "Expérience méditerranéenne tout compris · 12 heures",
    lead: ["Bien plus qu'une sortie en bateau : une journée entière en Méditerranée, d'Ibiza jusqu'à l'île paradisiaque de Formentera.",
      "Naviguez sur des eaux cristallines et profitez d'une bonne cuisine, de boissons à volonté, d'animations en direct, d'activités nautiques et d'environ 6 heures de temps libre pour explorer l'une des îles les plus spectaculaires d'Europe.",
      "Passez la journée à nager, vous détendre et découvrir des plages cachées, et terminez par une fête au coucher du soleil inoubliable sur le retour vers Ibiza."],
    scroll: "Faites défiler pour découvrir la journée",
    sections: [
      { h: "Ce qui est inclus", groups: [
        { t: "Petit-déjeuner buffet continental", li: ["Viennoiseries fraîches", "Charcuterie espagnole", "Pain, confitures et Nutella", "Fruits frais", "Café et thé", "Chocolat chaud", "Jus de fruits"] },
        { t: "Déjeuner", li: ["Paella fraîchement préparée par un traiteur local", "Option végétarienne", "Plats alternatifs pour ceux qui ne veulent pas de paella"] }] },
      { h: "Open bar à volonté", p: "Pendant toute l'expérience :", li: ["Bière", "Sangria", "Boissons sans alcool", "Eau", "Cava", "Prosecco"], p2: "Et aussi :", li2: ["Liqueur d'herbes traditionnelle d'Ibiza", "Shots de limoncello"] },
      { h: "À bord", li: ["DJ en live pendant toute l'excursion", "Système son premium", "Paddle", "Équipement de snorkeling", "Toboggan aquatique", "Matelas flottants", "Baignades en eaux cristallines", "Sunset party sur le retour"] },
      { h: "Explorez Formentera", p: "Environ 6 heures de temps libre pour découvrir l'une des plus belles îles de la Méditerranée :", li: ["Détendez-vous sur ses plages les plus célèbres", "Visitez Ses Illetes", "Explorez l'île à vélo ou en scooter", "Profitez des beach clubs et restaurants", "Nagez dans des eaux turquoise et cristallines", "Découvrez Formentera à votre rythme"] },
      { h: "Check-in (obligatoire)", rows: [["Lieu", "Playa d'en Bossa, Ibiza"], ["Check-in", "08:15"], ["Embarquement", "09:00"], ["Départ", "09:15"]], note: "Merci d'arriver à l'heure : les retardataires pourraient ne pas être admis à bord." },
      { h: "Programme", plan: [
        ["09:15", "Départ de Playa d'en Bossa"],
        ["1er arrêt", "Espalmador (environ 2 heures) : baignade, paddle, snorkeling et activités nautiques"],
        ["2e arrêt", "Ses Illetes (environ 45 minutes) : baignade, détente et photos panoramiques"],
        ["13:00–13:15", "Arrivée à La Savina, Formentera"],
        ["Temps libre", "Environ 6 heures pour explorer l'île"],
        ["19:15", "Embarquement pour la Sunset Party : DJ en live, open bar, cava et prosecco, ambiance coucher de soleil"],
        ["≈ 21:00", "Retour à Ibiza (selon la saison)"]] }],
    cta: "Réserver Formentera Experience", close: "Fermer", play: "Lire la vidéo",
  },
  de: {
    kicker: "All-inclusive-Erlebnis im Mittelmeer · 12 Stunden",
    lead: ["Viel mehr als ein Bootsausflug: ein ganzer Tag auf dem Mittelmeer, von Ibiza zur Trauminsel Formentera.",
      "Fahr durch kristallklares Wasser und genieß gutes Essen, unbegrenzte Getränke, Live-Unterhaltung, Wassersport und rund 6 Stunden Freizeit, um eine der spektakulärsten Inseln Europas zu entdecken.",
      "Verbring den Tag mit Schwimmen, Entspannen und versteckten Stränden, und lass ihn mit einer unvergesslichen Sunset-Party auf der Rückfahrt nach Ibiza ausklingen."],
    scroll: "Scrolle, um den Tag zu entdecken",
    sections: [
      { h: "Inklusive", groups: [
        { t: "Kontinentales Frühstücksbuffet", li: ["Frisches Gebäck", "Spanische Wurstspezialitäten", "Brot, Marmelade und Nutella", "Frisches Obst", "Kaffee und Tee", "Heiße Schokolade", "Fruchtsäfte"] },
        { t: "Mittagessen", li: ["Frisch zubereitete Paella von einem lokalen Caterer", "Vegetarische Option", "Alternative Gerichte für alle, die keine Paella möchten"] }] },
      { h: "Unbegrenzte Open Bar", p: "Während des ganzen Erlebnisses:", li: ["Bier", "Sangria", "Softdrinks", "Wasser", "Cava", "Prosecco"], p2: "Außerdem:", li2: ["Traditioneller Kräuterlikör aus Ibiza", "Limoncello-Shots"] },
      { h: "An Bord", li: ["Live-DJ während des ganzen Ausflugs", "Premium-Soundsystem", "Paddleboards", "Schnorchelausrüstung", "Wasserrutsche", "Schwimmmatten", "Baden in kristallklarem Wasser", "Sunset-Party auf der Rückfahrt"] },
      { h: "Formentera entdecken", p: "Rund 6 Stunden Freizeit, um eine der schönsten Inseln des Mittelmeers zu entdecken:", li: ["Entspann an den berühmtesten Stränden", "Besuch Ses Illetes", "Erkunde die Insel mit Fahrrad oder Roller", "Genieß Beach Clubs und Restaurants", "Schwimm in türkisem, kristallklarem Wasser", "Entdecke Formentera in deinem Tempo"] },
      { h: "Check-in (Pflicht)", rows: [["Ort", "Playa d'en Bossa, Ibiza"], ["Check-in", "08:15"], ["Einstieg", "09:00"], ["Abfahrt", "09:15"]], note: "Bitte sei pünktlich: Zu spät Kommende werden eventuell nicht mehr an Bord gelassen." },
      { h: "Ablauf", plan: [
        ["09:15", "Abfahrt von Playa d'en Bossa"],
        ["1. Stopp", "Espalmador (ca. 2 Stunden): Baden, Paddleboard, Schnorcheln und Wassersport"],
        ["2. Stopp", "Ses Illetes (ca. 45 Minuten): Baden, Entspannen und Panoramafotos"],
        ["13:00–13:15", "Ankunft in La Savina, Formentera"],
        ["Freizeit", "Rund 6 Stunden, um die Insel zu entdecken"],
        ["19:15", "Einstieg zur Sunset-Party: Live-DJ, Open Bar, Cava und Prosecco, Sonnenuntergangsstimmung"],
        ["≈ 21:00", "Rückkehr nach Ibiza (je nach Jahreszeit)"]] }],
    cta: "Formentera Experience buchen", close: "Schließen", play: "Video abspielen",
  },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const list = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;

export function initFormenteraTour({ onBook } = {}) {
  let root = null, video = null, lastFocus = null;
  const build = () => {
    const tx = T[getLang()] || T.es;
    const sec = s => `<section class="fx__sec">
        <h3>${esc(s.h)}</h3>
        ${s.groups ? s.groups.map(g => `<p class="fx__sub">${esc(g.t)}</p>${list(g.li)}`).join("") : ""}
        ${s.p ? `<p>${esc(s.p)}</p>` : ""}${s.li ? list(s.li) : ""}
        ${s.p2 ? `<p class="fx__sub">${esc(s.p2)}</p>` : ""}${s.li2 ? list(s.li2) : ""}
        ${s.rows ? `<dl class="fx__rows">${s.rows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>` : ""}
        ${s.note ? `<p class="fx__note">${esc(s.note)}</p>` : ""}
        ${s.plan ? `<ol class="fx__plan">${s.plan.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ol>` : ""}
      </section>`;
    root.querySelector(".fx__content").innerHTML = `
      <header class="fx__hero">
        <p class="fx__kicker">${esc(tx.kicker)}</p>
        <h2 class="fx__title">Formentera Experience</h2>
        ${tx.lead.map((p, i) => `<p class="${i ? "fx__p" : "fx__lead"}">${esc(p)}</p>`).join("")}
        <p class="fx__hint" aria-hidden="true">${esc(tx.scroll)}</p>
      </header>
      ${tx.sections.map(sec).join("")}
      <div class="fx__end"><button type="button" class="btn btn--primary fx__book">${esc(tx.cta)}</button></div>`;
    root.querySelector(".fx__x").setAttribute("aria-label", tx.close);
  };
  const create = () => {
    root = document.createElement("div"); root.className = "fx"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Formentera Experience");
    root.innerHTML = `<div class="fx__media"><video class="fx__video" muted loop playsinline preload="none" poster="data/formentera/fx-poster.webp"></video><span class="fx__shade" aria-hidden="true"></span></div>
      <div class="fx__scroll"><div class="fx__content"></div></div>
      <button type="button" class="fx__x"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    document.body.appendChild(root);
    video = root.querySelector("video");
    root.querySelector(".fx__x").addEventListener("click", close);
    root.addEventListener("click", e => { if (e.target.closest(".fx__book")) { close(); onBook?.(); } });
    addEventListener("keydown", e => { if (e.key === "Escape" && root && !root.hidden) close(); });
    document.addEventListener("langchange", () => { if (root) build(); });
    // the sections rise in as they reach the screen
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) en.target.classList.add("is-in"); }), { root: root.querySelector(".fx__scroll"), threshold: .12 });
    new MutationObserver(() => root.querySelectorAll(".fx__sec, .fx__end").forEach(s => io.observe(s))).observe(root.querySelector(".fx__content"), { childList: true });
  };
  function open() {
    if (!root) create();
    build(); lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add("fx-open");
    root.querySelector(".fx__scroll").scrollTop = 0;
    if (!video.src) { video.src = "data/formentera/fx-film.mp4"; video.load(); }
    video.play().catch(() => {});
    requestAnimationFrame(() => root.querySelector(".fx__x").focus({ preventScroll: true }));
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; video.pause(); document.documentElement.classList.remove("fx-open");
    lastFocus?.focus?.({ preventScroll: true });
  }
  return { open, close };
}
