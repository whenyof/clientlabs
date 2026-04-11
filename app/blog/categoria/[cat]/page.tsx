import type { Metadata } from "next"
import Link from "next/link"
import { ImageIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { Navbar } from "../../../ui/chrome"
import { ARTICLES } from "../../data"

type Props = { params: { cat: string } }

const CATEGORY_MAP: Record<string, { label: string; description: string }> = {
  "fiscalidad": {
    label: "Fiscalidad",
    description: "Guías fiscales para autónomos: IVA, IRPF, modelos tributarios y cumplimiento con la AEAT.",
  },
  "productividad": {
    label: "Productividad",
    description: "Herramientas y técnicas para trabajar mejor y ganar más tiempo como autónomo.",
  },
  "gestion-clientes": {
    label: "Gestión de clientes",
    description: "Estrategias para gestionar, retener y fidelizar clientes como autónomo.",
  },
  "captacion": {
    label: "Captación",
    description: "Cómo conseguir nuevos clientes como autónomo sin gastar en publicidad.",
  },
  "negocio": {
    label: "Negocio",
    description: "Guías de negocio para autónomos: precios, presupuestos y estrategia.",
  },
  "herramientas": {
    label: "Herramientas",
    description: "Las mejores herramientas y apps para autónomos en 2026.",
  },
  "finanzas": {
    label: "Finanzas",
    description: "Organiza y gestiona las finanzas de tu negocio como autónomo.",
  },
  "emprender": {
    label: "Emprender",
    description: "Todo lo que necesitas saber para empezar como autónomo en España.",
  },
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  "fiscalidad": "Fiscalidad",
  "productividad": "Productividad",
  "gestion-clientes": "Gestión de clientes",
  "captacion": "Captación",
  "negocio": "Negocio",
  "herramientas": "Herramientas",
  "finanzas": "Finanzas",
  "emprender": "Emprender",
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((cat) => ({ cat }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = CATEGORY_MAP[params.cat]
  return {
    title: `${cat?.label ?? params.cat} | Blog ClientLabs`,
    description: cat?.description ?? "",
    alternates: { canonical: `https://clientlabs.io/blog/categoria/${params.cat}` },
  }
}

export default function CategoryPage({ params }: Props) {
  const cat = CATEGORY_MAP[params.cat]
  if (!cat) notFound()

  const categoryLabel = CATEGORY_LABEL_MAP[params.cat]
  const articles = ARTICLES.filter(
    (a) => a.category.toLowerCase() === categoryLabel.toLowerCase()
  )

  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{cat.label}</h1>
        <p className="mt-4 text-[16px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          {cat.description}
        </p>
        <Link href="/blog" className="mt-6 inline-block text-[13px] text-[#1FA97A] hover:underline">
          Ver todos los artículos
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        {articles.length === 0 ? (
          <p className="text-center text-slate-500 text-[14px]">No hay artículos en esta categoría todavía.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((post) => (
              <article key={post.slug} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                <div className="bg-slate-100 h-48 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <div className="p-5">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 ${post.categoryColor}`}>
                    {post.category}
                  </span>
                  <h2 className="text-[16px] font-bold leading-snug mb-2">{post.title}</h2>
                  <p className="text-slate-500 text-[13px] leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[12px]">{post.readTime} lectura · {post.date}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[13px] font-semibold text-[#1FA97A] hover:underline"
                    >
                      Leer artículo
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
