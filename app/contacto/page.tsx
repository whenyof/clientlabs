import type { Metadata } from "next"
import ContactoClient from "./ContactoClient"

export const metadata: Metadata = {
  title: "Contacto — ClientLabs | Habla con Nuestro Equipo",
  description:
    "¿Tienes dudas? Contacta con el equipo de ClientLabs. Soporte en español, respuesta en menos de 24h. Estamos aquí para ayudarte a crecer.",
  openGraph: {
    title: "Contacto — ClientLabs | Habla con Nuestro Equipo",
    description: "Soporte en español, respuesta en menos de 24h. Estamos aquí para ayudarte.",
    type: "website",
    url: "https://clientlabs.io/contacto",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/contacto" },
}

export default function ContactoPage() {
 return <ContactoClient />
}


