/*
 * Concierge Ibiza — configuración del recorrido.
 *
 * Cada escena define un keyframe de cámara geográfico (lon, lat, altura en m,
 * heading y pitch en grados). `travel` = pantallas de scroll que tarda la cámara
 * en llegar desde la escena anterior; `hold` = pantallas en las que la cámara
 * se queda casi quieta mientras se lee el contenido comercial.
 * `light` (0–1) = temperatura de la luz: 0 mediodía, 1 hora dorada.
 *
 * `verified: false` marca keyframes provisionales (ver docs/fase-1-storyboard.md).
 */
window.CONCIERGE_CONFIG = {
  // Google Maps Platform key con Map Tiles API activada.
  // También se puede pasar por URL: index.html?key=TU_KEY
  googleMapsApiKey: '',

  brand: { name: 'Concierge Ibiza' },

  // ⚠️ PENDIENTE: número real en formato internacional sin "+" ni espacios.
  whatsapp: '34600000000',
  email: 'hello@example.com',

  totalScenes: 8, // storyboard completo; aquí se construyen progresivamente

  scenes: [
    {
      id: 'above',
      number: 1,
      label: 'Ibiza',
      verified: true, // vista cenital de las Pitiusas: geografía real
      camera: { lon: 1.42, lat: 38.86, height: 115000, heading: 0, pitch: -89 },
      travel: 0,
      hold: 1.2,
      light: 0,
      eyebrow: 'Private Concierge · Ibiza',
      title: 'IBIZA, WITHOUT LIMITS.',
      body: 'Private stays. Extraordinary experiences. One dedicated concierge.',
      cta: { label: 'Discover the island', href: '#world-end' },
    },
    {
      id: 'approach',
      label: 'South-west coast',
      verified: true, // aproximación oblicua desde el sur, mirando al noreste
      camera: { lon: 1.27, lat: 38.78, height: 9000, heading: 25, pitch: -28 },
      travel: 1.6,
      hold: 0.4,
      light: 0.15,
    },
    {
      id: 'villas',
      number: 2,
      label: 'Private Villas',
      // ⚠️ Zona PROVISIONAL (sobre Cala d'Hort, mirando a Es Vedrà).
      // Se sustituirá por la zona real de las villas del cliente.
      verified: false,
      camera: { lon: 1.2335, lat: 38.8935, height: 320, heading: 238, pitch: -11 },
      travel: 2.0,
      hold: 1.8,
      light: 0.35,
      eyebrow: 'Private Villas',
      title: 'Where the pool meets the Mediterranean.',
      body: 'A private collection of villas on the island’s quietest coastlines, each one personally inspected by our team.',
      mask: true, // transición piscina → mar con vídeo real de la villa
      cards: [
        { name: 'Villa — pending', meta: 'Zone pending validation', features: ['Bedrooms —', 'Sea view', 'Private pool'] },
        { name: 'Villa — pending', meta: 'Zone pending validation', features: ['Bedrooms —', 'Sunset terrace', 'Chef on request'] },
      ],
    },
    {
      id: 'concierge',
      number: 8,
      label: 'Private Concierge',
      verified: true, // retroceso panorámico sobre toda la isla
      camera: { lon: 1.40, lat: 38.80, height: 62000, heading: 8, pitch: -58 },
      travel: 2.2,
      hold: 2.2,
      light: 1,
      constellation: true, // los servicios se van uniendo en torno al concierge
      eyebrow: 'One dedicated concierge',
      title: 'Everything Ibiza, in one conversation.',
      body: 'Villas, yachts, cars, tables and nights out — arranged by one person who knows the island.',
      cta: { label: 'Create your private experience', href: '#concierge', primary: true },
    },
  ],

  // Nodos de la constelación final, en el orden del storyboard.
  constellation: ['Villas', 'Yachts', 'Jet Skis', 'Cars', 'Fine Dining', 'Beach Clubs', 'VIP', 'Bespoke'],

  services: [
    'Villas & accommodation',
    'Yacht & boat charter',
    'Jet ski & water experiences',
    'Luxury cars & transfers',
    'Restaurants & fine dining',
    'Beach clubs & nightlife',
    'VIP reservations',
    'Bespoke request',
  ],
};
