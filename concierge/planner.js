/* "Diseña tu semana en Ibiza": four quick steps (dates, group, style, must-haves) and the page draws a day-by-day
   plan built only from Mey Society's own services, each one a tap away, with the guestlists it unlocks. The plan goes
   to the concierge in one message. Nothing here is a price or a promise of availability: it is a proposal to confirm. */
import { getLang } from "./i18n.js";

const L = {
  es: {
    musicQ: "¿Qué música os gusta? (una o varias)", errMusic: "Elige al menos un tipo de música.",
    music: { techno: "Techno", techhouse: "Tech house", house: "House", afro: "Afro house", melodic: "Melodic techno", edm: "EDM", commercial: "Comercial y reggaeton", hiphop: "Hip hop y R&B", disco: "Disco y funk", any: "Nos vale todo" },
    clubT: n => `Noche en ${n} con mesa VIP`, clubD: (g, near) => `Su música va con lo vuestro: ${g}.${near ? " Queda cerca de vuestro plan de ese día." : ""} Te confirmamos la fiesta y el line-up de esa noche.`, djD: g => `Un DJ profesional de ${g} en tu villa o a bordo.`,
    eyebrow: "Planificador", title: "Diseña tu semana en Ibiza.", lede: "Cinco preguntas y tienes tu viaje dibujado día a día. Lo afinamos juntos por WhatsApp.",
    steps: ["Fechas", "Grupo", "Estilo", "Música", "Imprescindibles"], from: "Llegada", to: "Salida", people: "Personas", kids: "Viajamos con niños",
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
    musicQ: "What music do you like? (one or more)", errMusic: "Choose at least one kind of music.",
    music: { techno: "Techno", techhouse: "Tech house", house: "House", afro: "Afro house", melodic: "Melodic techno", edm: "EDM", commercial: "Commercial & reggaeton", hiphop: "Hip hop & R&B", disco: "Disco & funk", any: "Anything goes" },
    clubT: n => `Night at ${n} with a VIP table`, clubD: (g, near) => `Its sound matches yours: ${g}.${near ? " It is close to that day's plan." : ""} We confirm the party and line-up for that night.`, djD: g => `A professional ${g} DJ at your villa or on board.`,
    eyebrow: "Planner", title: "Design your week in Ibiza.", lede: "Five questions and your trip is drawn day by day. We fine-tune it together on WhatsApp.",
    steps: ["Dates", "Group", "Style", "Music", "Must-haves"], from: "Arrival", to: "Departure", people: "People", kids: "Travelling with children",
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
    musicQ: "Che musica vi piace? (una o più)", errMusic: "Scegli almeno un genere musicale.",
    music: { techno: "Techno", techhouse: "Tech house", house: "House", afro: "Afro house", melodic: "Melodic techno", edm: "EDM", commercial: "Commerciale e reggaeton", hiphop: "Hip hop e R&B", disco: "Disco e funk", any: "Ci va bene tutto" },
    clubT: n => `Serata al ${n} con tavolo VIP`, clubD: (g, near) => `La sua musica fa per voi: ${g}.${near ? " È vicino al vostro piano di quel giorno." : ""} Ti confermiamo la festa e il line-up della serata.`, djD: g => `Un DJ professionista di ${g} in villa o a bordo.`,
    eyebrow: "Pianificatore", title: "Disegna la tua settimana a Ibiza.", lede: "Cinque domande e il tuo viaggio è pronto giorno per giorno. Lo perfezioniamo insieme su WhatsApp.",
    steps: ["Date", "Gruppo", "Stile", "Musica", "Irrinunciabili"], from: "Arrivo", to: "Partenza", people: "Persone", kids: "Viaggiamo con bambini",
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
    musicQ: "Quelle musique aimez-vous ? (une ou plusieurs)", errMusic: "Choisissez au moins un style de musique.",
    music: { techno: "Techno", techhouse: "Tech house", house: "House", afro: "Afro house", melodic: "Melodic techno", edm: "EDM", commercial: "Commercial et reggaeton", hiphop: "Hip-hop et R&B", disco: "Disco et funk", any: "Tout nous va" },
    clubT: n => `Soirée au ${n} avec table VIP`, clubD: (g, near) => `Sa musique vous correspond : ${g}.${near ? " Il est proche de votre programme du jour." : ""} Nous vous confirmons la fête et le line-up du soir.`, djD: g => `Un DJ professionnel ${g} à la villa ou à bord.`,
    eyebrow: "Planificateur", title: "Dessinez votre semaine à Ibiza.", lede: "Cinq questions et votre voyage est tracé jour par jour. On l'affine ensemble sur WhatsApp.",
    steps: ["Dates", "Groupe", "Style", "Musique", "Indispensables"], from: "Arrivée", to: "Départ", people: "Personnes", kids: "Nous voyageons avec des enfants",
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
    musicQ: "Welche Musik mögt ihr? (eine oder mehrere)", errMusic: "Wähle mindestens eine Musikrichtung.",
    music: { techno: "Techno", techhouse: "Tech house", house: "House", afro: "Afro house", melodic: "Melodic techno", edm: "EDM", commercial: "Charts & Reggaeton", hiphop: "Hip-Hop & R&B", disco: "Disco & Funk", any: "Uns ist alles recht" },
    clubT: n => `Nacht im ${n} mit VIP-Tisch`, clubD: (g, near) => `Die Musik passt zu euch: ${g}.${near ? " Liegt nah an eurem Tagesplan." : ""} Wir bestätigen dir die Party und das Line-up des Abends.`, djD: g => `Ein professioneller ${g}-DJ in deiner Villa oder an Bord.`,
    eyebrow: "Planer", title: "Plane deine Woche auf Ibiza.", lede: "Fünf Fragen und deine Reise steht Tag für Tag. Den Feinschliff machen wir zusammen per WhatsApp.",
    steps: ["Daten", "Gruppe", "Stil", "Musik", "Must-haves"], from: "Ankunft", to: "Abreise", people: "Personen", kids: "Wir reisen mit Kindern",
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
// what each plan item is, when it happens, which service it books and where "see" takes the guest
const ITEMS = {
  W_boat:    { slot: "m", svc: "yates", go: "fleet:open" },
  W_comte:   { slot: "m", go: "place:Cala Comte" },
  W_bassa:   { slot: "a", go: "place:Cala Bassa" },
  W_jet:     { slot: "a", svc: "motos", go: "fleet:moto-agua", season: true },
  W_sunset:  { slot: "e", go: "place:Sunset Strip" },
  SW_vedra:  { slot: "m", go: "place:Es Vedrà" },
  SW_boat:   { slot: "m", svc: "yates", go: "fleet:open" },
  SW_jondal: { slot: "a", go: "place:Blue Marlin Ibiza", season: true },
  SW_sunset: { slot: "e", go: "place:Es Vedrà" },
  S_salines: { slot: "m", go: "place:Ses Salines" },
  S_lunch:   { slot: "a", go: "place:Sa Trinxa", season: true },
  S_jet:     { slot: "a", svc: "motos", go: "fleet:moto-agua", season: true },
  S_sunset:  { slot: "e", go: "place:Experimental Beach", season: true },
  T_dalt:    { slot: "m", go: null },
  T_tala:    { slot: "a", go: "place:Talamanca" },
  T_marina:  { slot: "e", go: null },
  T_michelin:{ slot: "n", go: "place:La Gaia" },
  N_car:     { slot: "m", svc: "coches", go: "fleet:coche" },
  N_villages:{ slot: "m", go: null },
  N_dalias:  { slot: "a", go: null },
  N_xarraca: { slot: "a", go: "place:Cala Xarraca" },
  N_paloma:  { slot: "a", go: "place:La Paloma" },
  N_benirras:{ slot: "e", go: "place:Benirràs" },
  E_santa:   { slot: "m", go: null },
  E_mastella:{ slot: "a", go: "place:Cala Mastella" },
  E_amante:  { slot: "e", go: "place:Amante", season: true },
  formentera:{ slot: "m", svc: "formentera", go: "fx", season: true },
  club:      { slot: "n", svc: "vip", go: "agenda", adult: true, season: true },
  chef:      { slot: "n", svc: "dining", go: "svc:dining" },
  dj:        { slot: "n", svc: "dj", go: "svc:dj", adult: true },
};
/* the island by areas: each day stays in one of them (a morning, an afternoon and a sunset that are minutes apart),
   so nobody drives from one end of Ibiza to the other and back. Each area brings its classics and its services. */
const AREAS = {
  west:  c => c.boat ? ["W_boat", "W_sunset"] : ["W_comte", c.motos ? "W_jet" : "W_bassa", "W_sunset"],   // the boat already calls at Cala Bassa and Cala Comte
  sw:    c => [c.boat ? "SW_boat" : "SW_vedra", "SW_jondal", "SW_sunset"],
  south: c => ["S_salines", c.motos ? "S_jet" : "S_lunch", "S_sunset"],
  town:  c => ["T_dalt", "T_tala", "T_marina", ...(c.food ? ["T_michelin"] : [])],
  north: c => [c.car ? "N_car" : "N_villages", ...(c.food ? ["N_paloma"] : []), c.sat ? "N_dalias" : "N_xarraca", "N_benirras"],
  east:  c => ["E_santa", "E_mastella", "E_amante"],
  formentera: () => ["formentera"],
};
const CLUB_AREAS = { west: ["west"], south: ["south", "centre"], town: ["town", "centre"], north: ["north"] };   // where a club night fits that day
const STYLE_AREAS = { party: ["south", "town", "west"], relax: ["sw", "north", "west", "east"], food: ["town", "sw", "north"], celeb: ["town", "sw", "west"], family: ["east", "town", "north", "west"], sea: ["west", "sw", "south"] };
/* what each club usually plays and where it is, so a club night fits the group's music and the day before it
   (a night is always confirmed against that date's actual party and line-up) */
export const CLUBS = [
  { n: "DC10", z: "south", g: ["techno", "techhouse"] }, { n: "Amnesia", z: "centre", g: ["techno", "techhouse", "melodic"] },
  { n: "[UNVRS]", z: "centre", g: ["house", "techhouse", "edm", "techno"] }, { n: "Hï Ibiza", z: "south", g: ["techhouse", "house", "techno", "edm"] },
  { n: "Ushuaïa Ibiza", z: "south", g: ["edm", "techhouse", "house", "commercial"] }, { n: "Pacha", z: "town", g: ["house", "afro", "disco", "melodic"] },
  { n: "Eden", z: "west", g: ["house", "techhouse", "edm"] }, { n: "Es Paradis", z: "west", g: ["edm", "commercial"] },
  { n: "Lío Ibiza", z: "town", g: ["commercial", "disco"] }, { n: "Chinois Ibiza", z: "town", g: ["hiphop", "commercial", "house"] },
  { n: "Tantra Ibiza", z: "south", g: ["commercial", "hiphop"] }, { n: "Swag Ibiza", z: "south", g: ["hiphop", "commercial"] },
  { n: "Keeper Ibiza", z: "town", g: ["commercial", "hiphop"] }, { n: "Lola's", z: "town", g: ["commercial", "disco"] },
  { n: "Pikes", z: "west", g: ["disco", "house"] }, { n: "Cova Santa", z: "south", g: ["afro", "melodic"] },
  { n: "Las Dalias · Akasha", z: "north", g: ["afro", "melodic", "house"] }, { n: "528 Ibiza", z: "west", g: ["melodic", "techno", "afro"] },
  { n: "Bora Bora Ibiza", z: "south", g: ["house", "techhouse", "commercial"] },
];
const GIFT_SVC = new Set(["yates", "motos", "moto", "coches", "villas", "vip", "dining", "transfers", "dj", "formentera"]);
const giftFor = k => k >= 3 ? 4 : k === 2 ? 3 : k === 1 ? 1 : 0;   // the same ladder as the form
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Planner: days built around one area of the island at a time, so a guest never crosses Ibiza back and forth in a day.
// Each area mixes the island's classic plans, real places worth seeing and Mey Society's services where they fit.
const PLAN_TX = {
  es: {
    welcome: ["Cena de bienvenida en Marina Botafoch", "Mesa con vistas a Dalt Vila iluminada para empezar el viaje."],
    W_boat: ["Barco a Cala Bassa y Cala Comte", "Salida con patrón por la costa oeste: baño en las calas más turquesa y comida a bordo."],
    W_comte: ["Mañana en Cala Comte", "Aguas transparentes entre islotes; mejor a primera hora, antes de que llegue la gente."],
    W_bassa: ["Tarde en Cala Bassa", "Arena entre sabinas y agua muy tranquila, a diez minutos de Cala Comte."],
    W_jet: ["Moto de agua por la bahía de Sant Antoni", "Ruta por la costa oeste hasta las calas; con monitor si no tienes licencia."],
    W_sunset: ["Atardecer en el Sunset Strip", "Café del Mar y Café Mambo en Caló des Moro, con música mientras el sol cae al mar."],
    SW_vedra: ["Mirador de Es Vedrà", "Paseo corto hasta la Torre des Savinar, con el islote más famoso de Ibiza enfrente."],
    SW_boat: ["Barco a Es Vedrà y Cala d'Hort", "Navegación al pie de Es Vedrà y baño en las calas de Sant Josep, con patrón."],
    SW_jondal: ["Comida en Cala Jondal", "Blue Marlin o Es Xarcu: pies en el agua y los barcos fondeados delante."],
    SW_sunset: ["Atardecer frente a Es Vedrà", "La puesta de sol más famosa de la isla, desde los acantilados de Cala d'Hort."],
    S_salines: ["Mañana en Ses Salines", "Parque natural: las salinas, la torre de Ses Portes y la playa de arena blanca."],
    S_lunch: ["Comida en la playa de Ses Salines", "Sa Trinxa, Beso Beach o Jockey Club, en la misma arena."],
    S_jet: ["Moto de agua en Platja d'en Bossa", "Desde la playa más larga de Ibiza hacia Ses Salines; con monitor si no tienes licencia."],
    S_sunset: ["Atardecer en Experimental Beach", "Cócteles junto a las salinas de Cap des Falcó mientras el sol cae al mar."],
    T_dalt: ["Mañana en Dalt Vila", "La ciudad amurallada, Patrimonio de la Humanidad: baluartes, catedral y vistas al puerto."],
    T_tala: ["Tarde en Talamanca", "Playa tranquila a cinco minutos de Eivissa, con Dalt Vila enfrente."],
    T_marina: ["Aperitivo en Marina Botafoch", "Yates, tiendas y Dalt Vila iluminándose al otro lado del puerto."],
    T_michelin: ["Cena con estrella Michelin", "La Gaia u Omakase by Walt, a pocos minutos del puerto; te reservamos mesa."],
    N_car: ["Ruta en coche por el norte", "Santa Gertrudis, Sant Joan y los pueblos blancos del interior, a tu ritmo."],
    N_villages: ["Pueblos del norte", "Santa Gertrudis y Sant Joan: plazas, iglesias blancas y cafés de pueblo."],
    N_dalias: ["Mercadillo de Las Dalias", "El mercadillo hippie de Sant Carles, cada sábado: artesanía, moda y música."],
    N_xarraca: ["Baño en Cala Xarraca", "Cala del norte entre acantilados, de agua cristalina, perfecta para snorkel."],
    N_paloma: ["Comida en La Paloma", "Jardín entre naranjos en Sant Llorenç, con cocina mediterránea e italiana."],
    N_benirras: ["Atardecer en Benirràs", "La cala del islote Cap Bernat; los domingos, tambores al caer el sol."],
    E_santa: ["Mañana en Santa Eulària", "Paseo marítimo y el Puig de Missa, con su iglesia blanca sobre el pueblo."],
    E_mastella: ["Comida en Cala Mastella", "Cala pequeña entre pinos, famosa por su guiso de pescado junto a las rocas."],
    E_amante: ["Tarde en Amante", "Beach club sobre el acantilado de Sol d'en Serra, con vistas al mar abierto."],
  },
  en: {
    welcome: ["Welcome dinner in Marina Botafoch", "A table facing Dalt Vila lit up at night to start the trip."],
    W_boat: ["Boat to Cala Bassa and Cala Comte", "With a skipper along the west coast: swims in the most turquoise coves and lunch on board."],
    W_comte: ["Morning at Cala Comte", "Clear water between islets; best early, before the crowds."],
    W_bassa: ["Afternoon at Cala Bassa", "Sand among juniper trees and very calm water, ten minutes from Cala Comte."],
    W_jet: ["Jet ski around Sant Antoni bay", "Along the west coast to the coves; with an instructor if you have no licence."],
    W_sunset: ["Sunset on the Sunset Strip", "Café del Mar and Café Mambo in Caló des Moro, with music as the sun drops into the sea."],
    SW_vedra: ["Es Vedrà viewpoint", "A short walk to Torre des Savinar, with Ibiza's most famous islet in front of you."],
    SW_boat: ["Boat to Es Vedrà and Cala d'Hort", "Sailing at the foot of Es Vedrà and swims in the coves of Sant Josep, with a skipper."],
    SW_jondal: ["Lunch at Cala Jondal", "Blue Marlin or Es Xarcu: feet in the water and yachts anchored in front."],
    SW_sunset: ["Sunset facing Es Vedrà", "The island's most famous sunset, from the cliffs above Cala d'Hort."],
    S_salines: ["Morning at Ses Salines", "Nature park: the salt flats, the Ses Portes tower and the white-sand beach."],
    S_lunch: ["Lunch on Ses Salines beach", "Sa Trinxa, Beso Beach or Jockey Club, right on the sand."],
    S_jet: ["Jet ski at Platja d'en Bossa", "From Ibiza's longest beach towards Ses Salines; with an instructor if you have no licence."],
    S_sunset: ["Sunset at Experimental Beach", "Cocktails by the Cap des Falcó salt flats as the sun sinks into the sea."],
    T_dalt: ["Morning in Dalt Vila", "The walled old town, a World Heritage Site: bastions, cathedral and harbour views."],
    T_tala: ["Afternoon at Talamanca", "A quiet beach five minutes from Ibiza town, facing Dalt Vila."],
    T_marina: ["Aperitif in Marina Botafoch", "Yachts, shops and Dalt Vila lighting up across the harbour."],
    T_michelin: ["Michelin-star dinner", "La Gaia or Omakase by Walt, minutes from the harbour; we book your table."],
    N_car: ["Drive through the north", "Santa Gertrudis, Sant Joan and the white villages inland, at your own pace."],
    N_villages: ["Villages of the north", "Santa Gertrudis and Sant Joan: squares, white churches and village cafés."],
    N_dalias: ["Las Dalias market", "Sant Carles' hippie market, every Saturday: crafts, fashion and music."],
    N_xarraca: ["Swim at Cala Xarraca", "A northern cove between cliffs, with crystal-clear water made for snorkelling."],
    N_paloma: ["Lunch at La Paloma", "A garden among orange trees in Sant Llorenç, with Mediterranean and Italian cooking."],
    N_benirras: ["Sunset at Benirràs", "The cove of the Cap Bernat islet; on Sundays, drums as the sun goes down."],
    E_santa: ["Morning in Santa Eulària", "The seafront and the Puig de Missa, its white church above the town."],
    E_mastella: ["Lunch at Cala Mastella", "A small cove among the pines, famous for its fish stew by the rocks."],
    E_amante: ["Afternoon at Amante", "A beach club on the Sol d'en Serra cliff, looking out to the open sea."],
  },
  it: {
    welcome: ["Cena di benvenuto a Marina Botafoch", "Un tavolo davanti a Dalt Vila illuminata per iniziare il viaggio."],
    W_boat: ["Barca a Cala Bassa e Cala Comte", "Con skipper lungo la costa ovest: bagni nelle calette più turchesi e pranzo a bordo."],
    W_comte: ["Mattina a Cala Comte", "Acqua trasparente tra gli isolotti; meglio presto, prima della folla."],
    W_bassa: ["Pomeriggio a Cala Bassa", "Sabbia tra i ginepri e acqua calmissima, a dieci minuti da Cala Comte."],
    W_jet: ["Moto d'acqua nella baia di Sant Antoni", "Lungo la costa ovest fino alle calette; con istruttore se non hai la patente."],
    W_sunset: ["Tramonto sul Sunset Strip", "Café del Mar e Café Mambo a Caló des Moro, con musica mentre il sole scende nel mare."],
    SW_vedra: ["Belvedere di Es Vedrà", "Breve passeggiata fino alla Torre des Savinar, con l'isolotto più famoso di Ibiza davanti."],
    SW_boat: ["Barca a Es Vedrà e Cala d'Hort", "Navigazione ai piedi di Es Vedrà e bagni nelle calette di Sant Josep, con skipper."],
    SW_jondal: ["Pranzo a Cala Jondal", "Blue Marlin o Es Xarcu: piedi nell'acqua e yacht alla fonda davanti."],
    SW_sunset: ["Tramonto davanti a Es Vedrà", "Il tramonto più famoso dell'isola, dalle scogliere sopra Cala d'Hort."],
    S_salines: ["Mattina a Ses Salines", "Parco naturale: le saline, la torre di Ses Portes e la spiaggia di sabbia bianca."],
    S_lunch: ["Pranzo sulla spiaggia di Ses Salines", "Sa Trinxa, Beso Beach o Jockey Club, direttamente sulla sabbia."],
    S_jet: ["Moto d'acqua a Platja d'en Bossa", "Dalla spiaggia più lunga di Ibiza verso Ses Salines; con istruttore se non hai la patente."],
    S_sunset: ["Tramonto all'Experimental Beach", "Cocktail accanto alle saline di Cap des Falcó mentre il sole cala nel mare."],
    T_dalt: ["Mattina a Dalt Vila", "La città murata, Patrimonio dell'Umanità: bastioni, cattedrale e vista sul porto."],
    T_tala: ["Pomeriggio a Talamanca", "Spiaggia tranquilla a cinque minuti da Ibiza città, davanti a Dalt Vila."],
    T_marina: ["Aperitivo a Marina Botafoch", "Yacht, negozi e Dalt Vila che si illumina dall'altra parte del porto."],
    T_michelin: ["Cena stellata Michelin", "La Gaia o Omakase by Walt, a pochi minuti dal porto; ti prenotiamo il tavolo."],
    N_car: ["Giro in auto nel nord", "Santa Gertrudis, Sant Joan e i paesi bianchi dell'interno, con calma."],
    N_villages: ["Paesi del nord", "Santa Gertrudis e Sant Joan: piazze, chiese bianche e caffè di paese."],
    N_dalias: ["Mercatino di Las Dalias", "Il mercatino hippie di Sant Carles, ogni sabato: artigianato, moda e musica."],
    N_xarraca: ["Bagno a Cala Xarraca", "Caletta del nord tra le scogliere, con acqua cristallina perfetta per lo snorkeling."],
    N_paloma: ["Pranzo a La Paloma", "Un giardino tra gli aranci a Sant Llorenç, con cucina mediterranea e italiana."],
    N_benirras: ["Tramonto a Benirràs", "La caletta dell'isolotto Cap Bernat; la domenica, tamburi al calar del sole."],
    E_santa: ["Mattina a Santa Eulària", "Il lungomare e il Puig de Missa, con la sua chiesa bianca sopra il paese."],
    E_mastella: ["Pranzo a Cala Mastella", "Piccola caletta tra i pini, famosa per la zuppa di pesce accanto agli scogli."],
    E_amante: ["Pomeriggio all'Amante", "Beach club sulla scogliera di Sol d'en Serra, affacciato sul mare aperto."],
  },
  fr: {
    welcome: ["Dîner de bienvenue à Marina Botafoch", "Une table face à Dalt Vila illuminée pour commencer le voyage."],
    W_boat: ["Bateau vers Cala Bassa et Cala Comte", "Avec skipper le long de la côte ouest : baignades dans les criques les plus turquoise et déjeuner à bord."],
    W_comte: ["Matinée à Cala Comte", "Eau transparente entre les îlots ; mieux tôt, avant la foule."],
    W_bassa: ["Après-midi à Cala Bassa", "Sable entre les genévriers et eau très calme, à dix minutes de Cala Comte."],
    W_jet: ["Jet-ski dans la baie de Sant Antoni", "Le long de la côte ouest jusqu'aux criques ; avec moniteur si vous n'avez pas de permis."],
    W_sunset: ["Coucher de soleil sur le Sunset Strip", "Café del Mar et Café Mambo à Caló des Moro, en musique pendant que le soleil plonge dans la mer."],
    SW_vedra: ["Belvédère d'Es Vedrà", "Courte balade jusqu'à la Torre des Savinar, face à l'îlot le plus célèbre d'Ibiza."],
    SW_boat: ["Bateau vers Es Vedrà et Cala d'Hort", "Navigation au pied d'Es Vedrà et baignades dans les criques de Sant Josep, avec skipper."],
    SW_jondal: ["Déjeuner à Cala Jondal", "Blue Marlin ou Es Xarcu : les pieds dans l'eau et les yachts au mouillage devant."],
    SW_sunset: ["Coucher de soleil face à Es Vedrà", "Le coucher de soleil le plus célèbre de l'île, depuis les falaises de Cala d'Hort."],
    S_salines: ["Matinée à Ses Salines", "Parc naturel : les salines, la tour de Ses Portes et la plage de sable blanc."],
    S_lunch: ["Déjeuner sur la plage de Ses Salines", "Sa Trinxa, Beso Beach ou Jockey Club, directement sur le sable."],
    S_jet: ["Jet-ski à Platja d'en Bossa", "De la plus longue plage d'Ibiza vers Ses Salines ; avec moniteur si vous n'avez pas de permis."],
    S_sunset: ["Coucher de soleil à l'Experimental Beach", "Cocktails près des salines de Cap des Falcó pendant que le soleil se couche sur la mer."],
    T_dalt: ["Matinée à Dalt Vila", "La ville fortifiée, classée au patrimoine mondial : bastions, cathédrale et vue sur le port."],
    T_tala: ["Après-midi à Talamanca", "Plage tranquille à cinq minutes d'Ibiza ville, face à Dalt Vila."],
    T_marina: ["Apéritif à Marina Botafoch", "Yachts, boutiques et Dalt Vila qui s'illumine de l'autre côté du port."],
    T_michelin: ["Dîner étoilé Michelin", "La Gaia ou Omakase by Walt, à quelques minutes du port ; nous réservons votre table."],
    N_car: ["Route en voiture dans le nord", "Santa Gertrudis, Sant Joan et les villages blancs de l'intérieur, à votre rythme."],
    N_villages: ["Villages du nord", "Santa Gertrudis et Sant Joan : places, églises blanches et cafés de village."],
    N_dalias: ["Marché de Las Dalias", "Le marché hippie de Sant Carles, chaque samedi : artisanat, mode et musique."],
    N_xarraca: ["Baignade à Cala Xarraca", "Crique du nord entre les falaises, à l'eau cristalline idéale pour le snorkeling."],
    N_paloma: ["Déjeuner à La Paloma", "Un jardin parmi les orangers à Sant Llorenç, cuisine méditerranéenne et italienne."],
    N_benirras: ["Coucher de soleil à Benirràs", "La crique de l'îlot Cap Bernat ; le dimanche, tambours au coucher du soleil."],
    E_santa: ["Matinée à Santa Eulària", "Le front de mer et le Puig de Missa, avec son église blanche au-dessus du village."],
    E_mastella: ["Déjeuner à Cala Mastella", "Petite crique entre les pins, célèbre pour son ragoût de poisson au bord des rochers."],
    E_amante: ["Après-midi à l'Amante", "Beach club sur la falaise de Sol d'en Serra, face au large."],
  },
  de: {
    welcome: ["Willkommensdinner in der Marina Botafoch", "Ein Tisch mit Blick auf das beleuchtete Dalt Vila zum Start der Reise."],
    W_boat: ["Boot nach Cala Bassa und Cala Comte", "Mit Skipper an der Westküste: Baden in den türkisesten Buchten und Mittagessen an Bord."],
    W_comte: ["Vormittag in Cala Comte", "Klares Wasser zwischen kleinen Inseln; am besten früh, vor dem Andrang."],
    W_bassa: ["Nachmittag in Cala Bassa", "Sand zwischen Wacholderbäumen und sehr ruhiges Wasser, zehn Minuten von Cala Comte."],
    W_jet: ["Jetski in der Bucht von Sant Antoni", "Entlang der Westküste zu den Buchten; mit Instruktor, wenn du keinen Führerschein hast."],
    W_sunset: ["Sonnenuntergang am Sunset Strip", "Café del Mar und Café Mambo in Caló des Moro, mit Musik, während die Sonne ins Meer sinkt."],
    SW_vedra: ["Aussichtspunkt Es Vedrà", "Kurzer Spaziergang zur Torre des Savinar, mit Ibizas berühmtester Insel vor dir."],
    SW_boat: ["Boot nach Es Vedrà und Cala d'Hort", "Fahrt am Fuß von Es Vedrà und Baden in den Buchten von Sant Josep, mit Skipper."],
    SW_jondal: ["Mittagessen in Cala Jondal", "Blue Marlin oder Es Xarcu: Füße im Wasser und ankernde Yachten vor dir."],
    SW_sunset: ["Sonnenuntergang vor Es Vedrà", "Der berühmteste Sonnenuntergang der Insel, von den Klippen über Cala d'Hort."],
    S_salines: ["Vormittag in Ses Salines", "Naturpark: die Salinen, der Turm Ses Portes und der weiße Sandstrand."],
    S_lunch: ["Mittagessen am Strand von Ses Salines", "Sa Trinxa, Beso Beach oder Jockey Club, direkt im Sand."],
    S_jet: ["Jetski in Platja d'en Bossa", "Vom längsten Strand Ibizas Richtung Ses Salines; mit Instruktor, wenn du keinen Führerschein hast."],
    S_sunset: ["Sonnenuntergang im Experimental Beach", "Cocktails an den Salinen von Cap des Falcó, während die Sonne ins Meer sinkt."],
    T_dalt: ["Vormittag in Dalt Vila", "Die ummauerte Altstadt, UNESCO-Welterbe: Bastionen, Kathedrale und Blick auf den Hafen."],
    T_tala: ["Nachmittag in Talamanca", "Ruhiger Strand fünf Minuten von Ibiza-Stadt, mit Blick auf Dalt Vila."],
    T_marina: ["Aperitif in der Marina Botafoch", "Yachten, Boutiquen und das abends leuchtende Dalt Vila auf der anderen Hafenseite."],
    T_michelin: ["Dinner mit Michelin-Stern", "La Gaia oder Omakase by Walt, wenige Minuten vom Hafen; wir reservieren deinen Tisch."],
    N_car: ["Autotour durch den Norden", "Santa Gertrudis, Sant Joan und die weißen Dörfer im Inland, in deinem Tempo."],
    N_villages: ["Dörfer im Norden", "Santa Gertrudis und Sant Joan: Plätze, weiße Kirchen und Dorfcafés."],
    N_dalias: ["Markt von Las Dalias", "Der Hippiemarkt von Sant Carles, jeden Samstag: Kunsthandwerk, Mode und Musik."],
    N_xarraca: ["Baden in Cala Xarraca", "Bucht im Norden zwischen Klippen, mit kristallklarem Wasser zum Schnorcheln."],
    N_paloma: ["Mittagessen im La Paloma", "Ein Garten zwischen Orangenbäumen in Sant Llorenç, mit mediterraner und italienischer Küche."],
    N_benirras: ["Sonnenuntergang in Benirràs", "Die Bucht mit der Insel Cap Bernat; sonntags Trommeln bei Sonnenuntergang."],
    E_santa: ["Vormittag in Santa Eulària", "Die Strandpromenade und der Puig de Missa mit seiner weißen Kirche über dem Ort."],
    E_mastella: ["Mittagessen in Cala Mastella", "Kleine Bucht zwischen Pinien, berühmt für ihren Fischeintopf an den Felsen."],
    E_amante: ["Nachmittag im Amante", "Beach Club auf der Klippe von Sol d'en Serra, mit Blick aufs offene Meer."],
  },
};

export function initPlanner(root, { onGo, onSend, icons = {} } = {}) {
  const st = { step: 0, from: "", to: "", people: 4, kids: false, music: new Set(), styles: new Set(), musts: new Set(["transfers"]), plan: null };
  const tx = () => { const l = L[getLang()] || L.es; return { ...l, items: { ...l.items, ...(PLAN_TX[getLang()] || PLAN_TX.es) } }; };
  const today = new Date(); today.setHours(12);
  const iso = d => d.toISOString().slice(0, 10);
  const fmt = d => d.toLocaleDateString(getLang(), { weekday: "short", day: "numeric", month: "short" });

  function build() {
    const t = tx(), D = [], start = new Date(st.from + "T12:00"), end = new Date(st.to + "T12:00");
    const nights = Math.max(1, Math.round((end - start) / 864e5));
    for (let i = 0; i <= nights; i++) D.push({ date: new Date(start.getTime() + i * 864e5), items: [] });
    const add = (d, key, extra = {}) => d.items.push({ key, ...(ITEMS[key] || {}), ...extra });
    const inSeason = d => d.date.getMonth() >= 4 && d.date.getMonth() <= 9;   // clubs, beach clubs and Formentera: May to October
    const ok = (d, k) => ITEMS[k] && !(st.kids && ITEMS[k].adult) && (!ITEMS[k].season || inSeason(d));
    // first and last day
    D[0].items.push({ key: "arrive", slot: "a", svc: "transfers", go: "fleet:transfer" });
    if (st.musts.has("villas")) D[0].items.push({ key: "checkin", slot: "a", svc: "villas", go: "villa" });
    add(D[0], "welcome", { slot: "n", go: null });
    D[D.length - 1].items.push({ key: "depart", slot: "m", svc: "transfers", go: "fleet:transfer" });
    const middle = D.slice(1, -1);
    // which areas the stay visits: the must-haves first (each where it belongs), then the chosen styles
    const has = m => st.musts.has(m), party = has("vip") || st.styles.has("party");
    const likes = st.music.has("any") || !st.music.size ? null : st.music;
    const g = c => likes ? c.g.filter(x => likes.has(x)) : c.g;
    const clubArea = () => { const best = CLUBS.filter(c => ["west", "south", "town", "centre"].includes(c.z)).sort((a, b) => g(b).length - g(a).length)[0]; return best.z === "centre" ? "town" : best.z; };
    const want = [];
    if (has("formentera")) want.push("formentera");
    if (has("yates")) want.push("west");
    if (has("motos")) want.push("south");
    if (has("coches")) want.push("north");
    if (party && !st.kids) want.push(clubArea());
    [...st.styles].forEach(s => (STYLE_AREAS[s] || []).forEach(z => want.push(z)));
    ["town", "west", "sw", "south", "north", "east"].forEach(z => want.push(z));
    const order = [...new Set(want)];
    const slow = middle.length >= 6 ? Math.floor(middle.length / 2) : -1;
    let boatsLeft = has("yates") ? 1 + Math.floor(middle.length / 5) : 0, oi = 0, chefDone = false;
    const clubUsed = new Map();
    middle.forEach((d, i) => {
      if (i === slow) { add(d, "free"); return; }
      let area = order[oi % order.length]; oi++;
      if (area === "formentera" && !inSeason(d)) { area = order[oi % order.length]; oi++; }
      const c = { boat: boatsLeft > 0 && (area === "west" || area === "sw"), motos: has("motos"), car: has("coches"), food: st.styles.has("food") || st.styles.has("celeb"), sat: d.date.getDay() === 6 };
      if (c.boat) boatsLeft--;
      AREAS[area](c).filter(k => ok(d, k)).forEach(k => add(d, k));
      d.area = area;
      // the night stays in the same area: a club there if the group is going out, else a private chef at the villa
      if (area === "formentera") return;   // the excursion ends with its own sunset party
      const clubs = CLUB_AREAS[area] && party ? CLUBS.filter(cl => CLUB_AREAS[area].includes(cl.z)) : [];
      const quiet = area === "sw" || area === "east" || area === "north" || !clubs.length;   // the calm areas: a dinner at the villa suits them
      if (has("dining") && !chefDone && quiet && !d.items.some(x => x.slot === "n")) { add(d, "chef"); chefDone = true; }
      else if (clubs.length && ok(d, "club") && !d.items.some(x => x.slot === "n")) {
        const best = clubs.map(cl => ({ cl, s: g(cl).length * 10 - (clubUsed.get(cl.n) || 0) * 8 })).sort((a, b) => b.s - a.s)[0].cl;
        clubUsed.set(best.n, (clubUsed.get(best.n) || 0) + 1);
        add(d, "club", { club: best.n, genres: g(best).length ? g(best) : best.g, near: true });
      } else if (has("dining") && !chefDone && !d.items.some(x => x.slot === "n")) { add(d, "chef"); chefDone = true; }
    });
    // a private DJ closes the stay at the villa, the last night before leaving
    if (has("dj") && !st.kids && middle.length) { const d = middle[middle.length - 1]; d.items = d.items.filter(x => x.slot !== "n"); add(d, "dj", { genres: likes ? [...likes] : [] }); }
    if (has("dining") && !chefDone && middle.length) {   // no calm evening left: the chef takes the place of one of the nights out (never the only one)
      const nightsOut = middle.filter(x => x.items.some(y => y.key === "club" || y.key === "T_michelin"));
      const d = middle.find(x => !x.items.some(y => y.slot === "n")) || (nightsOut.length > 1 ? nightsOut[nightsOut.length - 1] : null);
      if (d) { d.items = d.items.filter(y => y.slot !== "n"); add(d, "chef"); } }
    middle.forEach(d => { if (!d.items.length) add(d, "free"); });
    const slotOrder = { m: 0, a: 1, e: 2, n: 3 };
    D.forEach(d => d.items.sort((a, b) => slotOrder[a.slot] - slotOrder[b.slot]));
    const svcs = new Set(); D.forEach(d => d.items.forEach(it => it.svc && svcs.add(it.svc))); st.musts.forEach(m => svcs.add(m));
    return { days: D, nights, svcs: [...svcs], gifts: giftFor([...svcs].filter(s => GIFT_SVC.has(s)).length) };
  }

  const gl = g => { const t = tx(); return g.map(x => t.music[x] || x).join(", "); };
  const title = it => { const t = tx(); return it.key === "club" && it.club ? t.clubT(it.club) : (t.items[it.key] || [it.key])[0]; };
  const desc = it => { const t = tx(); if (it.key === "club" && it.club) return t.clubD(gl(it.genres), it.near); if (it.key === "dj" && it.genres?.length) return t.djD(gl(it.genres)); return (t.items[it.key] || ["", ""])[1]; };
  function text() {
    const t = tx(), p = st.plan; if (!p) return "";
    const lines = [t.waHead, `${fmt(p.days[0].date)} → ${fmt(p.days[p.days.length - 1].date)} · ${t.nights(p.nights)} · ${t.guests(st.people)}${st.kids ? " · " + t.kids : ""}`];
    p.days.forEach((d, i) => lines.push(`${t.day} ${i + 1} (${fmt(d.date)}): ${d.items.map(title).join(" · ")}`));
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
          <ul>${d.items.map(it => `<li><span class="pl__slot">${esc(t.slots[it.slot] || "")}</span><div><strong>${esc(title(it))}</strong><p>${esc(desc(it))}</p></div>${it.go ? `<button type="button" class="pl__see" data-go="${it.go}">${esc(t.see)}</button>` : ""}</li>`).join("")}</ul></li>`).join("")}</ol>
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
    } else if (st.step === 3) {
      body = `<p class="pl__q">${esc(t.musicQ)}</p><div class="pl__chips">${Object.entries(t.music).map(([k, v]) => chip("music", k, v, st.music.has(k))).join("")}</div>`;
    } else {
      body = `<p class="pl__q">${esc(t.mustQ)}</p><div class="pl__chips">${Object.entries(t.musts).filter(([k]) => !(st.kids && (k === "vip" || k === "dj"))).map(([k, v]) => chip("must", k, v, st.musts.has(k))).join("")}</div>`;
    }
    const nav = st.plan ? "" : `<p class="pl__err" role="alert"></p><div class="pl__nav">${st.step ? `<button type="button" class="btn pl__ghost" data-act="back">${esc(t.back)}</button>` : "<span></span>"}<button type="button" class="btn btn--primary" data-act="${st.step < 4 ? "next" : "make"}">${esc(st.step < 4 ? t.next : t.make)}</button></div>`;
    root.querySelector(".pl__card").innerHTML = (st.plan ? "" : stepper) + `<div class="pl__body">${body}</div>` + nav;
    root.querySelector(".pl__eyebrow").textContent = t.eyebrow; root.querySelector(".pl__title").textContent = t.title; root.querySelector(".pl__lede").textContent = t.lede;
  }
  const err = msg => { const e = root.querySelector(".pl__err"); if (e) e.textContent = msg; };

  root.innerHTML = `<div class="wrap pl"><div class="sec__head"><p class="eyebrow pl__eyebrow"></p><h2 class="display pl__title"></h2><p class="lede pl__lede"></p></div><div class="pl__card"></div></div>`;
  root.addEventListener("input", e => { const f = e.target.dataset.f; if (!f) return; if (f === "kids") st.kids = e.target.checked; else { st[f] = e.target.value; if (f === "from" && st.to && st.to <= st.from) { st.to = ""; render(); } } });
  root.addEventListener("click", e => {
    const t = tx(), b = e.target.closest("button"); if (!b) return;
    if (b.dataset.style) { const k = b.dataset.style; st.styles.has(k) ? st.styles.delete(k) : st.styles.add(k); b.setAttribute("aria-pressed", st.styles.has(k)); return; }
    if (b.dataset.music) { const k = b.dataset.music; if (k === "any") st.music.clear(); else st.music.delete("any"); st.music.has(k) ? st.music.delete(k) : st.music.add(k);
      b.closest(".pl__chips").querySelectorAll("[data-music]").forEach(x => x.setAttribute("aria-pressed", st.music.has(x.dataset.music))); return; }
    if (b.dataset.must) { const k = b.dataset.must; st.musts.has(k) ? st.musts.delete(k) : st.musts.add(k); b.setAttribute("aria-pressed", st.musts.has(k)); return; }
    if (b.dataset.go) { onGo?.(b.dataset.go); return; }
    const a = b.dataset.act;
    if (a === "minus" || a === "plus") { st.people = Math.min(40, Math.max(1, st.people + (a === "plus" ? 1 : -1))); root.querySelector(".pl__count output").textContent = st.people; return; }
    if (a === "next") {
      if (st.step === 0 && (!st.from || !st.to || st.to <= st.from)) return err(t.errDates);
      if (st.step === 2 && !st.styles.size) return err(t.errStyle);
      if (st.step === 3 && !st.music.size) return err(t.errMusic);
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
