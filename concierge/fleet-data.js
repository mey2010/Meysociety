/* The fleet, grouped by type of boat. Specs come from the operators' 2026 catalogue; prices are deliberately
   left out (they are quoted per date). Where the catalogue gives no figure, the field is simply omitted.
   Photos: data/fleet/card/<id>.webp (carousel) and data/fleet/4k/<id>-1..4.webp (detail sheet, full resolution). */

export const FLEET_TYPES = [
  ["all", "Todos"],
  ["sin-licencia", "Sin licencia"],
  ["lancha", "Lanchas"],
  ["open", "Open"],
  ["yate", "Yates"],
  ["gran-yate", "Grandes yates"],
  ["superyate", "Superyate"],
  ["catamaran", "Catamarán"],
  ["moto-agua", "Motos de agua"],
];

// what each type means, shown in the detail sheet
export const TYPE_NOTE = {
  "sin-licencia": "Barco pequeño que puedes llevar tú, sin titulación náutica.",
  "lancha": "Lancha abierta y ágil para calas cercanas.",
  "open": "Barco open de diseño: mucha cubierta, solárium y sombra, con patrón.",
  "yate": "Yate a motor con camarotes, salón y patrón.",
  "gran-yate": "Yate de gran eslora con tripulación profesional.",
  "superyate": "Superyate con tripulación completa, para el día o para dormir a bordo.",
  "catamaran": "Catamarán a vela: estable, espacioso y tranquilo.",
  "moto-agua": "Moto de agua: tour guiado con monitor, o alquiler si tienes titulación.",
};

const BOTAFOCH = "Marina Botafoch", SANT_ANTONI = "Club Náutico de Sant Antoni";
const WITH_SKIPPER = ["Patrón", "Amarre", "Seguro a todo riesgo", "Bebidas y hielo", "Toallas", "Equipo de snorkel", "Música"];
const SMALL = ["Amarre", "Seguro a todo riesgo", "Bebidas y hielo", "Toallas", "Equipo de snorkel", "Música"];
const TOYS = ["Seabob", "Moto de agua"];

// photos: number of gallery images in data/fleet/4k
export const FLEET = [
  // ---- sin licencia ----
  { id: "divina", type: "sin-licencia", name: "Divina", len: "4,99 m", pax: 6, port: SANT_ANTONI, crew: "Sin titulación", incl: SMALL, photos: 4 },
  { id: "cata", type: "sin-licencia", name: "Cata", port: SANT_ANTONI, crew: "Sin titulación", incl: SMALL, photos: 4 },
  // ---- lanchas ----
  { id: "quicksilver-605", type: "lancha", name: "Quicksilver 605", len: "6,12 m", pax: 7, port: SANT_ANTONI, crew: "Patrón opcional", incl: SMALL, photos: 4 },
  { id: "catleya", type: "lancha", name: "Catleya", port: SANT_ANTONI, photos: 4 },
  { id: "monterey-278", type: "lancha", name: "Monterey 278", len: "9 m", pax: 8, cabins: "Sin camarote, 1 baño", port: BOTAFOCH, incl: SMALL, photos: 4 },
  // ---- open ----
  { id: "de-antonio-d32", type: "open", name: "De Antonio D32", len: "9,8 m (32 ft)", pax: 9, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d34", type: "open", name: "De Antonio D34", len: "10,4 m (34 ft)", pax: 9, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d36", type: "open", name: "De Antonio D36", len: "11,3 m (37 ft)", pax: 11, cabins: "2 camarotes", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "tesoro-40", type: "open", name: "Tesoro 40", len: "12,2 m (40 ft)", pax: 11, cabins: "2 camarotes", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "scorpio-40", type: "open", name: "Scorpio 40", photos: 4 },
  { id: "fjord-41xl", type: "open", name: "Fjord 41 XL", len: "12,5 m (41 ft)", pax: 11, cabins: "2 camarotes", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "jeanneau-db43", type: "open", name: "Jeanneau DB43", len: "13 m (42,7 ft)", pax: 10, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d42-esplendida", type: "open", name: "De Antonio D42 · Espléndida", len: "13,5 m", pax: 11, night: 2, cabins: "2 camarotes", port: BOTAFOCH, crew: "1 tripulante", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  // ---- yates ----
  { id: "neptunus-42-vida-loca", type: "yate", name: "Neptunus 42 · Vida Loca", len: "13,5 m", pax: 11, night: 4, cabins: "2 camarotes, 1 baño", port: BOTAFOCH, crew: "1 tripulante", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "sessa-c44", type: "yate", name: "Sessa C44", len: "13,7 m (45 ft)", pax: 11, cabins: "2 dobles + salón, 2 baños", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "princess-v53", type: "yate", name: "Princess V53", len: "15,2 m (50 ft)", pax: 11, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: [...WITH_SKIPPER, "Aire acondicionado", "Paddle surf"], toys: TOYS, photos: 4 },
  { id: "ferretti-620", type: "yate", name: "Ferretti 620", len: "15,2 m (50 ft)", pax: 11, cabins: "4 dobles, 4 baños", port: BOTAFOCH, crew: "Patrón y azafata", extra: "2.400 CV", incl: ["Patrón y azafata", "Neumática auxiliar", "Luces subacuáticas", "Potabilizadora", "Toallas", "Tabla de paddle", "Limpieza final"], toys: TOYS, photos: 4 },
  { id: "sunseeker-portofino-53", type: "yate", name: "Sunseeker Portofino 53", len: "17,3 m (56,9 ft)", pax: 9, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  // ---- grandes yates ----
  { id: "sunseeker-predator-72-boss", type: "gran-yate", name: "Sunseeker Predator 72 · Boss", len: "17,9 m", pax: 12, night: 6, cabins: "2 dobles + 1 twin, 2 baños", port: BOTAFOCH, crew: "2 tripulantes", incl: ["Tripulación", "Bebidas, snacks y fruta", "Toallas", "Equipo de snorkel", "2 tablas de paddle"], photos: 4 },
  { id: "princess-v58-daddy-cool", type: "gran-yate", name: "Princess V58 · Daddy Cool", len: "18,2 m", pax: 12, night: 6, cabins: "3 camarotes", port: BOTAFOCH, crew: "2 tripulantes", incl: ["Tripulación", "Toallas", "Seguro", "Limpieza final"], toys: ["Seabob"], photos: 4 },
  { id: "pershing-62-urus", type: "gran-yate", name: "Pershing 62 · Urus", len: "19,9 m", pax: 12, night: 6, cabins: "3 camarotes", port: BOTAFOCH, crew: "2 tripulantes", incl: ["Tripulación", "Seguro", "Tabla de paddle", "Equipo de snorkel", "Wifi"], photos: 4 },
  // ---- superyate ----
  { id: "guy-couach-98", type: "superyate", name: "Guy Couach 98", len: "30 m", pax: 12, night: 10, cabins: "4 camarotes", port: BOTAFOCH, crew: "3 tripulantes", incl: ["Tripulación", "Bebidas y hielo", "Toallas", "Equipo de snorkel", "Paddle surf", "Música"], photos: 4 },
  // ---- catamarán ----
  { id: "catamaran-vela", type: "catamaran", name: "Catamarán a vela", photos: 4 },
  // ---- motos de agua (shown on their own from the jet ski card; the boats fleet leaves them out) ----
  { id: "sea-doo-rxt-x-300", type: "moto-agua", name: "Sea-Doo RXT-X 300", crew: "Guiada o con titulación", photos: 1, img: "data/services/moto-de-agua.webp" },
];
