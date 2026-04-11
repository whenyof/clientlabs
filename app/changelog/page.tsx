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
      { type: "new", text: "Planes de pago con Stripe — elige el plan que mejor se adapta a tu negocio" },
      { type: "new", text: "Email marketing básico — envía campañas a tus clientes desde ClientLabs" },
      { type: "new", text: "Automatizaciones configurables — define reglas para que ClientLabs trabaje solo" },
      { type: "new", text: "Factura electrónica con Verifactu — cumple con la normativa de la AEAT" },
    ],
  },
  {
    version: "0.8.0",
    date: "Abril 2026",
    items: [
      { type: "new", text: "Registra interacciones en tus leads: llamadas, emails y reuniones" },
      { type: "new", text: "Scoring automático de leads según su estado y actividad" },
      { type: "new", text: "Los leads sin actividad se marcan automáticamente como \"Estancados\"" },
      { type: "new", text: "Importa clientes desde Excel o CSV" },
      { type: "new", text: "Campo de notas adicionales en la ficha de cliente y lead" },
      { type: "new", text: "Plugin oficial para WordPress — captura leads desde tu web directamente" },
      { type: "improved", text: "Búsqueda y filtros de leads más rápidos" },
      { type: "improved", text: "Los KPIs del panel de leads ahora son clicables para filtrar" },
      { type: "improved", text: "Ficha de cliente rediseñada — más clara y completa" },
      { type: "improved", text: "Menú de acciones rápidas en cada cliente" },
      { type: "fixed", text: "Al editar un cliente, los cambios se guardan correctamente" },
      { type: "fixed", text: "La conversión de lead a cliente ahora funciona en un solo clic" },
    ],
  },
  {
    version: "0.7.0",
    date: "Marzo 2026",
    items: [
      { type: "new", text: "Módulo de proveedores — gestiona tus proveedores y pedidos" },
      { type: "new", text: "Sistema de tareas con calendario — organiza tu trabajo por fechas" },
      { type: "new", text: "Páginas legales disponibles: términos, privacidad y cookies" },
      { type: "improved", text: "Dashboard rediseñado con pipeline visual de leads" },
      { type: "improved", text: "Panel de leads con KPIs filtrables al instante" },
      { type: "improved", text: "Importación CSV más robusta — acepta más formatos de archivo" },
      { type: "improved", text: "El scoring de leads es ahora más preciso y refleja mejor la realidad" },
      { type: "fixed", text: "El panel carga más rápido en conexiones lentas" },
    ],
  },
  {
    version: "0.6.0",
    date: "Febrero 2026",
    items: [
      { type: "new", text: "SDK de captación — añade un formulario de contacto a cualquier web en 2 minutos" },
      { type: "new", text: "Plugin para WordPress (en revisión en el directorio oficial)" },
      { type: "new", text: "Panel de leads con pipeline visual — arrastra leads por etapas" },
      { type: "new", text: "Convierte un lead en cliente con un solo clic" },
      { type: "new", text: "Añade notas y comentarios a cada lead" },
      { type: "improved", text: "El panel responde más rápido en general" },
    ],
  },
  {
    version: "0.5.0",
    date: "Enero 2026",
    items: [
      { type: "new", text: "Módulo de facturación — crea y envía facturas profesionales" },
      { type: "new", text: "Descarga tus facturas en PDF con un clic" },
      { type: "new", text: "Panel de clientes — ficha completa con historial de compras" },
      { type: "new", text: "Registra ventas y mantén el control de tus ingresos" },
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
