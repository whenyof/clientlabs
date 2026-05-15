import Link from "next/link"

const FEATURED_POSTS = [
  {
    slug: "verifactu-guia-completa",
    category: "Normativa",
    title: "Verifactu 2026: guía completa para autónomos y pymes",
    description: "Todo lo que necesitas saber sobre Verifactu: fechas de obligatoriedad, requisitos y cómo prepararte.",
  },
  {
    slug: "mejores-software-facturacion-autonomos",
    category: "Comparativa",
    title: "Los 10 mejores software de facturación para autónomos en 2026",
    description: "Análisis comparativo de los principales programas de facturación para autónomos en España.",
  },
  {
    slug: "como-gestionar-leads-autonomo",
    category: "Negocio",
    title: "Cómo gestionar leads si eres autónomo sin perder oportunidades",
    description: "Sistema práctico para gestionar leads: desde el primer contacto hasta el cierre. Con métricas y automatizaciones.",
  },
]

export function BlogPreview() {
  return (
    <section className="bg-navy py-20 px-7">
      <div className="mx-auto max-w-[1240px]">
        <div className="text-center mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-emerald mb-3">
            Recursos para autónomos
          </p>
          <h2 className="text-[32px] md:text-[42px] font-bold text-white leading-tight tracking-[-0.02em]">
            Guías y artículos para tu negocio
          </h2>
          <p className="mt-3 text-[#8fa0aa] max-w-xl mx-auto text-base">
            Facturación electrónica, CRM, fiscalidad y gestión de clientes — todo lo que necesitas saber.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURED_POSTS.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:border-emerald/40 hover:bg-white/[0.06]"
            >
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald mb-3">
                {post.category}
              </span>
              <h3 className="text-white font-semibold text-[16px] leading-[1.4] mb-3 group-hover:text-emerald transition-colors">
                {post.title}
              </h3>
              <p className="text-[13px] text-[#8fa0aa] leading-[1.5] line-clamp-2">
                {post.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-emerald font-medium">
                Leer artículo
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/30 hover:bg-white/[0.08]"
          >
            Ver todos los artículos
          </Link>
        </div>
      </div>
    </section>
  )
}
