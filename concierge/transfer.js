/* Transfers — a full-screen page: why a private driver matters in Ibiza (with real-life moments the visitor will
   recognise), then a short request form: from, to, day, time, group, luggage, flight, return. As the group and the
   luggage are filled in, the right vehicle size is suggested (up to 7, 8 or 18 people). The request goes straight to
   the concierge (WhatsApp when set, otherwise the contact form) with everything the fleet needs to quote. */
import { getLang } from "./i18n.js";
import { FLEET } from "./fleet-data.js";

const T = {
  es: {
    kicker: "Transfers privados · Ibiza",
    title: ["En Ibiza, llegar a tiempo", "también es parte del plan."],
    lead: "En verano la isla se llena y los taxis no dan abasto: colas en el aeropuerto, esperas a la salida de los clubs y cenas que empiezan tarde porque nadie viene a buscarte. Con un chófer privado, tu coche ya te está esperando.",
    whyH: "¿Te suena alguna de estas situaciones?",
    cases: [
      ["Aterrizas a la 1:00", "6 amigos, 8 maletas y sin taxi disponible. Un conductor con tu nombre en la puerta."],
      ["Sales del club a las 6:00", "Miles de personas esperando en una cola de taxi que no avanza. Tu transfer está aparcado fuera y te deja en la puerta del alojamiento."],
      ["Cena en el norte, fiesta en el sur", "Nadie quiere ser el conductor esa noche. Un mismo chófer os lleva, espera y os trae de vuelta."],
    ],
    netH: "Siempre hay una van para ti",
    net: "No dependo de una sola flota. Trabajo con una red de conductores privados de la isla conectados entre sí en tiempo real: cuando me escribes, sé al momento qué vehículo está libre a la hora que lo necesitas y te lo confirmo. Temporada alta, domingo de closing o las 5 de la mañana:", netEnd: "Te encuentro el vehículo que encaja contigo", netTags: ["Red de conductores conectada en tiempo real", "Confirmación rápida", "El vehículo justo para tu grupo"],
    plusH: "Lo que incluye",
    plus: ["Recogida con tu nombre en el aeropuerto o el puerto", "Seguimiento de tu vuelo: si se retrasa, te esperamos", "Vehículos de alta gama con aire acondicionado", "Espacio para el equipaje de todo el grupo", "Disponible las 24 horas, también para noches de club", "Precio cerrado antes de reservar, sin sorpresas"],
    formH: "Pide tu transfer",
    formP: "Rellena el formulario: te respondemos con el vehículo que mejor te encaja con el precio cerrado.",
    from: "Recogida", to: "Destino", date: "Día", time: "Hora", pax: "Personas", bags: "Maletas grandes", flight: "Nº de vuelo o barco (opcional)", ret: "También la vuelta", rdate: "Día de vuelta", rtime: "Hora de vuelta", kids: "Sillas infantiles", notes: "Algo más (paradas, horas de espera…)", name: "Tu nombre",
    phFrom: "Aeropuerto de Ibiza, tu villa, un club…", phTo: "Tu hotel, villa, restaurante…",
    places: ["Aeropuerto de Ibiza", "Puerto de Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Te recomiendo una ${n}`, sugMany: "Para un grupo así coordinamos varios vehículos",
    sizes: { 4: "hasta 4 personas", 7: "hasta 7 personas", 8: "hasta 8 personas", 18: "hasta 18 personas" },
    send: "Enviar solicitud", close: "Cerrar", need: "Indica al menos recogida, destino y día",
    msg: "Hola Mey Society, quiero un transfer privado", yes: "sí",
  },
  en: {
    kicker: "Private transfers · Ibiza",
    title: ["In Ibiza, getting there on time", "is part of the plan."],
    lead: "In summer the island fills up and taxis can't keep up: queues at the airport, long waits outside the clubs and dinners that start late because nobody came to pick you up. With a private driver, your car is already waiting.",
    whyH: "Sound familiar?",
    cases: [
      ["You land at 1 a.m.", "6 friends, 8 suitcases and no taxi available. A driver with your name at the door."],
      ["You leave the club at 6 a.m.", "Thousands of people waiting in a taxi queue that won't move. Your transfer is parked outside and drops you at your door."],
      ["Dinner in the north, party in the south", "Nobody wants to drive that night. One driver takes you, waits and brings you back."],
    ],
    netH: "There's always a van for you",
    net: "I don't rely on a single fleet. I work with a network of the island's private drivers, connected in real time: when you message me, I know at once which vehicle is free at the time you need it and I confirm it. High season, a closing Sunday or 5 a.m.:", netEnd: "I find the vehicle that fits you", netTags: ["Driver network connected in real time", "Fast confirmation", "The right vehicle for your group"],
    plusH: "What's included",
    plus: ["Meet and greet with your name at the airport or port", "Flight tracking: if it's late, we wait", "High-end, air-conditioned vehicles", "Room for the whole group's luggage", "Available 24 hours, club nights included", "Fixed price before you book, no surprises"],
    formH: "Request your transfer",
    formP: "Fill in the form: we reply with the vehicle that suits you best, at a fixed price.",
    from: "Pick-up", to: "Destination", date: "Day", time: "Time", pax: "People", bags: "Large suitcases", flight: "Flight or ferry number (optional)", ret: "Return trip too", rdate: "Return day", rtime: "Return time", kids: "Child seats", notes: "Anything else (stops, waiting time…)", name: "Your name",
    phFrom: "Ibiza Airport, your villa, a club…", phTo: "Your hotel, villa, restaurant…",
    places: ["Ibiza Airport", "Ibiza Port", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `I recommend a ${n}`, sugMany: "For a group this size we coordinate several vehicles",
    sizes: { 4: "up to 4 people", 7: "up to 7 people", 8: "up to 8 people", 18: "up to 18 people" },
    send: "Send request", close: "Close", need: "Please add at least pick-up, destination and day",
    msg: "Hi Mey Society, I'd like a private transfer", yes: "yes",
  },
  it: {
    kicker: "Transfer privati · Ibiza",
    title: ["A Ibiza, arrivare in orario", "fa parte del piano."],
    lead: "D'estate l'isola si riempie e i taxi non bastano: code all'aeroporto, attese all'uscita dei club e cene che iniziano tardi perché nessuno è venuto a prenderti. Con un autista privato, la tua auto ti sta già aspettando.",
    whyH: "Ti suona familiare?",
    cases: [
      ["Atterri all'1:00", "6 amici, 8 valigie e nessun taxi disponibile. Un autista con il tuo nome alla porta."],
      ["Esci dal club alle 6:00", "Migliaia di persone in coda per un taxi che non arriva. Il tuo transfer è parcheggiato fuori e ti lascia alla porta del tuo alloggio."],
      ["Cena al nord, festa al sud", "Nessuno vuole guidare quella sera. Un solo autista vi porta, aspetta e vi riporta."],
    ],
    netH: "C'è sempre un van per te",
    net: "Non dipendo da una sola flotta. Lavoro con una rete di autisti privati dell'isola collegati tra loro in tempo reale: quando mi scrivi, so subito quale veicolo è libero all'ora che ti serve e te lo confermo. Alta stagione, domenica di closing o le 5 del mattino:", netEnd: "Ti trovo il veicolo giusto per te", netTags: ["Rete di autisti collegata in tempo reale", "Conferma rapida", "Il veicolo giusto per il tuo gruppo"],
    plusH: "Cosa include",
    plus: ["Accoglienza con il tuo nome in aeroporto o al porto", "Monitoraggio del volo: se ritarda, ti aspettiamo", "Veicoli di alta gamma con aria condizionata", "Spazio per i bagagli di tutto il gruppo", "Disponibile 24 ore, anche per le notti in club", "Prezzo chiuso prima di prenotare, senza sorprese"],
    formH: "Richiedi il tuo transfer",
    formP: "Compila il modulo: ti rispondiamo con il veicolo più adatto a te, a prezzo chiuso.",
    from: "Partenza", to: "Destinazione", date: "Giorno", time: "Ora", pax: "Persone", bags: "Valigie grandi", flight: "Numero di volo o traghetto (facoltativo)", ret: "Anche il ritorno", rdate: "Giorno del ritorno", rtime: "Ora del ritorno", kids: "Seggiolini per bambini", notes: "Altro (fermate, attese…)", name: "Il tuo nome",
    phFrom: "Aeroporto di Ibiza, la tua villa, un club…", phTo: "Il tuo hotel, villa, ristorante…",
    places: ["Aeroporto di Ibiza", "Porto di Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Ti consiglio una ${n}`, sugMany: "Per un gruppo così coordiniamo più veicoli",
    sizes: { 4: "4 persone", 7: "7 persone", 8: "8 persone", 18: "18 persone" },
    send: "Invia richiesta", close: "Chiudi", need: "Indica almeno partenza, destinazione e giorno",
    msg: "Ciao Mey Society, vorrei un transfer privato", yes: "sì",
  },
  fr: {
    kicker: "Transferts privés · Ibiza",
    title: ["À Ibiza, arriver à l'heure", "fait partie du plan."],
    lead: "L'été, l'île se remplit et les taxis ne suivent pas : files à l'aéroport, attentes à la sortie des clubs et dîners qui commencent tard parce que personne n'est venu vous chercher. Avec un chauffeur privé, votre voiture vous attend déjà.",
    whyH: "Ça vous parle ?",
    cases: [
      ["Vous atterrissez à 1 h", "6 amis, 8 valises et aucun taxi disponible. Un chauffeur avec votre nom à la porte."],
      ["Vous sortez du club à 6 h", "Des milliers de personnes dans une file de taxis qui n'avance pas. Votre transfert est garé devant et vous dépose à la porte de votre logement."],
      ["Dîner au nord, fête au sud", "Personne ne veut conduire ce soir-là. Un seul chauffeur vous emmène, attend et vous ramène."],
    ],
    netH: "Il y a toujours un van pour vous",
    net: "Je ne dépends pas d'une seule flotte. Je travaille avec un réseau de chauffeurs privés de l'île connectés en temps réel : quand vous m'écrivez, je sais aussitôt quel véhicule est libre à l'heure voulue et je vous le confirme. Haute saison, dimanche de closing ou 5 h du matin :", netEnd: "Je vous trouve le véhicule qui vous correspond", netTags: ["Réseau de chauffeurs connecté en temps réel", "Confirmation rapide", "Le bon véhicule pour votre groupe"],
    plusH: "Ce qui est inclus",
    plus: ["Accueil avec votre nom à l'aéroport ou au port", "Suivi du vol : s'il a du retard, on vous attend", "Véhicules haut de gamme climatisés", "De la place pour les bagages de tout le groupe", "Disponible 24 h/24, soirées en club comprises", "Prix fixé avant de réserver, sans surprise"],
    formH: "Demandez votre transfert",
    formP: "Remplissez le formulaire : nous vous répondons avec le véhicule qui vous convient le mieux, à prix fixe.",
    from: "Prise en charge", to: "Destination", date: "Jour", time: "Heure", pax: "Personnes", bags: "Grandes valises", flight: "N° de vol ou de ferry (facultatif)", ret: "Le retour aussi", rdate: "Jour du retour", rtime: "Heure du retour", kids: "Sièges enfants", notes: "Autre chose (arrêts, attente…)", name: "Votre nom",
    phFrom: "Aéroport d'Ibiza, votre villa, un club…", phTo: "Votre hôtel, villa, restaurant…",
    places: ["Aéroport d'Ibiza", "Port d'Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Je vous recommande un ${n}`, sugMany: "Pour un groupe de cette taille, nous coordonnons plusieurs véhicules",
    sizes: { 4: "jusqu'à 4 personnes", 7: "jusqu'à 7 personnes", 8: "jusqu'à 8 personnes", 18: "jusqu'à 18 personnes" },
    send: "Envoyer la demande", close: "Fermer", need: "Indiquez au moins la prise en charge, la destination et le jour",
    msg: "Bonjour Mey Society, je souhaite un transfert privé", yes: "oui",
  },
  de: {
    kicker: "Private Transfers · Ibiza",
    title: ["Auf Ibiza gehört pünktliches Ankommen", "zum Plan."],
    lead: "Im Sommer ist die Insel voll und die Taxis kommen nicht hinterher: Schlangen am Flughafen, Warten vor den Clubs und Dinner, die spät beginnen, weil dich niemand abgeholt hat. Mit einem privaten Fahrer wartet dein Wagen schon.",
    whyH: "Kommt dir bekannt vor?",
    cases: [
      ["Landung um 1 Uhr", "6 Freunde, 8 Koffer und kein Taxi frei. Ein Fahrer mit deinem Namen an der Tür."],
      ["Um 6 Uhr aus dem Club", "Tausende warten in einer Taxischlange, die sich nicht bewegt. Dein Transfer parkt draußen und bringt dich bis vor deine Unterkunft."],
      ["Dinner im Norden, Party im Süden", "Niemand will an dem Abend fahren. Ein Fahrer bringt euch hin, wartet und fährt euch zurück."],
    ],
    netH: "Es gibt immer einen Van für dich",
    net: "Ich hänge nicht an einer einzigen Flotte. Ich arbeite mit einem Netzwerk privater Fahrer der Insel, in Echtzeit verbunden: Wenn du mir schreibst, weiß ich sofort, welches Fahrzeug zu deiner Uhrzeit frei ist, und bestätige es dir. Hochsaison, Closing-Sonntag oder 5 Uhr morgens:", netEnd: "Ich finde das Fahrzeug, das zu dir passt", netTags: ["Fahrernetzwerk in Echtzeit verbunden", "Schnelle Bestätigung", "Das richtige Fahrzeug für deine Gruppe"],
    plusH: "Was dabei ist",
    plus: ["Abholung mit Namensschild am Flughafen oder Hafen", "Flugverfolgung: Bei Verspätung warten wir", "Hochwertige, klimatisierte Fahrzeuge", "Platz für das Gepäck der ganzen Gruppe", "Rund um die Uhr, auch in Clubnächten", "Festpreis vor der Buchung, ohne Überraschungen"],
    formH: "Transfer anfragen",
    formP: "Füll das Formular aus: Wir antworten mit dem Fahrzeug, das am besten zu dir passt, zum Festpreis.",
    from: "Abholung", to: "Ziel", date: "Tag", time: "Uhrzeit", pax: "Personen", bags: "Große Koffer", flight: "Flug- oder Fährnummer (optional)", ret: "Auch die Rückfahrt", rdate: "Tag der Rückfahrt", rtime: "Uhrzeit der Rückfahrt", kids: "Kindersitze", notes: "Sonst noch etwas (Stopps, Wartezeit…)", name: "Dein Name",
    phFrom: "Flughafen Ibiza, deine Villa, ein Club…", phTo: "Dein Hotel, Villa, Restaurant…",
    places: ["Flughafen Ibiza", "Hafen Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Ich empfehle dir einen ${n}`, sugMany: "Für eine so große Gruppe koordinieren wir mehrere Fahrzeuge",
    sizes: { 4: "bis zu 4 Personen", 7: "bis zu 7 Personen", 8: "bis zu 8 Personen", 18: "bis zu 18 Personen" },
    send: "Anfrage senden", close: "Schließen", need: "Bitte mindestens Abholung, Ziel und Tag angeben",
    msg: "Hallo Mey Society, ich möchte einen privaten Transfer", yes: "ja",
  },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
/* what the transfer includes, as a floating panel that ticks itself off line by line: a ring draws round each
   circle, it fills green with a small burst, the line lights up, the counter and the bar keep pace, and when the
   last one lands the whole panel glows "all included" */
/* the three moments every visitor recognises, told as before and after: what happens on your own (it is crossed
   out as you read), then what happens with us, lit in green, and the way straight to the form */
const SIT_ICON = [
  '<path d="M2.5 19.5h19M3.8 13.6l3 1.2 4.6-1.6-5.4-6.4 2-.8 7.6 5 4.2-1.6a1.6 1.6 0 0 1 1.2 3l-14.4 5.4-3.4-3.4Z"/>',
  '<path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"/><path d="M15.5 4.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z"/>',
  '<path d="M3.5 15.5v-3l2-5.2A2 2 0 0 1 7.4 6h9.2a2 2 0 0 1 1.9 1.3l2 5.2v3a1 1 0 0 1-1 1h-1.2"/><path d="M5.7 16.5H4.5a1 1 0 0 1-1-1M9 16.5h6"/><circle cx="7.4" cy="16.5" r="1.8"/><circle cx="16.6" cy="16.5" r="1.8"/><path d="M4.2 12h15.6"/>'];
function situations(t, x, uid) {
  const e = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const split = p => { const i = p.indexOf(". "); if (i < 0) return [p, ""]; const good = p.slice(i + 2).replace(/^(O|Or|Oppure|Ou|Oder)\s+/, ""); return [p.slice(0, i + 1), good.charAt(0).toUpperCase() + good.slice(1)]; };
  return `<ol class="trs">${t.cases.map(([h, p], k) => { const [bad, good] = split(p); return `<li style="--k:${k}">
    <div class="trs__top"><span class="trs__no">${String(k + 1).padStart(2, "0")}</span><span class="trs__ico" aria-hidden="true"><svg viewBox="0 0 24 24">${SIT_ICON[k] || SIT_ICON[0]}</svg></span></div>
    <b class="trs__h">${e(h)}</b>
    <div class="trs__row trs__row--bad"><span class="trs__tag"><i aria-hidden="true">✕</i>${e(x.own || "")}</span><p><span class="trs__strike">${e(bad)}</span></p></div>
    <div class="trs__row trs__row--good"><span class="trs__tag"><i aria-hidden="true">✓</i>${e(x.with || "")}</span><p>${e(good)}</p></div></li>`; }).join("")}</ol>`;
}
function checklist(t, x) {
  const items = [...t.netTags, ...t.plus]; if (items.length > 1) items.push(items.splice(items.length - 2, 1)[0]);   // the 24 h line goes last
  const n = items.length, e = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  return `<div class="trc" style="--n:${n}"><div class="trc__in">
    <div class="trc__head"><span class="trc__label">${e(t.plusH)}</span><span class="trc__count" aria-hidden="true"><b>0</b>/${n}</span></div>
    <div class="trc__bar" aria-hidden="true"><i></i></div>
    <ul class="trc__list">${items.map((v, k) => `<li style="--i:${k}"><span class="trc__tick" aria-hidden="true"><svg viewBox="0 0 28 28"><circle class="trc__ring" cx="14" cy="14" r="11.5"/><circle class="trc__fill" cx="14" cy="14" r="11.5"/><path d="M8.8 14.4l3.6 3.6 7-7.6"/></svg><i class="trc__burst"></i></span><span class="trc__txt">${e(v)}</span></li>`).join("")}</ul>
    <p class="trc__done"><span>${e(x.allIn || "Todo incluido")}</span></p>
  </div></div>`;
}
const sizeFor = (pax, bags) => { const load = pax + Math.max(0, bags - pax) * .5; return load <= 4 && bags <= 4 ? 4 : load <= 7 ? 7 : load <= 8 ? 8 : load <= 18 ? 18 : 0; };

/* extra copy for the page as it sits under the vehicles: a promise strip, how it works, and the jump to the form */
const X = {
  es: { own: "Por tu cuenta", with: "Con Mey", allIn: "Todo incluido, sin sorpresas", trust: ["Precio cerrado antes de reservar", "Seguimiento de tu vuelo", "Chófer con tu nombre en llegadas", "Disponible 24 h"],
    howH: "Así de fácil", steps: [["Cuéntanos el trayecto", "Recogida, destino, día y cuántos sois. Lo que no sepas aún, déjalo en blanco."], ["Te confirmamos vehículo y precio", "Te respondemos con el vehículo que encaja con tu grupo y un precio cerrado, sin sorpresas."], ["Tu chófer te espera", "Puntual, con tu nombre, el equipaje a bordo y directo a tu destino."]],
    jump: "Pedir mi transfer", closing: "Aterriza, sal del club o vuelve de cenar sin pensar en cómo llegar: de eso nos ocupamos nosotros." },
  en: { own: "On your own", with: "With Mey", allIn: "All included, no surprises", trust: ["Fixed price before you book", "Flight tracking", "Driver with your name at arrivals", "Available 24 h"],
    howH: "As easy as this", steps: [["Tell us the trip", "Pick-up, destination, day and how many you are. Leave blank whatever you don't know yet."], ["We confirm vehicle and price", "We reply with the vehicle that fits your group and a fixed price, no surprises."], ["Your driver is waiting", "On time, with your name, luggage on board and straight to your destination."]],
    jump: "Request my transfer", closing: "Land, leave the club or head home from dinner without thinking about how to get there: we take care of that." },
  it: { own: "Da solo", with: "Con Mey", allIn: "Tutto incluso, senza sorprese", trust: ["Prezzo chiuso prima di prenotare", "Monitoraggio del volo", "Autista con il tuo nome agli arrivi", "Disponibile 24 h"],
    howH: "Facile così", steps: [["Raccontaci il tragitto", "Partenza, destinazione, giorno e quanti siete. Ciò che non sai ancora, lascialo vuoto."], ["Ti confermiamo veicolo e prezzo", "Ti rispondiamo con il veicolo adatto al tuo gruppo e un prezzo chiuso, senza sorprese."], ["Il tuo autista ti aspetta", "Puntuale, con il tuo nome, i bagagli a bordo e dritto a destinazione."]],
    jump: "Richiedi il mio transfer", closing: "Atterra, esci dal club o torna da cena senza pensare a come arrivare: a questo pensiamo noi." },
  fr: { own: "Seul", with: "Avec Mey", allIn: "Tout compris, sans surprise", trust: ["Prix fixe avant de réserver", "Suivi de votre vol", "Chauffeur avec votre nom à l'arrivée", "Disponible 24 h/24"],
    howH: "Aussi simple que ça", steps: [["Dites-nous le trajet", "Prise en charge, destination, jour et nombre de personnes. Ce que vous ne savez pas encore, laissez-le vide."], ["Nous confirmons véhicule et prix", "Nous répondons avec le véhicule adapté à votre groupe et un prix fixe, sans surprise."], ["Votre chauffeur vous attend", "À l'heure, avec votre nom, les bagages à bord et direct à destination."]],
    jump: "Demander mon transfert", closing: "Atterrissez, sortez du club ou rentrez du dîner sans penser au trajet : on s'en occupe." },
  de: { own: "Auf eigene Faust", with: "Mit Mey", allIn: "Alles inklusive, ohne Überraschungen", trust: ["Festpreis vor der Buchung", "Flugverfolgung", "Fahrer mit Namensschild bei der Ankunft", "Rund um die Uhr"],
    howH: "So einfach geht's", steps: [["Sag uns die Strecke", "Abholung, Ziel, Tag und wie viele ihr seid. Was du noch nicht weißt, lass einfach frei."], ["Wir bestätigen Fahrzeug und Preis", "Wir antworten mit dem passenden Fahrzeug für deine Gruppe und einem Festpreis, ohne Überraschungen."], ["Dein Fahrer wartet", "Pünktlich, mit deinem Namen, Gepäck an Bord und direkt ans Ziel."]],
    jump: "Meinen Transfer anfragen", closing: "Lande, verlass den Club oder komm vom Dinner zurück, ohne an den Weg zu denken: Darum kümmern wir uns." },
};

/* The page lives under the transfer vehicles in the fleet gallery: mount() draws it into the given element. */
let UID = 0;
/* compact: only the request form (with the promise strip), for the home page */
export function initTransferPage({ onSend, compact = false } = {}) {
  let root = null, preset = 0; const uid = `tr${++UID}`;
  const tx = () => T[getLang()] || T.es, xx = () => X[getLang()] || X.es;
  const today = new Date().toISOString().slice(0, 10);
  const build = () => {
    const t = tx(), x = xx();
    const form = `<form class="tr__form" novalidate>
          <datalist id="${uid}Places">${t.places.map(p => `<option value="${esc(p)}">`).join("")}</datalist>
          <label class="tr__w2"><span>${esc(t.from)}</span><input name="from" list="${uid}Places" placeholder="${esc(t.phFrom)}" autocomplete="off"></label>
          <label class="tr__w2"><span>${esc(t.to)}</span><input name="to" list="${uid}Places" placeholder="${esc(t.phTo)}" autocomplete="off"></label>
          <label><span>${esc(t.date)}</span><input name="date" type="date" min="${today}"></label>
          <label><span>${esc(t.time)}</span><input name="time" type="time"></label>
          <label><span>${esc(t.pax)}</span><input name="pax" type="number" min="1" max="40" value="${preset || 2}" inputmode="numeric"></label>
          <label><span>${esc(t.bags)}</span><input name="bags" type="number" min="0" max="40" value="2" inputmode="numeric"></label>
          <label class="tr__w2"><span>${esc(t.flight)}</span><input name="flight" autocomplete="off"></label>
          <label class="tr__check tr__w2"><input name="ret" type="checkbox"><span>${esc(t.ret)}</span></label>
          <label class="tr__ret" hidden><span>${esc(t.rdate)}</span><input name="rdate" type="date" min="${today}"></label>
          <label class="tr__ret" hidden><span>${esc(t.rtime)}</span><input name="rtime" type="time"></label>
          <label><span>${esc(t.kids)}</span><input name="kids" type="number" min="0" max="6" value="0" inputmode="numeric"></label>
          <label><span>${esc(t.name)}</span><input name="name" autocomplete="name"></label>
          <label class="tr__w2"><span>${esc(t.notes)}</span><textarea name="notes" rows="2"></textarea></label>
          <p class="tr__sug tr__w2" aria-live="polite"></p>
          <p class="tr__err tr__w2" role="alert" hidden>${esc(t.need)}</p>
          <button type="submit" class="btn btn--primary btn--lg tr__w2">${esc(t.send)}</button>
        </form>`;
    root.innerHTML = compact ? `
      <div class="tr__content">
      <header class="tr__hero tr__hero--home">
        <p class="eyebrow eyebrow--light">${esc(t.kicker)}</p>
        <h2 class="display display--md">${esc(t.formH)}</h2>
        <p class="tr__lead">${esc(t.formP)}</p>
        ${checklist(t, x)}
      </header>
      <section class="tr__sec tr__formsec" id="${uid}Form">${form}<p class="tr__closing">${esc(x.closing)}</p></section>
      </div>` : `
      <div class="tr__content">
      <header class="tr__hero">
        <p class="tr__kicker">${esc(t.kicker)}</p>
        <h2 class="tr__title">${esc(t.title[0])} <em>${esc(t.title[1])}</em></h2>
        <p class="tr__lead">${esc(t.lead)}</p>
        ${checklist(t, x)}
        <a class="btn btn--primary tr__jump" href="#${uid}Form">${esc(x.jump)}</a>
      </header>
      <section class="tr__sec"><h3>${esc(t.whyH)}</h3>
        ${situations(t, x, uid)}</section>
      <section class="tr__sec tr__net"><h3>${esc(t.netH)}</h3><p class="tr__p tr__netp">${esc(t.net)}</p>${t.netEnd ? `<p class="tr__netend">${esc(t.netEnd)}</p>` : ""}</section>
      <section class="tr__sec"><h3>${esc(x.howH)}</h3>
        <ol class="tr__steps">${x.steps.map(([h, p], k) => `<li><span>${k + 1}</span><div><b>${esc(h)}</b><p>${esc(p)}</p></div></li>`).join("")}</ol></section>
      <section class="tr__sec tr__formsec" id="${uid}Form"><h3>${esc(t.formH)}</h3><p class="tr__p">${esc(t.formP)}</p>
        ${form}
        <p class="tr__closing">${esc(x.closing)}</p></section>
      </div>`;
    suggest();
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { root: root.closest(".fleet") || null, threshold: .12 });
    root.querySelectorAll(".tr__sec, .tr__hero").forEach(el => io.observe(el));
    // the checklist ticks itself line by line when the list is really in view
    const ck = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { runChecklist(en.target); ck.unobserve(en.target); } }), { root: root.closest(".fleet") || null, threshold: .3 });
    root.querySelectorAll(".trc").forEach(el => ck.observe(el));
  };
  function runChecklist(box) {
    const n = +getComputedStyle(box).getPropertyValue("--n") || box.querySelectorAll("li").length, b = box.querySelector(".trc__count b");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { box.classList.add("is-in", "is-done"); b.textContent = n; return; }
    box.classList.add("is-in");
    // the same rhythm as the CSS: the first tick lands at 0.75 s, then one every 0.32 s
    for (let k = 1; k <= n; k++) setTimeout(() => { b.textContent = k; box.style.setProperty("--p", k / n); }, 750 + (k - 1) * 320 + 260);
    setTimeout(() => box.classList.add("is-done"), 750 + (n - 1) * 320 + 700);
  }
  function suggest() {
    const t = tx(), f = root.querySelector("form"), pax = +f.pax.value || 1, bags = +f.bags.value || 0;
    const fit = sizeFor(pax, bags), n = fit && preset >= fit ? preset : fit;   // the size picked in the menu, unless the group has outgrown it
    // the actual vehicle: the smallest of ours that takes the group (and its bags)
    const van = n && FLEET.filter(v => v.type === "transfer" && v.pax >= n).sort((x, y) => x.pax - y.pax)[0];
    root.querySelector(".tr__sug").innerHTML = `<i aria-hidden="true"></i>${esc(van ? t.sug(van.name) : n ? t.sug(t.sizes[n]) : t.sugMany)}`;
    return n;
  }
  const wire = () => {
    root.addEventListener("input", e => { if (e.target.name === "pax" || e.target.name === "bags") suggest(); });
    root.addEventListener("change", e => { if (e.target.name === "ret") root.querySelectorAll(".tr__ret").forEach(l => l.hidden = !e.target.checked); });
    root.addEventListener("click", e => { if (e.target.closest(".tr__jump, .trs__cta")) { e.preventDefault(); scrollToForm(); } });
    root.addEventListener("submit", e => {
      e.preventDefault(); const t = tx(), f = e.target, v = k => (f[k].value || "").trim();
      if (!v("from") || !v("to") || !v("date")) { root.querySelector(".tr__err").hidden = false; f[!v("from") ? "from" : !v("to") ? "to" : "date"].focus(); return; }
      const n = suggest();
      const lines = [t.msg, `${t.from}: ${v("from")}`, `${t.to}: ${v("to")}`, `${t.date}: ${v("date")}${v("time") ? " · " + v("time") : ""}`,
        `${t.pax}: ${v("pax")} · ${t.bags}: ${v("bags")}`, n ? t.sug(t.sizes[n]) : t.sugMany,
        v("flight") && `${t.flight.replace(/ \(.*\)/, "")}: ${v("flight")}`,
        f.ret.checked && `${t.ret}: ${t.yes}${v("rdate") ? " · " + v("rdate") : ""}${v("rtime") ? " · " + v("rtime") : ""}`,
        +v("kids") > 0 && `${t.kids}: ${v("kids")}`, v("notes") && `${t.notes.replace(/ \(.*\)/, "")}: ${v("notes")}`, v("name") && `${t.name}: ${v("name")}`].filter(Boolean);
      onSend?.({ text: lines.join("\n"), from: v("date"), people: +v("pax") || 1 });
    });
  };
  /* draws the page into host (once per language), with the group size chosen in the menu or the chips */
  function mount(host, size = 0) {
    preset = [4, 7, 8, 18].includes(size) ? size : 0;
    if (!root || root.parentElement !== host) { root?.remove(); root = document.createElement("div"); root.className = "tr"; host.appendChild(root); wire(); }
    if (root.dataset.lang !== getLang()) { root.dataset.lang = getLang(); build(); }
    setPreset(preset);
  }
  function setPreset(size) {
    preset = [4, 7, 8, 18].includes(size) ? size : 0;
    if (!root) return; const f = root.querySelector("form");
    if (preset) f.pax.value = preset;
    suggest();
  }
  function scrollToForm() {
    const el = root?.querySelector(`#${uid}Form`), sc = root?.closest(".fleet"); if (!el) return;
    if (!sc) return el.scrollIntoView({ behavior: "smooth", block: "start" });
    const y = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16;
    sc.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  document.addEventListener("langchange", () => { if (root?.isConnected) { root.dataset.lang = getLang(); build(); setPreset(preset); } });
  return { mount, setPreset, scrollToForm };
}
