import { FORMENTERA, IBIZA } from "@/lib/island-geo"

/*
 * Proyección del mapa de la isla: equirectangular local centrada en 38.9° N.
 * Para 40 km de isla el error frente a una proyección conforme es inapreciable.
 */
const BOX = { west: 1.15, east: 1.66, north: 39.14, south: 38.62 }
const K = Math.cos((38.9 * Math.PI) / 180)
const S = 1000 / (BOX.north - BOX.south)

export const MAP_W = Math.round((BOX.east - BOX.west) * K * S)
export const MAP_H = 1000

export function project(lon: number, lat: number) {
  return { x: (lon - BOX.west) * K * S, y: (BOX.north - lat) * S }
}

const toPath = (ring: [number, number][]) =>
  ring
    .map(([lon, lat], i) => {
      const { x, y } = project(lon, lat)
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join("") + "Z"

export const IBIZA_PATH = toPath(IBIZA)
export const FORMENTERA_PATH = toPath(FORMENTERA)

/*
 * Salida y puesta de sol (algoritmo de efemérides solares simplificado, precisión ±1 min).
 * Devuelve instantes UTC; se formatean en hora de Ibiza con formatIbizaTime().
 */
const RAD = Math.PI / 180
const DAY_MS = 86400000
const J1970 = 2440588
const J2000 = 2451545
const OBLIQUITY = RAD * 23.4397

export function sunTimes(date: Date, lat: number, lon: number) {
  const days = date.valueOf() / DAY_MS - 0.5 + J1970 - J2000
  const lw = -lon * RAD
  const phi = lat * RAD
  const cycle = Math.round(days - 0.0009 - lw / (2 * Math.PI))
  const transitApprox = (ha: number) => 0.0009 + (ha + lw) / (2 * Math.PI) + cycle

  const ds = transitApprox(0)
  const M = RAD * (357.5291 + 0.98560028 * ds)
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const L = M + C + RAD * 102.9372 + Math.PI
  const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(L))
  const transit = (a: number) => J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L)

  const h0 = -0.833 * RAD // refracción + radio del disco solar
  const ha = Math.acos((Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)))
  const noon = transit(ds)
  const set = transit(transitApprox(ha))
  const toDate = (j: number) => new Date((j + 0.5 - J1970) * DAY_MS)
  return { sunrise: toDate(noon - (set - noon)), noon: toDate(noon), sunset: toDate(set) }
}

export function formatIbizaTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" }).format(d)
}
