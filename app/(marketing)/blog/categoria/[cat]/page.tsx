import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SITE_URL } from "@/lib/site-config"
import { ARTICLES } from "@/app/blog/data"

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

export function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((cat) => ({ cat }))
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const { cat: catKey } = await paramsPromise
  const cat = CATEGORY_MAP[catKey]
  return {
    title: `${cat?.label ?? catKey} | Blog ClientLabs`,
    description: cat?.description ?? "",
    alternates: { canonical: `${SITE_URL}/blog/categoria/${catKey}` },
  }
}

export default async function CategoryPage({ params: paramsPromise }: Props) {
  const { cat: catKey } = await paramsPromise
  const cat = CATEGORY_MAP[catKey]
  if (!cat) notFound()

  const articles = ARTICLES.filter((a) => a.categoryKey === catKey)

  return (
    <>
      <section className="page-hero soft">
        <div className="wrap">
          <span className="post-cat">{cat.label}</span>
          <h1 className="reveal" style={{ marginTop: 10 }}>{cat.label}</h1>
          <p className="reveal">{cat.description}</p>
          <div className="hero-ctas reveal">
            <Link href="/blog" className="btn btn-ghost btn-lg">Ver todos los artículos</Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 72 }}>
        <div className="wrap">
          {articles.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--ink-3)" }}>
              No hay artículos en esta categoría todavía.
            </p>
          ) : (
            <div className="bgrid">
              {articles.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="bpost reveal">
                  <div className="thumb">
                    {post.coverImage && <img src={post.coverImage} alt={post.title} loading="lazy" />}
                  </div>
                  <span className="post-cat">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <div className="post-meta">
                    <span className="av">CL</span> ClientLabs · {post.readTime}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
