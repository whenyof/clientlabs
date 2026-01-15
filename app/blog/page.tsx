import { BackgroundGlow, Navbar } from "../ui/chrome"

const posts = [
  { title: "Cómo automatizar cobros y recovery sin código", tag: "Automatización" },
  { title: "Framework de métricas: LTV, CAC y cohorts accionables", tag: "Métricas" },
  { title: "Playbooks de agencia: onboarding y reporting sin fricción", tag: "Agencias" },
]

export default function BlogPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#04050a] via-[#050814] to-[#040812] text-white">
      <BackgroundGlow />
      <Navbar />

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center md:pt-32">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Blog</p>
        <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Guías para operar sin improvisar.</h1>
        <p className="mt-4 max-w-3xl text-white/70">
          Estrategias prácticas sobre automatización, métricas y ejecución con ClientLabs.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <div key={post.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-900/15">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{post.tag}</p>
              <p className="mt-2 text-lg font-semibold text-white">{post.title}</p>
              <a href="#" className="mt-4 inline-flex text-sm font-semibold text-white/80 hover:text-white">
                Leer →
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

