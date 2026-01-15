import { BackgroundGlow, Navbar } from "../ui/chrome"

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">About</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Construimos infraestructura operativa.</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          ClientLabs nace para eliminar el caos de herramientas desconectadas. Equipo con background en SaaS, data y
          automatización construyendo producto para empresas que no pueden improvisar.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/20">
          <p className="text-lg font-semibold text-white">Nuestra tesis</p>
          <p className="mt-3 text-white/70">
            Operar bien es ventaja competitiva. Unimos datos, pagos y automatización con gobernanza y visibilidad para que
            cada equipo ejecute más rápido y con menos riesgo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h3 className="text-xl font-semibold text-white">Hitos</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { title: "Fundación", desc: "Creado por ex-ops, data y producto que vivieron el caos de 10 herramientas." },
            { title: "Clientes", desc: "+100 empresas en producción con 50k+ procesos automatizados." },
            { title: "Visión", desc: "Ser la capa operativa central para negocios que buscan escala sin fricción." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

