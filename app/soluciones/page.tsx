import type { Metadata } from "next"
import SolucionesClient from "./SolucionesClient"

export const metadata: Metadata = {
  title: "Soluciones | ClientLabs — Para cada tipo de negocio",
  description:
    "ClientLabs se adapta a tu industria. Agencias, SaaS, ecommerce, consultoras y startups — un solo sistema operativo para cada modelo de negocio.",
}

export default function Page() {
  return <SolucionesClient />
}
