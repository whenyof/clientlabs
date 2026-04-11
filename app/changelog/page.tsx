import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Wrench, Bug } from "lucide-react"
import { Navbar } from "../ui/chrome"

export const metadata: Metadata = {
  title: "Novedades | ClientLabs",
  description: "Todas las mejoras y nuevas funciones de ClientLabs.",
  alternates: { canonical: "https://clientlabs.io/changelog" },
}

type ChangeItem = { type: "new" | "improved" | "fixed"; text: string }
type Version = {
  version: string
  date: string
  upcoming?: boolean
  items: ChangeItem[]
}

const VERSIONS: Version[] = [
  {
    version: "1.0.0",
    date: "Junio 2026",
    upcoming: true,
    items: [
      { type: "new", text: "Lanzamiento público" },
      { type: "new", text: "Stripe y planes de pago" },
      { type: "new", text: "Email marketing básico" },
      { type: "new", text: "Automatizaciones configurables" },
      { type: "new", text: "Verifactu (normativa AEAT)" },
    ],
  },
  {
    version: "0.8.0",
    date: "Abril 2026",
    items: [
      { type: "new", text: "Registro de interacciones en leads (llamadas, emails, reuniones)" },
      { type: "new", text: "Scoring dinámico automático por estado y actividad" },
      { type: "new", text: "Estado \"Estancado\" automático para leads sin actividad" },
      { type: "new", text: "Importación de clientes por CSV" },
      { type: "new", text: "Campo \"Info adicional\" en ficha de cliente y lead" },
      { type: "new", text: "Plugin de WordPress aprobado en el directorio oficial" },
      { type: "improved", text: "Búsqueda y ordenación de leads sin llamadas a la API" },
      { type: "improved", text: "KPIs de leads filtrables al hacer click" },
      { type: "improved", text: "Header de ficha de cliente rediseñado" },
      { type: "improved", text: "Menú de acciones rápidas en ficha de cliente" },
      { type: "fixed", text: "Editar cliente ya guarda correctamente" },
      { type: "fixed", text: "Crear cliente funciona sin timeout" },
      { type: "fixed", text: "Conversión de lead a cliente completa" },
    ],
  },
  {
    version: "0.7.0",
    date: "Marzo 2026",
    items: [
      { type: "new", text: "Módulo de proveedores completo" },
      { type: "new", text: "Registro de interacciones" },
      { type: "new", text: "Sistema de tareas con calendario" },
      { type: "new", text: "Páginas legales: términos, privacidad y cookies" },
      { type: "improved", text: "Dashboard rediseñado con pipeline visual de leads" },
      { type: "improved", text: "Panel de leads con KPIs filtrables" },
      { type: "improved", text: "Importación CSV con parser mejorado" },
      { type: "improved", text: "Scoring de leads más preciso" },
      { type: "fixed", text: "Consumo de Vercel optimizado" },
      { type: "fixed", text: "Neon cold start manejado con timeout" },
      { type: "fixed", text: "Race conditions en React Query" },
    ],
  },
  {
    version: "0.6.0",
    date: "Febrero 2026",
    items: [
      { type: "new", text: "SDK de captación de leads" },
      { type: "new", text: "Plugin WordPress (en revisión)" },
      { type: "new", text: "Panel de leads con pipeline visual" },
      { type: "new", text: "Conversión lead → cliente en un clic" },
      { type: "new", text: "Sistema de notas en leads" },
      { type: "improved", text: "Rendimiento general del dashboard" },
      { type: "improved", text: "Caché con Upstash Redis" },
    ],
  },
  {
    version: "0.5.0",
    date: "Enero 2026",
    items: [
      { type: "new", text: "Módulo de facturación" },
      { type: "new", text: "Generación de PDF" },
      { type: "new", text: "Panel de clientes básico" },
      { type: "new", text: "Registro de ventas" },
    ],
  },
]

const TYPE_CONFIG = {
  new:      { label: "Nuevo",     Icon: Plus,   bg: "bg-[#E1F5EE]", text: "text-[#1FA97A]",  dot: "bg-[#1FA97A]" },
  improved: { label: "Mejorado",  Icon: Wrench, bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-500" },
  fixed:    { label: "Arreglado", Icon: Bug,    bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
}

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      {/* Header */}
      <section className="mx-auto max-w-3xl px-6 pt-28 pb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Novedades</h1>
        <p className="text-[16px] text-slate-500 leading-relaxed">
          Todas las mejoras y nuevas funciones de ClientLabs.
        </p>
      </section>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="relative border-l-2 border-[#1FA97A] ml-4">
          {VERSIONS.map((version, index) => (
            <div key={index} className="relative mb-12 pl-8">
              {/* Dot on timeline */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#1FA97A] border-2 border-white" />

              {/* Version header */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  version.upcoming
                    ? "border-2 border-dashed border-[#1FA97A] text-[#1FA97A] bg-[#E1F5EE]/50"
                    : "bg-[#E1F5EE] text-[#1FA97A]"
                }`}>
                  v{version.version}
                  {version.upcoming && " — Próximamente"}
                </span>
                <span className="text-sm text-slate-400">{version.date}</span>
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {version.items.map((item, j) => {
                  const cfg = TYPE_CONFIG[item.type]
                  const ItemIcon = cfg.Icon
                  return (
                    <li key={j} className="flex items-start gap-3 text-[14px] text-slate-700">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 mt-0.5 ${cfg.bg} ${cfg.text}`}>
                        <ItemIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      {item.text}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0B1F2A] rounded-xl p-10 text-center max-w-3xl mx-auto mb-16 mx-6">
        <h2 className="text-[22px] font-bold text-white mb-2">Prueba ClientLabs gratis</h2>
        <p className="text-slate-300 text-[14px] mb-6">14 días gratis, sin tarjeta de crédito.</p>
        <Link
          href="/register"
          className="inline-block px-7 py-3 bg-[#1FA97A] text-white text-[14px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors"
        >
          Empezar ahora →
        </Link>
      </div>
    </main>
  )
}
