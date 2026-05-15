import type { Metadata } from "next"
import SolucionesClient from "./SolucionesClient"

export const metadata: Metadata = {
  title: "CRM para autónomos y pymes por sector — ClientLabs",
  description: "ClientLabs se adapta a tu sector: agencias, freelancers, clínicas, consultorías, gimnasios y más. CRM, facturación con Verifactu y gestión de clientes adaptados a tu negocio.",
  keywords: ["crm autónomos españa", "crm pymes sector", "crm agencias digitales", "crm freelancers", "crm consultorías", "gestión clientes autónomos", "software crm y facturación"],
  openGraph: {
    title: "CRM para autónomos y pymes por sector — ClientLabs",
    description: "CRM y facturación con Verifactu adaptados a tu sector. Agencias, freelancers, consultorías y más.",
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
