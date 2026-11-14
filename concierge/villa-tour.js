/* Villa Aura — a scroll-driven film. Scrolling flies a drone from the cove to the villa, through the
   gate, up to the front door (which opens on its own) and through every room; each chapter brings a short
   line of copy and a reading pause. The film is 25 fps H.264, streamed as text lines (data/villa/aura-v-*.txt),
   decoded by the device's own video decoder (WebCodecs) and drawn on a canvas: scrubbing is frame-exact,
   every picture is a crisp real frame, and nothing is downloaded until the tour is opened. */
import { getLang } from "./i18n.js";

// two packs of the same film: 2560x1440 for laptops and tablets, a 1152x1440 (4:5) crop for phones held upright
const PHONE = matchMedia("(max-width: 720px) and (orientation: portrait)").matches;
let PACK = PHONE ? "p" : "d";
const SRC = k => `data/villa/aura-v-${PACK}-${k}.txt`;
let DOOR = { x0: .449, x1: .488, y0: .556, y1: .813 };     // the front door in the last frame of the "door" shot (each pack brings its own)
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/* Reading stops: places where the scroll comes to rest so a short text can be read, going down or up.
   It never fights the reader: no CSS snap, no pulling back on small steps.
   - a flick glides to the next stop it is heading for: as the momentum gets close, a smooth scroll takes over
     and lands exactly on it (one stop per flick, never a hard stop)
   - with `pager`, every gesture that moves the page (a swipe, a wheel notch, a trackpad stroke) goes to the
     next stop in its direction, even a short one that ends where nothing seems to move; while it glides,
     trackpad inertia is swallowed so it cannot overshoot. Outside the first and last stop it does nothing. */
export function readingStops(target, { centers, half, pager = false, touch = true, active = () => true }) {
  const win = target === window, el = win ? window : target;
  const getY = () => win ? scrollY : target.scrollTop;
  const vh = () => win ? innerHeight : target.clientHeight;
  let finger = false, fling = false, auto = false, dir = 0, lastY = getY(), anchor = getY(), idle = 0, lockUntil = 0, goal = null, userAt = -1e9;
  // only the reader's own gestures are guided: a jump from the menu or a link passes through untouched
  const byUser = () => fling || performance.now() - userAt < 700;
  // (a tap or a click is not a scroll: a menu link tapped here must not be taken for a swipe)
  let moved = false;
  el.addEventListener("touchmove", () => { if (!touch) return; userAt = performance.now(); moved = true; }, { passive: true });
  window.addEventListener("keydown", e => { if (/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) userAt = performance.now(); });
  const go = y => { auto = true; goal = y; lockUntil = performance.now() + 650; anchor = y; el.scrollTo({ top: y, behavior: "smooth" }); };
  const inRange = (y, cs, h) => cs.length && y > cs[0] - vh() && y < cs[cs.length - 1] + h;
  const nextFrom = (cs, from, d) => d > 0 ? cs.find(c => c > from + 4) : [...cs].reverse().find(c => c < from - 4);
  el.addEventListener("touchstart", () => { if (!touch) return; moved = false; finger = true; fling = false; if (auto || !idle) anchor = getY(); auto = false; goal = null; }, { passive: true });   // (a glide caught mid-way starts the new gesture from where it is)
  el.addEventListener("touchend", () => { if (!touch) return; finger = false; fling = moved; if (moved) { clearTimeout(idle); idle = setTimeout(settle, 120); } }, { passive: true });   // (a drag that stopped before the finger lifted is decided here)
  el.addEventListener("wheel", e => {
    if (!active()) return;
    if (pager && performance.now() < lockUntil && inRange(getY(), centers(), half())) { e.preventDefault(); return; }   // gliding: swallow inertia
    userAt = performance.now(); if (auto) anchor = getY(); auto = false; goal = null;
  }, { passive: false });
  el.addEventListener("scroll", () => {
    const y = getY(); if (y !== lastY) dir = Math.sign(y - lastY); lastY = y;
    clearTimeout(idle); idle = setTimeout(settle, 120);
    if (auto || finger || !active()) return;
    if (!byUser()) { anchor = y; return; }
    const cs = centers(), h = half(); if (!cs.length) return;
    if (!pager && !fling) return;                       // without pager only flicks are guided
    if (pager && !inRange(y, cs, h)) return;
    // the stop this movement is heading for: the next one after where the gesture started
    const c = nextFrom(cs, anchor + dir * h, dir); if (c === undefined) return;   // (the stop it is resting in does not count)
    const near = Math.min(vh() * .3, Math.abs(c - anchor) * .5);
    if ((c - y) * dir <= near) go(c);                  // close enough: glide the rest of the way and stop there
  }, { passive: true });
  function settle() {
    idle = 0;
    const was = auto; auto = false; fling = false;
    if (was) { if (goal !== null && Math.abs(getY() - goal) > 2) el.scrollTo({ top: goal }); goal = null; anchor = getY(); return; }
    if (finger || !active()) return;
    const y = getY(), cs = centers(), h = half();
    if (pager && byUser() && inRange(y, cs, h) && Math.abs(y - anchor) > 24 && Math.abs(y - anchor) < vh() * 1.5) {
      const d = Math.sign(y - anchor), c = nextFrom(cs, anchor + d * h, d);
      if (c !== undefined) return go(c);
    }
    anchor = y;
  }
}

