import { Navbar } from "../ui/chrome"

const posts = [
 { title: "Cómo automatizar cobros y recovery sin código", tag: "Automatización" },
 { title: "Framework de métricas: LTV, CAC y cohorts accionables", tag: "Métricas" },
 { title: "Playbooks de agencia: onboarding y reporting sin fricción", tag: "Agencias" },
]

export default function BlogPage() {
 return (
 <main className="relative min-h-screen overflow-hidden text-[var(--text-primary)]">
 <Navbar />

 <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 pb-14 text-center md:pt-32">
 <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Blog</p>
 <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Guías para operar sin improvisar.</h1>
 <p className="mt-4 max-w-3xl text-[var(--text-secondary)]">
 Estrategias prácticas sobre automatización, métricas y ejecución con ClientLabs.
 </p>
 </section>

 <section className="mx-auto max-w-5xl px-6 pb-24">
 <div className="grid gap-4 md:grid-cols-3">
 {posts.map((post) => (
 <div key={post.title} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-sm shadow-sm">
 <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{post.tag}</p>
 <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{post.title}</p>
 <a href="#" className="mt-4 inline-flex text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
 Leer →
 </a>
 </div>
 ))}
 </div>
 </section>
 </main>
 )
}


