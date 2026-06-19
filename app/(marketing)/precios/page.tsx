import type { Metadata } from "next"
import { Fragment } from "react"
import Link from "next/link"
import { PREVIEW_URL, SITE_URL } from "@/lib/site-config"
import { ArrowRight, Check, CheckBold } from "@/components/marketing/icons"

export const metadata: Metadata = {
  title: "Precios — ClientLabs",
  description:
    "Planes de ClientLabs para autónomos y pequeñas empresas: Básico 14,99€, Pro 24,99€ y Negocio 39,99€ al mes, IVA incluido. Empieza gratis, sin permanencia ni tarjeta.",
  keywords: [
    "precios crm autónomos",
    "software facturación precio",
    "verifactu incluido",
    "crm autónomos precio",
    "gestión pymes precio",
  ],
  openGraph: {
    title: "Precios — ClientLabs",
    description:
      "Básico 14,99€, Pro 24,99€ y Negocio 39,99€ al mes (IVA incl.). Empieza gratis, sin permanencia ni tarjeta.",
    type: "website",
    url: `${SITE_URL}/precios`,
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: `${SITE_URL}/precios` },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Necesito tarjeta para empezar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Puedes crear tu cuenta y empezar a usar ClientLabs sin introducir ningún dato de pago. Solo añadirás un método cuando quieras pasar a un plan de pago.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs tiene tres planes con IVA incluido: Básico a 14,99€/mes, Pro a 24,99€/mes y Negocio a 39,99€/mes. Puedes empezar gratis, sin permanencia.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué es Verifactu y por qué importa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Es el sistema de facturación verificable que exige la nueva normativa española. ClientLabs emite facturas conformes de forma nativa, firmadas y encadenadas, para que cumplas sin preocuparte de la parte técnica.",
      },
    },
    {
      "@type": "Question",
      name: "¿Puedo cambiar de plan más adelante?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, cuando quieras. Puedes subir o bajar de plan en cualquier momento y el cambio se aplica de inmediato, sin permanencia.",
      },
    },
    {
      "@type": "Question",
      name: "¿Dónde se guardan mis datos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En servidores ubicados en la Unión Europea, con tratamiento conforme al RGPD. Tus datos son tuyos y puedes exportarlos cuando quieras.",
      },
    },
  ],
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "ClientLabs",
  description: "Plataforma de gestión todo en uno para autónomos y pymes en España",
  brand: { "@type": "Brand", name: "ClientLabs" },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "14.99",
    highPrice: "39.99",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
}

type Cell = boolean | string
function cell(v: Cell, key: string) {
  if (v === true) return <td className="yes" key={key}><CheckBold /></td>
  if (v === false) return <td className="no" key={key}>—</td>
  return <td key={key}>{v}</td>
}

const COMPARISON: { group: string; rows: { label: string; values: [Cell, Cell, Cell] }[] }[] = [
  {
    group: "Clientes y ventas",
    rows: [
      { label: "CRM de leads y clientes", values: [true, true, true] },
      { label: "Proveedores y catálogo", values: [true, true, true] },
    ],
  },
  {
    group: "Facturación",
    rows: [
      { label: "Facturación con Verifactu", values: [true, true, true] },
      { label: "Tracking de documentos", values: [false, true, true] },
    ],
  },
  {
    group: "Operativa",
    rows: [
      { label: "Proyectos y tareas", values: [false, true, true] },
      { label: "Usuarios", values: ["1", "Hasta 5", "Ilimitados"] },
      { label: "Roles y permisos avanzados", values: [false, false, true] },
    ],
  },
  {
    group: "Crecimiento",
    rows: [
      { label: "Automatizaciones", values: [false, true, true] },
      { label: "Email marketing", values: [false, "Incluido", "Ampliado"] },
      { label: "Informes y cierres", values: [false, true, true] },
      { label: "Soporte", values: ["Email", "Email", "Prioritario"] },
    ],
  },
]

const FAQ = [
  {
    q: "¿Necesito tarjeta para empezar?",
    a: "No. Puedes crear tu cuenta y empezar a usar ClientLabs sin introducir ningún dato de pago. Solo añadirás un método cuando quieras pasar a un plan de pago.",
  },
  {
    q: "¿Los precios incluyen IVA?",
    a: "Sí. Los importes mostrados (14,99€, 24,99€ y 39,99€ al mes) ya incluyen el IVA. Sin costes ocultos ni letra pequeña.",
  },
  {
    q: "¿Qué es Verifactu y por qué importa?",
    a: "Es el sistema de facturación verificable que exige la nueva normativa española. ClientLabs emite facturas conformes de forma nativa, firmadas y encadenadas, para que cumplas sin preocuparte de la parte técnica.",
  },
  {
    q: "¿Puedo cambiar de plan más adelante?",
    a: "Sí, cuando quieras. Puedes subir o bajar de plan en cualquier momento y el cambio se aplica de inmediato, sin permanencia.",
  },
  {
    q: "¿Dónde se guardan mis datos?",
    a: "En servidores ubicados en la Unión Europea, con tratamiento conforme al RGPD. Tus datos son tuyos y puedes exportarlos cuando quieras.",
  },
]

