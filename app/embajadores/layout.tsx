import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programa de Embajadores — ClientLabs | Gana Recomendando",
  description:
    "Gana un 30% de comisión recurrente recomendando ClientLabs. Únete al programa de embajadores y ayuda a otros autónomos a crecer.",
  keywords: ["programa embajadores crm", "comisión recurrente saas", "referidos clientlabs"],
  openGraph: {
    title: "Programa de Embajadores — ClientLabs | Gana Recomendando",
    description: "Gana un 30% de comisión recurrente recomendando ClientLabs.",
    type: "website",
    url: "https://clientlabs.io/embajadores",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/embajadores" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
