import type { Metadata } from "next"
import { Navbar } from "../ui/chrome"

export const metadata: Metadata = {
  title: "Changelog | ClientLabs",
  description: "Historial de cambios y mejoras de ClientLabs. Nuevas funciones, mejoras y correcciones.",
  alternates: { canonical: "https://clientlabs.io/changelog" },
}

type ChangeItem = { type: "nuevo" | "mejorado" | "arreglado"; text: string }
type Version = {
  version: string
  date: string
  upcoming?: boolean
  items: ChangeItem[]
}

const versions: Version[] = [
  {
    version: "v0.8.0",
    date: "Abril 2026",
    items: [
      { type: "nuevo", text: "Registro de interacciones en leads (llamadas, emails, reuniones)" },
      { type: "nuevo", text: "Scoring dinámico automático según estado del lead" },
      { type: "nuevo", text: "Estado 'Estancado' automático tras 7 días sin actividad" },
      { type: "nuevo", text: "Importación de clientes por CSV" },
      { type: "nuevo", text: "Campo 'Info adicional' en ficha de cliente" },
      { type: "nuevo", text: "Plugin WordPress aprobado en directorio oficial" },
      { type: "mejorado", text: "Búsqueda y ordenación de listas sin API calls" },
      { type: "mejorado", text: "KPIs del dashboard filtrables al hacer click" },
      { type: "mejorado", text: "Header de ficha de cliente rediseñado" },
      { type: "mejorado", text: "Menú de acciones rápidas en leads y clientes" },
      { type: "arreglado", text: "Editar cliente ahora guarda correctamente todos los campos" },
      { type: "arreglado", text: "Crear cliente sin timeout en conexiones lentas" },
      { type: "arreglado", text: "Conversión lead a cliente completa con todos los datos" },
    ],
  },
  {
    version: "v0.7.0",
    date: "Marzo 2026",
    items: [
      { type: "nuevo", text: "Módulo de proveedores con gestión de pedidos" },
      { type: "nuevo", text: "Registro de interacciones por tipo" },
      { type: "nuevo", text: "Sistema de tareas con calendario" },
      { type: "nuevo", text: "Páginas legales (términos y privacidad)" },
      { type: "nuevo", text: "Whitelist con 50% de descuento permanente para los primeros usuarios" },
      { type: "mejorado", text: "Dashboard rediseñado con KPIs accionables" },
      { type: "mejorado", text: "Panel de leads con vista pipeline y KPIs filtrables" },
      { type: "mejorado", text: "Importación CSV mejorada con validación de columnas" },
      { type: "mejorado", text: "Scoring de leads más preciso y con historial" },
      { type: "arreglado", text: "Consumo de Vercel optimizado — reducción del 70%" },
      { type: "arreglado", text: "Neon cold start resuelto con connect_timeout" },
      { type: "arreglado", text: "Race conditions en React Query al navegar rápido" },
    ],
  },
  {
    version: "v0.6.0",
    date: "Febrero 2026",
    items: [
      { type: "nuevo", text: "SDK de captación de leads para cualquier web" },
      { type: "nuevo", text: "Plugin de WordPress (en revisión en el directorio oficial)" },
      { type: "nuevo", text: "Panel de leads con vista pipeline" },
      { type: "nuevo", text: "Conversión de lead a cliente en un solo clic" },
      { type: "nuevo", text: "Sistema de notas en leads y clientes" },
      { type: "mejorado", text: "Rendimiento del dashboard con caché Redis" },
      { type: "mejorado", text: "Tiempo de carga reducido en panel de leads" },
    ],
  },
  {
    version: "v0.5.0",
    date: "Enero 2026",
    items: [
      { type: "nuevo", text: "Módulo de facturación completo" },
      { type: "nuevo", text: "Generación de PDF de facturas" },
      { type: "nuevo", text: "Panel de clientes básico" },
      { type: "nuevo", text: "Registro de ventas por cliente" },
    ],
  },
  {
    version: "v1.0.0",
    date: "Junio 2026",
    upcoming: true,
    items: [
      { type: "nuevo", text: "Lanzamiento público" },
      { type: "nuevo", text: "Stripe y planes de pago" },
      { type: "nuevo", text: "Email marketing básico" },
      { type: "nuevo", text: "Automatizaciones configurables" },
      { type: "nuevo", text: "Verifactu (normativa AEAT)" },
    ],
  },
]

const dotColors = {
  nuevo: "bg-[#1FA97A]",
  mejorado: "bg-blue-500",
  arreglado: "bg-orange-400",
}

const labelColors = {
  nuevo: "text-[#1FA97A]",
  mejorado: "text-blue-500",
  arreglado: "text-orange-400",
}

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-white text-[#0B1F2A]">
      <Navbar />

      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Changelog</h1>
        <p className="text-slate-500 text-[15px] mb-14">Historial de cambios y mejoras de ClientLabs.</p>

        <div className="relative border-l-2 border-[#1FA97A] pl-8 space-y-12">
          {versions.map((v) => (
            <div key={v.version} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#1FA97A] border-2 border-white shadow" />

              {/* Version header */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[13px] font-bold px-3 py-1 rounded-full ${v.upcoming ? "border border-dashed border-[#1FA97A] bg-[#E1F5EE]/30 text-[#1FA97A]" : "bg-[#E1F5EE] text-[#1FA97A]"}`}>
                  {v.version}
                </span>
                <span className="text-slate-400 text-[13px]">{v.date}</span>
                {v.upcoming && (
                  <span className="text-[11px] font-medium text-slate-400 border border-dashed border-slate-300 px-2 py-0.5 rounded-full">
                    Próximamente
                  </span>
                )}
              </div>

              {/* Items */}
              <ul className="space-y-2">
                {v.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColors[item.type]}`} />
                    <span className="text-[13px] text-slate-700 leading-relaxed">
                      <span className={`font-semibold text-[11px] uppercase tracking-wide mr-1.5 ${labelColors[item.type]}`}>
                        {item.type}
                      </span>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
