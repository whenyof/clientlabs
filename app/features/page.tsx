import type { Metadata } from "next"
import {
  Users,
  Contact,
  Truck,
  ListChecks,
  BarChart3,
  FileCheck2,
  Files,
  Globe,
  UsersRound,
  Mail,
  Workflow,
  Sparkles,
} from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: "Funcionalidades — ClientLabs | CRM y facturación para autónomos y pymes",
  description: "Todo tu negocio en un solo sitio: leads, clientes, proveedores, tareas, informes, facturación con Verifactu, presupuestos, albaranes, portal cliente y equipo.",
  openGraph: {
    title: "Funcionalidades — ClientLabs",
    description: "CRM, facturación Verifactu, presupuestos, albaranes, portal cliente y más. Para autónomos y pymes españolas.",
    url: "https://clientlabs.io/features",
  },
  alternates: { canonical: "https://clientlabs.io/features" },
}

const MODULES = [
  { icon: Users, title: "Leads", desc: "Captura leads desde tu web, puntúalos automáticamente y conviértelos en clientes sin perder ninguno por el camino." },
  { icon: Contact, title: "Clientes (CRM)", desc: "Ficha completa de cada cliente: actividad, documentos, facturas y pagos. Todo su historial en una sola vista." },
  { icon: Truck, title: "Proveedores", desc: "Gestiona tus proveedores, sus pedidos y sus facturas en el mismo sitio que el resto de tu negocio." },
  { icon: ListChecks, title: "Tareas y proyectos", desc: "Organiza el trabajo del día a día con tareas, recordatorios y proyectos vinculados a tus clientes." },
  { icon: BarChart3, title: "Informes", desc: "KPIs de ventas, facturación y tesorería en tiempo real. Sabe cómo va tu negocio sin abrir una hoja de cálculo." },
  { icon: FileCheck2, title: "Facturación con Verifactu", desc: "Facturas conformes a la nueva normativa: registro en la AEAT, QR verificable, rectificativas e IRPF. Lista para 2026." },
  { icon: Files, title: "Presupuestos y albaranes", desc: "Del presupuesto aceptado al albarán y la factura en un clic, con numeración correlativa y trazabilidad completa." },
  { icon: Globe, title: "Portal cliente", desc: "Comparte presupuestos y facturas con tus clientes mediante un enlace seguro: los ven, los aceptan y los firman online." },
  { icon: UsersRound, title: "Equipo", desc: "Invita a tu equipo con roles y permisos. Cada uno ve lo que necesita, tú mantienes el control." },
]

const COMING_SOON = [
  { icon: Mail, title: "Email marketing", desc: "Campañas y newsletters a tus clientes desde el propio CRM." },
  { icon: Workflow, title: "Automatizaciones", desc: "Flujos automáticos: seguimientos, recordatorios y acciones sin intervención manual." },
  { icon: Sparkles, title: "Asistente de IA", desc: "Tu copiloto para redactar, resumir actividad y anticipar qué cliente necesita atención." },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#0B1F2A] px-4 py-16 sm:py-24 text-center">
          <p className="text-[12px] font-semibold text-[#2DD4A8] uppercase tracking-widest mb-4">
            Funcionalidades
          </p>
          <h1 className="text-[30px] sm:text-[40px] font-bold text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Todo tu negocio, <span className="text-[#1FA97A]">en el mismo sitio</span>
          </h1>
          <p className="text-[15px] text-white/60 max-w-xl mx-auto mt-4 leading-relaxed">
            Deja de saltar entre hojas de cálculo, el programa de facturas y el email.
            ClientLabs une todo lo que un autónomo o pyme necesita para vender, facturar y cumplir con la AEAT.
          </p>
        </section>

        {/* Módulos disponibles */}
        <section className="px-4 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[22px] font-bold text-slate-900 tracking-tight text-center mb-10">
              Disponible desde el primer día
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-[#0F766E]/10 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-[#0F766E]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">{title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Próximamente (solo lo futuro real) */}
        <section className="px-4 pb-16 sm:pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <h2 className="text-[18px] font-bold text-slate-700 tracking-tight">En el roadmap</h2>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                Próximamente
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {COMING_SOON.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white/60 border border-dashed border-slate-300 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-600 mb-1.5">{title}</h3>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20">
          <div className="max-w-3xl mx-auto bg-[#0B1F2A] rounded-2xl px-6 py-12 text-center">
            <h2 className="text-[22px] font-bold text-white tracking-tight mb-3">
              Lanzamos el 23 de junio
            </h2>
            <p className="text-[14px] text-white/60 mb-6">
              Únete a la lista de acceso anticipado: 1 mes gratis y precio early adopter de por vida.
            </p>
            <a
              href="/whitelist"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#0F766E] text-white text-[14px] font-semibold hover:bg-[#0E665F] transition-colors"
            >
              Quiero acceso anticipado
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
