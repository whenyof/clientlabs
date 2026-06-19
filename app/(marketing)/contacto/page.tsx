import type { Metadata } from "next"
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site-config"
import { Clock, IconX, Mail } from "@/components/marketing/icons"
import ContactForm from "@/components/marketing/ContactForm"

export const metadata: Metadata = {
  title: "Contacto — ClientLabs | Habla con nuestro equipo",
  description:
    "¿Tienes dudas? Escríbenos. Detrás de ClientLabs hay una persona que lee y responde en menos de 24 horas laborables. Soporte en español.",
  openGraph: {
    title: "Contacto — ClientLabs",
    description:
      "Detrás de ClientLabs hay una persona que lee y responde en menos de 24 horas laborables.",
    type: "website",
    url: `${SITE_URL}/contacto`,
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: `${SITE_URL}/contacto` },
}

export default function ContactoPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1 className="reveal">Hablemos.</h1>
          <p className="reveal">
            Detrás de ClientLabs hay una persona que lee y responde. Cuéntame qué necesitas y te
            contesto en menos de 24 horas laborables.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 72 }}>
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-aside reveal">
              <h3>¿En qué te ayudo?</h3>
              <p>
                Dudas sobre el producto, sobre Verifactu, sobre si ClientLabs encaja con tu negocio
                o simplemente para saludar. Todo cuenta.
              </p>
              <div className="contact-methods">
                <a className="contact-method" href={`mailto:${CONTACT_EMAIL}`}>
                  <span className="ico">
                    <Mail />
                  </span>
                  <span className="ct">
                    <span className="k">Correo</span>
                    <span className="v">{CONTACT_EMAIL}</span>
                  </span>
                </a>
                <a className="contact-method" href="#" aria-label="Redes sociales">
                  <span className="ico">
                    <IconX />
                  </span>
                  <span className="ct">
                    <span className="k">Redes</span>
                    <span className="v">@clientlabs</span>
                  </span>
                </a>
                <div className="contact-method">
                  <span className="ico">
                    <Clock />
                  </span>
                  <span className="ct">
                    <span className="k">Horario</span>
                    <span className="v">L–V · 9:00 a 18:00 (CET)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="reveal">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
