import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Navbar } from "../../ui/chrome"
import { ARTICLES } from "../data"
import { ARTICLE_CONTENT } from "../content"

export const revalidate = 86400

type Props = { params: Promise<{ slug: string }> }

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ]
  return `${d} de ${months[m - 1]} de ${y}`
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const { slug } = await paramsPromise
  const article = ARTICLES.find((a) => a.slug === slug)
  if (!article) return {}
  return {
    title: `${article.title} | ClientLabs Blog`,
    description: article.description,
    alternates: { canonical: `https://clientlabs.io/blog/${article.slug}` },
  }
}

export default async function BlogArticlePage({ params: paramsPromise }: Props) {
  const { slug } = await paramsPromise
  const article = ARTICLES.find((a) => a.slug === slug)
  if (!article) notFound()

  const content = ARTICLE_CONTENT[article.slug]
  const relatedArticles = ARTICLES.filter((a) => article.relatedSlugs.includes(a.slug))

  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://clientlabs.io/blog" },
                { "@type": "ListItem", "position": 2, "name": article.title, "item": `https://clientlabs.io/blog/${article.slug}` },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": article.title,
              "description": article.description,
              "author": { "@type": "Organization", "name": "ClientLabs" },
              "publisher": { "@type": "Organization", "name": "ClientLabs", "url": "https://clientlabs.io" },
              "datePublished": article.publishedAt,
              "url": `https://clientlabs.io/blog/${article.slug}`,
            }),
          }}
        />
        <article className="mx-auto max-w-2xl px-6 pt-28 pb-24">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-500 text-[13px] hover:text-[#1FA97A] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4 ${article.categoryColor}`}>
            {article.category}
          </span>
          <h1 className="text-[28px] font-bold leading-tight mb-4">{article.title}</h1>
          <p className="text-slate-400 text-[13px] mb-10">{article.readTime} lectura · {formatDate(article.publishedAt)}</p>
          <div className="prose-content text-[15px] leading-relaxed text-slate-700 space-y-4 [&_h2]:text-[20px] [&_h2]:font-bold [&_h2]:text-[#0B1F2A] [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#0B1F2A] [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_strong]:text-[#0B1F2A] [&_strong]:font-semibold [&_a]:text-[#1FA97A] [&_a]:hover:underline [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] [&_table]:my-5 [&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border-b-2 [&_th]:border-slate-200 [&_th]:font-semibold [&_th]:text-[#0B1F2A] [&_th]:bg-slate-50 [&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-slate-100">
            {content}
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-[14px] font-semibold text-slate-900 mb-4">Artículos relacionados</h3>
              <div className="space-y-3">
                {relatedArticles.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="flex items-center gap-2 text-[14px] text-[#1FA97A] hover:underline">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    {a.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 p-6 bg-[#E1F5EE] rounded-xl border border-[#1FA97A]/20">
            <p className="text-[14px] font-semibold text-[#0B1F2A] mb-1">Gestiona todo esto desde un solo panel</p>
            <p className="text-[13px] text-slate-600 mb-4">ClientLabs centraliza leads, clientes y facturación para autónomos españoles.</p>
            <Link href="/register" className="inline-block px-5 py-2 bg-[#1FA97A] text-white text-[13px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors">
              Empezar gratis 14 días
            </Link>
          </div>
        </article>
      </>
    </main>
  )
}
