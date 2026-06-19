import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import { WebVitals } from "./components/WebVitals"
import Providers from "./providers"
import QueryProvider from "@/providers/QueryProvider"
import { PLANS, PRICE_RANGE, schemaPrice } from "@/lib/pricing"

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
    default: "ClientLabs — Gestión todo en uno para autónomos y pymes en España",
    template: "%s | ClientLabs",
  },
  description: "La plataforma de gestión para autónomos y pymes en España. Leads, clientes, facturas, proveedores y automatizaciones en un solo lugar. Prueba gratis 14 días.",
  keywords: [
    "CRM autónomos España",
    "software gestión pymes España",
    "herramienta facturación autónomos",
    "gestión clientes autónomo",
    "CRM pequeña empresa España",
    "software autónomos España",
    "gestión leads autónomo",
    "facturación online autónomos España",
    "alternativa Holded autónomos",
    "herramienta gestión freelance España",
    "ClientLabs",
    "gestión proveedores autónomo",
    "automatizaciones negocio pequeño",
    "presupuestos firma digital autónomo",
    "verifactu software",
    "crm autónomos",
    "facturación electrónica españa",
    "mejor crm españa",
  ],
  authors: [{ name: "Errepe", url: "https://clientlabs.io" }],
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
    title: "ClientLabs — Gestión todo en uno para autónomos y pymes en España",
    description: "La plataforma de gestión para autónomos y pymes en España. Leads, clientes, facturas, proveedores y automatizaciones en un solo lugar.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ClientLabs — Gestión para autónomos y pymes en España" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClientLabs — Gestión todo en uno para autónomos y pymes en España",
    description: "La plataforma de gestión para autónomos y pymes en España. Prueba gratis 14 días.",
    images: ["/opengraph-image"],
    creator: "@clientlabs",
  },
  alternates: {
    canonical: "https://clientlabs.io",
    languages: {
      "es-ES": "https://clientlabs.io",
    },
  },
  verification: {
    google: "vbG3vG5z2qxWFaWvYW_HKSGM7-f5HXCzkdDqdkp7TFw",
  },
  category: "Software de gestión empresarial",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

/* ================================
   Google Tag Manager
================================ */

const GTM_ID = "GTM-WV6V422Q"

/* ================================
   Theme loader
================================ */

const themeScript = `
(function() {
  try {
    var p = localStorage.getItem('cl_appearance');
    var prefs = p ? JSON.parse(p) : {};
    document.documentElement.setAttribute('data-theme', 'light');
    if (prefs.accentColor) {
      document.documentElement.style.setProperty('--accent', prefs.accentColor);
      document.documentElement.style.setProperty('--brand-500', prefs.accentColor);
    }
    if (prefs.highDensity) document.documentElement.classList.add('density-high');
    if (prefs.animationsEnabled === false) document.documentElement.classList.add('no-animations');
    if (prefs.dateFormat) localStorage.setItem('cl_date_format', prefs.dateFormat);
    if (prefs.currency) localStorage.setItem('cl_currency', prefs.currency);
    if (prefs.itemsPerPage) localStorage.setItem('cl_items_per_page', String(prefs.itemsPerPage));
  } catch (e) {}
})();
`

/* ================================
   Structured Data
================================ */

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ClientLabs",
  alternateName: ["CRM autónomos España", "Software gestión pymes España", "Herramienta facturación autónomos"],
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "CRM, Facturación, Gestión empresarial",
  operatingSystem: "Web, iOS, Android",
  url: "https://clientlabs.io",
  description: "Plataforma de gestión todo en uno para autónomos y pymes en España. Centraliza leads, clientes, proveedores, facturas, presupuestos, albaranes, tareas, proyectos y automatizaciones en un solo lugar. Pensada para los 3,4 millones de autónomos en España.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: schemaPrice(PRICE_RANGE.low),
    highPrice: schemaPrice(PRICE_RANGE.high),
    priceCurrency: "EUR",
    offerCount: String(PLANS.length),
  },
  featureList: [
    "Gestión de leads y pipeline de ventas",
    "CRM de clientes",
    "Gestión de proveedores",
    "Facturación en PDF",
    "Presupuestos con firma digital",
    "Albaranes y hojas de pedido",
    "Gestión de tareas y proyectos",
    "Automatizaciones de negocio",
    "Email marketing",
    "Portal del cliente",
    "Recordatorios automáticos de pago",
    "Informes y estadísticas",
  ],
  audience: {
    "@type": "Audience",
    audienceType: "Autónomos y pymes en España",
    geographicArea: { "@type": "Country", name: "España" },
  },
  inLanguage: "es-ES",
  availableOnDevice: "Desktop, Mobile, Tablet",
  screenshot: "https://clientlabs.io/opengraph-image",
  softwareVersion: "1.0",
  releaseNotes: "Lanzamiento oficial junio 2026",
  sameAs: [
    "https://www.linkedin.com/company/clientlabs",
    "https://www.instagram.com/clientlabs",
    "https://www.tiktok.com/@clientlabs",
  ],
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ClientLabs",
  url: "https://clientlabs.io",
  logo: "https://clientlabs.io/logo.png",
  description: "Empresa tecnológica española que desarrolla software de gestión para autónomos y pymes.",
  foundingDate: "2025",
  foundingLocation: { "@type": "Place", name: "Asturias, España" },
  contactPoint: {
    "@type": "ContactPoint",
    email: "hola@clientlabs.io",
    contactType: "customer service",
    availableLanguage: "Spanish",
    areaServed: "ES",
  },
  sameAs: [
    "https://www.linkedin.com/company/clientlabs",
    "https://www.instagram.com/clientlabs",
  ],
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ClientLabs",
  url: "https://clientlabs.io",
  description: "CRM y software de gestión para autónomos y pymes en España",
  inLanguage: "es-ES",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://clientlabs.io/blog?q={search_term_string}",
    "query-input": "required name=search_term_string",
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

        {/* Google Tag Manager */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        {/* End Google Tag Manager */}
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* JSON-LD: hardcoded constants, no user input — XSS-safe */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
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