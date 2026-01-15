import { BackgroundGlow, Navbar } from "../ui/chrome"

const resources = [
  { title: "Blog", desc: "Estrategias operativas, automatización y métricas accionables.", href: "/blog" },
  { title: "Docs", desc: "Guías claras para integrar pagos, métricas y flujos sin código.", href: "#" },
  { title: "Soporte", desc: "Equipo disponible para ayudarte a implementar sin fricción.", href: "/contacto" },
  { title: "Demo guiada", desc: "Recorrido visual por el panel y flujos principales.", href: "/demo" },
  { title: "Plantillas", desc: "Webs y flujos listos por industria para lanzar rápido.", href: "#" },
  { title: "Changelog", desc: "Actualizaciones y mejoras continuas de producto.", href: "#" },
]

export default function Recursos() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-28 pb-12 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Recursos</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Material claro para operar con confianza.</h1>
        <p className="text-white/70">
          Documentación, guías y soporte para implementar ClientLabs sin improvisar.
        </p>
      </section>

      <section className="mx-auto max-w-6xl grid gap-4 px-6 pb-20 md:grid-cols-3">
        {resources.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-lg backdrop-blur transition hover:border-white/30"
          >
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm text-white/70">{item.desc}</p>
          </a>
        ))}
      </section>
    </main>
  )
}