// ---- copy: [kicker, headline, line, chips] per chapter, in the 5 languages of the site ----
const ORDER = ["cala", "villa", "gate", "door", "salon", "cocina", "piscina", "suite", "terraza", "suites", "jacuzzi", "fin"];
const T = {
  es: {
    ui: { name: "Villa Aura", place: "Recorrido privado", scroll: "Desliza para entrar", close: "Cerrar", loading: "Preparando el recorrido", fail: "Este navegador no puede mostrar el recorrido. Pídenos el dossier de la villa", ask: "Pedir disponibilidad", again: "Ver de nuevo", facts: ["5 suites con baño", "6 baños", "Piscina infinita", "Jacuzzi privado", "Acceso directo al mar"], fine: "Precio según fechas: te lo enviamos al pedir disponibilidad.<br>Guestlist de cortesía sujeta a disponibilidad del club." },
    cala: ["La cala privada", "Antes de la villa, su secreto.", "Agua turquesa a tus pies y acceso directo al mar. Hay quien cruza la isla buscando una cala así; tú te despiertas encima.", ["Acceso directo al mar"]],
    villa: ["La villa", "Arquitectura que mira al mar.", "Líneas blancas sobre el pinar y una piscina suspendida sobre el horizonte. Desde el aire impresiona. Desde dentro, más.", ["Diseño contemporáneo", "Vistas a la bahía"]],
    gate: ["La llegada", "La puerta se abre. Ibiza se queda fuera.", "Entrada privada, sin recepción y sin vecinos a la vista. Aquí nadie te pide la pulsera.", ["Acceso privado", "Aparcamiento"]],
    door: ["Bienvenido", "Lo que hay detrás de esta puerta no sale en ningún catálogo.", "Sigue bajando: estás a punto de entrar.", []],
    salon: ["El salón", "Un salón sin paredes al paisaje.", "Ventanales de suelo a techo: el mar y el pinar forman parte de la decoración.", ["Ventanales panorámicos", "Salida directa a la piscina"]],
    cocina: ["Comedor y cocina", "Cenas que se alargan solas.", "Mesa para todos y cocina equipada. ¿No te apetece cocinar? Te ponemos chef privado y tú solo eliges el vino.", ["Cocina equipada", "Chef privado opcional"]],
    piscina: ["La piscina", "El agua termina donde empieza el mar.", "Piscina infinita frente a la bahía. La foto que todos tus amigos te van a pedir.", ["Piscina infinita", "Solárium"]],
    suite: ["La suite principal", "Despertar con el Mediterráneo delante.", "Cama frente al ventanal, bañera exenta y terraza propia. Aquí no pones alarma: la hora la marca el Mediterráneo.", ["Bañera exenta", "Terraza privada"]],
    terraza: ["La terraza", "El mejor atardecer es privado.", "Dos sillas, una copa y la bahía entera. Sin reserva y sin consumición mínima.", ["Vistas al mar", "Puesta de sol"]],
    suites: ["Las suites", "Cinco suites. Cero discusiones.", "Cada dormitorio con su propio baño: todos duermen como invitados de honor.", ["5 suites", "6 baños"]],
    jacuzzi: ["El jacuzzi", "Burbujas entre pinos.", "Jacuzzi privado al aire libre. Perfecto para cerrar el día, o para empezarlo.", ["Jacuzzi privado", "Rodeado de pinar"]],
    fin: ["Tu semana en Villa Aura", "Empieza con un mensaje.", "Villa, chef, barco en la cala y mesa en el club: lo coordinamos todo. Y por reservar con nosotros, guestlist de cortesía.", []],
  },
  en: {
    ui: { name: "Villa Aura", place: "Private tour", scroll: "Scroll to step inside", close: "Close", loading: "Preparing the tour", fail: "This browser cannot show the tour. Ask us for the villa dossier", ask: "Check availability", again: "Watch again", facts: ["5 en-suite bedrooms", "6 bathrooms", "Infinity pool", "Private jacuzzi", "Direct access to the sea"], fine: "Price depends on dates: we send it when you ask for availability.<br>Complimentary guestlist subject to club availability." },
    cala: ["The private cove", "Before the villa, its secret.", "Turquoise water at your feet and direct access to the sea. Some people cross the island looking for a cove like this; you wake up above it.", ["Direct access to the sea"]],
    villa: ["The villa", "Architecture that faces the sea.", "White lines above the pines and a pool hanging over the horizon. Impressive from the air. Even more from inside.", ["Contemporary design", "Bay views"]],
    gate: ["The arrival", "The gate opens. Ibiza stays outside.", "A private entrance, no front desk, no neighbours in sight. Nobody asks for your wristband here.", ["Private access", "Parking"]],
    door: ["Welcome", "What lies behind this door is in no catalogue.", "Keep scrolling: you are about to walk in.", []],
    salon: ["The living room", "A living room with no walls to the view.", "Floor-to-ceiling glass: the sea and the pines are part of the décor.", ["Panoramic windows", "Straight out to the pool"]],
    cocina: ["Dining and kitchen", "Dinners that run long on their own.", "A table for everyone and a fully equipped kitchen. Don't feel like cooking? We bring a private chef and you just pick the wine.", ["Equipped kitchen", "Optional private chef"]],
    piscina: ["The pool", "The water ends where the sea begins.", "An infinity pool facing the bay. The photo all your friends will ask you for.", ["Infinity pool", "Sun deck"]],
    suite: ["The master suite", "Wake up facing the Mediterranean.", "A bed in front of the window, a freestanding bath and your own terrace. No alarm here: the Mediterranean sets the time.", ["Freestanding bath", "Private terrace"]],
    terraza: ["The terrace", "The best sunset is a private one.", "Two chairs, one glass and the whole bay. No booking, no minimum spend.", ["Sea views", "Sunset"]],
    suites: ["The suites", "Five suites. Zero arguments.", "Every bedroom has its own bathroom: everyone sleeps like the guest of honour.", ["5 suites", "6 bathrooms"]],
    jacuzzi: ["The jacuzzi", "Bubbles among the pines.", "A private open-air jacuzzi. Perfect to end the day, or to start it.", ["Private jacuzzi", "Surrounded by pines"]],
    fin: ["Your week at Villa Aura", "It starts with one message.", "Villa, chef, a boat in the cove and a table at the club: we coordinate it all. And when you book with us, a complimentary guestlist.", []],
  },
  it: {
    ui: { name: "Villa Aura", place: "Tour privato", scroll: "Scorri per entrare", close: "Chiudi", loading: "Preparazione del tour", fail: "Questo browser non può mostrare il tour. Chiedici il dossier della villa", ask: "Chiedi disponibilità", again: "Rivedi", facts: ["5 suite con bagno", "6 bagni", "Piscina a sfioro", "Jacuzzi privata", "Accesso diretto al mare"], fine: "Prezzo in base alle date: te lo inviamo quando chiedi la disponibilità.<br>Guestlist in omaggio secondo disponibilità del club." },
    cala: ["La caletta privata", "Prima della villa, il suo segreto.", "Acqua turchese ai tuoi piedi e accesso diretto al mare. C'è chi attraversa l'isola per una cala così; tu ti svegli sopra.", ["Accesso diretto al mare"]],
    villa: ["La villa", "Architettura che guarda il mare.", "Linee bianche sulla pineta e una piscina sospesa sull'orizzonte. Dall'alto colpisce. Da dentro, di più.", ["Design contemporaneo", "Vista sulla baia"]],
    gate: ["L'arrivo", "Il cancello si apre. Ibiza resta fuori.", "Ingresso privato, niente reception e nessun vicino in vista. Qui nessuno ti chiede il braccialetto.", ["Accesso privato", "Parcheggio"]],
    door: ["Benvenuto", "Quello che c'è dietro questa porta non è in nessun catalogo.", "Continua a scorrere: stai per entrare.", []],
    salon: ["Il salone", "Un salone senza pareti sul paesaggio.", "Vetrate dal pavimento al soffitto: il mare e la pineta fanno parte dell'arredo.", ["Vetrate panoramiche", "Uscita diretta in piscina"]],
    cocina: ["Sala da pranzo e cucina", "Cene che si allungano da sole.", "Un tavolo per tutti e cucina attrezzata. Non ti va di cucinare? Ti portiamo uno chef privato e tu scegli solo il vino.", ["Cucina attrezzata", "Chef privato opzionale"]],
    piscina: ["La piscina", "L'acqua finisce dove inizia il mare.", "Piscina a sfioro davanti alla baia. La foto che tutti i tuoi amici ti chiederanno.", ["Piscina a sfioro", "Solarium"]],
    suite: ["La suite principale", "Svegliarsi con il Mediterraneo davanti.", "Letto davanti alla vetrata, vasca freestanding e terrazza privata. Qui niente sveglia: l'ora la decide il Mediterraneo.", ["Vasca freestanding", "Terrazza privata"]],
    terraza: ["La terrazza", "Il tramonto migliore è privato.", "Due sedie, un bicchiere e tutta la baia. Senza prenotazione e senza consumazione minima.", ["Vista mare", "Tramonto"]],
    suites: ["Le suite", "Cinque suite. Zero discussioni.", "Ogni camera ha il suo bagno: tutti dormono da ospiti d'onore.", ["5 suite", "6 bagni"]],
    jacuzzi: ["La jacuzzi", "Bollicine tra i pini.", "Jacuzzi privata all'aperto. Perfetta per chiudere la giornata, o per iniziarla.", ["Jacuzzi privata", "Immersa nella pineta"]],
    fin: ["La tua settimana a Villa Aura", "Inizia con un messaggio.", "Villa, chef, barca nella cala e tavolo al club: coordiniamo tutto noi. E prenotando con noi, guestlist in omaggio.", []],
  },
  fr: {
    ui: { name: "Villa Aura", place: "Visite privée", scroll: "Faites défiler pour entrer", close: "Fermer", loading: "Préparation de la visite", fail: "Ce navigateur ne peut pas afficher la visite. Demandez-nous le dossier de la villa", ask: "Demander la disponibilité", again: "Revoir", facts: ["5 suites avec salle de bain", "6 salles de bain", "Piscine à débordement", "Jacuzzi privé", "Accès direct à la mer"], fine: "Prix selon les dates : nous vous l'envoyons lors de la demande de disponibilité.<br>Guestlist offerte selon disponibilité du club." },
    cala: ["La crique privée", "Avant la villa, son secret.", "Une eau turquoise à vos pieds et un accès direct à la mer. Certains traversent l'île pour une crique pareille ; vous vous réveillez au-dessus.", ["Accès direct à la mer"]],
    villa: ["La villa", "Une architecture tournée vers la mer.", "Des lignes blanches sur la pinède et une piscine suspendue sur l'horizon. Impressionnante vue du ciel. Plus encore de l'intérieur.", ["Design contemporain", "Vue sur la baie"]],
    gate: ["L'arrivée", "Le portail s'ouvre. Ibiza reste dehors.", "Entrée privée, pas de réception, aucun voisin en vue. Ici, personne ne vous demande votre bracelet.", ["Accès privé", "Parking"]],
    door: ["Bienvenue", "Ce qui se cache derrière cette porte n'est dans aucun catalogue.", "Continuez : vous êtes sur le point d'entrer.", []],
    salon: ["Le salon", "Un salon sans murs sur le paysage.", "Des baies vitrées du sol au plafond : la mer et la pinède font partie du décor.", ["Baies panoramiques", "Accès direct à la piscine"]],
    cocina: ["Salle à manger et cuisine", "Des dîners qui s'éternisent tout seuls.", "Une table pour tous et une cuisine équipée. Pas envie de cuisiner ? Nous envoyons un chef privé, vous choisissez le vin.", ["Cuisine équipée", "Chef privé en option"]],
    piscina: ["La piscine", "L'eau s'arrête là où la mer commence.", "Une piscine à débordement face à la baie. La photo que tous vos amis vous demanderont.", ["Piscine à débordement", "Solarium"]],
    suite: ["La suite parentale", "Se réveiller face à la Méditerranée.", "Un lit devant la baie vitrée, une baignoire îlot et votre terrasse. Ici, pas de réveil : c'est la Méditerranée qui donne l'heure.", ["Baignoire îlot", "Terrasse privée"]],
    terraza: ["La terrasse", "Le plus beau coucher de soleil est privé.", "Deux chaises, un verre et toute la baie. Sans réservation ni minimum de consommation.", ["Vue mer", "Coucher de soleil"]],
    suites: ["Les suites", "Cinq suites. Zéro dispute.", "Chaque chambre a sa salle de bain : tout le monde dort en invité d'honneur.", ["5 suites", "6 salles de bain"]],
    jacuzzi: ["Le jacuzzi", "Des bulles parmi les pins.", "Un jacuzzi privé en plein air. Parfait pour finir la journée, ou pour la commencer.", ["Jacuzzi privé", "Entouré de pins"]],
    fin: ["Votre semaine à la Villa Aura", "Elle commence par un message.", "Villa, chef, bateau dans la crique et table au club : nous coordonnons tout. Et en réservant avec nous, guestlist offerte.", []],
  },
  de: {
    ui: { name: "Villa Aura", place: "Private Tour", scroll: "Scrollen und eintreten", close: "Schließen", loading: "Tour wird vorbereitet", fail: "Dieser Browser kann die Tour nicht anzeigen. Fragen Sie uns nach dem Exposé der Villa", ask: "Verfügbarkeit anfragen", again: "Noch einmal ansehen", facts: ["5 Suiten mit Bad", "6 Bäder", "Infinity-Pool", "Privater Jacuzzi", "Direkter Zugang zum Meer"], fine: "Preis je nach Datum: Wir senden ihn dir mit der Verfügbarkeitsanfrage.<br>Gästeliste als Geschenk, je nach Verfügbarkeit des Clubs." },
    cala: ["Die private Bucht", "Vor der Villa: ihr Geheimnis.", "Türkises Wasser zu deinen Füßen und direkter Zugang zum Meer. Manche durchqueren die Insel für so eine Bucht; du wachst darüber auf.", ["Direkter Zugang zum Meer"]],
    villa: ["Die Villa", "Architektur mit Blick aufs Meer.", "Weiße Linien über dem Pinienwald und ein Pool, der über dem Horizont schwebt. Aus der Luft beeindruckend. Von innen noch mehr.", ["Zeitgenössisches Design", "Blick auf die Bucht"]],
    gate: ["Die Ankunft", "Das Tor öffnet sich. Ibiza bleibt draußen.", "Privater Eingang, keine Rezeption, keine Nachbarn in Sicht. Hier fragt niemand nach deinem Armband.", ["Privater Zugang", "Parkplatz"]],
    door: ["Willkommen", "Was hinter dieser Tür liegt, steht in keinem Katalog.", "Scroll weiter: Gleich trittst du ein.", []],
    salon: ["Das Wohnzimmer", "Ein Wohnzimmer ohne Wände zur Landschaft.", "Bodentiefe Fenster: Meer und Pinien gehören zur Einrichtung.", ["Panoramafenster", "Direkt hinaus zum Pool"]],
    cocina: ["Essbereich und Küche", "Abendessen, die von selbst länger werden.", "Ein Tisch für alle und eine voll ausgestattete Küche. Keine Lust zu kochen? Wir schicken einen Privatkoch, du wählst nur den Wein.", ["Ausgestattete Küche", "Privatkoch optional"]],
    piscina: ["Der Pool", "Das Wasser endet, wo das Meer beginnt.", "Infinity-Pool mit Blick auf die Bucht. Das Foto, nach dem dich alle Freunde fragen werden.", ["Infinity-Pool", "Sonnendeck"]],
    suite: ["Die Master-Suite", "Aufwachen mit dem Mittelmeer vor Augen.", "Das Bett vor der Fensterfront, eine freistehende Badewanne und eine eigene Terrasse. Hier stellst du keinen Wecker: Die Uhrzeit bestimmt das Mittelmeer.", ["Freistehende Badewanne", "Private Terrasse"]],
    terraza: ["Die Terrasse", "Der schönste Sonnenuntergang ist privat.", "Zwei Stühle, ein Glas und die ganze Bucht. Ohne Reservierung, ohne Mindestverzehr.", ["Meerblick", "Sonnenuntergang"]],
    suites: ["Die Suiten", "Fünf Suiten. Null Diskussionen.", "Jedes Schlafzimmer hat sein eigenes Bad: Alle schlafen wie Ehrengäste.", ["5 Suiten", "6 Bäder"]],
    jacuzzi: ["Der Jacuzzi", "Blubbern zwischen Pinien.", "Privater Jacuzzi unter freiem Himmel. Perfekt, um den Tag zu beenden – oder zu beginnen.", ["Privater Jacuzzi", "Umgeben von Pinien"]],
    fin: ["Deine Woche in der Villa Aura", "Sie beginnt mit einer Nachricht.", "Villa, Koch, Boot in der Bucht und Tisch im Club: Wir koordinieren alles. Und wenn du bei uns buchst, gibt es die Gästeliste dazu.", []],
  },
};
const tx = () => T[getLang()] || T.es;

