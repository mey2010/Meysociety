/* Transfers — a full-screen page: why a private driver matters in Ibiza (with real-life moments the visitor will
   recognise), then a short request form: from, to, day, time, group, luggage, flight, return. As the group and the
   luggage are filled in, the right vehicle size is suggested (up to 7, 8 or 18 people). The request goes straight to
   the concierge (WhatsApp when set, otherwise the contact form) with everything the fleet needs to quote. */
import { getLang } from "./i18n.js";

const T = {
  es: {
    kicker: "Transfers privados · Ibiza",
    title: ["En Ibiza, llegar", "también es parte del plan."],
    lead: "En verano la isla se llena y los taxis no dan abasto: colas en el aeropuerto, esperas a la salida de los clubs y cenas que empiezan tarde porque nadie viene a buscarte. Con un chófer privado, tu coche ya te está esperando.",
    whyH: "Te suena alguna de estas",
    cases: [
      ["Aterrizas a la 1:00", "Seis amigos, ocho maletas y una cola de taxis que no avanza. O un conductor con tu nombre en la puerta de llegadas y la nevera con agua fría."],
      ["Sales del club a las 6:00", "Miles de personas buscando lo mismo que tú a la vez. Tu furgoneta está aparcada fuera y te deja en la puerta de la villa."],
      ["Cena en el norte, fiesta en el sur", "Nadie quiere ser el conductor esa noche. Un mismo chófer os lleva, espera y os trae de vuelta."],
    ],
    netH: "Siempre hay una van para ti",
    net: "No dependo de una sola flota. Trabajo con una red de conductores privados de la isla conectados entre sí en tiempo real: cuando me escribes, sé al momento qué vehículo está libre a la hora que lo necesitas y te lo confirmo. Temporada alta, domingo de closing o las 5 de la mañana: te encuentro el que encaja con tu grupo.", netTags: ["Red de conductores conectada en tiempo real", "Confirmación rápida", "El vehículo justo para tu grupo"],
    plusH: "Lo que incluye",
    plus: ["Recogida con tu nombre en el aeropuerto o el puerto", "Seguimiento de tu vuelo: si se retrasa, te esperamos", "Vehículos de alta gama con aire acondicionado", "Espacio para el equipaje de todo el grupo", "Disponible las 24 horas, también para noches de club", "Precio cerrado antes de reservar, sin sorpresas"],
    formH: "Pide tu transfer",
    formP: "Rellena lo que sepas: te respondemos con el vehículo que mejor encaja y el precio cerrado.",
    from: "Recogida", to: "Destino", date: "Día", time: "Hora", pax: "Personas", bags: "Maletas grandes", flight: "Nº de vuelo o barco (opcional)", ret: "También la vuelta", rdate: "Día de vuelta", rtime: "Hora de vuelta", kids: "Sillas infantiles", notes: "Algo más (paradas, horas de espera…)", name: "Tu nombre",
    phFrom: "Aeropuerto de Ibiza, tu villa, un club…", phTo: "Tu hotel, villa, restaurante…",
    places: ["Aeropuerto de Ibiza", "Puerto de Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Te recomendamos un vehículo de ${n}`, sugMany: "Para un grupo así coordinamos varios vehículos",
    sizes: { 7: "hasta 7 personas", 8: "hasta 8 personas", 18: "hasta 18 personas" },
    send: "Enviar solicitud", close: "Cerrar", need: "Indica al menos recogida, destino y día",
    msg: "Hola Mey Society, quiero un transfer privado", yes: "sí",
  },
  en: {
    kicker: "Private transfers · Ibiza",
    title: ["In Ibiza, getting there", "is part of the plan."],
    lead: "In summer the island fills up and taxis can't keep up: queues at the airport, long waits outside the clubs and dinners that start late because nobody came to pick you up. With a private driver, your car is already waiting.",
    whyH: "Sound familiar?",
    cases: [
      ["You land at 1 a.m.", "Six friends, eight suitcases and a taxi queue that won't move. Or a driver with your name at arrivals and cold water in the fridge."],
      ["You leave the club at 6 a.m.", "Thousands of people looking for the same thing at the same time. Your van is parked outside and drops you at the villa door."],
      ["Dinner in the north, party in the south", "Nobody wants to drive that night. One driver takes you, waits and brings you back."],
    ],
    netH: "There's always a van for you",
    net: "I don't rely on a single fleet. I work with a network of the island's private drivers, connected in real time: when you message me, I know at once which vehicle is free at the time you need it and I confirm it. High season, a closing Sunday or 5 a.m.: I find the one that fits your group.", netTags: ["Driver network connected in real time", "Fast confirmation", "The right vehicle for your group"],
    plusH: "What's included",
    plus: ["Meet and greet with your name at the airport or port", "Flight tracking: if it's late, we wait", "High-end, air-conditioned vehicles", "Room for the whole group's luggage", "Available 24 hours, club nights included", "Fixed price before you book, no surprises"],
    formH: "Request your transfer",
    formP: "Fill in what you know: we reply with the vehicle that fits best and a fixed price.",
    from: "Pick-up", to: "Destination", date: "Day", time: "Time", pax: "People", bags: "Large suitcases", flight: "Flight or ferry number (optional)", ret: "Return trip too", rdate: "Return day", rtime: "Return time", kids: "Child seats", notes: "Anything else (stops, waiting time…)", name: "Your name",
    phFrom: "Ibiza Airport, your villa, a club…", phTo: "Your hotel, villa, restaurant…",
    places: ["Ibiza Airport", "Ibiza Port", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `We suggest a vehicle for ${n}`, sugMany: "For a group this size we coordinate several vehicles",
    sizes: { 7: "up to 7 people", 8: "up to 8 people", 18: "up to 18 people" },
    send: "Send request", close: "Close", need: "Please add at least pick-up, destination and day",
    msg: "Hi Mey Society, I'd like a private transfer", yes: "yes",
  },
  it: {
    kicker: "Transfer privati · Ibiza",
    title: ["A Ibiza, arrivare", "fa parte del piano."],
    lead: "D'estate l'isola si riempie e i taxi non bastano: code all'aeroporto, attese all'uscita dei club e cene che iniziano tardi perché nessuno è venuto a prenderti. Con un autista privato, la tua auto ti sta già aspettando.",
    whyH: "Ti suona familiare?",
    cases: [
      ["Atterri all'1:00", "Sei amici, otto valigie e una coda di taxi che non si muove. Oppure un autista con il tuo nome agli arrivi e acqua fresca in frigo."],
      ["Esci dal club alle 6:00", "Migliaia di persone cercano la stessa cosa nello stesso momento. Il tuo van è parcheggiato fuori e ti lascia alla porta della villa."],
      ["Cena al nord, festa al sud", "Nessuno vuole guidare quella sera. Un solo autista vi porta, aspetta e vi riporta."],
    ],
    netH: "C'è sempre un van per te",
    net: "Non dipendo da una sola flotta. Lavoro con una rete di autisti privati dell'isola collegati tra loro in tempo reale: quando mi scrivi, so subito quale veicolo è libero all'ora che ti serve e te lo confermo. Alta stagione, domenica di closing o le 5 del mattino: trovo quello giusto per il tuo gruppo.", netTags: ["Rete di autisti collegata in tempo reale", "Conferma rapida", "Il veicolo giusto per il tuo gruppo"],
    plusH: "Cosa include",
    plus: ["Accoglienza con il tuo nome in aeroporto o al porto", "Monitoraggio del volo: se ritarda, ti aspettiamo", "Veicoli di alta gamma con aria condizionata", "Spazio per i bagagli di tutto il gruppo", "Disponibile 24 ore, anche per le notti in club", "Prezzo chiuso prima di prenotare, senza sorprese"],
    formH: "Richiedi il tuo transfer",
    formP: "Compila ciò che sai: ti rispondiamo con il veicolo più adatto e il prezzo chiuso.",
    from: "Partenza", to: "Destinazione", date: "Giorno", time: "Ora", pax: "Persone", bags: "Valigie grandi", flight: "Numero di volo o traghetto (facoltativo)", ret: "Anche il ritorno", rdate: "Giorno del ritorno", rtime: "Ora del ritorno", kids: "Seggiolini per bambini", notes: "Altro (fermate, attese…)", name: "Il tuo nome",
    phFrom: "Aeroporto di Ibiza, la tua villa, un club…", phTo: "Il tuo hotel, villa, ristorante…",
    places: ["Aeroporto di Ibiza", "Porto di Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Ti consigliamo un veicolo fino a ${n}`, sugMany: "Per un gruppo così coordiniamo più veicoli",
    sizes: { 7: "7 persone", 8: "8 persone", 18: "18 persone" },
    send: "Invia richiesta", close: "Chiudi", need: "Indica almeno partenza, destinazione e giorno",
    msg: "Ciao Mey Society, vorrei un transfer privato", yes: "sì",
  },
  fr: {
    kicker: "Transferts privés · Ibiza",
    title: ["À Ibiza, arriver", "fait partie du plan."],
    lead: "L'été, l'île se remplit et les taxis ne suivent pas : files à l'aéroport, attentes à la sortie des clubs et dîners qui commencent tard parce que personne n'est venu vous chercher. Avec un chauffeur privé, votre voiture vous attend déjà.",
    whyH: "Ça vous parle ?",
    cases: [
      ["Vous atterrissez à 1 h", "Six amis, huit valises et une file de taxis qui n'avance pas. Ou un chauffeur avec votre nom aux arrivées et de l'eau fraîche."],
      ["Vous sortez du club à 6 h", "Des milliers de personnes cherchent la même chose au même moment. Votre van est garé devant et vous dépose à la porte de la villa."],
      ["Dîner au nord, fête au sud", "Personne ne veut conduire ce soir-là. Un seul chauffeur vous emmène, attend et vous ramène."],
    ],
    netH: "Il y a toujours un van pour vous",
    net: "Je ne dépends pas d'une seule flotte. Je travaille avec un réseau de chauffeurs privés de l'île connectés en temps réel : quand vous m'écrivez, je sais aussitôt quel véhicule est libre à l'heure voulue et je vous le confirme. Haute saison, dimanche de closing ou 5 h du matin : je trouve celui qui convient à votre groupe.", netTags: ["Réseau de chauffeurs connecté en temps réel", "Confirmation rapide", "Le bon véhicule pour votre groupe"],
    plusH: "Ce qui est inclus",
    plus: ["Accueil avec votre nom à l'aéroport ou au port", "Suivi du vol : s'il a du retard, on vous attend", "Véhicules haut de gamme climatisés", "De la place pour les bagages de tout le groupe", "Disponible 24 h/24, soirées en club comprises", "Prix fixé avant de réserver, sans surprise"],
    formH: "Demandez votre transfert",
    formP: "Remplissez ce que vous savez : nous répondons avec le véhicule le plus adapté et un prix fixe.",
    from: "Prise en charge", to: "Destination", date: "Jour", time: "Heure", pax: "Personnes", bags: "Grandes valises", flight: "N° de vol ou de ferry (facultatif)", ret: "Le retour aussi", rdate: "Jour du retour", rtime: "Heure du retour", kids: "Sièges enfants", notes: "Autre chose (arrêts, attente…)", name: "Votre nom",
    phFrom: "Aéroport d'Ibiza, votre villa, un club…", phTo: "Votre hôtel, villa, restaurant…",
    places: ["Aéroport d'Ibiza", "Port d'Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Nous vous conseillons un véhicule ${n}`, sugMany: "Pour un groupe de cette taille, nous coordonnons plusieurs véhicules",
    sizes: { 7: "jusqu'à 7 personnes", 8: "jusqu'à 8 personnes", 18: "jusqu'à 18 personnes" },
    send: "Envoyer la demande", close: "Fermer", need: "Indiquez au moins la prise en charge, la destination et le jour",
    msg: "Bonjour Mey Society, je souhaite un transfert privé", yes: "oui",
  },
  de: {
    kicker: "Private Transfers · Ibiza",
    title: ["Auf Ibiza gehört das Ankommen", "zum Plan."],
    lead: "Im Sommer ist die Insel voll und die Taxis kommen nicht hinterher: Schlangen am Flughafen, Warten vor den Clubs und Dinner, die spät beginnen, weil dich niemand abgeholt hat. Mit einem privaten Fahrer wartet dein Wagen schon.",
    whyH: "Kommt dir bekannt vor?",
    cases: [
      ["Landung um 1 Uhr", "Sechs Freunde, acht Koffer und eine Taxischlange, die sich nicht bewegt. Oder ein Fahrer mit deinem Namen in der Ankunftshalle und kaltem Wasser im Kühlschrank."],
      ["Um 6 Uhr aus dem Club", "Tausende suchen gleichzeitig dasselbe. Dein Van parkt vor der Tür und bringt dich bis vor die Villa."],
      ["Dinner im Norden, Party im Süden", "Niemand will an dem Abend fahren. Ein Fahrer bringt euch hin, wartet und fährt euch zurück."],
    ],
    netH: "Es gibt immer einen Van für dich",
    net: "Ich hänge nicht an einer einzigen Flotte. Ich arbeite mit einem Netzwerk privater Fahrer der Insel, in Echtzeit verbunden: Wenn du mir schreibst, weiß ich sofort, welches Fahrzeug zu deiner Uhrzeit frei ist, und bestätige es dir. Hochsaison, Closing-Sonntag oder 5 Uhr morgens: Ich finde das passende für deine Gruppe.", netTags: ["Fahrernetzwerk in Echtzeit verbunden", "Schnelle Bestätigung", "Das richtige Fahrzeug für deine Gruppe"],
    plusH: "Was dabei ist",
    plus: ["Abholung mit Namensschild am Flughafen oder Hafen", "Flugverfolgung: Bei Verspätung warten wir", "Hochwertige, klimatisierte Fahrzeuge", "Platz für das Gepäck der ganzen Gruppe", "Rund um die Uhr, auch in Clubnächten", "Festpreis vor der Buchung, ohne Überraschungen"],
    formH: "Transfer anfragen",
    formP: "Füll aus, was du weißt: Wir antworten mit dem passenden Fahrzeug und einem Festpreis.",
    from: "Abholung", to: "Ziel", date: "Tag", time: "Uhrzeit", pax: "Personen", bags: "Große Koffer", flight: "Flug- oder Fährnummer (optional)", ret: "Auch die Rückfahrt", rdate: "Tag der Rückfahrt", rtime: "Uhrzeit der Rückfahrt", kids: "Kindersitze", notes: "Sonst noch etwas (Stopps, Wartezeit…)", name: "Dein Name",
    phFrom: "Flughafen Ibiza, deine Villa, ein Club…", phTo: "Dein Hotel, Villa, Restaurant…",
    places: ["Flughafen Ibiza", "Hafen Ibiza", "Marina Botafoch", "Marina Ibiza", "Sant Antoni", "Santa Eulària", "Platja d'en Bossa", "Ushuaïa Ibiza", "Hï Ibiza", "Pacha", "Amnesia", "[UNVRS]", "DC10"],
    sug: n => `Wir empfehlen ein Fahrzeug für ${n}`, sugMany: "Für eine so große Gruppe koordinieren wir mehrere Fahrzeuge",
    sizes: { 7: "bis zu 7 Personen", 8: "bis zu 8 Personen", 18: "bis zu 18 Personen" },
    send: "Anfrage senden", close: "Schließen", need: "Bitte mindestens Abholung, Ziel und Tag angeben",
    msg: "Hallo Mey Society, ich möchte einen privaten Transfer", yes: "ja",
  },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const sizeFor = (pax, bags) => { const load = pax + Math.max(0, bags - pax) * .5; return load <= 7 ? 7 : load <= 8 ? 8 : load <= 18 ? 18 : 0; };

export function initTransferPage({ onSend } = {}) {
  let root = null, lastFocus = null, preset = 0;
  const tx = () => T[getLang()] || T.es;
  const today = new Date().toISOString().slice(0, 10);
  const build = () => {
    const t = tx();
    root.querySelector(".tr__content").innerHTML = `
      <header class="tr__hero">
        <p class="tr__kicker">${esc(t.kicker)}</p>
        <h2 class="tr__title">${esc(t.title[0])}<br><em>${esc(t.title[1])}</em></h2>
        <p class="tr__lead">${esc(t.lead)}</p>
      </header>
      <section class="tr__sec"><h3>${esc(t.whyH)}</h3>
        <ul class="tr__cases">${t.cases.map(([h, p]) => `<li><b>${esc(h)}</b><p>${esc(p)}</p></li>`).join("")}</ul></section>
      <section class="tr__sec tr__net"><h3>${esc(t.netH)}</h3><p class="tr__p">${esc(t.net)}</p>
        <ul class="tr__tags">${t.netTags.map(x => `<li><i aria-hidden="true"></i>${esc(x)}</li>`).join("")}</ul></section>
      <section class="tr__sec"><h3>${esc(t.plusH)}</h3>
        <ul class="tr__plus">${t.plus.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
      <section class="tr__sec tr__formsec" id="trForm"><h3>${esc(t.formH)}</h3><p class="tr__p">${esc(t.formP)}</p>
        <form class="tr__form" novalidate>
          <datalist id="trPlaces">${t.places.map(p => `<option value="${esc(p)}">`).join("")}</datalist>
          <label class="tr__w2"><span>${esc(t.from)}</span><input name="from" list="trPlaces" placeholder="${esc(t.phFrom)}" autocomplete="off"></label>
          <label class="tr__w2"><span>${esc(t.to)}</span><input name="to" list="trPlaces" placeholder="${esc(t.phTo)}" autocomplete="off"></label>
          <label><span>${esc(t.date)}</span><input name="date" type="date" min="${today}"></label>
          <label><span>${esc(t.time)}</span><input name="time" type="time"></label>
          <label><span>${esc(t.pax)}</span><input name="pax" type="number" min="1" max="40" value="${preset ? Math.min(preset, 4) : 2}" inputmode="numeric"></label>
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
        </form></section>`;
    root.querySelector(".tr__x").setAttribute("aria-label", t.close);
    root.setAttribute("aria-label", t.kicker);
    if (preset) { const f = root.querySelector("form"); f.pax.value = preset; }
    suggest();
  };
  function suggest() {
    const t = tx(), f = root.querySelector("form"), pax = +f.pax.value || 1, bags = +f.bags.value || 0;
    const fit = sizeFor(pax, bags), n = fit && preset >= fit ? preset : fit;   // the size picked in the menu, unless the group has outgrown it
    root.querySelector(".tr__sug").innerHTML = `<i aria-hidden="true"></i>${esc(n ? t.sug(t.sizes[n]) : t.sugMany)}`;
    return n;
  }
  const create = () => {
    root = document.createElement("div"); root.className = "tr"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    root.innerHTML = `<div class="tr__media" aria-hidden="true"><img src="data/services/transfers.webp" alt="" decoding="async"><span class="tr__shade"></span></div>
      <div class="tr__scroll"><div class="tr__content"></div></div>
      <button type="button" class="tr__x"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    document.body.appendChild(root);
    root.querySelector(".tr__x").addEventListener("click", close);
    root.addEventListener("input", e => { if (e.target.name === "pax" || e.target.name === "bags") suggest(); });
    root.addEventListener("change", e => { if (e.target.name === "ret") root.querySelectorAll(".tr__ret").forEach(l => l.hidden = !e.target.checked); });
    root.addEventListener("submit", e => {
      e.preventDefault(); const t = tx(), f = e.target, v = k => (f[k].value || "").trim();
      if (!v("from") || !v("to") || !v("date")) { root.querySelector(".tr__err").hidden = false; f[!v("from") ? "from" : !v("to") ? "to" : "date"].focus(); return; }
      const n = suggest();
      const lines = [t.msg, `${t.from}: ${v("from")}`, `${t.to}: ${v("to")}`, `${t.date}: ${v("date")}${v("time") ? " · " + v("time") : ""}`,
        `${t.pax}: ${v("pax")} · ${t.bags}: ${v("bags")}`, n ? t.sug(t.sizes[n]) : t.sugMany,
        v("flight") && `${t.flight.replace(/ \(.*\)/, "")}: ${v("flight")}`,
        f.ret.checked && `${t.ret}: ${t.yes}${v("rdate") ? " · " + v("rdate") : ""}${v("rtime") ? " · " + v("rtime") : ""}`,
        +v("kids") > 0 && `${t.kids}: ${v("kids")}`, v("notes") && `${t.notes.replace(/ \(.*\)/, "")}: ${v("notes")}`, v("name") && `${t.name}: ${v("name")}`].filter(Boolean);
      close(); onSend?.({ text: lines.join("\n"), from: v("date"), people: +v("pax") || 1 });
    });
    addEventListener("keydown", e => { if (e.key === "Escape" && root && !root.hidden) close(); });
    document.addEventListener("langchange", () => { if (root && !root.hidden) build(); });
    const sc = root.querySelector(".tr__scroll");
    sc.addEventListener("scroll", () => root.style.setProperty("--dim", Math.min(1, sc.scrollTop / (sc.clientHeight * .8)).toFixed(3)), { passive: true });
  };
  function open(size = 0) {
    if (!root) create();
    preset = [7, 8, 18].includes(size) ? size : 0;
    build(); lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add("fx-open");
    const sc = root.querySelector(".tr__scroll"); sc.scrollTop = 0; root.style.setProperty("--dim", 0);
    if (preset) requestAnimationFrame(() => root.querySelector("#trForm").scrollIntoView({ block: "start" }));
    requestAnimationFrame(() => root.querySelector(".tr__x").focus({ preventScroll: true }));
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; document.documentElement.classList.remove("fx-open");
    lastFocus?.focus?.({ preventScroll: true });
  }
  return { open, close };
}
