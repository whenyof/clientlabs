import type { Metadata } from "next"
import Link from "next/link"
import { START_HREF, SITE_URL } from "@/lib/site-config"
import { plansSummary } from "@/lib/pricing"
import { ArrowRight, Check, ChevronDown, Eye, Globe, Lock, Shield } from "@/components/marketing/icons"
import PlanCards from "@/components/marketing/PlanCards"

export const metadata: Metadata = {
  title: "ClientLabs — Gestión todo-en-uno para autónomos y pequeñas empresas",
  description:
    "CRM, facturación legal con Verifactu y toda tu operativa en un único lugar. Sin hojas de cálculo, sin sustos con Hacienda.",
  keywords: [
    "CRM autónomos España",
    "software gestión autónomos",
    "facturación Verifactu",
    "gestión leads autónomo",
    "alternativa Holded",
    "software pymes España",
    "ClientLabs",
  ],
  alternates: {
    canonical: SITE_URL,
    languages: { "es-ES": SITE_URL },
  },
  openGraph: {
    title: "ClientLabs — Gestión todo-en-uno para autónomos y pequeñas empresas",
    description:
      "CRM, facturación legal con Verifactu y toda tu operativa en un único lugar. Sin hojas de cálculo, sin sustos con Hacienda.",
    url: SITE_URL,
    siteName: "ClientLabs",
    locale: "es_ES",
    type: "website",
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ClientLabs es una plataforma de gestión todo en uno para autónomos y pymes en España. Centraliza leads, clientes, proveedores, facturas con Verifactu, presupuestos, albaranes, tareas, proyectos y automatizaciones en un solo lugar.",
      },
    },
    {
      "@type": "Question",
      name: "¿Para quién es ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Para autónomos, freelancers y pequeños negocios de 1 a 10 personas en España: agencias, consultores, diseñadores, fisioterapeutas y cualquier profesional que necesite gestión profesional sin la complejidad de herramientas para grandes empresas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto cuesta ClientLabs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `ClientLabs tiene dos planes (precios sin IVA): ${plansSummary()}. Con facturación anual te llevas 2 meses gratis. Puedes probarlo 14 días y cancelar cuando quieras.`,
      },
    },
    {
      "@type": "Question",
      name: "¿ClientLabs cumple con Verifactu?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. ClientLabs emite facturas conformes a Verifactu de forma nativa, firmadas y encadenadas, conforme a la normativa española de facturación electrónica.",
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-stage">
          <h1 className="reveal">
            El software de gestión todo-en-uno para autónomos y pequeñas empresas.
          </h1>
          <p className="sub reveal">
            CRM, facturación legal con Verifactu y toda tu operativa en un único lugar.
            Sin hojas de cálculo, sin sustos con Hacienda.
          </p>
          <div className="hero-ctas reveal">
            <a href={START_HREF} className="btn btn-primary btn-lg">
              Empieza gratis
              <ArrowRight className="arr" />
            </a>
            <a href="#preview" className="btn btn-ghost btn-lg">
              Ver cómo funciona
            </a>
          </div>
          <a className="scroll-cue" href="#preview" aria-label="Desliza para ver más">
            Desliza
            <ChevronDown />
          </a>
        </div>
      </section>

      <section className="hero-shot-sec" id="preview">
        <div className="wrap">
          <div className="hero-shot reveal">
            <div className="bar">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>
              <span className="url">app.clientlabs.io</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/marketing/dashboard.png"
              width={3358}
              height={1966}
              alt="Panel de ClientLabs mostrando el dashboard con CRM, clientes, proveedores, tareas, facturación, automatizaciones e informes en la barra lateral."
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* CREDIBILITY LINE */}
      <div className="cred reveal">
        <div className="cred-inner">
          <span className="cred-item">
            <Shield />
            Facturación conforme a <b>Verifactu</b>
          </span>
          <span className="cred-sep" />
          <span className="cred-item">
            <Lock />
            Cumplimiento <b>RGPD</b>
          </span>
          <span className="cred-sep" />
          <span className="cred-item">
            <Globe />
            Tus datos alojados en la <b>Unión Europea</b>
          </span>
        </div>
      </div>

      {/* PRODUCT / PILLARS */}
      <section className="sec" id="producto">
        <div className="wrap">
          <div className="sec-intro reveal">
            <h2>Todo tu negocio, en una sola herramienta.</h2>
            <p>
              Deja de saltar entre hojas de cálculo, programas de facturas y notas sueltas.
              ClientLabs reúne lo que necesitas para gestionar clientes, cobrar y crecer.
            </p>
          </div>

          {/* Pilar 1 — CRM */}
          <div className="pillar reveal">
            <div className="pillar-copy">
              <h3>Tu cartera, bajo control.</h3>
              <p>
                Leads, clientes y proveedores en un mismo sitio, con un catálogo de productos
                y servicios integrado para crear pedidos en segundos.
              </p>
              <ul className="pillar-list">
                <li>
                  <Check />
                  <span>
                    <b>Leads y clientes</b> con su historial, contactos y estado del ciclo de venta.
                  </span>
                </li>
                <li>
                  <Check />
                  <span>
                    <b>Proveedores y catálogo</b> conectados, para presupuestar sin empezar de cero.
                  </span>
                </li>
              </ul>
            </div>
            <div className="pillar-vis">
              <div className="vbar">
                <i />
                <i />
                <i />
                <span className="lead">Leads · Diego Torres</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/marketing/leads.png"
                width={3358}
                height={1608}
                alt="Listado de leads en ClientLabs con datos de contacto, fuente, propietario y estado del ciclo de venta."
              />
            </div>
          </div>

          {/* Pilar 2 — Operativa (alterna lado) */}
          <div className="pillar reverse reveal">
            <div className="pillar-copy">
              <h3>Tu operativa diaria, ordenada.</h3>
              <p>
                Proyectos, tareas y equipo en el mismo espacio. Invita a quien necesites y asigna
                roles y permisos para que cada uno vea lo justo.
              </p>
              <ul className="pillar-list">
                <li>
                  <Check />
                  <span>
                    <b>Proyectos y tareas</b> con responsables, fechas y seguimiento.
                  </span>
                </li>
                <li>
                  <Check />
                  <span>
                    <b>Equipo con roles y permisos</b> para trabajar con gestores, socios o colaboradores.
                  </span>
                </li>
              </ul>
            </div>
            <div className="pillar-vis">
              <div className="vbar">
                <i />
                <i />
                <i />
                <span className="lead">Tareas y proyectos</span>
              </div>
              <div className="vis-pad">
                <div className="flow">
                  <div className="flow-step">
                    <span className="av">MG</span>
                    <span>
                      <b>Preparar presupuesto · Torres Marketing</b>
                      <br />
                      <span className="role">Marta García · Comercial</span>
                    </span>
                    <span className="badge done">Hecho</span>
                  </div>
                  <div className="flow-step">
                    <span className="av">IR</span>
                    <span>
                      <b>Revisar contrato anual</b>
                      <br />
                      <span className="role">Iyan R. · Dirección</span>
                    </span>
                    <span className="badge">Hoy</span>
                  </div>
                  <div className="flow-step">
                    <span className="av">LP</span>
                    <span>
                      <b>Enviar factura de junio</b>
                      <br />
                      <span className="role">Laura P. · Administración</span>
                    </span>
                    <span className="badge">En curso</span>
                  </div>
                  <div className="flow-step">
                    <span className="av">MG</span>
                    <span>
                      <b>Llamada de seguimiento</b>
                      <br />
                      <span className="role">Marta García · Comercial</span>
                    </span>
                    <span className="badge">Mañana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilar destacado — Verifactu */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="pillar-feature reveal">
            <div className="inner">
              <div className="pillar-copy">
                <h3>Facturación legal, sin sorpresas.</h3>
                <p>
                  Emite facturas conformes a Verifactu de forma nativa y sabe al instante qué pasa
                  con cada documento. Lo que tu gestor agradece y tus competidores pequeños todavía no tienen.
                </p>
                <ul className="pillar-list">
                  <li>
                    <Check />
                    <span>
                      <b>Conforme a Verifactu de serie</b>, lista para la nueva normativa española.
                    </span>
                  </li>
                  <li>
                    <Check />
                    <span>
                      <b>Tracking en tiempo real:</b> sabes si tu cliente ha abierto el presupuesto o la factura.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="feat-vis">
                <div className="inv">
                  <div className="inv-top">
                    <span className="ttl">Factura 2026-0148</span>
                    <span className="vf">
                      <span className="d" />
                      Verifactu · Registrada
                    </span>
                  </div>
                  <div className="inv-body">
                    <div className="inv-row">
                      <span>Diseño de marca — Torres Marketing</span>
                      <span>1.800,00 €</span>
                    </div>
                    <div className="inv-row">
                      <span>Mantenimiento web (junio)</span>
                      <span>320,00 €</span>
                    </div>
                    <div className="inv-row">
                      <span>IVA (21 %)</span>
                      <span>445,20 €</span>
                    </div>
                    <div className="inv-tot">
                      <span>Total</span>
                      <span>2.565,20 €</span>
                    </div>
                  </div>
                  <div className="inv-track">
                    <Eye />
                    <span>
                      <b>Diego Torres</b> abrió esta factura hace 2 h
                    </span>
                  </div>
                  <div className="inv-hash">Huella: 9F3A·C1B7·E84D·2A56 · Encadenada y firmada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilar 4 — Crece */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="pillar reveal">
            <div className="pillar-copy">
              <h3>Crece sin esfuerzo.</h3>
              <p>
                Cuando el día a día está resuelto, ClientLabs te ayuda a ir un paso más allá:
                comunícate con tus clientes, automatiza lo repetitivo y entiende tus números.
              </p>
              <ul className="pillar-list">
                <li>
                  <Check />
                  <span>
                    <b>Email marketing</b> a tus contactos, sin salir de la plataforma.
                  </span>
                </li>
                <li>
                  <Check />
                  <span>
                    <b>Automatizaciones</b> para tareas y recordatorios repetitivos.
                  </span>
                </li>
                <li>
                  <Check />
                  <span>
                    <b>Informes y cierres trimestrales</b> para tener tus números claros.
                  </span>
                </li>
              </ul>
            </div>
            <div className="pillar-vis">
              <div className="vbar">
                <i />
                <i />
                <i />
                <span className="lead">Informes · Cierre trimestral</span>
              </div>
              <div className="vis-pad">
                <div className="grow">
                  <div className="grow-card">
                    <div className="gt">
                      <span className="nm">Facturación por trimestre</span>
                      <span className="st">T2 · al día</span>
                    </div>
                    <div className="gs">Evolución de los últimos seis trimestres</div>
                    <div className="grow-bars">
                      <i style={{ height: "38%" }} />
                      <i style={{ height: "52%" }} />
                      <i style={{ height: "46%" }} />
                      <i style={{ height: "64%" }} />
                      <i style={{ height: "72%" }} />
                      <i className="hi" style={{ height: "88%" }} />
                    </div>
                  </div>
                  <div className="grow-card">
                    <div className="gt">
                      <span className="nm">Campaña · Bienvenida verano</span>
                      <span className="st">Enviada</span>
                    </div>
                    <div className="gs">Email marketing a 312 contactos de tu cartera</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="sec pricing" id="precios">
        <div className="wrap">
          <div className="sec-intro reveal">
            <h2>Empieza gratis. Crece cuando lo necesites.</h2>
            <p>
              Sin permanencia: cancela cuando quieras. Elige el plan que encaja con tu negocio hoy
              y cámbialo cuando quieras.
            </p>
          </div>

          <PlanCards />

          <p className="pricing-foot reveal">
            ¿Quieres ver el detalle?{" "}
            <Link href="/precios" style={{ color: "var(--teal-ink)", fontWeight: 600 }}>
              Compara todos los planes →
            </Link>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="wrap">
          <h2 className="reveal">Pon orden en tu negocio hoy.</h2>
          <p className="reveal">
            Empieza gratis y ten tu CRM, tus facturas y tu operativa en un único lugar.
          </p>
          <div className="hero-ctas reveal">
            <a href={START_HREF} className="btn btn-primary btn-lg">
              Empieza gratis
              <ArrowRight className="arr" />
            </a>
            <a href="#producto" className="btn btn-ghost btn-lg">
              Ver cómo funciona
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
