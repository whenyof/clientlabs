import { BackgroundGlow, Navbar } from "../ui/chrome"

export default function Seguridad() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-28 pb-12 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Seguridad</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Confianza operativa para equipos auditados.</h1>
        <p className="text-white/70">
          Gobernanza, cumplimiento y resiliencia de la infraestructura sin complicaciones.
        </p>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-6 pb-20">
        {[
          {
            title: "GDPR y privacidad",
            desc: "Datos tratados bajo principios de minimización, derecho al olvido y exportabilidad.",
          },
          {
            title: "Cifrado y control de acceso",
            desc: "Cifrado en tránsito y en reposo, roles granulares, MFA y bitácora de auditoría.",
          },
          {
            title: "Infraestructura",
            desc: "Despliegue en nubes europeas y US, redundancia, backups automáticos y SLA de disponibilidad.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-lg font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm text-white/70">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