export default function PreciosPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <section className="page-hero">
        <div className="wrap">
          <h1 className="reveal">Precios sencillos, sin letra pequeña.</h1>
          <p className="reveal">
            Empieza gratis y crece cuando lo necesites. Sin permanencia y sin tarjeta para empezar.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <div className="plans">
            <div className="plan reveal">
              <div className="pn">Básico</div>
              <div className="plan-price">
                <b>14,99 €</b> <span>/mes · IVA incl.</span>
              </div>
              <div className="pd">Para empezar a facturar en regla y ordenar tu cartera.</div>
              <ul className="pf">
                <li><Check />CRM de leads y clientes</li>
                <li><Check />Facturación con Verifactu</li>
                <li><Check />Proveedores y catálogo</li>
                <li><Check />1 usuario</li>
              </ul>
              <a href={PREVIEW_URL} className="btn btn-ghost">Empezar gratis</a>
            </div>

            <div className="plan rec reveal">
              <span className="rec-tag">Recomendado</span>
              <div className="pn">Pro</div>
              <div className="plan-price">
                <b>24,99 €</b> <span>/mes · IVA incl.</span>
              </div>
              <div className="pd">Para equipos pequeños que gestionan clientes y proyectos.</div>
              <ul className="pf">
                <li><Check />Todo lo de Básico</li>
                <li><Check />Proyectos, tareas y equipo</li>
                <li><Check />Tracking de documentos</li>
                <li><Check />Automatizaciones e informes</li>
              </ul>
              <a href={PREVIEW_URL} className="btn btn-primary">Empezar gratis</a>
            </div>

            <div className="plan reveal">
              <div className="pn">Negocio</div>
              <div className="plan-price">
                <b>39,99 €</b> <span>/mes · IVA incl.</span>
              </div>
              <div className="pd">Para pymes con más volumen y necesidades de control.</div>
              <ul className="pf">
                <li><Check />Todo lo de Pro</li>
                <li><Check />Usuarios y permisos avanzados</li>
                <li><Check />Email marketing ampliado</li>
                <li><Check />Soporte prioritario</li>
              </ul>
              <Link href="/contacto" className="btn btn-ghost">Hablar con ventas</Link>
            </div>
          </div>
          <p className="pricing-foot reveal">
            Todos los precios incluyen IVA · sin permanencia · empieza gratis sin tarjeta ·{" "}
            <Link href="/contacto" style={{ color: "var(--teal-ink)", fontWeight: 600 }}>
              ¿dudas? escríbenos →
            </Link>
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-intro reveal">
            <h2>Compara los planes.</h2>
            <p>Todo lo que incluye cada plan, sin sorpresas más adelante.</p>
          </div>
          <div className="cmp-wrap reveal">
            <div className="cmp-scroll">
              <table className="cmp">
                <colgroup>
                  <col />
                  <col />
                  <col className="rec-col" />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>Funcionalidad</th>
                    <th>Básico</th>
                    <th className="rec">Pro</th>
                    <th>Negocio</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((g) => (
                    <Fragment key={g.group}>
                      <tr className="grp">
                        <td colSpan={4}>{g.group}</td>
                      </tr>
                      {g.rows.map((r) => (
                        <tr key={r.label}>
                          <th>{r.label}</th>
                          {r.values.map((v, i) => cell(v, `${r.label}-${i}`))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-intro reveal">
            <h2>Preguntas frecuentes.</h2>
          </div>
          <div className="faq reveal">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <span className="pm" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2 className="reveal">Empieza gratis hoy.</h2>
          <p className="reveal">Crea tu cuenta en un minuto y empieza a facturar en regla.</p>
          <div className="hero-ctas reveal">
            <a href={PREVIEW_URL} className="btn btn-primary btn-lg">
              Empieza gratis
              <ArrowRight className="arr" />
            </a>
            <Link href="/contacto" className="btn btn-ghost btn-lg">
              Hablar con nosotros
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
