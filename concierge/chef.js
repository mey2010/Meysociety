/* Alta cocina — the private chef's page. A full-screen page that opens from the "Alta cocina" card or the menu:
   who she is (as the concierge vouches for her), what she cooks, where she takes the service (villa, party, boat),
   how it works from the first message to the last plate, and one clear way to book. Nothing here is invented:
   no awards, no reviews, no prices. The voice is the concierge's own recommendation. */
import { getLang } from "./i18n.js";

const T = {
  es: {
    kicker: "Chef privada · Ibiza y Formentera",
    title: ["La chef que", "hace que vuelvas."],
    lead: "De todas las cocinas de la isla, esta es la que recomiendo sin pensarlo. Cocina como pocas, se adapta a lo que te apetezca y convierte una cena en el recuerdo del viaje.",
    scroll: "Desliza para conocerla",
    whyH: "Por qué ella",
    why: [
      ["Producto de aquí, del día", "Pescado de la lonja, verdura de payés y lo mejor del mercado esa misma mañana. El menú se decide con lo que está en su punto, no con lo que había en la nevera."],
      ["Cocina a tu medida", "Mediterránea, japonesa, brasa, vegana, sin gluten o el plato de tu infancia. Escucha, propone y cocina para ti, no un menú cerrado para todos."],
      ["Servicio impecable", "Llega, cocina, sirve y recoge. La cocina queda como estaba y tú solo te ocupas de tus invitados."],
    ],
    whereH: "Donde tú estés",
    whereP: "Se desplaza con todo lo necesario para cocinar al nivel de un buen restaurante, en cualquier rincón de la isla.",
    where: [["Tu villa", "Cenas íntimas, desayunos largos o un menú degustación junto a la piscina."], ["Tu fiesta", "Cumpleaños, despedidas, aniversarios o un evento privado, con el ritmo que pida la noche."], ["Tu barco", "Un almuerzo a bordo fondeado en una cala, servido como en tierra firme."]],
    cuisH: "Lo que se te antoje",
    cuis: ["Mediterránea e ibicenca", "Arroces y paellas", "Pescado y marisco", "Japonesa y nikkei", "Brasa y barbacoa", "Vegetariana y vegana", "Menú degustación", "Brunch y desayunos", "Menú para niños", "Sin gluten y alergias"],
    howH: "Así funciona",
    how: [["Nos cuentas", "Ocasión, número de invitados, gustos, alergias y dónde será."], ["Tu menú", "Te llega una propuesta personalizada y la ajustamos hasta que sea exactamente lo que quieres."], ["El día", "Compra el producto esa mañana, llega con tiempo y cocina en tu cocina o a bordo."], ["Después", "Servicio, mesa y recogida. Tú te quedas con el recuerdo."]],
    quote: "Que al día siguiente todavía se hable de la cena. Y que el año que viene la quieras otra vez.",
    quoteBy: "Lo que busco cada vez que la recomiendo",
    noteH: "Fechas limitadas",
    note: "Es una sola chef y en temporada alta sus noches se reservan con antelación. Si ya tienes fechas, escríbeme hoy y te la aseguro.",
    cta: "Reservar a la chef", cta2: "Pedir una propuesta de menú", close: "Cerrar",
    msg: "Hola Mey Society, quiero a la chef privada", msg2: "Hola Mey Society, me gustaría una propuesta de menú de la chef",
  },
  en: {
    kicker: "Private chef · Ibiza and Formentera",
    title: ["The chef who", "brings you back."],
    lead: "Of all the kitchens on the island, this is the one I recommend without a second thought. She cooks like few others, adapts to whatever you fancy and turns a dinner into the memory of the trip.",
    scroll: "Scroll to meet her",
    whyH: "Why her",
    why: [
      ["Local produce, bought that day", "Fish from the market, vegetables from island farms and the best of that morning's stalls. The menu is set by what is at its peak, not by what was in the fridge."],
      ["Cooking made for you", "Mediterranean, Japanese, grill, vegan, gluten-free or the dish from your childhood. She listens, suggests and cooks for you, not a set menu for everyone."],
      ["Flawless service", "She arrives, cooks, serves and clears away. The kitchen is left as it was and you only look after your guests."],
    ],
    whereH: "Wherever you are",
    whereP: "She travels with everything needed to cook at the level of a fine restaurant, anywhere on the island.",
    where: [["Your villa", "Intimate dinners, long breakfasts or a tasting menu by the pool."], ["Your party", "Birthdays, hen and stag parties, anniversaries or a private event, at the pace the night asks for."], ["Your boat", "Lunch on board, anchored in a cove, served as it would be on land."]],
    cuisH: "Whatever you crave",
    cuis: ["Mediterranean and Ibizan", "Rice dishes and paella", "Fish and seafood", "Japanese and Nikkei", "Grill and barbecue", "Vegetarian and vegan", "Tasting menu", "Brunch and breakfast", "Kids' menu", "Gluten-free and allergies"],
    howH: "How it works",
    how: [["Tell us", "The occasion, number of guests, tastes, allergies and where it will be."], ["Your menu", "You receive a personal proposal and we adjust it until it is exactly what you want."], ["On the day", "She buys the produce that morning, arrives in good time and cooks in your kitchen or on board."], ["Afterwards", "Service, table and clearing up. You keep the memory."]],
    quote: "That the next day everyone is still talking about the dinner. And that next year you want her again.",
    quoteBy: "What I look for every time I recommend her",
    noteH: "Limited dates",
    note: "She is one chef, and in high season her evenings are booked well ahead. If you already have dates, write to me today and I will secure her for you.",
    cta: "Book the chef", cta2: "Ask for a menu proposal", close: "Close",
    msg: "Hi Mey Society, I'd like the private chef", msg2: "Hi Mey Society, I'd like a menu proposal from the chef",
  },
  it: {
    kicker: "Chef privata · Ibiza e Formentera",
    title: ["La chef che", "ti fa tornare."],
    lead: "Tra tutte le cucine dell'isola, è quella che consiglio senza pensarci. Cucina come poche, si adatta a ciò che desideri e trasforma una cena nel ricordo del viaggio.",
    scroll: "Scorri per conoscerla",
    whyH: "Perché lei",
    why: [
      ["Prodotto locale, del giorno", "Pesce del mercato, verdure dei contadini dell'isola e il meglio dei banchi di quella mattina. Il menu lo decide ciò che è al punto giusto, non ciò che c'era in frigo."],
      ["Cucina su misura", "Mediterranea, giapponese, brace, vegana, senza glutine o il piatto della tua infanzia. Ascolta, propone e cucina per te, non un menu fisso per tutti."],
      ["Servizio impeccabile", "Arriva, cucina, serve e riordina. La cucina resta com'era e tu pensi solo ai tuoi ospiti."],
    ],
    whereH: "Ovunque tu sia",
    whereP: "Si sposta con tutto il necessario per cucinare al livello di un ottimo ristorante, in ogni angolo dell'isola.",
    where: [["La tua villa", "Cene intime, colazioni lunghe o un menu degustazione a bordo piscina."], ["La tua festa", "Compleanni, addii al nubilato e celibato, anniversari o un evento privato, al ritmo che chiede la serata."], ["La tua barca", "Un pranzo a bordo all'ancora in una caletta, servito come sulla terraferma."]],
    cuisH: "Tutto ciò che desideri",
    cuis: ["Mediterranea e ibizenca", "Risotti e paella", "Pesce e frutti di mare", "Giapponese e nikkei", "Brace e barbecue", "Vegetariana e vegana", "Menu degustazione", "Brunch e colazioni", "Menu per bambini", "Senza glutine e allergie"],
    howH: "Come funziona",
    how: [["Raccontaci", "Occasione, numero di ospiti, gusti, allergie e luogo."], ["Il tuo menu", "Ricevi una proposta personalizzata e la ritocchiamo finché non è esattamente ciò che vuoi."], ["Il giorno", "Compra il prodotto quella mattina, arriva per tempo e cucina nella tua cucina o a bordo."], ["Dopo", "Servizio, tavola e riordino. A te resta il ricordo."]],
    quote: "Che il giorno dopo si parli ancora della cena. E che l'anno prossimo tu la voglia di nuovo.",
    quoteBy: "Ciò che cerco ogni volta che la consiglio",
    noteH: "Date limitate",
    note: "È una sola chef e in alta stagione le sue serate si prenotano con anticipo. Se hai già le date, scrivimi oggi e te la assicuro.",
    cta: "Prenota la chef", cta2: "Chiedi una proposta di menu", close: "Chiudi",
    msg: "Ciao Mey Society, vorrei la chef privata", msg2: "Ciao Mey Society, vorrei una proposta di menu della chef",
  },
  fr: {
    kicker: "Cheffe privée · Ibiza et Formentera",
    title: ["La cheffe qui", "vous fait revenir."],
    lead: "De toutes les cuisines de l'île, c'est celle que je recommande sans hésiter. Elle cuisine comme peu d'autres, s'adapte à toutes vos envies et fait d'un dîner le souvenir du voyage.",
    scroll: "Faites défiler pour la découvrir",
    whyH: "Pourquoi elle",
    why: [
      ["Des produits d'ici, du jour", "Poisson de la criée, légumes des fermes de l'île et le meilleur du marché le matin même. Le menu suit ce qui est à point, pas ce qu'il y avait au frigo."],
      ["Une cuisine sur mesure", "Méditerranéenne, japonaise, grillades, vegan, sans gluten ou le plat de votre enfance. Elle écoute, propose et cuisine pour vous, pas un menu unique pour tous."],
      ["Un service impeccable", "Elle arrive, cuisine, sert et range. La cuisine reste comme elle était et vous ne vous occupez que de vos invités."],
    ],
    whereH: "Là où vous êtes",
    whereP: "Elle se déplace avec tout le nécessaire pour cuisiner au niveau d'un grand restaurant, partout sur l'île.",
    where: [["Votre villa", "Dîners intimes, longs petits-déjeuners ou menu dégustation au bord de la piscine."], ["Votre fête", "Anniversaires, EVJF et EVG, célébrations ou événement privé, au rythme de la soirée."], ["Votre bateau", "Un déjeuner à bord, au mouillage dans une crique, servi comme à terre."]],
    cuisH: "Selon vos envies",
    cuis: ["Méditerranéenne et ibicenca", "Riz et paella", "Poisson et fruits de mer", "Japonaise et nikkei", "Braise et barbecue", "Végétarienne et vegan", "Menu dégustation", "Brunch et petits-déjeuners", "Menu enfants", "Sans gluten et allergies"],
    howH: "Comment ça marche",
    how: [["Racontez-nous", "L'occasion, le nombre d'invités, vos goûts, vos allergies et le lieu."], ["Votre menu", "Vous recevez une proposition personnalisée, ajustée jusqu'à ce qu'elle soit exactement ce que vous voulez."], ["Le jour J", "Elle achète les produits le matin, arrive en avance et cuisine chez vous ou à bord."], ["Ensuite", "Service, table et rangement. Il vous reste le souvenir."]],
    quote: "Que le lendemain, on parle encore du dîner. Et que l'an prochain, vous la vouliez de nouveau.",
    quoteBy: "Ce que je recherche chaque fois que je la recommande",
    noteH: "Dates limitées",
    note: "Elle est seule en cuisine et, en haute saison, ses soirées se réservent longtemps à l'avance. Si vous avez déjà vos dates, écrivez-moi aujourd'hui et je vous la réserve.",
    cta: "Réserver la cheffe", cta2: "Demander une proposition de menu", close: "Fermer",
    msg: "Bonjour Mey Society, je souhaite la cheffe privée", msg2: "Bonjour Mey Society, je voudrais une proposition de menu de la cheffe",
  },
  de: {
    kicker: "Private Köchin · Ibiza und Formentera",
    title: ["Die Köchin, wegen der", "du wiederkommst."],
    lead: "Von allen Küchen der Insel ist das die, die ich ohne zu zögern empfehle. Sie kocht wie kaum eine andere, passt sich jedem Wunsch an und macht ein Abendessen zur Erinnerung der Reise.",
    scroll: "Scrollen, um sie kennenzulernen",
    whyH: "Warum sie",
    why: [
      ["Regional, vom selben Tag", "Fisch vom Markt, Gemüse von den Bauern der Insel und das Beste der Stände am selben Morgen. Das Menü richtet sich nach dem, was gerade perfekt ist, nicht nach dem Kühlschrank."],
      ["Küche nach Maß", "Mediterran, japanisch, Grill, vegan, glutenfrei oder das Gericht deiner Kindheit. Sie hört zu, schlägt vor und kocht für dich, kein Einheitsmenü."],
      ["Makelloser Service", "Sie kommt, kocht, serviert und räumt auf. Die Küche bleibt, wie sie war, und du kümmerst dich nur um deine Gäste."],
    ],
    whereH: "Wo immer du bist",
    whereP: "Sie bringt alles mit, um auf dem Niveau eines sehr guten Restaurants zu kochen, überall auf der Insel.",
    where: [["Deine Villa", "Intime Dinner, lange Frühstücke oder ein Degustationsmenü am Pool."], ["Deine Party", "Geburtstage, Junggesellenabschiede, Jubiläen oder ein privates Event, im Rhythmus des Abends."], ["Dein Boot", "Ein Mittagessen an Bord, vor Anker in einer Bucht, serviert wie an Land."]],
    cuisH: "Worauf du Lust hast",
    cuis: ["Mediterran und ibizenkisch", "Reisgerichte und Paella", "Fisch und Meeresfrüchte", "Japanisch und Nikkei", "Grill und Barbecue", "Vegetarisch und vegan", "Degustationsmenü", "Brunch und Frühstück", "Kindermenü", "Glutenfrei und Allergien"],
    howH: "So funktioniert's",
    how: [["Erzähl uns", "Anlass, Gästezahl, Vorlieben, Allergien und Ort."], ["Dein Menü", "Du bekommst einen persönlichen Vorschlag, den wir anpassen, bis er genau passt."], ["Am Tag", "Sie kauft morgens ein, kommt rechtzeitig und kocht in deiner Küche oder an Bord."], ["Danach", "Service, Tisch und Aufräumen. Dir bleibt die Erinnerung."]],
    quote: "Dass am nächsten Tag noch alle vom Abendessen reden. Und dass du sie nächstes Jahr wieder willst.",
    quoteBy: "Was ich jedes Mal suche, wenn ich sie empfehle",
    noteH: "Begrenzte Termine",
    note: "Sie ist eine einzige Köchin, und in der Hochsaison sind ihre Abende früh vergeben. Wenn du deine Daten schon hast, schreib mir heute und ich sichere sie dir.",
    cta: "Köchin buchen", cta2: "Menüvorschlag anfragen", close: "Schließen",
    msg: "Hallo Mey Society, ich möchte die private Köchin", msg2: "Hallo Mey Society, ich hätte gern einen Menüvorschlag der Köchin",
  },
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ICON = {
  villa: '<path d="M3 11.5 12 5l9 6.5M5.5 10v9h13v-9M10 19v-5h4v5" />',
  party: '<path d="M5 20 9 8l7 7-11 5ZM13 4v2M18 6l-1.5 1.5M20 11h-2M15.5 3.5 15 5" />',
  boat: '<path d="M3 16.5h18l-2.5 3.5h-13L3 16.5ZM6 16.5V13h12v3.5M12 13V4l5 6h-5" />',
};

export function initChefPage({ onBook } = {}) {
  let root = null, lastFocus = null;
  const tx = () => T[getLang()] || T.es;
  const build = () => {
    const t = tx();
    root.querySelector(".chef__content").innerHTML = `
      <header class="chef__hero">
        <p class="chef__kicker">${esc(t.kicker)}</p>
        <h2 class="chef__title">${esc(t.title[0])}<br><em>${esc(t.title[1])}</em></h2>
        <p class="chef__lead">${esc(t.lead)}</p>
        <div class="chef__ctas"><button type="button" class="btn btn--primary btn--lg" data-chef="book">${esc(t.cta)}</button></div>
        <p class="chef__hint" aria-hidden="true">${esc(t.scroll)}</p>
      </header>
      <section class="chef__sec">
        <h3>${esc(t.whyH)}</h3>
        <ol class="chef__why">${t.why.map(([h, p], i) => `<li><span class="chef__n">0${i + 1}</span><b>${esc(h)}</b><p>${esc(p)}</p></li>`).join("")}</ol>
      </section>
      <section class="chef__sec chef__sec--where">
        <h3>${esc(t.whereH)}</h3><p class="chef__p">${esc(t.whereP)}</p>
        <ul class="chef__where">${t.where.map(([h, p], i) => `<li><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ICON[["villa", "party", "boat"][i]]}</svg><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ul>
      </section>
      <section class="chef__sec">
        <h3>${esc(t.cuisH)}</h3>
        <ul class="chef__chips">${t.cuis.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
      </section>
      <section class="chef__sec">
        <h3>${esc(t.howH)}</h3>
        <ol class="chef__how">${t.how.map(([h, p]) => `<li><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ol>
      </section>
      <figure class="chef__sec chef__quote"><blockquote>${esc(t.quote)}</blockquote><figcaption>${esc(t.quoteBy)}</figcaption></figure>
      <section class="chef__sec chef__end">
        <p class="chef__noteH"><i aria-hidden="true"></i>${esc(t.noteH)}</p>
        <p class="chef__note">${esc(t.note)}</p>
        <div class="chef__ctas"><button type="button" class="btn btn--primary btn--lg" data-chef="book">${esc(t.cta)}</button><button type="button" class="btn chef__ghost" data-chef="menu">${esc(t.cta2)}</button></div>
      </section>`;
    root.querySelector(".chef__x").setAttribute("aria-label", t.close);
    root.setAttribute("aria-label", t.kicker);
  };
  const create = () => {
    root = document.createElement("div"); root.className = "chef"; root.hidden = true;
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    root.innerHTML = `<div class="chef__media" aria-hidden="true"><img src="data/services/dining.webp" alt="" decoding="async"><span class="chef__shade"></span></div>
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
    // the photo drifts slower than the text (depth), and each block rises in as it reaches the screen
    const sc = root.querySelector(".chef__scroll"), img = root.querySelector(".chef__media img");
    sc.addEventListener("scroll", () => {
      img.style.transform = `translate3d(0, ${(-sc.scrollTop * .12).toFixed(1)}px, 0) scale(1.12)`;
      root.style.setProperty("--dim", Math.min(1, sc.scrollTop / (sc.clientHeight * .8)).toFixed(3));   // the photo steps back as the reading starts
    }, { passive: true });
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) en.target.classList.add("is-in"); }), { root: sc, threshold: .15 });
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