// ---- frames: the film is H.264 video (25 fps), streamed as one access unit per line and decoded with the
// device's own video decoder (WebCodecs, hardware accelerated). Decoded pictures live in a small cache. ----
function createFrames(onProgress) {
  let head = null, failed = false, onHead = null, onFrame = null, focus = 0;
  const raw = [], key = [], cache = new Map(); let MAX = 30;
  let dec = null, fedTo = -1, jobEnd = -1, inFlight = 0, keepLo = 0, keepHi = 30, keepX = new Set(), runStart = -1, outTo = -1;
  // the decoder runs through the film in order from a key frame: runStart (that key frame) .. fedTo (last fed) .. outTo (last out)
  const cfg = () => ({ codec: head.codec, codedWidth: head.w, codedHeight: head.h, optimizeForLatency: true });
  const ready = (async () => {
    if (typeof VideoDecoder !== "function") throw new Error("no-webcodecs");
    for (let part = 1; !head || part <= head.parts; part++) {
      const res = await fetch(SRC(part)); if (!res.ok) throw new Error("tour " + res.status);
      const reader = res.body.getReader(), td = new TextDecoder(); let tail = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        const lines = (tail + td.decode(value, { stream: true })).split("\n"); tail = lines.pop();
        for (const ln of lines) {
          if (!ln) continue;
          if (!head) {
            head = JSON.parse(ln);
            const ok = await VideoDecoder.isConfigSupported({ codec: head.codec, codedWidth: head.w, codedHeight: head.h }).catch(() => ({ supported: false }));
            if (!ok.supported) throw new Error("no-h264");
            MAX = PACK === "d" ? 30 : 40;            // a decoded 2560x1440 picture is ~15 MB, a phone one ~7 MB
            onHead?.(head); continue;
          }
          const bin = atob(ln.slice(1)), u = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
          key.push(ln[0] === "K"); raw.push(u);
        }
        if (head) { onProgress?.(raw.length / head.frames); pump(); }
      }
    }
    onProgress?.(1);
  })().catch(e => { failed = true; console.error(e); });
  const has = i => i >= 0 && i < raw.length;
  const keyBefore = i => { while (i > 0 && !key[i]) i--; return i; };
  function decoder() {
    if (dec && dec.state !== "closed") return dec;
    dec = new VideoDecoder({
      output: f => {
        inFlight--;
        const i = Math.round(f.timestamp / 40000); outTo = Math.max(outTo, i);
        // keep only what is near where the reader is; a picture is copied out so the decoder's own buffers are
        // handed back at once (holding them would stall a hardware decoder)
        if (cache.has(i) || !(i >= keepLo && i <= keepHi || keepX.has(i))) { f.close(); pump(); return; }   // decoded only to reach the next one
        createImageBitmap(f).then(bm => {
          f.close(); cache.set(i, bm);
          if (cache.size > MAX) { const far = [...cache.keys()].sort((a, b) => Math.abs(b - focus) - Math.abs(a - focus)).slice(0, cache.size - MAX); far.forEach(k => { cache.get(k).close?.(); cache.delete(k); }); }
          onFrame?.(i);
        }, () => f.close());
        pump();
      },
      error: e => { console.error(e); dec = null; fedTo = -1; jobEnd = -1; inFlight = 0; runStart = -1; outTo = -1; }
    });
    dec.configure(cfg()); return dec;
  }
  // feed the decoder in order, a few access units at a time, up to the end of the current job
  function pump() {
    if (!head || failed || jobEnd < 0) return;
    const d = decoder();
    while (fedTo < jobEnd && has(fedTo + 1) && d.decodeQueueSize < 3 && inFlight < 6) {
      const i = ++fedTo; inFlight++;
      d.decode(new EncodedVideoChunk({ type: key[i] ? "key" : "delta", timestamp: i * 40000, data: raw[i] }));
    }
  }
  // start decoding at `from` (jumping back to its key frame unless the decoder is already there) through `to`
  function job(from, to) {
    const k = keyBefore(from), live = dec && dec.state === "configured" && runStart >= 0;
    // keep going when the running pass will reach `from` anyway: it is fed but not out yet, or the feed is
    // just behind it (a restart would only throw that work away)
    const coming = live && from >= runStart && (from > outTo) && fedTo + 1 >= k;
    if (coming) { jobEnd = Math.max(jobEnd, to); pump(); return; }
    if (live) { dec.reset(); dec.configure(cfg()); }
    inFlight = 0; runStart = k; fedTo = k - 1; outTo = k - 1; jobEnd = to; pump();
  }
  const AHEAD = 22;
  function plan(f, dir, extra = []) {
    if (!head || failed) return;
    focus = f; keepLo = dir > 0 ? f - 2 : f - AHEAD; keepHi = dir > 0 ? f + AHEAD : f + 2; keepX = new Set(extra);
    const missingAt = i => has(i) && !cache.has(i);
    if (missingAt(f)) return job(f, Math.min(raw.length - 1, f + (dir > 0 ? AHEAD : 2)));
    if (dir > 0) { for (let i = f + 1; i <= f + AHEAD; i++) if (missingAt(i)) return job(i, Math.min(raw.length - 1, f + AHEAD)); }
    else { for (let i = f - 1; i >= f - AHEAD; i--) if (missingAt(i)) return job(keyBefore(i), f - 1); }
    for (const x of extra) if (missingAt(x)) return job(x, x + 4);
  }
  const want = i => { if (has(i) && !cache.has(i)) plan(i, 1); };
  return { ready, has, want, plan, get failed() { return failed; }, get: i => cache.get(i), setFocus: i => { focus = i; }, set onHead(f) { onHead = f; if (head) f(head); }, set onFrame(f) { onFrame = f; }, get head() { return head; } };
}

