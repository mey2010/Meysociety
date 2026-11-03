import type { Metadata, Viewport } from "next"
import { Geist, IBM_Plex_Mono, Syncopate } from "next/font/google"
import "./globals.css"

const display = Syncopate({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-display", display: "swap" })
const sans = Geist({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" })
const text = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-text", display: "swap" })

export const metadata: Metadata = {
  title: "Mey Society · Private concierge in Ibiza",
  description: "A villa in Cala Molí, yachts, jet skis, cars, beach clubs and guest lists for every club in Ibiza, arranged in one conversation.",
  openGraph: { title: "Mey Society · Private concierge in Ibiza", images: ["/brand/logo.png"] },
}

export const viewport: Viewport = { themeColor: "#04030F", viewportFit: "cover" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
