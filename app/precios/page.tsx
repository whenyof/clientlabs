import type { Metadata } from "next"
import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Precios — ClientLabs | CRM Gratis para Autónomos",
  description:
    "Plan gratuito para siempre. Pro desde 14,99€/mes. Gestiona leads, clientes y facturas sin tarjeta ni permanencia. Descubre qué plan se adapta a tu negocio.",
  keywords: ["crm gratis autónomos", "precios crm pymes", "software facturación precio", "alternativa holded", "alternativa factusol"],
  openGraph: {
    title: "Precios — ClientLabs | CRM Gratis para Autónomos",
    description: "Plan gratuito para siempre. Pro desde 14,99€/mes. Sin tarjeta ni permanencia.",
    type: "website",
    url: "https://clientlabs.io/precios",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/precios" },
}

export default function Page() {
 return <PricingClient />
}