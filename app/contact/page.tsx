import type { Metadata } from "next"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { ContactForm } from "./ContactForm"

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:py-24">
        <div className="max-w-xl mx-auto">
          <header className="text-center mb-10">
            <p className="text-[12px] font-semibold text-[#0F766E] uppercase tracking-widest mb-3">
              Contacto
            </p>
            <h1 className="text-[28px] sm:text-[34px] font-bold text-slate-900 tracking-tight mb-3">
              Hablemos de tu negocio
            </h1>
            <p className="text-[15px] text-slate-500 leading-relaxed">
              ¿Dudas sobre planes, facturación con Verifactu o cómo migrar tus datos?
              Escríbenos y te respondemos en menos de 24 horas laborables. En español, sin bots.
            </p>
          </header>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
