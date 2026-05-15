import type { Metadata } from "next"
import ProductClient from "./ProductClient"

export const metadata: Metadata = {
  title: "CRM y software de facturación para autónomos con Verifactu — ClientLabs",
  description: "Descubre todas las funciones de ClientLabs: facturación electrónica con Verifactu, CRM para gestión de clientes, captación de leads, presupuestos, albaranes, automatizaciones y asistente IA.",
  keywords: ["software facturación verifactu", "crm autónomos funciones", "facturación electrónica autónomos", "gestión leads autónomos", "presupuestos online", "programa facturación pymes", "crm y facturación"],
  openGraph: {
    title: "CRM y software de facturación para autónomos con Verifactu — ClientLabs",
    description: "Facturación electrónica con Verifactu, CRM, leads, presupuestos y automatizaciones en una sola herramienta.",
    type: "website",
    url: "https://clientlabs.io/producto",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/producto" },
}

export default function Page() {
 return <ProductClient />
}