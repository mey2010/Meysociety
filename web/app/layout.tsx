import type { Metadata, Viewport } from "next"
import "./globals.css"
import "./concierge.css"

export const metadata: Metadata = {
  title: "Concierge Ibiza — Private Concierge",
  description: "Private villas, yacht charter, jet skis, luxury cars, fine dining and VIP nightlife in Ibiza. One dedicated concierge.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1C1C1E",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cesium@1.120.0/Build/Cesium/Widgets/widgets.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
