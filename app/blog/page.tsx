import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "../ui/chrome"
import { ARTICLES } from "./data"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog — ClientLabs | Guías para Autónomos y Pymes",
  description:
    "Artículos sobre facturación, Verifactu, fiscalidad, CRM y gestión de clientes para autónomos y pymes españolas.",
  keywords: [
    "blog autónomos",
    "facturación electrónica",
    "verifactu",
    "guías pymes",
    "fiscalidad autónomos españa",
  ],
  openGraph: {
    title: "Blog — ClientLabs | Guías para Autónomos y Pymes",
    description:
      "Artículos, guías y recursos para autónomos y pymes españolas.",
    type: "website",
    url: "https://clientlabs.io/blog",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/blog" },
}

const CATEGORIES = [
  { key: "all", label: "Todos" },
  { key: "normativa", label: "Normativa" },
  { key: "guia", label: "Guía" },
  { key: "negocio", label: "Negocio" },
  { key: "comparativa", label: "Comparativa" },
  { key: "tutorial", label: "Tutorial" },
] as const

const CATEGORY_ACCENT: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  normativa:  { bg: "bg-amber-500/10",   text: "text-amber-300",   border: "border-amber-500/20"   },
  guia:       { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  comparativa:{ bg: "bg-blue-500/10",    text: "text-blue-300",    border: "border-blue-500/20"    },
  tutorial:   { bg: "bg-violet-500/10",  text: "text-violet-300",  border: "border-violet-500/20"  },
  negocio:    { bg: "bg-pink-500/10",    text: "text-pink-300",    border: "border-pink-500/20"    },
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ]
  return `${d} ${months[m - 1]} ${y}`
}

const sortedArticles = [...ARTICLES].sort(
  (a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
)

type PageProps = { searchParams: Promise<{ cat?: string }> }

export default async function BlogPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise
  const activeCategory = searchParams.cat ?? "all"
  const filtered =
    activeCategory === "all"
      ? sortedArticles
      : sortedArticles.filter((a) => a.categoryKey === activeCategory)

  return (
    <main className="min-h-screen bg-[#0B1F2A] text-white">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-28 pb-12 text-center">
        <span className="inline-block text-[11px] font-semibold text-[#1FA97A] uppercase tracking-widest mb-4">
          Blog ClientLabs
        </span>
        <h1 className="text-[36px] md:text-[48px] font-bold leading-tight text-white">
          Guías para autónomos
          <br className="hidden md:block" />
          y pymes españolas
        </h1>
        <p className="mt-4 text-[16px] text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Facturación, Verifactu, fiscalidad, CRM y captación de clientes.
          Todo lo que necesitas para gestionar mejor tu negocio.
        </p>
      </section>

      {/* Category filters */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key
            return (
              <Link
                key={cat.key}
                href={cat.key === "all" ? "/blog" : `/blog?cat=${cat.key}`}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  isActive
                    ? "bg-[#1FA97A] text-white border-[#1FA97A]"
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat.label}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Articles grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <p className="text-slate-500 text-[12px] mb-6 text-center">
          {filtered.length} {filtered.length === 1 ? "artículo" : "artículos"}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => {
            const accent =
              CATEGORY_ACCENT[post.categoryKey] ?? CATEGORY_ACCENT.guia
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] transition-all"
              >
                {/* Card cover */}
                <div
                  className={`h-28 rounded-t-xl flex items-end justify-between px-4 pb-3 relative overflow-hidden ${accent.bg}`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl bg-white" />
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${accent.bg} ${accent.text} ${accent.border}`}
                  >
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {post.readTime}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-[14px] font-semibold text-white leading-snug mb-2 group-hover:text-[#1FA97A] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-[12px] leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-slate-500 text-[11px]">
                      {formatDate(post.publishedAt)}
                    </span>
                    <span
                      className={`text-[12px] font-semibold ${accent.text} group-hover:underline`}
                    >
                      Leer →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
