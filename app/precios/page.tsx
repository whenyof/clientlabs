import { Fragment } from "react"
import { BackgroundGlow, Navbar } from "../ui/chrome"

const planCards = [
  {
    name: "Free",
    price: "0€",
    note: "Dashboard básico y arranque sin riesgo.",
    features: ["Dashboard básico", "1 automatización", "50 acciones", "Soporte básico"],
  },
  {
    name: "Pro",
    price: "€89/mes",
    note: "Automatización seria y métricas avanzadas.",
    features: ["Automatizaciones ilimitadas", "Stripe integrado", "IA + Leads", "Analytics avanzados", "Integraciones", "Soporte prioritario"],
    recommended: true,
  },
  {
    name: "Business",
    price: "A medida",
    note: "Seguridad, control y performance a escala.",
    features: ["Todo lo de Pro", "API y webhooks", "Roles y auditoría", "White label", "SLA", "Soporte dedicado"],
  },
]

const comparisonRows = [
  { label: "Dashboard", free: "Básico", pro: "Avanzado", business: "Avanzado + SLA" },
  { label: "Automatizaciones", free: "1 / 50 acciones", pro: "Ilimitadas", business: "Ilimitadas + prioridad" },
  { label: "Stripe y pagos", free: "Incluido", pro: "Incluido", business: "Incluido + soporte dedicado" },
  { label: "IA y leads", free: "Básico", pro: "Completo", business: "Completo + tuning" },
  { label: "Integraciones", free: "Principales", pro: "Todas", business: "Todas + personalizadas" },
  { label: "Roles y auditoría", free: "No", pro: "Sí", business: "Avanzado" },
  { label: "API / Webhooks", free: "No", pro: "Sí", business: "Sí + control" },
  { label: "White label", free: "No", pro: "No", business: "Sí" },
  { label: "SLA / Soporte", free: "Básico", pro: "Prioritario", business: "Dedicado + SLA" },
]

export default function Precios() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-28 pb-12 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Precios</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Planes claros, sin letra pequeña.</h1>
        <p className="text-white/70">Escala cuando lo necesites, con control y soporte adecuado.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-3">
        {planCards.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border px-6 py-8 shadow-lg backdrop-blur ${
              plan.recommended ? "border-[#7C3AED]/50 bg-[#7C3AED]/12 shadow-purple-900/30" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">{plan.name}</p>
              {plan.recommended && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">Recomendado</span>
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{plan.price}</p>
            <p className="mt-2 text-sm text-white/70">{plan.note}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {plan.features.map((f) => (
                <li key={f} className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/register"
              className={`mt-6 inline-flex rounded-full px-4 py-2 text-xs font-semibold transition ${
                plan.recommended ? "bg-white text-black" : "border border-white/20 text-white/80 hover:border-white/40"
              }`}
            >
              Empezar
            </a>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/20">
          <p className="text-sm font-semibold text-white">Comparativa rápida</p>
          <div className="mt-4 grid grid-cols-4 gap-4 text-sm text-white/70">
            <div className="font-semibold text-white/60">Incluye</div>
            <div className="text-center font-semibold text-white/60">Free</div>
            <div className="text-center font-semibold text-white">Pro</div>
            <div className="text-center font-semibold text-white/60">Business</div>
            {comparisonRows.map((row) => (
              <Fragment key={row.label}>
                <div className="py-2">{row.label}</div>
                <div className="py-2 text-center">{row.free}</div>
                <div className="py-2 text-center text-white">{row.pro}</div>
                <div className="py-2 text-center">{row.business}</div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

