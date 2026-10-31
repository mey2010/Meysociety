import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"
import "./styles/capsule.css"
import "./styles/journey.css"
import "./styles/sections.css"
import "./styles/client.css"

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" })
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

export const metadata: Metadata = {
  title: "Concierge Ibiza — Private Concierge",
  description: "Private villas, yacht charter, jet skis, luxury cars, fine dining and VIP nightlife in Ibiza. One dedicated concierge.",
  openGraph: {
    title: "Concierge Ibiza — Ibiza, without limits",
    description: "Private stays. Extraordinary experiences. One dedicated concierge.",
    type: "website",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B1520",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* las entradas [data-reveal] solo se ocultan si hay JavaScript */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
