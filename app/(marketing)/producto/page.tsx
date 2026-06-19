import type { Metadata } from "next"
import Link from "next/link"
import { PREVIEW_URL, SITE_URL } from "@/lib/site-config"
import { ArrowRight, Check, CheckBold, Globe, Lock, Shield } from "@/components/marketing/icons"
import ProductIndex from "@/components/marketing/ProductIndex"

export const metadata: Metadata = {
  title: "CRM y software de facturación para autónomos con Verifactu — ClientLabs",
  description:
    "Un recorrido por dentro de ClientLabs módulo a módulo: clientes y ventas, facturación con Verifactu, operativa y equipo, y crecimiento. Lo que ves es lo que usarás desde el primer día.",
  keywords: [
    "software facturación verifactu",
    "crm autónomos funciones",
    "facturación electrónica autónomos",
    "gestión leads autónomos",
    "presupuestos online",
    "crm y facturación",
  ],
  openGraph: {
    title: "ClientLabs por dentro — CRM y facturación con Verifactu",
    description:
      "Clientes y ventas, facturación con Verifactu, operativa y crecimiento. Módulo a módulo.",
    type: "website",
    url: `${SITE_URL}/producto`,
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: `${SITE_URL}/producto` },
}

export default function ProductoPage() {
  return (
    <>
      <section className="page-hero soft">
        <div className="wrap">
          <h1 className="reveal">ClientLabs por dentro.</h1>
          <p className="reveal">
            Un recorrido módulo a módulo por todo lo que puedes hacer. Sin humo: lo que ves es lo
            que usarás desde el primer día.
          </p>
          <div className="hero-ctas reveal">
            <a href={PREVIEW_URL} className="btn btn-primary btn-lg">
              Empieza gratis
              <ArrowRight className="arr" />
            </a>
            <Link href="/contacto" className="btn btn-ghost btn-lg">
              Pedir una demo
            </Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="wrap">
          <div className="ptour">
            <ProductIndex />

            <div className="modules">
              {/* 01 CLIENTES */}
              <article className="module" id="clientes">
                <div className="m-head">
                  <span className="m-num">01</span>
                  <h2>Clientes y ventas</h2>
                </div>
                <p className="m-lead">
                  Un único lugar para tu cartera: cada lead, cliente y proveedor con su historial,
                  su estado y todo lo que habéis hablado. De la primera conversación a la factura,
                  sin teclear lo mismo dos veces.
                </p>
                <div className="m-cols">
                  <ul>
                    <li>
                      <Check />
                      <span>
                        <b>Pipeline de ventas</b> con etapas claras: nuevo, cualificado, propuesta y cliente.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Ficha de contacto</b> con fuente, propietario, notas y documentos asociados.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Proveedores y catálogo</b> integrados para presupuestar en segundos.
                      </span>
                    </li>
                  </ul>
                  <div className="m-vis">
                    <div className="vbar">
                      <i />
                      <i />
                      <i />
                      <span className="lead">Embudo de ventas</span>
                    </div>
                    <div className="pad">
                      <div className="pipe">
                        <div className="pipe-col">
                          <div className="pc-head">
                            <span>Cualificados</span>
                            <span className="ct">2</span>
                          </div>
                          <div className="pipe-card">
                            <div className="nm">Diego Torres</div>
                            <div className="mt">Torres Marketing</div>
                          </div>
                          <div className="pipe-card">
                            <div className="nm">Pablo Ruiz</div>
                            <div className="mt">Autónomo</div>
                          </div>
                        </div>
                        <div className="pipe-col">
                          <div className="pc-head">
                            <span>Propuesta</span>
                            <span className="ct">1</span>
                          </div>
                          <div className="pipe-card hot">
                            <div className="nm">Estudio Nórdico</div>
                            <div className="mt">2.565 € · enviada</div>
                          </div>
                        </div>
                        <div className="pipe-col">
                          <div className="pc-head">
                            <span>Cliente</span>
                            <span className="ct">1</span>
                          </div>
                          <div className="pipe-card">
                            <div className="nm">Laura Núñez</div>
                            <div className="mt">Recurrente</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* 02 FACTURACIÓN */}
              <article className="module" id="facturacion">
                <div className="m-head">
                  <span className="m-num">02</span>
                  <h2>Facturación con Verifactu</h2>
                </div>
                <p className="m-lead">
                  Presupuestos y facturas conformes a la nueva normativa, firmados y encadenados.
                  Conviertes un presupuesto aceptado en factura con un clic y sabes al instante qué
                  ha hecho tu cliente con cada documento.
                </p>
                <div className="m-cols">
                  <ul>
                    <li>
                      <Check />
                      <span>
                        <b>Conforme a Verifactu de serie</b>, sin configurar nada raro.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Presupuesto → factura</b> en un clic, con numeración correlativa automática.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Tracking en tiempo real:</b> sabes si lo han abierto y cuándo.
                      </span>
                    </li>
                  </ul>
                  <div className="m-vis">
                    <div className="vbar">
                      <i />
                      <i />
                      <i />
                      <span className="lead">Documentos</span>
                    </div>
                    <div className="pad">
                      <div className="doclist">
                        <div className="doc-row">
                          <div>
                            <div className="dt">Factura 2026-0148</div>
                            <div className="ds">Torres Marketing</div>
                          </div>
                          <span className="doc-status ok">
                            <span className="d" />
                            Registrada
                          </span>
                          <span className="amt">2.565 €</span>
                        </div>
                        <div className="doc-row">
                          <div>
                            <div className="dt">Presupuesto P-0212</div>
                            <div className="ds">Estudio Nórdico · abierto hace 2 h</div>
                          </div>
                          <span className="doc-status warn">
                            <span className="d" />
                            Pendiente
                          </span>
                          <span className="amt">1.940 €</span>
                        </div>
                        <div className="doc-row">
                          <div>
                            <div className="dt">Factura 2026-0147</div>
                            <div className="ds">Laura Núñez</div>
                          </div>
                          <span className="doc-status ok">
                            <span className="d" />
                            Cobrada
                          </span>
                          <span className="amt">820 €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* 03 OPERATIVA */}
              <article className="module" id="operativa">
                <div className="m-head">
                  <span className="m-num">03</span>
                  <h2>Operativa y equipo</h2>
                </div>
                <p className="m-lead">
                  Proyectos, tareas y personas en el mismo espacio. Lo que hay que hacer, quién lo
                  hace y para cuándo, sin que nada se pierda entre correos. Invita a tu equipo y
                  decide qué ve cada uno.
                </p>
                <div className="m-cols">
                  <ul>
                    <li>
                      <Check />
                      <span>
                        <b>Tareas con responsable y fecha</b>, vinculadas al cliente o proyecto.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Roles y permisos</b> para socios, gestores y colaboradores.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Todo conectado:</b> cada tarea sabe a qué cliente y factura pertenece.
                      </span>
                    </li>
                  </ul>
                  <div className="m-vis">
                    <div className="vbar">
                      <i />
                      <i />
                      <i />
                      <span className="lead">Tareas · Hoy</span>
                    </div>
                    <div className="pad">
                      <div className="checklist">
                        <div className="chk done">
                          <span className="box">
                            <CheckBold />
                          </span>
                          <span className="tk">Preparar presupuesto · Torres</span>
                          <span className="due">Hecho</span>
                        </div>
                        <div className="chk">
                          <span className="box" />
                          <span className="tk">Revisar contrato anual</span>
                          <span className="due today">Hoy</span>
                        </div>
                        <div className="chk">
                          <span className="box" />
                          <span className="tk">Enviar factura de junio</span>
                          <span className="due">En curso</span>
                        </div>
                        <div className="chk">
                          <span className="box" />
                          <span className="tk">Llamada de seguimiento</span>
                          <span className="due">Mañana</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* 04 CRECIMIENTO */}
              <article className="module" id="crecimiento">
                <div className="m-head">
                  <span className="m-num">04</span>
                  <h2>Crecimiento</h2>
                </div>
                <p className="m-lead">
                  Cuando el día a día está resuelto, ClientLabs te ayuda a ir un paso más allá:
                  comunícate con tu cartera, automatiza lo repetitivo y entiende tus números sin
                  montar una hoja de cálculo.
                </p>
                <div className="m-cols">
                  <ul>
                    <li>
                      <Check />
                      <span>
                        <b>Email marketing</b> a tus contactos, sin salir de la plataforma.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Automatizaciones</b> para recordatorios y tareas que se repiten.
                      </span>
                    </li>
                    <li>
                      <Check />
                      <span>
                        <b>Informes y cierres</b> trimestrales listos para tu gestor.
                      </span>
                    </li>
                  </ul>
                  <div className="m-vis">
                    <div className="vbar">
                      <i />
                      <i />
                      <i />
                      <span className="lead">Informes · T2</span>
                    </div>
                    <div className="pad">
                      <div className="metrics">
                        <div className="metric">
                          <div className="mk">Facturado este trimestre</div>
                          <div className="mv">18.420 €</div>
                          <div className="md">▲ vs. T1</div>
                        </div>
                        <div className="metric">
                          <div className="mk">Pendiente de cobro</div>
                          <div className="mv">3.180 €</div>
                          <div className="md" style={{ color: "var(--ink-3)" }}>
                            2 facturas
                          </div>
                        </div>
                      </div>
                      <div className="grow">
                        <div className="grow-card">
                          <div className="gt">
                            <span className="nm">Facturación por trimestre</span>
                            <span className="st">al día</span>
                          </div>
                          <div className="grow-bars">
                            <i style={{ height: "38%" }} />
                            <i style={{ height: "52%" }} />
                            <i style={{ height: "46%" }} />
                            <i style={{ height: "64%" }} />
                            <i style={{ height: "72%" }} />
                            <i className="hi" style={{ height: "88%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="cred reveal">
        <div className="cred-inner">
          <span className="cred-item">
            <Shield />
            Conforme a <b>Verifactu</b>
          </span>
          <span className="cred-sep" />
          <span className="cred-item">
            <Lock />
            Cumplimiento <b>RGPD</b>
          </span>
          <span className="cred-sep" />
          <span className="cred-item">
            <Globe />
            Datos alojados en la <b>UE</b>
          </span>
        </div>
      </div>

      {/* CÓMO EMPEZAR */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-intro reveal">
            <h2>Empezar es así de simple.</h2>
            <p>
              Sin migraciones eternas ni consultores. En una tarde tienes tu negocio dentro y
              facturas en regla.
            </p>
          </div>
          <div className="steps">
            <div className="step reveal">
              <div className="s-n">01</div>
              <h3>Crea tu cuenta</h3>
              <p>Te registras gratis, sin tarjeta. En un minuto estás dentro y con todo listo para configurar.</p>
            </div>
            <div className="step reveal">
              <div className="s-n">02</div>
              <h3>Trae tu cartera</h3>
              <p>
                Importa tus clientes y proveedores desde un archivo o añádelos a mano. Tus datos,
                ordenados desde el primer día.
              </p>
            </div>
            <div className="step reveal">
              <div className="s-n">03</div>
              <h3>Factura en regla</h3>
              <p>
                Emite tu primera factura conforme a Verifactu y empieza a trabajar como siempre,
                pero todo en un único lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="wrap">
          <h2 className="reveal">¿Lo vemos en tu negocio?</h2>
          <p className="reveal">Crea tu cuenta gratis o pídeme una demo y te lo enseño en directo.</p>
          <div className="hero-ctas reveal">
            <a href={PREVIEW_URL} className="btn btn-primary btn-lg">
              Empieza gratis
              <ArrowRight className="arr" />
            </a>
            <Link href="/contacto" className="btn btn-ghost btn-lg">
              Pedir una demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
