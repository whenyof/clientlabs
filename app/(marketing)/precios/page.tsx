import type { Metadata } from "next"
import { Fragment } from "react"
import Link from "next/link"
import { checkoutHref, SITE_URL } from "@/lib/site-config"
import { ANNUAL_FREE_MONTHS, PLANS, PRICE_RANGE, plansSummary, schemaPrice } from "@/lib/pricing"
import { ArrowRight, CheckBold } from "@/components/marketing/icons"
import PlanCards from "@/components/marketing/PlanCards"

export const metadata: Metadata = {
  title: "Precios — ClientLabs",
  description: `Planes de ClientLabs para autónomos y pequeñas empresas: ${plansSummary()}, IVA incluido. Paga al año y llévate ${ANNUAL_FREE_MONTHS} meses gratis. Empieza con 14 días de prueba.`,
  keywords: [
    "precios crm autónomos",
    "software facturación precio",
    "verifactu incluido",
    "crm autónomos precio",
    "gestión pymes precio",
  ],
  openGraph: {
    title: "Precios — ClientLabs",
    description: `${plansSummary()} (IVA incl.). Plan anual con ${ANNUAL_FREE_MONTHS} meses gratis. Sin permanencia.`,
    type: "website",
    url: `${SITE_URL}/precios`,
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: `${SITE_URL}/precios` },
}

// Visible FAQ — the JSON-LD below is generated from this same array so they never drift.
const FAQ = [
  {
    q: "¿Cómo funciona la prueba gratuita?",
    a: "Tienes 14 días para probar ClientLabs con acceso completo. Puedes cancelar cuando quieras antes de que termine la prueba y no se te cobrará nada.",
  },
  {
    q: "¿Los precios incluyen IVA?",
    a: `Sí. Los importes mostrados (${plansSummary()}) ya incluyen el IVA. Sin costes ocultos ni letra pequeña.`,
  },
  {
    q: "¿Hay descuento por pago anual?",
    a: `Sí. Si eliges facturación anual te llevas ${ANNUAL_FREE_MONTHS} meses gratis: pagas el equivalente a 10 meses por un año completo.`,
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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "ClientLabs",
  description: "Plataforma de gestión todo en uno para autónomos y pymes en España",
  brand: { "@type": "Brand", name: "ClientLabs" },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: schemaPrice(PRICE_RANGE.low),
    highPrice: schemaPrice(PRICE_RANGE.high),
    priceCurrency: "EUR",
    offerCount: String(PLANS.length),
    availability: "https://schema.org/InStock",
  },
}

type Cell = boolean | string
function cell(v: Cell, key: string) {
  if (v === true) return <td className="yes" key={key}><CheckBold /></td>
  if (v === false) return <td className="no" key={key}>—</td>
  return <td key={key}>{v}</td>
}

// Values are [Autónomo, Pro] — same order as PLANS.
const COMPARISON: { group: string; rows: { label: string; values: [Cell, Cell] }[] }[] = [
  {
    group: "Clientes y ventas",
    rows: [
      { label: "CRM de leads y clientes", values: [true, true] },
      { label: "Proveedores y gastos", values: [true, true] },
    ],
  },
  {
    group: "Facturación",
    rows: [
      { label: "Facturación con Verifactu", values: [true, true] },
      { label: "Presupuestos, pedidos y albaranes", values: [true, true] },
      { label: "Impuestos e informes trimestrales", values: [true, true] },
    ],
  },
  {
    group: "Operativa",
    rows: [
      { label: "Tareas y proyectos", values: [true, true] },
      { label: "Usuarios", values: ["1", "Hasta 5"] },
    ],
  },
  {
    group: "Crecimiento",
    rows: [
      { label: "Email marketing", values: [false, true] },
      { label: "Automatizaciones", values: [false, true] },
      { label: "Asistente de IA", values: [false, true] },
      { label: "Soporte", values: ["Email", "Prioritario"] },
    ],
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
            Empieza gratis y crece cuando lo necesites. Sin permanencia: cancela cuando quieras.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 64 }}>
        <div className="wrap">
          <PlanCards />
          <p className="pricing-foot reveal">
            Todos los precios incluyen IVA · sin permanencia · cancela cuando quieras ·{" "}
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
                  {PLANS.map((p) => (
                    <col key={p.key} className={p.recommended ? "rec-col" : undefined} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th>Funcionalidad</th>
                    {PLANS.map((p) => (
                      <th key={p.key} className={p.recommended ? "rec" : undefined}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((g) => (
                    <Fragment key={g.group}>
                      <tr className="grp">
                        <td colSpan={PLANS.length + 1}>{g.group}</td>
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
            <a href={checkoutHref("PRO")} className="btn btn-primary btn-lg">
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
