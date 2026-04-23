import type { Metadata } from "next"
import ProductClient from "./ProductClient"

export const metadata: Metadata = {
  title: "Producto — ClientLabs | Todo lo que Necesitas para tu Negocio",
  description:
    "CRM, facturación, leads, tareas y automatizaciones en una sola plataforma. Diseñado para autónomos y pequeños negocios en España. Con IA integrada.",
  keywords: ["crm todo en uno autónomos", "software gestión integral pymes", "plataforma facturación leads", "gestión integral autónomos"],
  openGraph: {
    title: "Producto — ClientLabs | Todo lo que Necesitas para tu Negocio",
    description: "CRM, facturación, leads, tareas y automatizaciones en una sola plataforma.",
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