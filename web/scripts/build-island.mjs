/*
 * Genera lib/island-geo.ts: el contorno real de Ibiza y Formentera.
 * Fuente: Natural Earth 10m land (dominio público) — https://www.naturalearthdata.com
 *
 *   curl -L -o ne_10m_land.geojson \
 *     https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson
 *   node scripts/build-island.mjs ne_10m_land.geojson
 *
 * Proyección: equirectangular local centrada en 38.95° N (x escalado por cos(lat)),
 * suficiente para una isla de 40 km. Las coordenadas de los lugares se proyectan
 * con la misma función en lib/island.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const BOX = { minLon: 1.1, maxLon: 1.65, minLat: 38.62, maxLat: 39.15 }
const land = JSON.parse(readFileSync(process.argv[2], 'utf8'))

const rings = []
for (const f of land.features) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  for (const p of polys) {
    const r = p[0]
    const inside = r.filter(([x, y]) => x > BOX.minLon && x < BOX.maxLon && y > BOX.minLat && y < BOX.maxLat)
    if (r.length > 8 && inside.length === r.length) rings.push(r)
  }
}
rings.sort((a, b) => b.length - a.length)
const [ibiza, formentera] = rings
const round = (n) => Math.round(n * 1e5) / 1e5
const out = `// Generado por scripts/build-island.mjs — no editar a mano.
// Natural Earth 10m land (dominio público). [lon, lat]
export const IBIZA: [number, number][] = ${JSON.stringify(ibiza.map(([x, y]) => [round(x), round(y)]))}
export const FORMENTERA: [number, number][] = ${JSON.stringify(formentera.map(([x, y]) => [round(x), round(y)]))}
`
writeFileSync(new URL('../lib/island-geo.ts', import.meta.url), out)
console.log('ibiza', ibiza.length, 'formentera', formentera.length)
