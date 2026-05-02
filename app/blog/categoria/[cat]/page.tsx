import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "../../../ui/chrome"
import { ARTICLES } from "../../data"

type Props = { params: Promise<{ cat: string }> }

const CATEGORY_MAP: Record<string, { label: string; description: string }> = {
  normativa: {
    label: "Normativa",
    description:
      "Todo sobre Verifactu, facturación electrónica obligatoria, modelos de la AEAT y cumplimiento fiscal para autónomos en España.",
  },
  guia: {
    label: "Guía",
    description:
      "Guías prácticas para gestionar mejor tu negocio como autónomo: facturación, clientes, IVA y organización.",
  },
  comparativa: {
    label: "Comparativa",
    description:
      "Comparativas honestas de software de facturación, CRM y herramientas para autónomos y pymes españolas.",
  },
  tutorial: {
    label: "Tutorial",
    description:
      "Tutoriales paso a paso para usar ClientLabs: crea facturas, gestiona leads y migra desde Excel.",
  },
  negocio: {
    label: "Negocio",
    description:
      "Estrategias de negocio para autónomos: captación de clientes, gestión de leads y organización comercial.",
  },
}

const CATEGORY_ACCENT: Record<string, { bg: string; text: string; border: string }> = {
  normativa:   { bg: "bg-amber-500/10",   text: "text-amber-300",   border: "border-amber-500/20"   },
  guia:        { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20" },
  comparativa: { bg: "bg-blue-500/10",    text: "text-blue-300",    border: "border-blue-500/20"    },
  tutorial:    { bg: "bg-violet-500/10",  text: "text-violet-300",  border: "border-violet-500/20"  },
  negocio:     { bg: "bg-pink-500/10",    text: "text-pink-300",    border: "border-pink-500/20"    },
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ]
  return `${d} ${months[m - 1]} ${y}`
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((cat) => ({ cat }))
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const { cat: catKey } = await paramsPromise
  const cat = CATEGORY_MAP[catKey]
  return {
    title: `${cat?.label ?? catKey} | Blog ClientLabs`,
    description: cat?.description ?? "",
    alternates: {
      canonical: `https://clientlabs.io/blog/categoria/${catKey}`,
    },
  }
}

export default async function CategoryPage({ params: paramsPromise }: Props) {
  const { cat: catKey } = await paramsPromise
  const cat = CATEGORY_MAP[catKey]
  if (!cat) notFound()

  const accent = CATEGORY_ACCENT[catKey] ?? CATEGORY_ACCENT.guia
  const articles = ARTICLES.filter((a) => a.categoryKey === catKey)

  return (
    <main className="min-h-screen bg-[#0B1F2A] text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-28 pb-12 text-center">
        <span
          className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full border mb-4 ${accent.bg} ${accent.text} ${accent.border}`}
        >
          {cat.label}
        </span>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {cat.label}
        </h1>
        <p className="mt-4 text-[16px] text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {cat.description}
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-block text-[13px] text-[#1FA97A] hover:underline"
        >
          Ver todos los artículos
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        {articles.length === 0 ? (
          <p className="text-center text-slate-500 text-[14px]">
            No hay artículos en esta categoría todavía.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05] transition-all"
              >
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
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
