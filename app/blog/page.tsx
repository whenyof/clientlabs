import Link from "next/link"
import { ImageIcon } from "lucide-react"
import { Navbar } from "../ui/chrome"

const posts = [
  {
    slug: "como-no-perder-clientes-seguimiento",
    title: "Cómo no perder clientes por no hacer seguimiento",
    category: "Gestión de clientes",
    categoryColor: "bg-[#E1F5EE] text-[#1FA97A]",
    readTime: "5 min",
    date: "1 de abril de 2026",
    excerpt: "El error más común de los autónomos es conseguir un cliente potencial y luego olvidarse de él. Te explicamos cómo evitarlo.",
  },
  {
    slug: "facturacion-autonomos-espana-2026",
    title: "Facturación para autónomos en España en 2026: todo lo que necesitas saber",
    category: "Fiscalidad",
    categoryColor: "bg-blue-50 text-blue-600",
    readTime: "8 min",
    date: "25 de marzo de 2026",
    excerpt: "IVA, IRPF, Verifactu, franquicia de IVA... La normativa fiscal para autónomos cambia cada año. Aquí tienes todo actualizado.",
  },
  {
    slug: "herramientas-gestion-autonomos",
    title: "Las 5 herramientas que todo autónomo necesita en 2026",
    category: "Productividad",
    categoryColor: "bg-purple-50 text-purple-600",
    readTime: "6 min",
    date: "15 de marzo de 2026",
    excerpt: "Desde el CRM hasta la facturación, estas son las herramientas que te van a ahorrar más tiempo cada semana.",
  },
  {
    slug: "como-conseguir-primeros-clientes",
    title: "Cómo conseguir tus primeros 10 clientes como autónomo",
    category: "Captación",
    categoryColor: "bg-orange-50 text-orange-600",
    readTime: "7 min",
    date: "5 de marzo de 2026",
    excerpt: "La guía práctica que nadie te da cuando empiezas. Sin teoría, sin humo. Solo lo que realmente funciona.",
  },
]

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
          {posts.map((post) => (
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
