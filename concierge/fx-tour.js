/* Formentera Experience — a full-screen page for the day trip: the film plays as a cinematic backdrop (full screen
   on a phone, a tall framed screen beside the text on a computer) while the chapters scroll over it: what is
   included, the open bar, life on board, the free time on the island, check-in and the timetable. Nothing is
   downloaded until the page is opened. */
import { getLang } from "./i18n.js";
import { pick } from "./fleet-blob.js";

/* stills taken from the excursion film, upscaled ×2: the full file for the photo viewer, the -m file on the page */
const PH = n => pick(`data/formentera/fx-${n}-m.webp`), PHF = n => pick(`data/formentera/fx-${n}.webp`);
const REEL = ["clip1", "slide", "clip2", "swim", "illetes", "sunset"];
/* the reel's two films (upscaled ×4 with AI, 1080×1920): they play only while their card is the one in view */
const CLIP = { clip1: "data/formentera/fx-clip1.mp4", clip2: "data/formentera/fx-clip2.mp4" };
const isClip = n => n in CLIP;
const FILM = pick("data/formentera/fx-film.mp4");
const SEC_IMG = ["breakfast", "party", "slide", "illetes", null, null];       // photo heading each chapter
const PLAN_IMG = ["aerial", "paddle", "illetes", "shore", "swim", "sunset", "dj"];
const X = {
  es: { stats: [["12", "h", "de experiencia todo incluido"], ["6", "h", "libres en Formentera"], ["2", "", "paradas de baño en aguas cristalinas"], ["DJ", "", "en directo y open bar todo el día"]],
    reelH: "Así se vive el día", reelP: "Imágenes de la excursión. Desliza y elige tu momento favorito.",
    cap: { clip1: "Rumbo a Formentera: embarque y aguas cristalinas", clip2: "Tobogán y paddle surf en el fondeo", slide: "Tobogán acuático directo al mar", snorkel: "Snorkel en aguas cristalinas", paddle: "Paddle surf sobre el turquesa", swim: "Baños en aguas transparentes", illetes: "Arena blanca y agua turquesa", shore: "Agua clara hasta la orilla", party: "Ambiente a bordo con DJ en directo", sunset: "Sunset party de vuelta a Ibiza", breakfast: "Desayuno buffet a bordo", aerial: "Fondeo en aguas turquesas", dj: "DJ en directo" },
    waterH: "Al agua", waterP: "Tobogán, paddle surf y equipo de snorkel incluidos: en cada parada el mar es tuyo.",
    sunH: "Sunset Party", sunP: "De vuelta a Ibiza, el sol cae sobre el mar mientras el DJ sube el ritmo. Cava, prosecco y la mejor luz del día.",
    bar: "12 h · todo incluido", book: "Reservar", open: "Ampliar foto" },
  en: { stats: [["12", "h", "all-inclusive experience"], ["6", "h", "free time in Formentera"], ["2", "", "swim stops in crystal-clear water"], ["DJ", "", "live, plus an open bar all day"]],
    reelH: "How the day feels", reelP: "Images from the excursion. Swipe and pick your favourite moment.",
    cap: { clip1: "Setting off for Formentera: boarding and crystal-clear water", clip2: "Water slide and paddle boarding at anchor", slide: "A water slide straight into the sea", snorkel: "Snorkelling in crystal-clear water", paddle: "Paddle boarding on the turquoise", swim: "Swims in see-through water", illetes: "White sand and turquoise water", shore: "Clear water right to the shore", party: "Live DJ vibes on board", sunset: "Sunset party on the way back", breakfast: "Breakfast buffet on board", aerial: "Anchored in turquoise water", dj: "Live DJ" },
    waterH: "Into the water", waterP: "Water slide, paddle boards and snorkelling gear included: at every stop the sea is yours.",
    sunH: "Sunset Party", sunP: "On the way back to Ibiza the sun sinks into the sea while the DJ lifts the tempo. Cava, prosecco and the best light of the day.",
    bar: "12 h · all inclusive", book: "Book", open: "Enlarge photo" },
  it: { stats: [["12", "h", "di esperienza all-inclusive"], ["6", "h", "di tempo libero a Formentera"], ["2", "", "soste per il bagno in acque cristalline"], ["DJ", "", "dal vivo e open bar tutto il giorno"]],
    reelH: "Come si vive la giornata", reelP: "Immagini dell'escursione. Scorri e scegli il tuo momento preferito.",
    cap: { clip1: "Rotta su Formentera: imbarco e acque cristalline", clip2: "Scivolo e paddle board alla fonda", slide: "Scivolo acquatico dritto in mare", snorkel: "Snorkeling in acque cristalline", paddle: "Paddle board sul turchese", swim: "Bagni in acque trasparenti", illetes: "Sabbia bianca e acqua turchese", shore: "Acqua limpida fino a riva", party: "Atmosfera a bordo con DJ dal vivo", sunset: "Sunset party sulla via del ritorno", breakfast: "Colazione a buffet a bordo", aerial: "All'ancora in acque turchesi", dj: "DJ dal vivo" },
    waterH: "In acqua", waterP: "Scivolo, paddle board e attrezzatura da snorkeling inclusi: a ogni sosta il mare è tuo.",
    sunH: "Sunset Party", sunP: "Sulla via del ritorno a Ibiza il sole cala sul mare mentre il DJ alza il ritmo. Cava, prosecco e la luce più bella del giorno.",
    bar: "12 h · tutto incluso", book: "Prenota", open: "Ingrandisci foto" },
  fr: { stats: [["12", "h", "d'expérience tout compris"], ["6", "h", "de temps libre à Formentera"], ["2", "", "arrêts baignade en eaux cristallines"], ["DJ", "", "en live et open bar toute la journée"]],
    reelH: "La journée en images", reelP: "Images de l'excursion. Faites défiler et choisissez votre moment préféré.",
    cap: { clip1: "Cap sur Formentera : embarquement et eaux cristallines", clip2: "Toboggan et paddle au mouillage", slide: "Toboggan aquatique direct dans la mer", snorkel: "Snorkeling en eaux cristallines", paddle: "Paddle sur le turquoise", swim: "Baignades en eaux transparentes", illetes: "Sable blanc et eau turquoise", shore: "Une eau claire jusqu'au rivage", party: "Ambiance à bord avec DJ en live", sunset: "Sunset party sur le retour", breakfast: "Petit-déjeuner buffet à bord", aerial: "Au mouillage en eaux turquoise", dj: "DJ en live" },
    waterH: "À l'eau", waterP: "Toboggan, paddle et équipement de snorkeling inclus : à chaque arrêt, la mer est à vous.",
    sunH: "Sunset Party", sunP: "Sur le retour vers Ibiza, le soleil plonge dans la mer pendant que le DJ monte le rythme. Cava, prosecco et la plus belle lumière de la journée.",
    bar: "12 h · tout compris", book: "Réserver", open: "Agrandir la photo" },
  de: { stats: [["12", "h", "All-inclusive-Erlebnis"], ["6", "h", "Freizeit auf Formentera"], ["2", "", "Badestopps in kristallklarem Wasser"], ["DJ", "", "live und Open Bar den ganzen Tag"]],
    reelH: "So fühlt sich der Tag an", reelP: "Bilder vom Ausflug. Wisch dich durch und finde deinen Lieblingsmoment.",
    cap: { clip1: "Kurs auf Formentera: Einschiffen und kristallklares Wasser", clip2: "Wasserrutsche und Paddleboarden vor Anker", slide: "Wasserrutsche direkt ins Meer", snorkel: "Schnorcheln in kristallklarem Wasser", paddle: "Paddleboarden auf Türkis", swim: "Baden in glasklarem Wasser", illetes: "Weißer Sand und türkises Wasser", shore: "Klares Wasser bis zum Ufer", party: "Stimmung an Bord mit Live-DJ", sunset: "Sunset-Party auf der Rückfahrt", breakfast: "Frühstücksbuffet an Bord", aerial: "Vor Anker in türkisem Wasser", dj: "Live-DJ" },
    waterH: "Ab ins Wasser", waterP: "Wasserrutsche, Paddleboards und Schnorchelausrüstung inklusive: an jedem Stopp gehört das Meer dir.",
    sunH: "Sunset-Party", sunP: "Auf der Rückfahrt nach Ibiza versinkt die Sonne im Meer, während der DJ das Tempo anzieht. Cava, Prosecco und das schönste Licht des Tages.",
    bar: "12 h · alles inklusive", book: "Buchen", open: "Foto vergrößern" },
};

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
  let root = null, video = null, lastFocus = null, scroller = null, raf = 0;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const img = (n, alt, cls = "", sz = "100vw") => `<img class="${cls}" src="${PH(n)}" srcset="${PH(n)} 928w, ${PHF(n)} 1856w" sizes="${sz}" alt="${esc(alt)}" loading="lazy" decoding="async" width="928" height="1664" draggable="false">`;
  const clipEl = n => `<video class="fx__clip" data-src="${pick(CLIP[n])}" poster="${PH(n)}" muted loop playsinline preload="none" width="1080" height="1920" aria-hidden="true"></video><span class="fx__play" aria-hidden="true"></span>`;
  const zoom = (n, cap, inner, cls = "") => `<button type="button" class="fx__zoom ${cls}" data-fx-full="${n}" aria-label="${esc(cap)}">${inner}</button>`;
  const build = () => {
    const tx = T[getLang()] || T.es, x = X[getLang()] || X.es;
    const banner = (n, h) => n ? `<figure class="fx__ph">${zoom(n, x.cap[n], img(n, x.cap[n], "fx__par", "(min-width: 900px) 600px, 100vw"))}<figcaption>${esc(x.cap[n])}</figcaption></figure>` : "";
    const sec = (s, i) => `<section class="fx__sec${SEC_IMG[i] ? " fx__sec--ph" : ""}${s.plan ? " fx__sec--plan" : ""}">
        ${banner(SEC_IMG[i])}
        <div class="fx__body">
        <h3>${esc(s.h)}</h3>
        ${s.groups ? s.groups.map(g => `<p class="fx__sub">${esc(g.t)}</p>${list(g.li)}`).join("") : ""}
        ${s.p ? `<p>${esc(s.p)}</p>` : ""}${s.li ? list(s.li) : ""}
        ${s.p2 ? `<p class="fx__sub">${esc(s.p2)}</p>` : ""}${s.li2 ? list(s.li2) : ""}
        ${i === 2 ? `<div class="fx__mosaic">${["snorkel", "paddle", "swim"].map(n => zoom(n, x.cap[n], img(n, x.cap[n], "", "(min-width: 900px) 300px, 50vw") + `<span>${esc(x.cap[n])}</span>`)).join("")}</div>` : ""}
        ${s.rows ? `<dl class="fx__rows">${s.rows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>` : ""}
        ${s.note ? `<p class="fx__note">${esc(s.note)}</p>` : ""}
        ${s.plan ? `<ol class="fx__plan">${s.plan.map(([a, b], k) => `<li><i class="fx__dot">${img(PLAN_IMG[k], x.cap[PLAN_IMG[k]], "", "44px")}</i><div><b>${esc(a)}</b><span>${esc(b)}</span></div></li>`).join("")}</ol>` : ""}
        </div>
      </section>`;
    const reel = `<section class="fx__reelwrap" aria-label="${esc(x.reelH)}">
        <div class="fx__reelhead"><h3>${esc(x.reelH)}</h3><p>${esc(x.reelP)}</p></div>
        <div class="fx__reel">${REEL.map((n, k) => zoom(n, x.cap[n], (isClip(n) ? clipEl(n) : img(n, x.cap[n], "", "(min-width: 900px) 250px, 72vw")) + `<span class="fx__cap"><em>${String(k + 1).padStart(2, "0")}</em>${esc(x.cap[n])}</span>`, "fx__card")).join("")}</div>
        <div class="fx__dots" aria-hidden="true">${REEL.map(() => "<i></i>").join("")}</div>
      </section>`;
    const sunset = `<section class="fx__sun">${zoom("sunset", x.cap.sunset, img("sunset", x.cap.sunset, "fx__par", "(min-width: 900px) 600px, 100vw"))}<div class="fx__suntx"><h3>${esc(x.sunH)}</h3><p>${esc(x.sunP)}</p></div></section>`;
    const water = `<header class="fx__intro"><h3>${esc(x.waterH)}</h3><p>${esc(x.waterP)}</p></header>`;
    const secs = tx.sections.map(sec);
    root.querySelector(".fx__content").innerHTML = `
      <header class="fx__hero">
        <p class="fx__kicker">${esc(tx.kicker)}</p>
        <h2 class="fx__title">Formentera Experience</h2>
        ${tx.lead.map((p, i) => `<p class="${i ? "fx__p" : "fx__lead"}">${esc(p)}</p>`).join("")}
        <p class="fx__hint" aria-hidden="true">${esc(tx.scroll)}</p>
      </header>
      <ul class="fx__stats">${x.stats.map(([n, u, l]) => `<li><b data-n="${/^\d+$/.test(n) ? n : ""}">${esc(n)}</b>${u ? `<small>${esc(u)}</small>` : ""}<span>${esc(l)}</span></li>`).join("")}</ul>
      ${reel}
      ${secs[0]}${secs[1]}${water}${secs[2]}${secs[3]}${sunset}${secs[5]}${secs[4]}
      <div class="fx__end"><button type="button" class="btn btn--primary fx__book">${esc(tx.cta)}</button></div>`;
    root.querySelector(".fx__x").setAttribute("aria-label", tx.close);
    root.querySelector(".fx__barbtn").textContent = x.book;
    root.querySelector(".fx__bartx").textContent = x.bar;
    root.querySelector(".fx__lb").setAttribute("aria-label", x.open);
    wire();
  };

  /* --- motion: reveal, count-up, parallax, reel focus, timeline progress, booking bar --- */
  let io = null, reelIo = null, parEls = [], planEl = null;
  const countUp = b => {
    const n = +b.dataset.n; if (!n || REDUCED) return;
    const t0 = performance.now(), d = 1100;
    const step = t => { const k = Math.min(1, (t - t0) / d); b.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    b.textContent = "0"; requestAnimationFrame(step);
  };
  function wire() {
    io?.disconnect(); reelIo?.disconnect();
    io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; el.classList.add("is-in"); io.unobserve(el);
      if (el.classList.contains("fx__stats")) el.querySelectorAll("b[data-n]").forEach((b, k) => setTimeout(() => countUp(b), k * 120));
    }), { root: scroller, threshold: .14 });
    root.querySelectorAll(".fx__sec, .fx__end, .fx__stats, .fx__reelwrap, .fx__sun, .fx__intro, .fx__plan li").forEach(s => io.observe(s));
    const reel = root.querySelector(".fx__reel"), dots = [...root.querySelectorAll(".fx__dots i")], cards = [...reel.children];
    reelIo = new IntersectionObserver(es => es.forEach(en => {
      const k = cards.indexOf(en.target), on = en.intersectionRatio > .6; en.target.classList.toggle("is-on", on); dots[k]?.classList.toggle("is-on", on);
      const v = en.target.querySelector("video"); if (!v) return;
      if (en.isIntersecting && !v.src) { v.src = v.dataset.src; v.preload = "auto"; }
      if (on && !REDUCED) v.play().catch(() => {}); else v.pause();
    }), { root: reel, threshold: [0, .6, 1] });
    cards.forEach(c => reelIo.observe(c));
    parEls = [...root.querySelectorAll(".fx__par")]; planEl = root.querySelector(".fx__plan");
    onScroll();
  }
  const bar = () => root.querySelector(".fx__bar");
  function frame() {
    raf = 0; const vh = scroller.clientHeight, top = scroller.scrollTop;
    if (!REDUCED) for (const im of parEls) {       // the photos drift a little slower than the page
      const r = im.parentElement.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) continue;
      const k = (r.top + r.height / 2 - vh / 2) / vh; im.style.transform = `translate3d(0, ${(k * -9).toFixed(2)}%, 0) scale(1.18)`;
    }
    if (planEl) { const r = planEl.getBoundingClientRect(); planEl.style.setProperty("--p", Math.max(0, Math.min(1, (vh * .62 - r.top) / r.height)).toFixed(3)); }
    const end = root.querySelector(".fx__end").getBoundingClientRect().top < vh;
    bar().classList.toggle("is-on", top > vh * .7 && !end);
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(frame); };

  /* --- photo viewer: the full-resolution still, swipe or arrows for the next --- */
  let lbList = [], lbK = 0;
  const lbShow = k => {
    const lb = root.querySelector(".fx__lb"), x = X[getLang()] || X.es; lbK = (k + lbList.length) % lbList.length;
    const n = lbList[lbK], im = lb.querySelector("img"), lv = lb.querySelector("video");
    lv.hidden = !isClip(n); im.hidden = isClip(n);
    if (isClip(n)) { lv.poster = PH(n); lv.src = pick(CLIP[n]); lv.play().catch(() => {}); lb.querySelector("figcaption").textContent = x.cap[n]; return; }
    lv.pause(); lv.removeAttribute("src");
    im.removeAttribute("srcset"); im.src = PH(n); im.alt = x.cap[n]; const full = new Image(); full.onload = () => { if (lbList[lbK] === n) im.src = full.src; }; full.src = PHF(n);
    lb.querySelector("figcaption").textContent = x.cap[n];
  };
  const lbOpen = n => {
    lbList = [...new Set([...root.querySelectorAll("[data-fx-full]")].map(b => b.dataset.fxFull))];
    root.querySelector(".fx__lb").hidden = false; lbShow(lbList.indexOf(n));
    root.querySelector(".fx__lbx").focus({ preventScroll: true });
  };
  const lbClose = () => { const lb = root.querySelector(".fx__lb"); if (!lb.hidden) { lb.hidden = true; lb.querySelector("video").pause(); return true; } return false; };

  const create = () => {
    root = document.createElement("div"); root.className = "fx"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Formentera Experience");
    const chev = d => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    root.innerHTML = `<div class="fx__media"><video class="fx__video" muted loop playsinline preload="none" poster="data/formentera/fx-poster.webp"></video><span class="fx__shade" aria-hidden="true"></span></div>
      <div class="fx__scroll"><div class="fx__content"></div></div>
      <div class="fx__bar"><span class="fx__bartx"></span><button type="button" class="btn btn--primary fx__book fx__barbtn"></button></div>
      <button type="button" class="fx__x"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <div class="fx__lb" role="dialog" aria-modal="true" hidden><figure><img alt="" decoding="async"><video muted loop playsinline controls hidden></video><figcaption></figcaption></figure>
        <button type="button" class="fx__lbnav fx__lbprev" aria-label="‹">${chev("M15 5l-7 7 7 7")}</button><button type="button" class="fx__lbnav fx__lbnext" aria-label="›">${chev("M9 5l7 7-7 7")}</button>
        <button type="button" class="fx__x fx__lbx" aria-label="×">${chev("M6 6l12 12M18 6L6 18")}</button></div>`;
    document.body.appendChild(root);
    video = root.querySelector("video"); scroller = root.querySelector(".fx__scroll");
    scroller.addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", () => root && !root.hidden && onScroll());
    root.querySelector(".fx__x").addEventListener("click", close);
    root.addEventListener("click", e => {
      if (e.target.closest(".fx__book")) { close(); onBook?.(); return; }
      const z = e.target.closest("[data-fx-full]"); if (z) { lbOpen(z.dataset.fxFull); return; }
      if (e.target.closest(".fx__lbprev")) return lbShow(lbK - 1);
      if (e.target.closest(".fx__lbnext")) return lbShow(lbK + 1);
      if (e.target.closest(".fx__lbx") || e.target.classList.contains("fx__lb")) lbClose();
    });
    let sx = 0; const lb = root.querySelector(".fx__lb");
    lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) lbShow(lbK + (d < 0 ? 1 : -1)); }, { passive: true });
    addEventListener("keydown", e => {
      if (!root || root.hidden) return;
      if (e.key === "Escape") { if (!lbClose()) close(); }
      else if (!lb.hidden && e.key === "ArrowRight") lbShow(lbK + 1);
      else if (!lb.hidden && e.key === "ArrowLeft") lbShow(lbK - 1);
    });
    document.addEventListener("langchange", () => { if (root) build(); });
  };
  /* start buffering the film before the page opens (on approach, or the moment a finger touches the card),
     so it is already playing while the first lines are read */
  function warm() {
    if (!root) create();
    if (!video.src) { video.preload = "auto"; video.src = FILM; video.load(); }
  }
  function open() {
    if (!root) create();
    build(); lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add("fx-open");
    scroller.scrollTop = 0; root.querySelector(".fx__lb").hidden = true; onScroll();
    warm();
    video.play().catch(() => {});
    requestAnimationFrame(() => root.querySelector(".fx__x").focus({ preventScroll: true }));
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; video.pause(); document.documentElement.classList.remove("fx-open");
    // the reel's films are let go on close (their decoded frames are memory a phone needs back)
    root.querySelectorAll(".fx__reel video, .fx__lb video").forEach(v => { v.pause(); if (v.getAttribute("src")) { v.removeAttribute("src"); v.load(); } });
    lastFocus?.focus?.({ preventScroll: true });
  }
  return { open, close, warm };
}
