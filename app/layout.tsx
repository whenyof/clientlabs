import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import { WebVitals } from "./components/WebVitals"
import Providers from "./providers"
import QueryProvider from "@/providers/QueryProvider"

import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Toaster } from "sonner"

/* ================================
   Fonts
================================ */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})


/* ================================
   Metadata
================================ */

export const metadata: Metadata = {
  metadataBase: new URL("https://clientlabs.io"),
  title: {
    default: "ClientLabs — CRM y software de facturación para autónomos y pymes en España",
    template: "%s | ClientLabs",
  },
  description: "El CRM todo-en-uno para autónomos y pymes en España. Facturación legal con Verifactu, captación de leads, gestión de clientes, presupuestos, automatizaciones y email marketing. Desde 14,99€/mes.",
  keywords: [
    "crm autónomos",
    "crm para autónomos",
    "software facturación autónomos",
    "facturación electrónica españa",
    "verifactu software",
    "software facturación verifactu",
    "gestión clientes autónomos",
    "programa facturación pymes",
    "crm españa",
    "facturar online autónomos",
    "alternativa holded",
    "alternativa quipu",
    "captar leads autónomos",
    "presupuestos online",
    "facturación legal españa",
    "mejor crm españa",
  ],
  authors: [{ name: "ClientLabs" }],
  creator: "ClientLabs",
  publisher: "ClientLabs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://clientlabs.io",
    siteName: "ClientLabs",
    title: "ClientLabs — CRM y facturación para autónomos",
    description: "Factura legalmente con Verifactu, capta leads desde tu web y gestiona tu negocio. Todo en uno desde 14,99€/mes.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ClientLabs — CRM y facturación para autónomos" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientLabs — CRM y facturación para autónomos",
    description: "Factura legalmente con Verifactu, capta leads y gestiona clientes. Todo en uno.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://clientlabs.io",
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

/* ================================
   Theme loader
================================ */

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`

/* ================================
   Structured Data
================================ */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ClientLabs",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://clientlabs.io",
  description: "CRM y software de facturación para autónomos y pymes en España con Verifactu integrado",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "14.99",
    highPrice: "39.99",
    priceCurrency: "EUR",
    offerCount: 3,
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "200",
  },
  author: {
    "@type": "Organization",
    name: "ClientLabs",
    url: "https://clientlabs.io",
  },
  featureList: [
    "Facturación electrónica con Verifactu",
    "CRM para gestión de clientes",
    "Captación automática de leads",
    "Presupuestos y albaranes",
    "Pedidos de venta",
    "Automatizaciones de negocio",
    "Email marketing",
    "QR verificable de la AEAT",
    "Asistente IA integrado",
  ],
}

/* ================================
   Root Layout
================================ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Theme initialization */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>

      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          min-h-screen
          bg-[var(--bg-main)]
          text-[var(--text-primary)]
          transition-colors duration-300
        `}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <QueryProvider>
          <ThemeProvider>
            <Providers>
              <ToastProvider>
                <WebVitals />

                {children}

                <Toaster
                  richColors
                  position="top-right"
                  toastOptions={{
                    style: {
                      zIndex: 10,
                    },
                  }}
                />
              </ToastProvider>
            </Providers>
          </ThemeProvider>
        </QueryProvider>
        {/* ClientLabs Tracking */}
        <Script id="clientlabs-config" strategy="afterInteractive">
          {`
            window.clientlabsConfig = {
              "key": "cl_pub_16413eafbfdbbe6ab8bde12e2cb69678b596ecad673a5e71fd653ec7faa7467a",
              "features": {
                "pageview": true,
                "forms": true,
                "intent": true,
                "ecommerce": true,
                "heartbeat": true,
                "utm": true,
                "email": true,
                "cta": true,
                "whatsapp": true,
                "cart": true
              }
            };
          `}
        </Script>
        <Script
          id="clientlabs-loader"
          src="https://clientlabs.io/v1/loader.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}