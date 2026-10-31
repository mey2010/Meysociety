import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SESSION_COOKIE, decodeSession } from "@/lib/auth"
import { Dashboard } from "@/components/dashboard/dashboard"

export const metadata: Metadata = { title: "Your stay — Concierge Ibiza", robots: { index: false } }
export const dynamic = "force-dynamic"

export default async function PanelPage() {
  const session = decodeSession((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) redirect("/login?next=/panel")
  // la hora del servidor se pasa al cliente para que el primer render coincida
  return <Dashboard name={session.name} now={Date.now()} />
}
