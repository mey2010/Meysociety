import { NextResponse } from "next/server"
import { DEMO_ACCESS, SESSION_COOKIE, encodeSession } from "@/lib/auth"

// Inicio de sesión de demostración (ver lib/auth.ts).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || "").trim().toLowerCase()
  const code = String(body.code || "").trim().toUpperCase()
  if (email !== DEMO_ACCESS.email || code !== DEMO_ACCESS.code) {
    return NextResponse.json({ error: "That email and booking code do not match a stay." }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, encodeSession({ email, name: DEMO_ACCESS.name }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
