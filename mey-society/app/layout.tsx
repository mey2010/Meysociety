import type { Metadata, Viewport } from "next"
import { Cormorant, Montserrat } from "next/font/google"
import "./globals.css"

const display = Cormorant({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-display", display: "swap" })
const text = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-text", display: "swap" })

export const metadata: Metadata = {
  title: "Mey Society · Private concierge in Ibiza",
  description: "A villa in Cala Molí, yachts, jet skis, cars, beach clubs and guest lists for every club in Ibiza, arranged in one conversation.",
  openGraph: { title: "Mey Society · Private concierge in Ibiza", images: ["/brand/logo.png"] },
}

export const viewport: Viewport = { themeColor: "#06051A", viewportFit: "cover" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  )
}
