import type { Metadata } from "next"
import Link from "next/link"
import { ImageIcon, FileSpreadsheet, Mail, CheckSquare, Calculator, Calendar, ExternalLink, ArrowRight } from "lucide-react"
import { Navbar } from "../ui/chrome"

export const metadata: Metadata = {
  title: "Recursos — ClientLabs | Aprende a Sacar el Máximo Partido",
  description: "Guías, tutoriales, documentación y recursos para sacar el máximo partido a ClientLabs. Todo en español, pensado para autónomos y pequeños negocios.",
  keywords: ["recursos autónomos", "plantillas facturación", "guías crm", "tutoriales gestión clientes"],
  openGraph: {
    title: "Recursos — ClientLabs | Aprende a Sacar el Máximo Partido",
    description: "Guías, tutoriales y recursos para autónomos y pequeños negocios. Todo en español.",
    type: "website",
    url: "https://clientlabs.io/recursos",
    siteName: "ClientLabs",
    locale: "es_ES",
  },
  alternates: { canonical: "https://clientlabs.io/recursos" },
}

const FEATURED_ARTICLES = [
  { slug: "como-no-perder-clientes-seguimiento", category: "Gestión de clientes", title: "Cómo no perder clientes por no hacer seguimiento" },
  { slug: "facturacion-autonomos-espana-2026", category: "Fiscalidad", title: "Facturación para autónomos en España: guía completa 2026" },
  { slug: "errores-fiscales-autonomos-espana", category: "Fiscalidad", title: "Los 7 errores fiscales más comunes de los autónomos" },
  { slug: "como-fijar-precios-servicios-autonomo", category: "Negocio", title: "Cómo fijar el precio de tus servicios sin quedarte corto" },
  { slug: "modelo-303-autonomos-guia", category: "Fiscalidad", title: "Modelo 303: guía paso a paso para autónomos" },
  { slug: "como-conseguir-clientes-autonomo-sin-publicidad", category: "Captación", title: "Cómo conseguir clientes sin gastar en publicidad" },
]

const TEMPLATES = [
  { icon: FileSpreadsheet, type: "Excel", title: "Plantilla de seguimiento de leads", description: "Para cuando todavía no usas un CRM. Organiza tus contactos con esta hoja de cálculo." },
  { icon: Mail, type: "Email", title: "Email de bienvenida para nuevos clientes", description: "La plantilla exacta que usamos en ClientLabs para dar la bienvenida a nuevos clientes." },
  { icon: CheckSquare, type: "PDF", title: "Checklist: qué pedirle a un cliente antes de empezar", description: "Evita malentendidos con esta lista de información que debes recopilar al inicio." },
]

const TOOLS = [
  { icon: Calculator, title: "Calculadora de IRPF para autónomos", description: "Calcula cuánto tienes que retener en tus facturas según tus ingresos.", href: "https://www.agenciatributaria.gob.es", external: true },
  { icon: Calendar, title: "Calendario fiscal 2026", description: "Fechas clave: modelos 303, 130, 347 y declaración de la renta.", href: "https://www.agenciatributaria.gob.es", external: true },
  { icon: ExternalLink, title: "Buscador NIF/CIF de empresas", description: "Verifica el NIF de cualquier empresa o autónomo español antes de facturar.", href: "https://www.registradores.org", external: true },
]

export default function RecursosPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Recursos para autónomos</h1>
        <p className="mt-4 text-[16px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Todo lo que necesitas para gestionar mejor tu negocio. Gratis.
        </p>
      </section>

      {/* Section 1 — Guías y artículos */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-8">Guías y artículos</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURED_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#1FA97A] transition-colors"
              >
                <div className="bg-slate-100 h-36 rounded-xl mx-4 mt-4 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="p-4">
                  <span className="inline-block bg-[#E1F5EE] text-[#1FA97A] text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-2">
                    {article.category}
                  </span>
                  <h3 className="text-[14px] font-semibold leading-snug mb-3">{article.title}</h3>
                  <span className="text-[12px] font-medium text-[#1FA97A]">
                    Leer artículo →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#1FA97A] hover:underline">
              Ver todos los artículos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2 — Plantillas gratuitas */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-8">Plantillas gratuitas</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {TEMPLATES.map((t) => {
              const TIcon = t.icon
              return (
                <div key={t.title} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="bg-[#E1F5EE] rounded-xl w-10 h-10 flex items-center justify-center mb-4">
                    <TIcon className="h-5 w-5 text-[#1FA97A]" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#1FA97A] uppercase tracking-wide mb-2 block">
                    {t.type}
                  </span>
                  <h3 className="text-[14px] font-semibold leading-snug mb-2">{t.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{t.description}</p>
                  <button type="button" className="text-[12px] font-medium text-[#1FA97A] hover:underline">
                    Descargar gratis →
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 3 — Herramientas recomendadas */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-8">Herramientas recomendadas</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {TOOLS.map((tool) => {
              const ToolIcon = tool.icon
              return (
                <a
                  key={tool.title}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#1FA97A] transition-colors"
                >
                  <div className="bg-[#E1F5EE] rounded-xl w-10 h-10 flex items-center justify-center mb-4">
                    <ToolIcon className="h-5 w-5 text-[#1FA97A]" />
                  </div>
                  <h3 className="text-[14px] font-semibold leading-snug mb-2">{tool.title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{tool.description}</p>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 4 — Últimas novedades */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="bg-[#E1F5EE] rounded-xl p-8 text-center">
            <h2 className="text-[20px] font-bold text-[#0B1F2A] mb-2">Últimas novedades de ClientLabs</h2>
            <p className="text-[14px] text-slate-600 mb-6">
              Nuevas funciones, mejoras y correcciones. Mira qué hay de nuevo.
            </p>
            <Link
              href="/changelog"
              className="inline-block px-6 py-2.5 bg-[#1FA97A] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors"
            >
              Ver changelog completo →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="bg-[#0B1F2A] rounded-xl p-12 text-center">
            <h2 className="text-[26px] font-bold text-white mb-3">¿Listo para probarlo?</h2>
            <p className="text-slate-300 text-[15px] mb-8">14 días gratis, sin tarjeta de crédito.</p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-[#1FA97A] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors"
            >
              Empezar gratis →
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