export function initVillaTour({ onAsk } = {}) {
  let root = null, api = null;
  function build() {
    const L = tx();
    root = document.createElement("div"); root.className = "vt" + (PHONE ? " vt--phone" : ""); root.hidden = true; root.setAttribute("data-no-i18n", "");
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", L.ui.name);
    root.innerHTML = `
      <div class="vt__scroll" tabindex="0">
        <div class="vt__track"><div class="vt__stage">
          <canvas class="vt__cv" aria-hidden="true"></canvas>
          <div class="vt__shade" aria-hidden="true"></div>
          <div class="vt__bars" aria-hidden="true"><i></i><i></i></div>
          <div class="vt__cap" aria-live="polite"></div>
          <div class="vt__hint"><span></span><em>${L.ui.scroll}</em></div>
          <div class="vt__load"><i></i><span>${L.ui.loading}</span></div>
        </div></div>
        <section class="vt__end">
          <p class="vt__k">${L.ui.place}</p><h3>${L.ui.name}</h3>
          <video class="vt__film" src="data/villa/aura-film.mp4#t=24" controls playsinline preload="metadata" aria-label="${L.ui.name}"></video>
          <ul class="vt__facts">${L.ui.facts.map(f => `<li>${f}</li>`).join("")}</ul>
          <div class="vt__cta"><button class="btn btn--primary btn--lg" type="button" data-ask>${L.ui.ask}</button><button class="btn btn--glass btn--onDark" type="button" data-again>${L.ui.again}</button></div>
          <p class="vt__fine">${L.ui.fine}</p>
        </section>
      </div>
      <header class="vt__top"><div class="vt__brand"><b>${L.ui.name}</b></div>
        <button class="vt__x" type="button" data-close aria-label="${L.ui.close}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
      <nav class="vt__rail" aria-hidden="true"></nav>`;
    document.body.appendChild(root);
    const scroller = root.querySelector(".vt__scroll"), track = root.querySelector(".vt__track"), stage = root.querySelector(".vt__stage");
    const cv = root.querySelector(".vt__cv"), ctx = cv.getContext("2d"), cap = root.querySelector(".vt__cap"), rail = root.querySelector(".vt__rail");
    const hint = root.querySelector(".vt__hint"), load = root.querySelector(".vt__load"), bars = root.querySelector(".vt__bars");

    // ---- timeline: every shot is a segment; the door shot is followed by the door-opening move ----
    let seg = [], total = 0, chapters = [], head = null;
    /* reading pauses: in every chapter the film stops for a stretch of scroll while its text is fully shown,
       and the scroll snaps there, so each room holds still long enough to read (going down or back up) */
    let holds = [], S = 0;
    const HOLD = 0;                                     // no reading pauses: the film runs straight through (owner's choice)
    const toT = s => { let acc = 0; for (const h of holds) { if (s < h.at + acc) return s - acc; if (s < h.at + acc + HOLD) return h.at; acc += HOLD; } return s - acc; };
    const toS = t => { let acc = 0; for (const h of holds) { if (t <= h.at) return t + acc; acc += HOLD; } return t + acc; };
    const frames = createFrames(f => { load.style.setProperty("--p", f.toFixed(3)); if (f >= 1) load.classList.add("is-done"); kick(); });
    /* if the film cannot load (old browser, network), say so instead of an endless "preparing" */
    frames.ready.then(() => { if (!frames.failed || frames.head) return; load.classList.add("is-err"); load.querySelector("span").textContent = L.ui.fail; });
    frames.onFrame = () => kick();
    frames.onHead = h => {
      head = h; if (h.door) DOOR = { x0: h.door[0], x1: h.door[1], y0: h.door[2], y1: h.door[3] };
      // shots overlap: each one starts playing underneath while the previous is still on screen, so a cut is a
      // long dissolve between two moving pictures (never a jump). The door shot hands over through the doorway.
      let t = 0, prev = null;
      h.clips.forEach((c, i) => {
        const xin = prev && prev.kind === "clip" ? Math.min(.7, .3 * Math.min(prev.len, c.dur)) : 0;   // short, clean dissolves between shots
        const s = { kind: "clip", ch: c.ch, first: c.first, n: c.n, t0: t - xin, len: c.dur, xin }; seg.push(s); t = s.t0 + s.len; prev = s;
        if (c.ch === "door" && h.clips[i + 1]) { prev = { kind: "door", ch: "door", from: c.first + c.n - 1, to: h.clips[i + 1].first, t0: t, len: 2.8 }; seg.push(prev); t += 2.8; }
      });
      total = t;
      ORDER.forEach(id => { const ss = seg.filter(s => s.ch === id); if (ss.length) chapters.push({ id, t0: ss[0].t0, t1: ss[ss.length - 1].t0 + ss[ss.length - 1].len }); });
      holds = chapters.map(c => {
        const first = seg.find(q => q.ch === c.id), len = c.t1 - c.t0;
        // the moment the shot has finished dissolving in and its text is fully on screen
        return { at: Math.min(c.t1 - len * .2, Math.max(c.t0 + len * .14, first.t0 + (first.xin || 0) + .3)) };
      });
      S = total + holds.length * HOLD;
      const K = innerWidth < 900 ? 25 : 28;             // vh of scroll per second of film
      track.style.height = `calc(${Math.round(S * K)}vh + 100vh)`;
      track.querySelectorAll(".vt__snap").forEach(n => n.remove());
      let acc = 0;
      holds.forEach(h => { const n = document.createElement("i"); n.className = "vt__snap"; n.setAttribute("aria-hidden", "true"); n.style.top = `${((h.at + acc + HOLD / 2) * K).toFixed(2)}vh`; track.appendChild(n); acc += HOLD; });
      rail.innerHTML = chapters.map((c, i) => `<i style="top:${(toS(c.t0) / S * 100).toFixed(2)}%" data-i="${i}"></i>`).join("");
      for (let i = 0; i < 6; i++) frames.want(i);
      kick();
    };

    // ---- drawing ----
    let W = 0, H = 0, dpr = 1, lastGood = null;
    function size() {
      dpr = Math.min(PHONE ? 3 : 2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight;
      const k = Math.min(1, 2560 / (W * dpr)); cv.width = Math.round(W * dpr * k); cv.height = Math.round(H * dpr * k);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; kick();
    }
    // cover-fit rect of a frame, with an optional zoom about a point given in frame coordinates (0..1)
    function fit(zoom = 1, fx = .5, fy = .5) {
      const cw = cv.width, chh = cv.height, s = Math.max(cw / head.w, chh / head.h) * zoom, w = head.w * s, h = head.h * s;
      return { x: cw / 2 - fx * w, y: chh / 2 - fy * h, w, h };
    }
    let missing = false;
    function near(i) { // the wanted frame, or the closest decoded one of the same shot (never a frame of another room)
      let bm = frames.get(i); if (bm) return bm;
      const c = head.clips.find(c => i >= c.first && i < c.first + c.n), lo = c ? c.first : i, hi = c ? c.first + c.n - 1 : i;
      for (let d = 1; d < 12; d++) { bm = (i - d >= lo && frames.get(i - d)) || (i + d <= hi && frames.get(i + d)); if (bm) return bm; }
      missing = true; return null;   // (decoding is planned once per frame in draw)
    }
    function drawFrame(i, alpha = 1, r = null) {
      const bm = near(i); if (!bm) return false;
      r = r || fit(); ctx.globalAlpha = alpha; ctx.drawImage(bm, r.x, r.y, r.w, r.h); ctx.globalAlpha = 1; lastGood = i; return true;
    }
    function drawClip(s, local, alpha = 1) {
      const f = clamp(local / s.len, 0, 1) * (s.n - 1), i0 = Math.floor(f), frac = f - i0;
      // a slow push-in over each shot adds life; two neighbouring frames are blended for fluid motion
      const r = fit(1 + .03 * clamp(local / s.len)); // starts at 1:1 (no resampling blur), then a very slow push-in
      // 25 real pictures a second: always one crisp frame, never two blended (no double image)
      return drawFrame(s.first + Math.min(s.n - 1, i0 + (frac >= .5 ? 1 : 0)), alpha, r);
    }
    function drawDoor(s, k) {
      // 1) push in towards the door  2) the door swings open on its own  3) we fly through into the living room
      const z = smooth(clamp(k / .92)), open = smooth(clamp((k - .16) / .42));
      const dcx = (DOOR.x0 + DOOR.x1) / 2, dcy = (DOOR.y0 + DOOR.y1) / 2;
      const base = fit(1.05), dw0 = (DOOR.x1 - DOOR.x0) * base.w, dh0 = (DOOR.y1 - DOOR.y0) * base.h;
      const zEnd = Math.max(cv.width / dw0, cv.height / dh0) * 1.12, zoom = Math.exp(Math.log(zEnd) * z) * 1.05;
      const aim = smooth(clamp(z / .55)), r = fit(zoom, lerp(.5, dcx, aim), lerp(.5, dcy, aim));
      drawFrame(s.from, 1, r);
      const dx = r.x + DOOR.x0 * r.w, dy = r.y + DOOR.y0 * r.h, dw = (DOOR.x1 - DOOR.x0) * r.w, dh = (DOOR.y1 - DOOR.y0) * r.h;
      if (open > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
        // what waits inside, seen through the doorway (it settles as we arrive)
        const bm = near(s.to); if (bm) { const ri = fit(1.13 - .13 * z); /* lands exactly on the framing the living-room shot starts with */ ctx.drawImage(bm, ri.x, ri.y, ri.w, ri.h); } else { ctx.fillStyle = "#f3efe8"; ctx.fillRect(dx, dy, dw, dh); }
        // the door leaf, hinged on the left, swinging inwards
        const lw = dw * Math.cos(open * 1.48), g = ctx.createLinearGradient(dx, 0, dx + lw, 0);
        g.addColorStop(0, "#0e0f12"); g.addColorStop(.85, "#23252b"); g.addColorStop(1, "#3a3d45");
        ctx.fillStyle = g; ctx.fillRect(dx, dy, lw, dh);
        ctx.fillStyle = `rgba(0,0,0,${(.35 * (1 - open)).toFixed(3)})`; ctx.fillRect(dx + lw, dy, dw - lw, dh); // the room is dim until the door clears
        ctx.restore();
        // warm light spilling out of the doorway
        const gl = ctx.createRadialGradient(dx + dw / 2, dy + dh / 2, 0, dx + dw / 2, dy + dh / 2, Math.max(dw, dh) * 1.6);
        gl.addColorStop(0, `rgba(255,236,200,${(.28 * open * (1 - z)).toFixed(3)})`); gl.addColorStop(1, "rgba(255,236,200,0)");
        ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = gl; ctx.fillRect(0, 0, cv.width, cv.height); ctx.globalCompositeOperation = "source-over";
      }
    }
    function draw(t) {
      if (!head) return;
      // the shots alive at this moment: normally one; two while one dissolves into the next
      const live = seg.filter(s => t >= s.t0 && t < s.t0 + s.len); if (!live.length) live.push(t < seg[0].t0 ? seg[0] : seg[seg.length - 1]);
      const s = live[live.length - 1], local = clamp(t - s.t0, 0, s.len);
      missing = false;
      const frameOf = (g, lt) => g.kind === "door" ? g.from : g.first + Math.floor(clamp(lt / g.len) * (g.n - 1));
      const probe = frameOf(live[0], t - live[0].t0), now = frameOf(s, local);
      // one decoding plan per frame: the picture on screen first, then onwards in the direction of travel
      // (the scroll target is ahead of the picture, which glides after it), plus what a cut or the door needs
      if (target !== cur) planDir = target > cur ? 1 : -1;
      const extra = live.length > 1 ? [probe] : [];
      for (const g of live) if (g.kind === "door") { extra.push(g.from); for (let d = 0; d < 6; d++) extra.push(g.to + d); }
      const nx = seg[seg.indexOf(s) + planDir]; if (nx) { const nf = nx.kind === "door" ? nx.from : planDir > 0 ? nx.first : nx.first + nx.n - 1; for (let d = 0; d < 4; d++) extra.push(nf + d * planDir); }
      frames.plan(now, planDir, extra);
      // while a shot is still arriving, the previous picture stays on screen instead of a blank or a wrong room
      if (!near(probe)) return;
      for (const g of live) {
        const lt = clamp(t - g.t0, 0, g.len);
        if (g.kind === "door") drawDoor(g, clamp(lt / g.len));
        else drawClip(g, lt, g === live[0] ? 1 : smooth(clamp(lt / (g.xin || 1e-6))));
      }
      lastT = t;
    }
    let lastT = 0, planDir = 1;

    // ---- captions ----
    let capCh = -1;
    function caption(t) {
      const i = chapters.findIndex(c => t >= c.t0 && t < c.t1), c = chapters[i];
      if (i !== capCh) {
        capCh = i; cap.classList.remove("is-in");
        if (c) {
          const [k, h, p, chips] = tx()[c.id];
          cap.innerHTML = `<p class="vt__n"><span>${String(i + 1).padStart(2, "0")}</span><i></i>${k}</p><h2>${h.split(" ").map((w, j) => `<span style="--j:${j}"><b>${w}</b></span>`).join(" ")}</h2><p class="vt__p">${p}</p>${chips.length ? `<ul>${chips.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}`;
          void cap.offsetWidth; cap.classList.add("is-in");
        }
        rail.querySelectorAll("i").forEach((d, j) => d.classList.toggle("is-on", j === i));
      }
      if (c) { // fade the copy in after the cut and out before the next one
        const u = (t - c.t0) / (c.t1 - c.t0), o = clamp(u / .1) * clamp((1 - u) / .12);
        cap.style.opacity = o.toFixed(3); cap.style.setProperty("--drift", ((.5 - u) * 26).toFixed(1) + "px");
      }
    }

    // ---- scroll → timeline, eased ----
    let cur = 0, target = 0, raf = 0, lastNow = 0, vel = 0, lastScroll = 0;
    const read = () => { const max = track.offsetHeight - scroller.clientHeight; target = max > 0 && S ? toT(clamp(scroller.scrollTop / max) * S) : 0; };
    function frame(now) {
      raf = 0; const dt = lastNow ? Math.min(.05, (now - lastNow) / 1000) : .016; lastNow = now;
      read();
      // at rest the film glides the last few hundredths onto a whole frame: a still picture is never a blend of two
      let goal = target;
      if (now - lastScroll > 140 && head) { const g = seg.filter(q => q.kind === "clip" && target >= q.t0 + (q.xin || 0) && target < q.t0 + q.len).pop(); if (g && g.n > 1) { const step = g.len / (g.n - 1); goal = g.t0 + Math.round((target - g.t0) / step) * step; } }
      if (reduced) { cur = goal; vel = 0; }
      else { // critically damped spring: follows the finger closely (tight, so the film never trails behind), lands without a bump
        const w = 15; for (let rem = dt; rem > 0; rem -= 1 / 240) { const hh = Math.min(rem, 1 / 240); vel += (w * w * (goal - cur) - 2 * w * vel) * hh; cur += vel * hh; }
        if (Math.abs(goal - cur) < .0015 && Math.abs(vel) < .01) { cur = goal; vel = 0; }
      }
      draw(cur); caption(cur);
      
      hint.classList.toggle("is-off", cur > .5); bars.classList.toggle("is-on", cur > .15 && cur < total - .3);
      if (vel !== 0 || now - lastScroll < 400 || missing) raf = requestAnimationFrame(frame); else lastNow = 0;
    }
    const kick = () => { if (!raf && root && !root.hidden) raf = requestAnimationFrame(frame); };
    scroller.addEventListener("scroll", () => { lastScroll = performance.now(); kick(); }, { passive: true });
    // (no reading stops in the tour: one continuous, light scroll)
    new ResizeObserver(size).observe(cv);

    function close() { root.querySelector(".vt__film")?.pause(); root.hidden = true; document.body.style.overflow = ""; document.documentElement.classList.remove("is-covered"); document.dispatchEvent(new CustomEvent("coverchange", { detail: false })); }
    root.addEventListener("click", e => {
      if (e.target.closest("[data-close]")) close();
      else if (e.target.closest("[data-ask]")) { close(); onAsk?.(tx().ui.name); }
      else if (e.target.closest("[data-again]")) scroller.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && root && !root.hidden) close(); });
    api = { open() { root.hidden = false; document.body.style.overflow = "hidden"; document.documentElement.classList.add("is-covered"); document.dispatchEvent(new CustomEvent("coverchange", { detail: true })); scroller.scrollTop = 0; cur = 0; vel = 0; capCh = -1; size(); kick(); requestAnimationFrame(() => scroller.focus({ preventScroll: true })); } };
  }
  return { open() { if (!root || root.dataset.lang !== getLang()) { root?.remove(); build(); root.dataset.lang = getLang(); } api.open(); } };
}
