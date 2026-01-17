import type { Metadata } from "next"
import ContactoClient from "./ContactoClient"

export const metadata: Metadata = {
  title: "Contacto | ClientLabs – Soporte humano para operaciones reales",
  description:
    "Centro de soporte premium, onboarding guiado y acompañamiento real para escalar con control.",
  openGraph: {
    title: "Contacto | ClientLabs – Soporte humano para operaciones reales",
    description:
      "Centro de soporte premium, onboarding guiado y acompañamiento real para escalar con control.",
    type: "website",
  },
}

export default function ContactoPage() {
  return <ContactoClient />
}


