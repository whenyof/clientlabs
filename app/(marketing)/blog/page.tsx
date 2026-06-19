import type { Metadata } from "next"
import Link from "next/link"
import { SITE_URL } from "@/lib/site-config"
import { ArrowRight } from "@/components/marketing/icons"
import { ARTICLES } from "@/app/blog/data"

export const metadata: Metadata = {
  title: "Blog — ClientLabs",
  description:
    "Notas desde dentro: facturación, Verifactu, productividad para autónomos y cómo construimos ClientLabs.",
  openGraph: {
    title: "Blog — ClientLabs",
    description:
      "Lo que aprendemos construyendo ClientLabs y gestionando un negocio: facturación, Verifactu, productividad y algo de detrás de cámaras.",
    type: "website",
    url: `${SITE_URL}/blog`,
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: `${SITE_URL}/blog` },
}

const [featured, ...rest] = ARTICLES

export default function BlogPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1 className="reveal">Notas desde dentro.</h1>
          <p className="reveal">
            Lo que aprendemos construyendo ClientLabs y gestionando un negocio: facturación,
            Verifactu, productividad y algo de detrás de cámaras.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 72 }}>
        <div className="wrap">
          {/* Featured */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="blog-feat reveal"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="thumb">
                <span className="tag">
                  <span
                    className="post-cat"
                    style={{ background: "#fff", padding: "6px 10px", borderRadius: 6 }}
                  >
                    {featured.category}
                  </span>
                </span>
              </div>
              <div>
                <span className="post-cat">{featured.category}</span>
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <div className="post-meta">
                  <span className="av">CL</span> ClientLabs · {featured.readTime} de lectura
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="bgrid">
            {rest.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="bpost reveal">
                <div className="thumb" />
                <span className="post-cat">{a.category}</span>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
                <div className="post-meta">
                  <span className="av">CL</span> ClientLabs · {a.readTime}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2 className="reveal">¿Te avisamos cuando publiquemos?</h2>
          <p className="reveal">
            Apúntate y recibe las notas nuevas, sin spam. Solo lo que de verdad te sirve.
          </p>
          <div className="hero-ctas reveal">
            <Link href="/contacto" className="btn btn-primary btn-lg">
              Apuntarme
              <ArrowRight className="arr" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
