import { Navbar } from "../ui/chrome"

export default function DemoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Demo</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Ve el panel en acción.</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          Recorre automatizaciones, métricas y flujos clave. Agenda una sesión o prueba la demo guiada.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="/contacto"
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Probar demo guiada
          </a>
          <a
            href="/contacto"
            className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Agendar sesión
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/20">
          <p className="text-sm font-semibold text-white">Incluye en la demo</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>• Flujos sin código: creación, monitoreo y alertas.</li>
            <li>• Dashboard: métricas clave y reporting accionable.</li>
            <li>• Integraciones: Stripe, WordPress, Zapier, APIs.</li>
            <li>• IA aplicada: scoring de leads y contenido contextual.</li>
            <li>• Roles, permisos y auditoría.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}


