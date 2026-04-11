import type { Metadata } from "next"
import Link from "next/link"
import { ImageIcon } from "lucide-react"
import { Navbar } from "../ui/chrome"
import { ARTICLES } from "./data"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Blog para autónomos | ClientLabs",
  description: "Consejos, guías y recursos prácticos para autónomos y freelancers españoles. Gestión, fiscalidad, clientes y productividad.",
  alternates: { canonical: "https://clientlabs.io/blog" },
}

const sortedArticles = [...ARTICLES].sort((a, b) => {
  const months: Record<string, number> = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
  }
  const parseDate = (d: string) => {
    const parts = d.split(" de ")
    const day = parseInt(parts[0])
    const month = months[parts[1].toLowerCase()] ?? 0
    const year = parseInt(parts[2])
    return new Date(year, month, day)
  }
  return parseDate(b.date).getTime() - parseDate(a.date).getTime()
})

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog para autónomos</h1>
        <p className="mt-4 text-[16px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Consejos prácticos para gestionar y hacer crecer tu negocio.
        </p>
      </section>

      {/* Articles grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {sortedArticles.map((post) => (
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
      </section>
    </main>
  )
}
