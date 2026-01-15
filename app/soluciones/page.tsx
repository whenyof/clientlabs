import { BackgroundGlow, Navbar } from "../ui/chrome"

const solutions = [
  {
    type: "Agencias",
    pains: ["Onboarding y cobros fragmentados", "Reporting manual para clientes", "Flujos repetitivos sin trazabilidad"],
    fix: "Centraliza clientes, contratos, cobros y reporting compartible. Automatiza onboarding, alerts y handoffs.",
  },
  {
    type: "Ecommerce",
    pains: ["Pedidos y pagos sin reconciliar", "Campañas sin atribución clara", "Recuperación de carritos débil"],
    fix: "Stripe + flujos de recuperación, audiencias sincronizadas y dashboards de conversión en vivo.",
  },
  {
    type: "SaaS",
    pains: ["Health de cuentas opaco", "Expansión y churn sin alertas", "Integraciones ad hoc frágiles"],
    fix: "Scoring, alerts, playbooks sin código y métricas LTV/CAC con pipelines conectados a facturación.",
  },
  {
    type: "Freelancers",
    pains: ["Cobros tardíos y sin seguimiento", "Propuestas y funnels manuales", "Sin datos para decidir"],
    fix: "Landings y funnels listos, cobros y suscripciones simples, alerts y nurture automatizado.",
  },
  {
    type: "Startups",
    pains: ["Iterar lento por dependencia técnica", "Datos dispersos en prototipos", "Sin visibilidad de pipeline"],
    fix: "Plantillas, IA y flujos visuales para lanzar rápido; métricas consistentes y APIs listas para escalar.",
  },
  {
    type: "PYMES",
    pains: ["Operaciones desordenadas", "Roles y permisos difusos", "Reporting lento"],
    fix: "Panel único con roles, flujos guiados, pagos y métricas claras para decidir sin fricción.",
  },
]

export default function SolucionesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Soluciones</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Casos reales, dolores reales.</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          ClientLabs adapta automatización, pagos, IA y métricas a cada modelo de negocio sin perder consistencia de datos.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          {solutions.map((item) => (
            <div key={item.type} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/20">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-white">{item.type}</p>
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Dolores → Solución</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <p className="text-white">Dolores:</p>
                <ul className="list-disc space-y-1 pl-5">
                  {item.pains.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="pt-2 text-white">Cómo lo resolvemos:</p>
                <p>{item.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 shadow-2xl shadow-purple-900/30 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">CTA</p>
          <h3 className="text-3xl font-semibold text-white md:text-4xl">Elige tu caso y arranca en minutos.</h3>
          <p className="text-white/70">Automatiza lo crítico hoy y escala sin rehacer tu stack mañana.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Empezar gratis
            </a>
            <a
              href="/demo"
              className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Ver demo
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

