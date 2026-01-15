import { BackgroundGlow, Navbar } from "../ui/chrome"

export default function ContactoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Contacto</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Hablemos de tu operación.</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          Cuéntanos tu stack y tus cuellos de botella. Te ayudamos a lanzar automatizaciones y métricas coherentes sin fricción.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
          <form className="space-y-4">
            {[
              { label: "Nombre", type: "text", id: "name", placeholder: "Tu nombre" },
              { label: "Email", type: "email", id: "email", placeholder: "tu@empresa.com" },
            ].map((f) => (
              <div key={f.id} className="space-y-2">
                <label htmlFor={f.id} className="text-sm text-white/70">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  placeholder={f.placeholder}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                />
              </div>
            ))}
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm text-white/70">
                Qué quieres resolver
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Cuéntanos tus dolores operativos"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-blue-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-purple-800/30 transition hover:shadow-purple-800/50"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

