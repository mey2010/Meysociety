/* The fleet, grouped by type of boat. Specs come from the operators' 2026 catalogues (partner fleet included); prices are deliberately
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
  ["coche", "Coches"],
  ["transfer", "Transfers"],
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
  "coche": "Coche de alquiler entregado donde estés, por días o por semanas.",
  "transfer": "Vehículo con chófer privado para llegadas, salidas y noches de club.",
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
  { id: "noah-rib-29-django", type: "lancha", name: "Noah RIB 29 · Django", len: "8,6 m", pax: 9, port: "Marina Botafoch", crew: "Patrón", incl: ["Sonido Hi-Fi Bose"], photos: 2 },
  { id: "valiant-750-mojo", type: "lancha", name: "Valiant 750 · Mojo", len: "7,5 m", pax: 11, port: "Marina Ibiza", crew: "Patrón", extra: "225 CV", incl: ["Toldo bimini", "Escalera de baño", "Solárium amplio", "Equipo de snorkel"], toys: ["Seabob", "Paddle surf"], photos: 2 },
  { id: "sunseeker-mohawk-29-tabung", type: "lancha", name: "Sunseeker Mohawk 29 · Tabung", len: "9,5 m", pax: 7, cabins: "1 camarote abierto", port: "Marina Ibiza", crew: "Patrón", incl: ["Equipo de snorkel", "Paddle surf", "Toallas", "Audio Bluetooth", "Patrón", "Bebidas incluidas", "Snacks"], photos: 2 },
  // ---- open ----
  { id: "de-antonio-d32", type: "open", name: "De Antonio D32", len: "9,8 m (32 ft)", pax: 9, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d34", type: "open", name: "De Antonio D34", len: "10,4 m (34 ft)", pax: 9, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d36", type: "open", name: "De Antonio D36", len: "11,3 m (37 ft)", pax: 11, cabins: "2 camarotes", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "tesoro-40", type: "open", name: "Tesoro 40", len: "12,2 m (40 ft)", pax: 11, cabins: "2 camarotes", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "scorpio-40", type: "open", name: "Scorpio 40", photos: 4 },
  { id: "fjord-41xl", type: "open", name: "Fjord 41 XL", len: "12,5 m (41 ft)", pax: 11, cabins: "2 camarotes", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "jeanneau-db43", type: "open", name: "Jeanneau DB43", len: "13 m (42,7 ft)", pax: 10, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d42-esplendida", type: "open", name: "De Antonio D42 · Espléndida", len: "13,5 m", pax: 11, night: 2, cabins: "2 camarotes", port: BOTAFOCH, crew: "1 tripulante", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "de-antonio-d32-toretto", type: "open", name: "De Antonio D32 · Toretto", len: "11 m", pax: 9, cabins: "1 camarote", port: "Marina Ibiza", crew: "Patrón", extra: "2 × 300 CV", incl: ["Bebidas incluidas", "Toallas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 2 },
  { id: "de-antonio-d34-gogga", type: "open", name: "De Antonio D34 · Gogga", len: "9,8 m", pax: 11, cabins: "1 camarote abierto", port: "Marina Ibiza", crew: "Patrón", incl: ["Equipo de snorkel", "Bebidas incluidas", "Toallas", "Snacks", "Audio Bluetooth", "Paddle surf"], photos: 2 },
  { id: "de-antonio-d42-bambino", type: "open", name: "De Antonio D42 · Bambino", len: "13 m", pax: 11, night: 4, cabins: "1 camarote doble + salón, 1 baño", port: "Port de Santa Eulària", crew: "Patrón", incl: ["Equipo de snorkel", "Paddle surf", "Toallas", "Audio Bluetooth", "Patrón", "Bebidas incluidas", "Snacks"], photos: 3 },
  { id: "de-antonio-d42-beso", type: "open", name: "De Antonio D42 · Beso", len: "12,64 m", pax: 11, cabins: "1 camarote doble, 1 WC eléctrico", port: "Marina Botafoch", crew: "Patrón", incl: ["Tomas USB y 12 V", "Luces decorativas en cubierta", "Toallas", "Bebidas incluidas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 2 },
  { id: "de-antonio-d42-tot-suma", type: "open", name: "De Antonio D42 · Tot Suma", len: "13 m", pax: 11, cabins: "1 camarote abierto", port: "Marina Ibiza", crew: "Patrón", incl: ["Equipo de snorkel", "Bebidas incluidas", "Toallas", "Snacks", "Audio Bluetooth", "Paddle surf"], photos: 3 },
  { id: "de-antonio-d42-ragnar", type: "open", name: "De Antonio D42 · Ragnar", len: "13 m", pax: 11, cabins: "1 camarote", port: "Marina Ibiza", crew: "Patrón", extra: "3 × 300 CV", incl: ["Bebidas incluidas", "Toallas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 2 },
  { id: "de-antonio-d50-sereia", type: "open", name: "De Antonio D50 · Sereia", len: "14,9 m", pax: 11, cabins: "1 camarote doble, 1 baño", port: "Marina Botafoch", crew: "Patrón", incl: ["Tomas USB y 12 V", "Luces decorativas en cubierta", "Aire acondicionado", "Toallas", "Bebidas incluidas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 3 },
  { id: "evo-43-aurora", type: "open", name: "Evo 43 · Aurora", len: "13 m", pax: 11, cabins: "1 camarote doble", port: "Marina Ibiza", crew: "Patrón", incl: ["Equipo de snorkel", "Bebidas incluidas", "Toallas", "Snacks", "Audio Bluetooth", "Paddle surf"], photos: 3 },
  { id: "frauscher-1414-hailey-su", type: "open", name: "Frauscher 1414 Demon Air · Hailey Su", len: "13 m", pax: 11, cabins: "1 camarote", port: "Marina Botafoch", crew: "Patrón", extra: "2 × 440 CV", photos: 3 },
  { id: "say-carbon-45-my-choice", type: "open", name: "SAY Carbon 45 · My Choice", len: "13,85 m", pax: 11, port: "Marina Ibiza", crew: "Patrón", extra: "900 CV", photos: 3 },
  { id: "vandutch-40-majestic", type: "open", name: "VanDutch 40 · Majestic", len: "11,98 m", pax: 9, port: "Marina Botafoch", crew: "Patrón", extra: "2 × 480 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel"], toys: ["Seabob"], photos: 3 },
  { id: "oryx-38-santa-cruz", type: "open", name: "Oryx 38 · Santa Cruz", len: "11,5 m", pax: 11, port: "Port de Santa Eulària", crew: "Patrón", incl: ["Equipo de snorkel", "Paddle surf", "Toallas", "Audio Bluetooth", "Patrón", "Bebidas incluidas", "Snacks"], photos: 3 },
  { id: "ts-drive-seanfinity", type: "open", name: "TS Drive · Seanfinity", len: "14,3 m", pax: 11, port: "Marina Botafoch", crew: "Patrón", extra: "2 × 570 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel"], toys: ["Seabob"], photos: 3 },
  { id: "bronson-50-celebrate-life", type: "open", name: "Bronson 50 · Celebrate Life", len: "15 m", pax: 12, cabins: "2 camarotes", port: "Marina Ibiza", crew: "Patrón y azafata", extra: "2 × Volvo Penta IPS 800", photos: 3 },
  { id: "cnm-tender-50-double-k", type: "open", name: "CNM Continental Tender 50 · Double K", len: "16,03 m", pax: 10, cabins: "2 camarotes", port: "Marina Botafoch", crew: "Patrón y azafata", extra: "2 × 800 CV MAN", photos: 3 },
  { id: "pardo-50-horizon", type: "open", name: "Pardo 50 · Horizon", len: "16,25 m", pax: 10, cabins: "2 camarotes dobles, 2 baños", port: "Marina Ibiza", crew: "Patrón", extra: "2 × Volvo Penta IPS 800", incl: ["Audio Bluetooth", "Equipo de música", "Plataforma de baño", "TV por satélite", "Bebidas incluidas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 3 },
  { id: "vanquish-vq52-casa-atlantis", type: "open", name: "Vanquish VQ52 · Casa Atlantis", len: "16,2 m", pax: 12, cabins: "1 camarote", port: "Marina Ibiza", crew: "Patrón y azafata", extra: "2 × 600 CV Cummins", photos: 3 },
  { id: "vanquish-vq54-diva", type: "open", name: "Vanquish VQ54 · Diva", len: "13,1 m", pax: 11, cabins: "1 camarote", port: "Marina Botafoch", crew: "Patrón", extra: "2 × 435 CV Volvo Penta", photos: 3 },
  { id: "vanquish-vq58-mi-paraiso", type: "open", name: "Vanquish VQ58 · Mi Paraíso", len: "17,95 m", pax: 12, cabins: "1 camarote", port: "Marina Botafoch", crew: "Patrón y azafata", extra: "2 × Volvo Penta IPS 950", photos: 3 },
  // ---- yates ----
  { id: "neptunus-42-vida-loca", type: "yate", name: "Neptunus 42 · Vida Loca", len: "13,5 m", pax: 11, night: 4, cabins: "2 camarotes, 1 baño", port: BOTAFOCH, crew: "1 tripulante", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "sessa-c44", type: "yate", name: "Sessa C44", len: "13,7 m (45 ft)", pax: 11, cabins: "2 dobles + salón, 2 baños", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "princess-v53", type: "yate", name: "Princess V53", len: "15,2 m (50 ft)", pax: 11, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: [...WITH_SKIPPER, "Aire acondicionado", "Paddle surf"], toys: TOYS, photos: 4 },
  { id: "ferretti-620", type: "yate", name: "Ferretti 620", len: "15,2 m (50 ft)", pax: 11, cabins: "4 dobles, 4 baños", port: BOTAFOCH, crew: "Patrón y azafata", extra: "2.400 CV", incl: ["Patrón y azafata", "Neumática auxiliar", "Luces subacuáticas", "Potabilizadora", "Toallas", "Tabla de paddle", "Limpieza final"], toys: TOYS, photos: 4 },
  { id: "sunseeker-portofino-53", type: "yate", name: "Sunseeker Portofino 53", len: "17,3 m (56,9 ft)", pax: 9, cabins: "3 dobles + salón", port: BOTAFOCH, crew: "Patrón incluido", incl: WITH_SKIPPER, toys: TOYS, photos: 4 },
  { id: "cranchi-47-com-tu", type: "yate", name: "Cranchi Mediterranee 47 · Com Tu", len: "15 m", pax: 12, night: 4, cabins: "1 doble + 1 twin, 2 baños", port: "Port de Santa Eulària", crew: "Patrón", incl: ["Equipo de snorkel", "Paddle surf", "Toallas", "Audio Bluetooth", "Patrón", "Bebidas incluidas", "Snacks"], photos: 3 },
  { id: "cranchi-41-new-cristina", type: "yate", name: "Cranchi 41 · New Cristina", len: "13 m", pax: 9, night: 2, cabins: "1 camarote + salón, 1 baño", port: "Marina Botafoch", crew: "Patrón", extra: "2 × 300 CV Volvo Penta", incl: ["Equipo de música", "Agua caliente", "Mesa en bañera", "Ducha", "Toldo bimini", "Colchonetas en proa", "Cocina equipada", "Bebidas incluidas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 3 },
  { id: "apreamare-45-iremar", type: "yate", name: "Apreamare 45 · Iremar", len: "13,5 m", pax: 11, night: 4, cabins: "1 doble + 1 twin, 2 baños", port: "Port de Santa Eulària", crew: "Patrón", incl: ["Equipo de snorkel", "Paddle surf", "Toallas", "Audio Bluetooth", "Patrón", "Bebidas incluidas", "Snacks"], photos: 2 },
  { id: "pershing-37-tanit", type: "yate", name: "Pershing 37 · Tanit", len: "11,45 m", pax: 9, cabins: "1 camarote abierto", port: "Marina Ibiza", crew: "Patrón", incl: ["Equipo de snorkel", "Bebidas incluidas", "Toallas", "Snacks", "Audio Bluetooth", "Paddle surf"], photos: 2 },
  { id: "pershing-43-nina", type: "yate", name: "Pershing 43 · Nina", len: "13 m", pax: 12, night: 4, cabins: "2 dobles + salón, 1 baño", port: "Marina Botafoch", crew: "Patrón", incl: ["Radar", "Equipo de música", "Agua caliente", "Mesa en bañera", "Ducha", "Toldo bimini", "Colchonetas en proa", "Nevera", "Cocina equipada", "Bebidas incluidas", "Equipo de snorkel", "Paddle surf"], toys: ["Seabob"], photos: 3 },
  { id: "pershing-5x-remedy", type: "yate", name: "Pershing 5X · Remedy", len: "16,51 m", pax: 10, cabins: "2 camarotes", port: "Marina Botafoch", crew: "Patrón y azafata", extra: "2 × Volvo D11 IPS 950", photos: 3 },
  { id: "riva-rivale-52-invictus", type: "yate", name: "Riva Rivale 52 · Invictus", len: "16,12 m", pax: 12, night: 6, cabins: "3 camarotes", port: "Marina Ibiza", crew: "Patrón", extra: "2 × 1.050 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático"], toys: ["Seabob"], photos: 3 },
  { id: "riva-rivale-56-next-level", type: "yate", name: "Riva Rivale 56 · Next Level", len: "17 m", pax: 12, cabins: "3 camarotes", port: "Marina Botafoch", crew: "2 tripulantes", extra: "2 × 1.200 CV MAN", photos: 2 },
  { id: "sea-ray-55-il-consigliere", type: "yate", name: "Sea Ray 55 · Il Consigliere", len: "17 m", pax: 12, night: 6, cabins: "1 camarote principal", port: "Marina Ibiza", crew: "Patrón y azafata", photos: 2 },
  { id: "sunseeker-predator-62-shadow", type: "yate", name: "Sunseeker Predator 62 · Shadow", len: "18 m", pax: 12, night: 6, cabins: "2 camarotes dobles", port: "Marina Ibiza", crew: "Patrón y azafata", photos: 3 },
  // ---- grandes yates ----
  { id: "sunseeker-predator-72-boss", type: "gran-yate", name: "Sunseeker Predator 72 · Boss", len: "17,9 m", pax: 12, night: 6, cabins: "2 dobles + 1 twin, 2 baños", port: BOTAFOCH, crew: "2 tripulantes", incl: ["Tripulación", "Bebidas, snacks y fruta", "Toallas", "Equipo de snorkel", "2 tablas de paddle"], photos: 4 },
  { id: "princess-v58-daddy-cool", type: "gran-yate", name: "Princess V58 · Daddy Cool", len: "18,2 m", pax: 12, night: 6, cabins: "3 camarotes", port: BOTAFOCH, crew: "2 tripulantes", incl: ["Tripulación", "Toallas", "Seguro", "Limpieza final"], toys: ["Seabob"], photos: 4 },
  { id: "pershing-62-urus", type: "gran-yate", name: "Pershing 62 · Urus", len: "19,9 m", pax: 12, night: 6, cabins: "3 camarotes", port: BOTAFOCH, crew: "2 tripulantes", incl: ["Tripulación", "Seguro", "Tabla de paddle", "Equipo de snorkel", "Wifi"], photos: 4 },
  { id: "sunseeker-predator-68-tranquility", type: "gran-yate", name: "Sunseeker Predator 68 · Tranquility III", len: "21,6 m", pax: 12, night: 6, cabins: "2 camarotes", port: "Marina Botafoch", crew: "2 tripulantes", extra: "2 × 1.300 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático"], toys: ["Seabob"], photos: 3 },
  { id: "sunseeker-predator-74-black-jax", type: "gran-yate", name: "Sunseeker Predator 74 · Black Jax", len: "22,38 m", pax: 12, night: 6, cabins: "3 camarotes", port: "Marina Botafoch", crew: "2 tripulantes", extra: "2 × 1.850 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático"], toys: ["Seabob"], photos: 3 },
  { id: "sunseeker-predator-82-georgia", type: "gran-yate", name: "Sunseeker Predator 82 · Georgia", len: "24 m", pax: 12, night: 8, cabins: "4 camarotes", port: "Marina Botafoch", crew: "3 tripulantes", extra: "2 × 1.820 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático", "Donut hinchable"], toys: ["Seabob", "Moto de agua"], photos: 3 },
  { id: "princess-v72-ruby-tuesday", type: "gran-yate", name: "Princess V72 · Ruby Tuesday", len: "22 m", pax: 12, night: 6, cabins: "3 camarotes", port: "Marina Botafoch", crew: "2 tripulantes", extra: "2 × 1.850 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático"], toys: ["Seabob"], photos: 3 },
  { id: "pershing-72-legendary", type: "gran-yate", name: "Pershing 72 · Legendary", len: "21 m", pax: 12, night: 7, cabins: "3 camarotes", port: "Marina Ibiza", crew: "3 tripulantes", extra: "2 × 2.000 CV MTU", photos: 3 },
  { id: "pershing-72-sensation", type: "gran-yate", name: "Pershing 72 · Sensation", len: "22,26 m", pax: 12, night: 6, cabins: "3 camarotes", port: "Marina Botafoch", crew: "2 tripulantes", extra: "2 × 2.000 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático"], toys: ["Seabob"], photos: 3 },
  { id: "sirena-64-salacia", type: "gran-yate", name: "Sirena 64 · Salacia", len: "20,74 m", pax: 12, night: 6, cabins: "Suite principal, suite VIP y 1 camarote twin", port: "Marina Botafoch", crew: "Patrón y azafata", photos: 3 },
  // ---- superyate ----
  { id: "guy-couach-98", type: "superyate", name: "Guy Couach 98", len: "30 m", pax: 12, night: 10, cabins: "4 camarotes", port: BOTAFOCH, crew: "3 tripulantes", incl: ["Tripulación", "Bebidas y hielo", "Toallas", "Equipo de snorkel", "Paddle surf", "Música"], photos: 4 },
  { id: "sunseeker-predator-84-ariyas", type: "superyate", name: "Sunseeker Predator 84 · Ariyas", len: "25,6 m", pax: 12, night: 8, cabins: "4 camarotes", port: "Marina Botafoch", crew: "3 tripulantes", extra: "2 × 2.434 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático", "Donut hinchable"], toys: ["Seabob", "Moto de agua"], photos: 3 },
  { id: "pershing-90-inspiration", type: "superyate", name: "Pershing 90 · Inspiration", len: "27,42 m", pax: 12, night: 8, cabins: "4 camarotes", port: "Marina Botafoch", crew: "3 tripulantes", extra: "2 × 2.450 CV", photos: 3 },
  { id: "vanquish-vq82-sea-story", type: "superyate", name: "Vanquish VQ82 · Sea Story", pax: 12, night: 9, cabins: "1 camarote", port: "Marina Botafoch", crew: "Patrón y azafata", extra: "2 × Volvo Penta IPS 1050", photos: 3 },
  { id: "mangusta-108-belisa", type: "superyate", name: "Mangusta 108 · Belisa", len: "32,92 m", pax: 12, night: 10, cabins: "4 camarotes", port: "Marina Botafoch", crew: "5 tripulantes", extra: "2 × 2.800 CV", incl: ["TV y sonido Hi-Fi Bose", "Wifi a bordo", "Equipo de snorkel", "Neumática auxiliar", "Wakeboard y esquí acuático", "Donut hinchable"], toys: ["Seabob", "Moto de agua"], photos: 3 },
  // ---- catamarán ----
  { id: "catamaran-vela", type: "catamaran", name: "Catamarán a vela", photos: 4 },
  { id: "sunreef-70-yolo", type: "catamaran", name: "Sunreef 70 · Yolo", len: "22,72 m", pax: 12, night: 8, cabins: "4 camarotes", port: "Marina Botafoch", crew: "4 tripulantes", extra: "2 × 168 CV John Deere", incl: ["Neumática auxiliar", "Flybridge con zona de bar", "Sonido Hi-Fi Sonos", "Equipo de snorkel", "Paddle surf", "Wakeboard y esquí acuático", "Pesca"], toys: ["Seabob"], photos: 3 },
  // ---- motos de agua (shown on their own from the jet ski card; the boats fleet leaves them out) ----
  { id: "sea-doo-rxt-x-300", type: "moto-agua", name: "Sea-Doo RXT-X 300", crew: "Guiada o con titulación", photos: 1, img: "data/services/moto-de-agua.webp" },
  { id: "sea-doo-gtx-230", type: "moto-agua", name: "Sea-Doo GTX 230", len: "3,45 m", pax: 3, port: "Marina Botafoch", crew: "Guiada o con titulación", extra: "230 CV", incl: ["Nevera", "Audio Bluetooth"], photos: 2 },
  { id: "sea-doo-gtx-limited-300", type: "moto-agua", name: "Sea-Doo GTX Limited 300", len: "3,45 m", pax: 3, port: "Marina Botafoch", crew: "Guiada o con titulación", extra: "300 CV", incl: ["Nevera", "Audio Bluetooth"], photos: 2 },
  { id: "sea-doo-rxt-x-rs-325", type: "moto-agua", name: "Sea-Doo RXT-X RS 325", len: "3,45 m", pax: 3, port: "Marina Botafoch", crew: "Guiada o con titulación", extra: "325 CV", incl: ["Nevera", "Audio Bluetooth"], photos: 2 },
  { id: "sea-doo-wake-pro-230", type: "moto-agua", name: "Sea-Doo Wake Pro 230", len: "3,45 m", pax: 3, port: "Marina Botafoch", crew: "Guiada o con titulación", extra: "230 CV", incl: ["Nevera", "Audio Bluetooth"], photos: 2 },
  // ---- coches y transfers (each shown on its own from its card; photos from the service cards) ----
  { id: "lamborghini-huracan", type: "coche", name: "Lamborghini Huracán", photos: 1, img: "data/services/coches.webp" },
  { id: "mercedes-clase-v", type: "transfer", name: "Mercedes-Benz Clase V", photos: 1, img: "data/services/transfers.webp" },
];
