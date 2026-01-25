import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { WebVitals } from "./components/WebVitals"
import GlobalBackground from "@/components/layout/GlobalBackground"
import { ToastProvider } from "@/components/ui/toast"
import Providers from "./providers"
import { AiFloatingAssistant } from "@/components/AiFloatingAssistant"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ClientLabs - SaaS para Profesionales",
  description:
    "Plataforma SaaS completa para gestión de clientes, ventas y automatizaciones.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b0f1c]`}
      >
        <Providers>
          <ToastProvider>
            <GlobalBackground />
            <WebVitals />
            {children}
            <AiFloatingAssistant />
            <Toaster richColors position="top-right" />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}