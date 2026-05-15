import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto — ClientLabs | Soporte para autónomos y pymes",
  description: "¿Tienes dudas sobre ClientLabs? Contacta con nuestro equipo en español. Te ayudamos a elegir el plan de CRM y facturación que mejor se adapta a tu negocio.",
  openGraph: {
    title: "Contacto — ClientLabs | Soporte para autónomos y pymes",
    description: "Contacta con el equipo de ClientLabs. Soporte en español para autónomos y pymes.",
    url: "https://clientlabs.io/contact",
  },
  alternates: { canonical: "https://clientlabs.io/contact" },
}

export default function ContactPage() {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-gray-900">Página de Contacto</h1>
 <p className="text-gray-600 mt-2">Próximamente...</p>
 </div>
 </div>
 )
}