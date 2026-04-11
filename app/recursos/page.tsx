import type { Metadata } from "next"
import Link from "next/link"
import { ImageIcon, FileSpreadsheet, Mail, CheckSquare, Calculator, Calendar, Hash, ArrowRight } from "lucide-react"
import { Navbar } from "../ui/chrome"

export const metadata: Metadata = {
  title: "Recursos para autónomos | ClientLabs",
  description: "Guías gratuitas, plantillas y herramientas para autónomos españoles. Todo lo que necesitas para gestionar mejor tu negocio.",
  alternates: { canonical: "https://clientlabs.io/recursos" },
}

const guides = [
  { title: "Cómo gestionar tus leads sin perder ninguno", tag: "Guía gratuita" },
  { title: "Facturación para autónomos en España: guía completa 2026", tag: "Guía gratuita" },
  { title: "Cómo automatizar el seguimiento de clientes", tag: "Guía gratuita" },
  { title: "De lead a cliente: el proceso que funciona", tag: "Guía gratuita" },
]

const templates = [
  { title: "Plantilla de seguimiento de leads en Excel", tag: "Excel gratuito", Icon: FileSpreadsheet },
  { title: "Email de bienvenida para nuevos clientes", tag: "Email gratuito", Icon: Mail },
  { title: "Checklist: qué pedirle a un cliente antes de empezar", tag: "PDF gratuito", Icon: CheckSquare },
]

const tools = [
  { title: "Calculadora de IRPF", href: "https://www.agenciatributaria.gob.es", Icon: Calculator, external: true },
  { title: "Calendario fiscal 2026", href: "https://www.agenciatributaria.gob.es", Icon: Calendar, external: true },
  { title: "Generador de número de factura", href: "/whitelist", Icon: Hash, external: false },
]

const blogLinks = [
  {
    label: "Cómo gestionar tus leads sin perder ninguno",
    href: "/blog/como-no-perder-clientes-seguimiento",
  },
  {
    label: "Facturación para autónomos en España: guía completa 2026",
    href: "/blog/facturacion-autonomos-espana-2026",
  },
  {
    label: "Cómo retener a tus clientes como autónomo",
    href: "/blog/como-retener-clientes-autonomo",
  },
]

export default function RecursosPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-28 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Recursos para autónomos</h1>
        <p className="mt-4 text-[16px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Guías, plantillas y herramientas para gestionar mejor tu negocio.
        </p>
      </section>

      {/* Guides */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-8">Guías</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((g) => (
              <div key={g.title} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="bg-slate-100 rounded-xl h-40 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <span className="inline-block bg-[#E1F5EE] text-[#1FA97A] text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
                  {g.tag}
                </span>
                <h3 className="text-[15px] font-semibold leading-snug mb-4">{g.title}</h3>
                <a href="#" className="text-[13px] font-medium text-[#1FA97A] hover:underline">
                  Leer guía
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-8">Plantillas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((t) => (
              <div key={t.title} className="border border-slate-200 rounded-xl p-5 shadow-sm">
                <t.Icon className="w-6 h-6 text-[#1FA97A] mb-3" />
                <span className="inline-block bg-[#E1F5EE] text-[#1FA97A] text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
                  {t.tag}
                </span>
                <h3 className="text-[14px] font-semibold leading-snug mb-4">{t.title}</h3>
                <a href="#" className="text-[13px] font-medium text-[#1FA97A] hover:underline">
                  Descargar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-8">Herramientas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tools.map((t) => (
              <a
                key={t.title}
                href={t.href}
                target={t.external ? "_blank" : undefined}
                rel={t.external ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-[#1FA97A] transition-colors"
              >
                <t.Icon className="w-5 h-5 text-[#1FA97A] shrink-0" />
                <span className="text-[14px] font-medium">{t.title}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Del blog */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[20px] font-bold mb-6">Del blog</h2>
          <div className="space-y-3">
            {blogLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-[14px] text-[#1FA97A] hover:underline"
              >
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-[24px] font-bold mb-3">¿Quieres gestionar todo esto automáticamente?</h2>
          <p className="text-slate-500 text-[15px] mb-8">
            ClientLabs centraliza leads, clientes, facturas y automatizaciones en un solo panel.
          </p>
          <Link
            href="/whitelist"
            className="inline-block px-8 py-3 bg-[#1FA97A] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors"
          >
            Unirse a la whitelist
          </Link>
        </div>
      </section>
    </main>
  )
}
