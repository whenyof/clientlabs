import type { Metadata } from "next"
import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Precios ClientLabs — CRM y facturación con Verifactu desde 14,99€/mes",
  description: "Planes para autónomos y pymes desde 14,99€/mes con Verifactu incluido. Básico, Pro y Negocio. 14 días gratis sin tarjeta. CRM, facturación y gestión de leads.",
  keywords: ["precios crm autónomos", "software facturación precio", "alternativa holded precio", "alternativa quipu precio", "verifactu incluido", "crm autónomos precio"],
  openGraph: {
    title: "Precios ClientLabs — CRM y facturación con Verifactu desde 14,99€/mes",
    description: "Planes desde 14,99€/mes con Verifactu incluido. 14 días gratis sin tarjeta.",
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