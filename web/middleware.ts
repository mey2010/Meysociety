import { NextResponse, type NextRequest } from "next/server"

// El panel solo se abre con sesión; si no, al inicio de sesión (y de vuelta tras entrar).
export function middleware(req: NextRequest) {
  if (!req.cookies.get("ci_session")?.value) {
    const url = new URL("/login", req.url)
    url.searchParams.set("next", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ["/panel/:path*"] }
