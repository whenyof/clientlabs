import type { Metadata } from "next"
import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Precios | ClientLabs – Automatización profesional",
  description:
    "Planes claros para escalar tu negocio. Empieza gratis y crece con automatización real.",
  openGraph: {
    title: "Precios | ClientLabs – Automatización profesional",
    description:
      "Planes claros para escalar tu negocio. Empieza gratis y crece con automatización real.",
    type: "website",
  },
}

export default function Page() {
  return <PricingClient />
}