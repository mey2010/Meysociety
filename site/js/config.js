/*
 * Concierge Ibiza — configuración del recorrido.
 *
 * Cada escena define un keyframe de cámara geográfico (lon, lat, altura en m,
 * heading y pitch en grados). `travel` = pantallas de scroll que tarda la cámara
 * en llegar desde la escena anterior; `hold` = pantallas en las que la cámara
 * se queda casi quieta mientras se lee el contenido comercial.
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

  scenes: [
    {
      id: 'above',
      label: 'Ibiza',
      verified: true, // vista cenital de las Pitiusas: geografía real
      camera: { lon: 1.42, lat: 38.86, height: 115000, heading: 0, pitch: -89 },
      travel: 0,
      hold: 1.2,
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
    },
    {
      id: 'villas',
      label: 'Private Villas',
      // ⚠️ Zona PROVISIONAL (sobre Cala d'Hort, mirando a Es Vedrà).
      // Se sustituirá por la zona real de las villas del cliente.
      verified: false,
      camera: { lon: 1.2335, lat: 38.8935, height: 320, heading: 238, pitch: -11 },
      travel: 2.0,
      hold: 1.8,
      eyebrow: 'Scene 02 · Private Villas',
      title: 'Where the pool meets the Mediterranean.',
      body: 'A private collection of villas on the island’s quietest coastlines, each one personally inspected by our team.',
      mask: true, // transición piscina → mar con vídeo real de la villa
      cards: [
        { name: 'Villa — pending', meta: 'Zone pending validation', features: ['Bedrooms —', 'Sea view', 'Private pool'] },
        { name: 'Villa — pending', meta: 'Zone pending validation', features: ['Bedrooms —', 'Sunset terrace', 'Chef on request'] },
      ],
    },
  ],

  // Escenas 03–08 del storyboard: se añadirán progresivamente (metodología, punto 9).
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
