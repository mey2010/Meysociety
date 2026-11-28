/* Alta cocina — the private chef's page. A full-screen page that opens from the "Alta cocina" card or the menu, in
   the logo's own colours (midnight, indigo, royal blue, cyan, violet, chrome). It sells the evening, not the
   recipe: anything you ask for, cooked in your villa or on board, served, and the kitchen left spotless. Nothing
   here is invented: no awards, no reviews, no prices. The voice is the concierge's own recommendation.
   PHOTOS lists the dish photos shown; each new one only needs a line there. */
import { getLang } from "./i18n.js";
import { pick } from "./fleet-blob.js";

// dish photos, in order: the first is the cover. [path, caption key]
const PHOTOS = [["data/services/chef-carne.webp", "meat"], ["data/services/chef-paella.webp", "paella"], ["data/services/chef-espana.webp", "spain"],
  ["data/services/chef-brasil.webp", "brazil"], ["data/services/chef-pescado.webp", "fish"], ["data/services/chef-degustacion.webp", "tasting"]];

const T = {
  es: {
    kicker: "Chef privado · Ibiza y Formentera",
    title: ["Alta cocina,", "donde tú estés."],
    lead: "Un chef privado que cocina lo que te apetezca, en tu villa o a bordo de tu barco. Llega con el producto del día, cocina, sirve y se va dejando la cocina impecable.",
    cta: "Reservar el chef", cta2: "Pedir una propuesta de menú", close: "Cerrar", scroll: "Desliza",
    promise: [
      ["dish", "Lo que pidas", "Paellas, carnes a la brasa, pescado, cocina española, brasileña, japonesa… o lo que os apetezca en ese momento."],
      ["pin", "En tu villa o tu barco", "Se desplaza con todo lo necesario y cocina en tu cocina o en la del barco."],
      ["basket", "Compra, cocina y sirve", "Producto fresco comprado ese mismo día. Vosotros solo os sentáis a la mesa."],
      ["spark", "Lo deja todo limpio", "Recoge la mesa, los restos y la cocina. Cuando se va, no queda rastro: solo el recuerdo de la cena."],
    ],
    openH: "Sin carta fija. Pide lo que quieras.",
    openP: "Nuestro chef no trabaja con un menú cerrado: atiende cualquier pedido o petición de comida. ¿Un plato de tu país, la receta de tu familia, algo que probaste en un viaje o un cambio de última hora? Se adapta a ti, no al revés.",
    openPts: ["Cualquier cocina, cualquier plato", "Cambios sobre la marcha, incluso esa misma noche", "Alergias, dietas y gustos de cada invitado"],
    caps: { paella: "Paella de marisco, para compartir en la mesa.", meat: "Solomillo con jugo de vino tinto, puré y zanahorias asadas.", spain: "Jamón ibérico, gambas al ajillo, pan con tomate y manchego.", brazil: "Picanha a la brasa y moqueca de pescado, con arroz, farofa y vinagreta.", fish: "Lubina con mantequilla de azafrán, espárragos y tomates confitados.", tasting: "Menú degustación: tartar de atún, burrata y carpaccio de vieira." },
    menuH: "Un menú escrito contigo",
    menuP: "No hay carta cerrada. Nos cuentas qué os gusta, quién come qué y si hay alergias; el chef propone y lo ajustamos hasta que sea exactamente lo que queréis. Y si esa noche os apetece otra cosa, se adapta.",
    cuis: ["Paellas y arroces", "Carnes a la brasa", "Pescado y marisco", "Cocina española y tapas", "Cocina brasileña", "Mediterránea e ibicenca", "Japonesa y nikkei", "Vegetariana y vegana", "Brunch y desayunos", "Menú infantil", "Sin gluten y alergias"],
    whereH: "A domicilio, en tierra o en el mar",
    where: [["villa", "Tu villa", "Una cena junto a la piscina, un desayuno largo o un menú degustación para celebrar."], ["boat", "Tu barco", "Almuerzo a bordo, fondeados en una cala, servido como en el mejor restaurante."], ["party", "Tu celebración", "Cumpleaños, aniversarios o un evento privado, al ritmo que pida la noche."]],
    whoH: "Quién llega a tu casa",
    whoP: "Atento, amable y de buena presencia. Sabe cuándo explicar un plato y cuándo dejaros a solas. Trato discreto, puntual y cuidado hasta el último detalle: alguien a quien abrirías tu casa sin pensarlo.",
    howH: "De principio a fin, resuelto",
    how: [["Nos cuentas", "Ocasión, número de invitados, gustos, alergias y dónde será."], ["Tu propuesta", "Te llega un menú pensado para vosotros y lo ajustamos hasta que encaje."], ["Compra del día", "El chef compra el producto esa misma mañana."], ["Cocina y servicio", "Llega con tiempo, cocina en tu cocina o a bordo y sirve en la mesa."], ["Recogida y limpieza", "Recoge, limpia y se lleva los restos. La cocina queda como estaba."]],
    vsH: "Lo que no tendrás que hacer",
    vs: ["Reservar mesa ni adaptarte al horario de un restaurante", "Buscar taxi de vuelta a medianoche", "Ir a comprar, cocinar ni fregar", "Elegir entre la cena y estar con los tuyos"],
    noteH: "Fechas limitadas en temporada alta",
    note: "Las noches de julio y agosto se reservan con antelación. Si ya tienes fechas, escríbeme hoy y te las aseguro.",
    msg: "Hola Mey Society, quiero reservar el chef privado", msg2: "Hola Mey Society, me gustaría una propuesta de menú del chef privado",
  },
  en: {
    kicker: "Private chef · Ibiza and Formentera",
    title: ["Fine dining,", "wherever you are."],
    lead: "A private chef who cooks whatever you fancy, at your villa or on board your boat. He arrives with the day's produce, cooks, serves and leaves the kitchen spotless.",
    cta: "Book the chef", cta2: "Ask for a menu proposal", close: "Close", scroll: "Scroll",
    promise: [
      ["dish", "Whatever you ask for", "Paella, grilled meats, fish, Spanish, Brazilian, Japanese… or whatever you feel like on the night."],
      ["pin", "At your villa or on your boat", "He brings everything needed and cooks in your kitchen or the boat's galley."],
      ["basket", "Shops, cooks and serves", "Fresh produce bought that same day. You simply sit down at the table."],
      ["spark", "Leaves everything clean", "He clears the table, the leftovers and the kitchen. When he leaves there is no trace, only the memory of the dinner."],
    ],
    openH: "No set menu. Ask for anything.",
    openP: "Our chef does not work from a fixed menu: he takes any food order or request. A dish from your country, a family recipe, something you tasted on a trip or a last-minute change? He adapts to you, not the other way round.",
    openPts: ["Any cuisine, any dish", "Changes on the go, even that same night", "Every guest's allergies, diets and tastes"],
    caps: { paella: "Seafood paella, to share at the table.", meat: "Beef tenderloin with red-wine jus, purée and roasted carrots.", spain: "Ibérico ham, garlic prawns, pan con tomate and Manchego.", brazil: "Grilled picanha and fish moqueca, with rice, farofa and vinaigrette.", fish: "Sea bass with saffron butter, asparagus and confit tomatoes.", tasting: "Tasting menu: tuna tartare, burrata and scallop carpaccio." },
    menuH: "A menu written with you",
    menuP: "There is no set menu. Tell us what you like, who eats what and any allergies; the chef suggests and we adjust until it is exactly what you want. And if that night you fancy something else, he adapts.",
    cuis: ["Paella and rice dishes", "Grilled meats", "Fish and seafood", "Spanish cuisine and tapas", "Brazilian cuisine", "Mediterranean and Ibizan", "Japanese and Nikkei", "Vegetarian and vegan", "Brunch and breakfast", "Kids' menu", "Gluten-free and allergies"],
    whereH: "At home, on land or at sea",
    where: [["villa", "Your villa", "Dinner by the pool, a long breakfast or a tasting menu to celebrate."], ["boat", "Your boat", "Lunch on board, anchored in a cove, served as in the finest restaurant."], ["party", "Your celebration", "Birthdays, anniversaries or a private event, at the pace the night asks for."]],
    whoH: "Who comes to your home",
    whoP: "Attentive, friendly and well presented. He knows when to explain a dish and when to leave you be. Discreet, punctual and careful to the last detail: someone you would open your home to without a second thought.",
    howH: "Taken care of, start to finish",
    how: [["Tell us", "The occasion, number of guests, tastes, allergies and where it will be."], ["Your proposal", "You receive a menu designed for you and we adjust it until it fits."], ["Bought that day", "The chef buys the produce that same morning."], ["Cooking and service", "He arrives in good time, cooks in your kitchen or on board and serves at the table."], ["Clearing and cleaning", "He clears up, cleans and takes the leftovers away. The kitchen is left as it was."]],
    vsH: "What you won't have to do",
    vs: ["Book a table or fit a restaurant's hours", "Find a taxi home at midnight", "Shop, cook or wash up", "Choose between dinner and being with your people"],
    noteH: "Limited dates in high season",
    note: "July and August evenings are booked well ahead. If you already have dates, write to me today and I will secure them for you.",
    msg: "Hi Mey Society, I'd like to book the private chef", msg2: "Hi Mey Society, I'd like a menu proposal from the private chef",
  },
  it: {
    kicker: "Chef privato · Ibiza e Formentera",
    title: ["Alta cucina,", "ovunque tu sia."],
    lead: "Uno chef privato che cucina ciò che desideri, in villa o a bordo della tua barca. Arriva con il prodotto del giorno, cucina, serve e se ne va lasciando la cucina impeccabile.",
    cta: "Prenota lo chef", cta2: "Chiedi una proposta di menu", close: "Chiudi", scroll: "Scorri",
    promise: [
      ["dish", "Ciò che chiedi", "Paella, carni alla brace, pesce, cucina spagnola, brasiliana, giapponese… o ciò che vi va in quel momento."],
      ["pin", "In villa o in barca", "Si sposta con tutto il necessario e cucina nella tua cucina o in quella della barca."],
      ["basket", "Fa la spesa, cucina e serve", "Prodotto fresco comprato quel giorno stesso. Voi vi sedete solo a tavola."],
      ["spark", "Lascia tutto pulito", "Sparecchia, porta via gli avanzi e pulisce la cucina. Quando se ne va non resta traccia, solo il ricordo della cena."],
    ],
    openH: "Nessun menu fisso. Chiedi ciò che vuoi.",
    openP: "Il nostro chef non lavora con un menu chiuso: accoglie qualsiasi ordine o richiesta. Un piatto del tuo paese, una ricetta di famiglia, qualcosa assaggiato in viaggio o un cambio dell'ultimo minuto? Si adatta a te, non il contrario.",
    openPts: ["Qualsiasi cucina, qualsiasi piatto", "Modifiche al volo, anche quella sera stessa", "Allergie, diete e gusti di ogni ospite"],
    caps: { paella: "Paella di mare, da condividere a tavola.", meat: "Filetto con fondo al vino rosso, purè e carote arrostite.", spain: "Prosciutto ibérico, gamberi all'aglio, pan con tomate e manchego.", brazil: "Picanha alla brace e moqueca di pesce, con riso, farofa e vinaigrette.", fish: "Branzino con burro allo zafferano, asparagi e pomodorini confit.", tasting: "Menu degustazione: tartare di tonno, burrata e carpaccio di capesante." },
    menuH: "Un menu scritto con te",
    menuP: "Non c'è un menu fisso. Raccontaci cosa vi piace, chi mangia cosa e le allergie; lo chef propone e lo ritocchiamo finché non è esattamente ciò che volete. E se quella sera vi va altro, si adatta.",
    cuis: ["Paella e risi", "Carni alla brace", "Pesce e frutti di mare", "Cucina spagnola e tapas", "Cucina brasiliana", "Mediterranea e ibizenca", "Giapponese e nikkei", "Vegetariana e vegana", "Brunch e colazioni", "Menu per bambini", "Senza glutine e allergie"],
    whereH: "A domicilio, in terra o in mare",
    where: [["villa", "La tua villa", "Una cena a bordo piscina, una colazione lunga o un menu degustazione per festeggiare."], ["boat", "La tua barca", "Pranzo a bordo, all'ancora in una caletta, servito come nel miglior ristorante."], ["party", "La tua festa", "Compleanni, anniversari o un evento privato, al ritmo che chiede la serata."]],
    whoH: "Chi arriva a casa tua",
    whoP: "Attento, gentile e di bella presenza. Sa quando spiegare un piatto e quando lasciarvi soli. Discreto, puntuale e curato fino all'ultimo dettaglio: qualcuno a cui apriresti casa senza pensarci.",
    howH: "Dall'inizio alla fine, pensiamo a tutto",
    how: [["Raccontaci", "Occasione, numero di ospiti, gusti, allergie e luogo."], ["La tua proposta", "Ricevi un menu pensato per voi e lo ritocchiamo finché non va bene."], ["Spesa del giorno", "Lo chef compra il prodotto quella mattina stessa."], ["Cucina e servizio", "Arriva per tempo, cucina nella tua cucina o a bordo e serve a tavola."], ["Riordino e pulizia", "Riordina, pulisce e porta via gli avanzi. La cucina resta com'era."]],
    vsH: "Quello che non dovrai fare",
    vs: ["Prenotare un tavolo o seguire gli orari di un ristorante", "Cercare un taxi a mezzanotte", "Fare la spesa, cucinare o lavare i piatti", "Scegliere tra la cena e stare con i tuoi"],
    noteH: "Date limitate in alta stagione",
    note: "Le serate di luglio e agosto si prenotano con anticipo. Se hai già le date, scrivimi oggi e te le assicuro.",
    msg: "Ciao Mey Society, vorrei prenotare lo chef privato", msg2: "Ciao Mey Society, vorrei una proposta di menu dello chef privato",
  },
  fr: {
    kicker: "Chef privé · Ibiza et Formentera",
    title: ["La haute cuisine,", "là où vous êtes."],
    lead: "Un chef privé qui cuisine tout ce dont vous avez envie, à la villa ou à bord de votre bateau. Il arrive avec les produits du jour, cuisine, sert et repart en laissant la cuisine impeccable.",
    cta: "Réserver le chef", cta2: "Demander une proposition de menu", close: "Fermer", scroll: "Faites défiler",
    promise: [
      ["dish", "Ce que vous voulez", "Paella, viandes grillées, poisson, cuisine espagnole, brésilienne, japonaise… ou ce qui vous fait envie sur le moment."],
      ["pin", "À la villa ou sur votre bateau", "Il se déplace avec tout le nécessaire et cuisine dans votre cuisine ou à bord."],
      ["basket", "Il achète, cuisine et sert", "Des produits frais achetés le jour même. Vous n'avez qu'à passer à table."],
      ["spark", "Il laisse tout propre", "Il débarrasse la table, les restes et la cuisine. Quand il part, il ne reste aucune trace, seulement le souvenir du dîner."],
    ],
    openH: "Pas de carte figée. Demandez ce que vous voulez.",
    openP: "Notre chef ne travaille pas avec un menu fermé : il répond à toute commande ou demande culinaire. Un plat de votre pays, une recette de famille, une saveur découverte en voyage ou un changement de dernière minute ? Il s'adapte à vous, pas l'inverse.",
    openPts: ["Toutes les cuisines, tous les plats", "Des changements à la volée, même le soir même", "Allergies, régimes et goûts de chaque invité"],
    caps: { paella: "Paella aux fruits de mer, à partager à table.", meat: "Filet de bœuf, jus au vin rouge, purée et carottes rôties.", spain: "Jambon ibérique, crevettes à l'ail, pan con tomate et manchego.", brazil: "Picanha grillée et moqueca de poisson, avec riz, farofa et vinaigrette.", fish: "Bar au beurre de safran, asperges et tomates confites.", tasting: "Menu dégustation : tartare de thon, burrata et carpaccio de Saint-Jacques." },
    menuH: "Un menu écrit avec vous",
    menuP: "Pas de carte figée. Dites-nous ce que vous aimez, qui mange quoi et les allergies ; le chef propose et nous ajustons jusqu'à ce que ce soit exactement ce que vous voulez. Et si ce soir-là vous avez envie d'autre chose, il s'adapte.",
    cuis: ["Paella et riz", "Viandes grillées", "Poisson et fruits de mer", "Cuisine espagnole et tapas", "Cuisine brésilienne", "Méditerranéenne et ibicenca", "Japonaise et nikkei", "Végétarienne et vegan", "Brunch et petits-déjeuners", "Menu enfants", "Sans gluten et allergies"],
    whereH: "À domicile, sur terre ou en mer",
    where: [["villa", "Votre villa", "Un dîner au bord de la piscine, un long petit-déjeuner ou un menu dégustation pour célébrer."], ["boat", "Votre bateau", "Un déjeuner à bord, au mouillage dans une crique, servi comme dans le meilleur restaurant."], ["party", "Votre fête", "Anniversaires, célébrations ou événement privé, au rythme de la soirée."]],
    whoH: "Qui vient chez vous",
    whoP: "Attentionné, aimable et d'une belle présentation. Il sait quand expliquer un plat et quand vous laisser entre vous. Discret, ponctuel et soigné jusqu'au moindre détail : quelqu'un à qui vous ouvririez votre porte sans hésiter.",
    howH: "Du début à la fin, on s'occupe de tout",
    how: [["Racontez-nous", "L'occasion, le nombre d'invités, vos goûts, vos allergies et le lieu."], ["Votre proposition", "Vous recevez un menu pensé pour vous, ajusté jusqu'à ce qu'il vous convienne."], ["Achats du jour", "Le chef achète les produits le matin même."], ["Cuisine et service", "Il arrive en avance, cuisine chez vous ou à bord et sert à table."], ["Rangement et nettoyage", "Il range, nettoie et emporte les restes. La cuisine reste comme elle était."]],
    vsH: "Ce que vous n'aurez pas à faire",
    vs: ["Réserver une table ou suivre les horaires d'un restaurant", "Chercher un taxi à minuit", "Faire les courses, cuisiner ou la vaisselle", "Choisir entre le dîner et être avec les vôtres"],
    noteH: "Dates limitées en haute saison",
    note: "Les soirées de juillet et d'août se réservent longtemps à l'avance. Si vous avez déjà vos dates, écrivez-moi aujourd'hui et je vous les réserve.",
    msg: "Bonjour Mey Society, je souhaite réserver le chef privé", msg2: "Bonjour Mey Society, je voudrais une proposition de menu du chef privé",
  },
  de: {
    kicker: "Privatkoch · Ibiza und Formentera",
    title: ["Spitzenküche,", "wo immer du bist."],
    lead: "Ein Privatkoch, der kocht, worauf du Lust hast, in deiner Villa oder an Bord deines Boots. Er kommt mit den Zutaten des Tages, kocht, serviert und hinterlässt die Küche makellos.",
    cta: "Koch buchen", cta2: "Menüvorschlag anfragen", close: "Schließen", scroll: "Scrollen",
    promise: [
      ["dish", "Was du dir wünschst", "Paella, Fleisch vom Grill, Fisch, spanische, brasilianische, japanische Küche… oder worauf ihr gerade Lust habt."],
      ["pin", "In deiner Villa oder an Bord", "Er bringt alles Nötige mit und kocht in deiner Küche oder in der Bordküche."],
      ["basket", "Einkauf, Kochen, Service", "Frische Zutaten, am selben Tag gekauft. Ihr setzt euch nur an den Tisch."],
      ["spark", "Hinterlässt alles sauber", "Er räumt Tisch, Reste und Küche auf. Wenn er geht, bleibt keine Spur, nur die Erinnerung an das Essen."],
    ],
    openH: "Keine feste Karte. Wünsch dir, was du willst.",
    openP: "Unser Koch arbeitet ohne festes Menü: Er nimmt jede Essensbestellung und jeden Wunsch an. Ein Gericht aus deiner Heimat, ein Familienrezept, etwas, das du auf Reisen probiert hast, oder eine Änderung in letzter Minute? Er passt sich dir an, nicht umgekehrt.",
    openPts: ["Jede Küche, jedes Gericht", "Änderungen spontan, sogar am selben Abend", "Allergien, Diäten und Vorlieben jedes Gastes"],
    caps: { paella: "Meeresfrüchte-Paella zum Teilen am Tisch.", meat: "Rinderfilet mit Rotweinjus, Püree und gerösteten Karotten.", spain: "Ibérico-Schinken, Knoblauchgarnelen, Pan con tomate und Manchego.", brazil: "Gegrillte Picanha und Fisch-Moqueca, mit Reis, Farofa und Vinaigrette.", fish: "Wolfsbarsch mit Safranbutter, Spargel und confierten Tomaten.", tasting: "Degustationsmenü: Thunfischtatar, Burrata und Jakobsmuschel-Carpaccio." },
    menuH: "Ein Menü, mit dir geschrieben",
    menuP: "Es gibt keine feste Karte. Erzähl uns, was ihr mögt, wer was isst und ob es Allergien gibt; der Koch schlägt vor und wir passen an, bis es genau stimmt. Und wenn ihr an dem Abend Lust auf etwas anderes habt, passt er sich an.",
    cuis: ["Paella und Reisgerichte", "Fleisch vom Grill", "Fisch und Meeresfrüchte", "Spanische Küche und Tapas", "Brasilianische Küche", "Mediterran und ibizenkisch", "Japanisch und Nikkei", "Vegetarisch und vegan", "Brunch und Frühstück", "Kindermenü", "Glutenfrei und Allergien"],
    whereH: "Bei dir, an Land oder auf See",
    where: [["villa", "Deine Villa", "Ein Abendessen am Pool, ein langes Frühstück oder ein Degustationsmenü zum Feiern."], ["boat", "Dein Boot", "Mittagessen an Bord, vor Anker in einer Bucht, serviert wie im besten Restaurant."], ["party", "Deine Feier", "Geburtstage, Jubiläen oder ein privates Event, im Rhythmus des Abends."]],
    whoH: "Wer zu dir nach Hause kommt",
    whoP: "Aufmerksam, freundlich und gepflegt im Auftreten. Er weiß, wann er ein Gericht erklärt und wann er euch allein lässt. Diskret, pünktlich und sorgfältig bis ins Detail: jemand, dem du ohne zu zögern die Tür öffnest.",
    howH: "Von Anfang bis Ende erledigt",
    how: [["Erzähl uns", "Anlass, Gästezahl, Vorlieben, Allergien und Ort."], ["Dein Vorschlag", "Du bekommst ein Menü für euch und wir passen es an, bis es stimmt."], ["Einkauf am Tag", "Der Koch kauft die Zutaten am selben Morgen."], ["Kochen und Service", "Er kommt rechtzeitig, kocht in deiner Küche oder an Bord und serviert am Tisch."], ["Aufräumen und Putzen", "Er räumt auf, putzt und nimmt die Reste mit. Die Küche bleibt, wie sie war."]],
    vsH: "Was du nicht tun musst",
    vs: ["Einen Tisch reservieren oder dich nach Öffnungszeiten richten", "Um Mitternacht ein Taxi suchen", "Einkaufen, kochen oder abwaschen", "Zwischen dem Essen und deinen Leuten wählen"],
    noteH: "Begrenzte Termine in der Hochsaison",
    note: "Die Abende im Juli und August sind früh vergeben. Wenn du deine Daten schon hast, schreib mir heute und ich sichere sie dir.",
    msg: "Hallo Mey Society, ich möchte den Privatkoch buchen", msg2: "Hallo Mey Society, ich hätte gern einen Menüvorschlag des Privatkochs",
  },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ICON = {
  villa: '<path d="M3 11.5 12 5l9 6.5M5.5 10v9h13v-9M10 19v-5h4v5" />',
  party: '<path d="M5 20 9 8l7 7-11 5ZM13 4v2M18 6l-1.5 1.5M20 11h-2M15.5 3.5 15 5" />',
  boat: '<path d="M3 16.5h18l-2.5 3.5h-13L3 16.5ZM6 16.5V13h12v3.5M12 13V4l5 6h-5" />',
  dish: '<path d="M3 16h18M5 16a7 7 0 0 1 14 0M12 9V7M10 7h4M4 19h16" />',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" />',
  basket: '<path d="M4 10h16l-1.6 9H5.6L4 10ZM8 10l3-6M16 10l-3-6M9.5 14v2M14.5 14v2" />',
  spark: '<path d="M12 3.5 13.8 9l5.7 1.5-5.7 1.6L12 17.5l-1.8-5.4-5.7-1.6L10.2 9 12 3.5ZM19 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5" />',
};
const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;

export function initChefPage({ onBook } = {}) {
  let root = null, lastFocus = null;
  const tx = () => T[getLang()] || T.es;
  const ctas = t => `<div class="chef__ctas"><button type="button" class="btn btn--primary btn--lg" data-chef="book">${esc(t.cta)}</button><button type="button" class="btn chef__ghost" data-chef="menu">${esc(t.cta2)}</button></div>`;
  const build = () => {
    const t = tx(), shots = PHOTOS.slice(1);
    root.querySelector(".chef__media img").src = pick(PHOTOS[0][0]);
    root.querySelector(".chef__content").innerHTML = `
      <header class="chef__hero">
        <p class="chef__kicker">${esc(t.kicker)}</p>
        <h2 class="chef__title">${esc(t.title[0])}<br><em>${esc(t.title[1])}</em></h2>
        <p class="chef__lead">${esc(t.lead)}</p>
        ${ctas(t)}
        <p class="chef__hint" aria-hidden="true">${esc(t.scroll)}</p>
      </header>
      <section class="chef__sec chef__promise">
        <ul>${t.promise.map(([ic, h, p]) => `<li><i>${svg(ic)}</i><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ul>
      </section>
      <section class="chef__sec chef__open">
        <p class="chef__openTag">${svg("spark")}</p>
        <h3>${esc(t.openH)}</h3><p class="chef__p">${esc(t.openP)}</p>
        <ul>${t.openPts.map(v => `<li><i>${svg("check")}</i><span>${esc(v)}</span></li>`).join("")}</ul>
      </section>
      ${shots.length ? `<section class="chef__sec chef__gallery">${shots.map(([src, k]) => `<figure><img src="${esc(pick(src))}" alt="${esc(t.caps[k] || "")}" loading="lazy" decoding="async"><figcaption>${esc(t.caps[k] || "")}</figcaption></figure>`).join("")}</section>` : ""}
      <section class="chef__sec chef__menu">
        <h3>${esc(t.menuH)}</h3><p class="chef__p">${esc(t.menuP)}</p>
        <ul class="chef__chips">${t.cuis.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
      </section>
      <section class="chef__sec">
        <h3>${esc(t.whereH)}</h3>
        <ul class="chef__where">${t.where.map(([ic, h, p]) => `<li><i>${svg(ic)}</i><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ul>
      </section>
      <section class="chef__sec chef__who"><h3>${esc(t.whoH)}</h3><p class="chef__p">${esc(t.whoP)}</p></section>
      <section class="chef__sec">
        <h3>${esc(t.howH)}</h3>
        <ol class="chef__how">${t.how.map(([h, p], i) => `<li><span class="chef__n">${i + 1}</span><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ol>
      </section>
      <section class="chef__sec chef__vs">
        <h3>${esc(t.vsH)}</h3>
        <ul>${t.vs.map(v => `<li><i>${svg("check")}</i><span>${esc(v)}</span></li>`).join("")}</ul>
      </section>
      <section class="chef__sec chef__end">
        <p class="chef__noteH"><i aria-hidden="true"></i>${esc(t.noteH)}</p>
        <p class="chef__note">${esc(t.note)}</p>
        ${ctas(t)}
      </section>`;
    root.querySelector(".chef__x").setAttribute("aria-label", t.close);
    root.setAttribute("aria-label", t.kicker);
  };
  const create = () => {
    root = document.createElement("div"); root.className = "chef"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    root.innerHTML = `<div class="chef__media" aria-hidden="true"><img alt="" decoding="async"><span class="chef__shade"></span></div>
      <div class="chef__scroll"><div class="chef__content"></div></div>
      <button type="button" class="chef__x"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    document.body.appendChild(root);
    root.querySelector(".chef__x").addEventListener("click", close);
    root.addEventListener("click", e => {
      const a = e.target.closest("[data-chef]")?.dataset.chef; if (!a) return;
      close(); onBook?.({ kind: a, text: a === "menu" ? tx().msg2 : tx().msg });
    });
    addEventListener("keydown", e => { if (e.key === "Escape" && root && !root.hidden) close(); });
    document.addEventListener("langchange", () => { if (root && !root.hidden) build(); });
    // the photo drifts slower than the text (depth) and dims as the reading starts; each block rises in on arrival
    const sc = root.querySelector(".chef__scroll"), img = root.querySelector(".chef__media img");
    sc.addEventListener("scroll", () => {
      img.style.transform = `translate3d(0, ${(-sc.scrollTop * .12).toFixed(1)}px, 0) scale(1.1)`;
      root.style.setProperty("--dim", Math.min(1, sc.scrollTop / (sc.clientHeight * .7)).toFixed(3));
    }, { passive: true });
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) en.target.classList.add("is-in"); }), { root: sc, threshold: .12 });
    new MutationObserver(() => root.querySelectorAll(".chef__sec").forEach(s => io.observe(s))).observe(root.querySelector(".chef__content"), { childList: true });
  };
  function open() {
    if (!root) create();
    build(); lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add("fx-open");
    root.querySelector(".chef__scroll").scrollTop = 0; root.style.setProperty("--dim", 0);
    requestAnimationFrame(() => root.querySelector(".chef__x").focus({ preventScroll: true }));
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; document.documentElement.classList.remove("fx-open");
    lastFocus?.focus?.({ preventScroll: true });
  }
  return { open, close };
}
