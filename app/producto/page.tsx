"use client"

import { BackgroundGlow, Navbar } from "../ui/chrome"

const modules = [
  {
    name: "Clientes",
    problem: "Datos dispersos y duplicados en múltiples CRMs y hojas.",
    solution: "Perfil único con scoring, segmentación dinámica y actividad consolidada.",
    benefit: "Visibilidad real del estado de cada cuenta sin fricción operativa.",
    example: "Segmenta clientes enterprise y activa nurturing y alerts automáticos.",
  },
  {
    name: "Automatizaciones",
    problem: "Flujos manuales que se rompen y no escalan.",
    solution: "Editor visual sin código con triggers, bifurcaciones y trazabilidad.",
    benefit: "Menos incidencias, más velocidad y SLA visibles.",
    example: "Recovery de pagos fallidos con retries y notificaciones en minutos.",
  },
  {
    name: "Pagos",
    problem: "Cobros y suscripciones sin reconciliación ni contexto de cliente.",
    solution: "Stripe integrado, facturación y conciliación conectadas al CRM y métricas.",
    benefit: "Ingresos claros, sin Excel paralelo, con reporting listo.",
    example: "Lanza un plan mensual y ve el MRR impactando dashboards en tiempo real.",
  },
  {
    name: "IA",
    problem: "Sin priorización de leads ni contenido contextual.",
    solution: "Lead scoring con IA, generación de copies y respuestas guiadas.",
    benefit: "Equipos comerciales operan con foco y contexto.",
    example: "IA marca riesgo y dispara secuencias personalizadas en segundos.",
  },
  {
    name: "Integraciones",
    problem: "APIs y herramientas desconectadas sin monitorización.",
    solution: "Conectores con Stripe, WordPress, Zapier, Make, APIs y webhooks.",
    benefit: "Stack coherente, sin depender de pegamentos frágiles.",
    example: "Sync de pedidos Shopify a CRM + campañas automáticas según evento.",
  },
  {
    name: "Web builder",
    problem: "Lanzar landings y sitios requiere ingeniería constante.",
    solution: "Plantillas por industria con edición visual y tracking integrado.",
    benefit: "Iteras rápido sin perder trazabilidad ni consistencia de datos.",
    example: "Landing para agencia con formularios conectados a scoring y pipeline.",
  },
  {
    name: "Analytics",
    problem: "Métricas inconsistente y reporting manual.",
    solution: "Dashboards en tiempo real, cohorts, LTV/CAC, alertas y logs.",
    benefit: "Decisiones con datos confiables y listos para accionar.",
    example: "Alertas de churn y expansión para actuar antes de perder ingresos.",
  },
  {
    name: "Seguridad y roles",
    problem: "Accesos abiertos y cambios sin auditoría.",
    solution: "Roles granulares, bitácora de cambios, backups y cifrado.",
    benefit: "Gobernanza clara y cumplimiento para equipos auditados.",
    example: "Rol finanzas sólo ve cobros; rol ops edita flujos con logs trazables.",
  },
  {
    name: "API",
    problem: "Difícil extender y automatizar con seguridad.",
    solution: "API keys, tokens y webhooks con control y rotación.",
    benefit: "Extensión segura y observable sin romper flujos.",
    example: "Disparas onboarding custom desde tu backend y monitoreas en el panel.",
  },
]

export default function ProductoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      {/* HERO */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-16 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Producto</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">El sistema operativo para tu negocio.</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          ClientLabs centraliza clientes, pagos, automatizaciones, IA y métricas en un panel profesional para equipos que
          necesitan control y velocidad sin depender de ingeniería.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
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
      </section>

      {/* QUE ES */}
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-lg shadow-purple-900/20">
          <h2 className="text-2xl font-semibold text-white">¿Qué es ClientLabs?</h2>
          <p className="mt-3 text-white/70">
            Es la plataforma todo-en-uno que orquesta clientes, pagos, flujos, contenido e IA con métricas coherentes y
            seguridad empresarial. Menos silos, más control operativo.
          </p>
        </div>
      </section>

      {/* PARA QUIEN */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h3 className="text-xl font-semibold text-white">¿Para quién?</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {["Agencias", "Ecommerce", "SaaS", "Freelancers pro", "Startups", "PYMES"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* MODULOS */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Módulos</p>
          <h3 className="text-2xl font-semibold text-white md:text-3xl">Cada pieza resuelve un dolor real.</h3>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {modules.map((mod) => (
            <div key={mod.name} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/15">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-white">{mod.name}</p>
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Módulo</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <p><span className="text-white">Problema:</span> {mod.problem}</p>
                <p><span className="text-white">Solución:</span> {mod.solution}</p>
                <p><span className="text-white">Beneficio:</span> {mod.benefit}</p>
                <p className="text-white/60"><span className="text-white">Ejemplo:</span> {mod.example}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Cómo funciona</p>
          <h3 className="text-2xl font-semibold text-white md:text-3xl">Implementa en 4 pasos claros.</h3>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            "Conecta tu stack y normaliza datos.",
            "Define flujos visuales con IA y triggers.",
            "Activa pagos, campañas y alerts conectados.",
            "Mide en dashboards y ajusta con seguridad.",
          ].map((step) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
              {step}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 shadow-2xl shadow-purple-900/25 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Listo para operar</p>
          <h4 className="text-3xl font-semibold text-white md:text-4xl">Centraliza. Automatiza. Controla.</h4>
          <p className="text-white/70">Empieza gratis y pasa a Pro cuando necesites más capacidad.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Crear cuenta gratis
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