/*
 * Sesión de DEMOSTRACIÓN del área privada.
 *
 * Valida un único acceso de prueba y guarda una cookie httpOnly. Sirve para enseñar el
 * panel, no para producción: allí la sesión debe venir de un proveedor real (Supabase Auth,
 * Clerk, Auth.js…) y el itinerario de la base de datos de reservas.
 */

export const SESSION_COOKIE = "ci_session"

export const DEMO_ACCESS = {
  email: process.env.DEMO_EMAIL || "demo@concierge-ibiza.com",
  code: process.env.DEMO_CODE || "IBIZA2026",
  name: "Alex",
}

export type Session = { email: string; name: string }

export function encodeSession(s: Session) {
  return Buffer.from(JSON.stringify(s)).toString("base64url")
}

export function decodeSession(value: string | undefined): Session | null {
  if (!value) return null
  try {
    const s = JSON.parse(Buffer.from(value, "base64url").toString("utf8"))
    return typeof s?.email === "string" && typeof s?.name === "string" ? s : null
  } catch {
    return null
  }
}
