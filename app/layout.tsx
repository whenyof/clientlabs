import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import { WebVitals } from "./components/WebVitals"
import Providers from "./providers"
import QueryProvider from "@/providers/QueryProvider"

import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AiFloatingAssistant } from "@/components/AiFloatingAssistant"
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
  title: "ClientLabs - SaaS para Profesionales",
  description:
    "Plataforma SaaS completa para gestión de clientes, ventas y automatizaciones.",
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
        <QueryProvider>
          <ThemeProvider>
            <Providers>
              <ToastProvider>
                <WebVitals />

                {children}

                <AiFloatingAssistant />

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
        <Script id="clientlabs-config" strategy="beforeInteractive">
          {`
            window.clientlabsConfig = {
              "key": "cl_pub_70fd7ea9a369b19760f4866e9c65ff54147d78c899a208f9ee31cf4291fe9c8b",
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