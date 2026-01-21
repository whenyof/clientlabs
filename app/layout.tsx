import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { WebVitals } from "./components/WebVitals"
import GlobalBackground from "@/components/layout/GlobalBackground"
import { ToastProvider } from "@/components/ui/toast"
import Providers from "./providers"

// FONTS
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

// SEO
export const metadata: Metadata = {
  title: "ClientLabs | Sistema operativo para negocios",
  description:
    "ClientLabs centraliza clientes, pagos, métricas y automatizaciones en un único panel profesional. Infraestructura diseñada para escalar operaciones reales.",
  keywords: [
    "ClientLabs",
    "automatización",
    "CRM",
    "pagos",
    "SaaS",
    "negocios",
    "sistema operativo empresarial",
  ],
  metadataBase: new URL("https://clientlabs.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ClientLabs | Sistema operativo para negocios",
    description:
      "Infraestructura para negocios que crecen en serio. Un único sistema para clientes, pagos y automatizaciones.",
    type: "website",
    url: "https://clientlabs.com",
    siteName: "ClientLabs",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientLabs | Sistema operativo para negocios",
    description:
      "Infraestructura para negocios que crecen en serio. Un único sistema para clientes, pagos y automatizaciones.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

// ROOT LAYOUT
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          text-white
        `}
      >
        <Providers>
          <ToastProvider>
            <GlobalBackground />
            <WebVitals />
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}