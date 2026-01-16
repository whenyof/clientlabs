import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Font optimization: display swap for better LCP
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Not critical, lazy load
});

export const metadata: Metadata = {
  title: "ClientLabs - Automatiza tu negocio sin tocar código",
  description: "ClientLabs centraliza clientes, pagos, métricas, automatizaciones y campañas en un solo panel profesional diseñado para escalar negocios reales.",
  keywords: ["automatización", "CRM", "pagos", "SaaS", "negocios", "automatización sin código", "gestión de clientes"],
  openGraph: {
    title: "ClientLabs - Automatiza tu negocio sin tocar código",
    description: "Infraestructura para negocios que crecen en serio. El sistema operativo que conecta todo tu negocio.",
    type: "website",
  },
  // Performance: preconnect to critical domains
  other: {
    "dns-prefetch": "https://fonts.googleapis.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
