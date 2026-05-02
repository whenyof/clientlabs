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
  title: "ClientLabs — El CRM para autónomos españoles",
  description: "Gestiona leads, clientes, facturas y automatizaciones en un solo panel. Diseñado para autónomos y pequeños negocios españoles.",
  keywords: ["CRM autónomos", "gestión clientes España", "facturación autónomos", "software autónomos España"],
  authors: [{ name: "ClientLabs" }],
  creator: "ClientLabs",
  openGraph: {
    title: "ClientLabs — El CRM para autónomos españoles",
    description: "Leads automáticos, CRM, facturas y automatizaciones. Todo en un panel.",
    url: "https://clientlabs.io",
    siteName: "ClientLabs",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientLabs — El CRM para autónomos españoles",
    description: "Leads automáticos, CRM, facturas y automatizaciones. Todo en un panel.",
  },
  robots: {
    index: true,
    follow: true,
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
  description: "CRM y facturación para autónomos y pequeños negocios en España",
  url: "https://clientlabs.io",
  offers: [
    { "@type": "Offer", price: "0",     priceCurrency: "EUR", name: "Free"     },
    { "@type": "Offer", price: "14.99", priceCurrency: "EUR", name: "Pro"      },
    { "@type": "Offer", price: "29.99", priceCurrency: "EUR", name: "Business" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "200",
  },
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