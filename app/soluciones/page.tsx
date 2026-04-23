import type { Metadata } from "next"
import SolucionesClient from "./SolucionesClient"

export const metadata: Metadata = {
  title: "Soluciones por Sector — ClientLabs | CRM para tu Tipo de Negocio",
  description:
    "ClientLabs se adapta a clínicas, gimnasios, agencias, freelancers, consultorías y más. Descubre cómo gestionar tu sector con un solo sistema.",
  keywords: ["crm clínicas", "crm gimnasios", "crm agencias", "crm freelancers", "gestión por sector", "crm pymes españa"],
  openGraph: {
    title: "Soluciones por Sector — ClientLabs | CRM para tu Tipo de Negocio",
    description: "ClientLabs se adapta a clínicas, gimnasios, agencias, freelancers y más.",
    type: "website",
    url: "https://clientlabs.io/soluciones",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/soluciones" },
}

export default function Page() {
  return <SolucionesClient />
}
