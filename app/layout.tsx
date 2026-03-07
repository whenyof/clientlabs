import type { Metadata } from "next"
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { WebVitals } from "./components/WebVitals"

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

import { ThemeProvider } from "@/components/ThemeProvider"

export const metadata: Metadata = {
    title: "ClientLabs - SaaS para Profesionales",
    description:
        "Plataforma SaaS completa para gestión de clientes, ventas y automatizaciones.",
}

const themeScript = `
 (function() {
 try {
 var theme = localStorage.getItem('theme') || 'light';
 document.documentElement.setAttribute('data-theme', theme);
 } catch (e) {}
 })();
`;

const clientlabsConfig = {
    key: process.env.NEXT_PUBLIC_CLIENTLABS_PUBLIC_KEY || "cl_pub_1005fd6d5b7da49b438d470f9ae23eea",
    features: {
        pageview: true,
        forms: true,
        intent: true,
        ecommerce: true,
        heartbeat: true,
        utm: true,
        email: true,
        cta: true,
        whatsapp: true,
        cart: true,
    },
};
const clientlabsConfigScript = `window.clientlabsConfig=${JSON.stringify(clientlabsConfig)};`;

const clientlabsLoaderUrl = process.env.NEXT_PUBLIC_CLIENTLABS_CDN || "https://cdn.clientlabs.io/v1/loader.js";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                {/* ClientLabs Tracking — config before loader */}
                <script dangerouslySetInnerHTML={{ __html: clientlabsConfigScript }} />
                <Script
                    id="clientlabs-loader"
                    src={clientlabsLoaderUrl}
                    strategy="afterInteractive"
                    async
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300 min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]`}
            >
                <ThemeProvider>
                    <Providers>
                        <ToastProvider>
                            <WebVitals />
                            {children}
                            <AiFloatingAssistant />
                            <Toaster richColors position="top-right" />
                        </ToastProvider>
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    )
}