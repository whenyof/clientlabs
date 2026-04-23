"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePlan } from "@/hooks/use-plan"
import { UpgradeWall } from "@/components/ui/upgrade-wall"
import {
  Megaphone, Filter, Plus,
  LayoutDashboard, Send, Newspaper,
  Sparkles, Users2, BarChart3, Globe,
  TrendingUp, TrendingDown,
  Eye, MousePointer, UserPlus, Zap,
  Search, ArrowRight, Copy,
  RefreshCw, Bookmark,
  Clock, FileText, Target, Mail,
  MessageSquare,
  ChevronRight, X, Check,
  Users, AtSign,
  Trash2, Edit3,
  Share2, Code2,
  ArrowLeft, CheckCircle,
  // Nuevos para plantillas
  Bell, Gift, Trophy, Heart, Lightbulb,
  RotateCcw, Handshake, CalendarCheck,
  Receipt, Cake, Flame, Snowflake,
  Star, UserCheck, Link2, Sprout,
  Rocket, BatteryLow, BookmarkCheck,
  MessageCircle, HelpCircle, Shuffle,
  DoorOpen, AlertCircle, FolderOpen,
  type LucideIcon,
} from "lucide-react"

// ── Utilities ────────────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

// ── Mock data ────────────────────────────────────────────────────────────────

const KPIS = [
  {
    label: "Contactos totales",
    valor: "374",
    sublabel: "vs mes anterior: +12",
    sublabelClass: "text-[#1FA97A]",
    icon: Users,
  },
  {
    label: "Emails enviados",
    valor: "2.722",
    sublabel: "vs mes anterior: +8.4%",
    sublabelClass: "text-[#1FA97A]",
    icon: AtSign,
  },
  {
    label: "Tasa de apertura",
    valor: "68.4%",
    sublabel: "vs mes anterior: -1.2%",
    sublabelClass: "text-red-500",
    icon: Eye,
  },
  {
    label: "Leads generados",
    valor: "47",
    sublabel: "vs mes anterior: +6",
    sublabelClass: "text-[#1FA97A]",
    icon: TrendingUp,
  },
]

const CAMPANAS_RESUMEN = [
  {
    nombre: "Clientes inactivos Mayo",
    audiencia: "23 clientes",
    enviados: 23,
    apertura: 89,
    clicks: 14,
    estado: "activa",
    estadoLabel: "Activa",
  },
  {
    nombre: "Bienvenida nuevos clientes",
    audiencia: "Automática",
    enviados: 31,
    apertura: 76,
    clicks: 8,
    estado: "automatica",
    estadoLabel: "Automática",
  },
  {
    nombre: "Newsletter Mayo 2026",
    audiencia: "156 suscriptores",
    enviados: 156,
    apertura: 71,
    clicks: 34,
    estado: "enviada",
    estadoLabel: "Enviada",
  },
]

const FUENTES = [
  { nombre: "Web / Formulario", cantidad: 21, porcentaje: 45, color: "bg-[#1FA97A]", barColor: "bg-[#1FA97A]" },
  { nombre: "LinkedIn",         cantidad: 13, porcentaje: 28, color: "bg-blue-500",  barColor: "bg-blue-500"  },
  { nombre: "Referidos",        cantidad: 9,  porcentaje: 19, color: "bg-amber-400", barColor: "bg-amber-400" },
  { nombre: "Manual",           cantidad: 4,  porcentaje: 8,  color: "bg-slate-300", barColor: "bg-slate-300" },
]

const ACTIVIDAD = [
  { icon: Eye,         bg: "bg-blue-50",      iconColor: "text-blue-500",    texto: "Juan Pérez abrió 'Clientes inactivos Mayo'",        tiempo: "Hace 2 horas"  },
  { icon: MousePointer,bg: "bg-[#E1F5EE]",    iconColor: "text-[#1FA97A]",   texto: "María García hizo click en tu CTA",                 tiempo: "Hace 5 horas"  },
  { icon: Send,        bg: "bg-purple-50",    iconColor: "text-purple-500",  texto: "Newsletter Mayo enviada a 156 contactos",           tiempo: "Ayer a las 9:00"},
  { icon: UserPlus,    bg: "bg-amber-50",     iconColor: "text-amber-500",   texto: "3 nuevos suscriptores a tu newsletter",             tiempo: "Ayer"          },
  { icon: Zap,         bg: "bg-[#E1F5EE]",    iconColor: "text-[#1FA97A]",   texto: "Campaña automática activada para nuevos clientes",  tiempo: "Lunes"         },
]

const CAMPANAS_TABLA = [
  {
    nombre: "Clientes inactivos Mayo",
    audiencia: "23 clientes",
    estado: "activa",
    estadoLabel: "Activa",
    alcance: 23,
    apertura: 89,
    clics: 34,
    enviados: 23,
  },
  {
    nombre: "Bienvenida nuevos clientes",
    audiencia: "Automática",
    estado: "automatica",
    estadoLabel: "Automática",
    alcance: 31,
    apertura: 76,
    clics: 22,
    enviados: 31,
  },
  {
    nombre: "Newsletter Mayo 2026",
    audiencia: "156 suscriptores",
    estado: "enviada",
    estadoLabel: "Enviada",
    alcance: 156,
    apertura: 71,
    clics: 18,
    enviados: 156,
  },
  {
    nombre: "Oferta servicios diseño",
    audiencia: "Clientes PRO",
    estado: "programada",
    estadoLabel: "Programada",
    alcance: 0,
    apertura: 0,
    clics: 0,
    enviados: 0,
  },
  {
    nombre: "Black Friday 2025",
    audiencia: "Todos los contactos",
    estado: "enviada",
    estadoLabel: "Enviada",
    alcance: 312,
    apertura: 54,
    clics: 28,
    enviados: 312,
  },
]

const NEWSLETTERS_DATA = [
  { nombre: "Newsletter Mayo 2026", suscriptores: 156, abiertos: 111, fecha: "1 May 2026", estado: "enviada" },
  { nombre: "Newsletter Abril 2026", suscriptores: 148, abiertos: 105, fecha: "1 Abr 2026", estado: "enviada" },
  { nombre: "Newsletter Junio 2026", suscriptores: 163, abiertos: 0, fecha: "1 Jun 2026", estado: "programada" },
]

const SEGMENTOS_DATA = [
  { nombre: "Leads calientes",        desc: "Score > 70, sin convertir",     count: 34, color: "text-red-500",      bg: "bg-red-50"        },
  { nombre: "Clientes activos",       desc: "Con factura en últimos 90d",    count: 87, color: "text-[#1FA97A]",   bg: "bg-[#E1F5EE]"     },
  { nombre: "Sin contactar +14d",     desc: "Leads sin acción reciente",     count: 21, color: "text-amber-600",   bg: "bg-amber-50"      },
  { nombre: "Inactivos >6 meses",     desc: "Para reactivación",             count: 56, color: "text-indigo-600",  bg: "bg-indigo-50"     },
  { nombre: "Clientes PRO / Business", desc: "Plan PRO o Business",           count: 12, color: "text-sky-600",     bg: "bg-sky-50"        },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function EstadoBadge({ estado, label }: { estado: string; label: string }) {
  const styles: Record<string, string> = {
    activa:     "bg-[#E1F5EE] text-[#1FA97A]",
    automatica: "bg-blue-50 text-blue-600",
    enviada:    "bg-purple-50 text-purple-600",
    programada: "bg-sky-50 text-sky-600",
    borrador:   "bg-slate-100 text-slate-500",
  }
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", styles[estado] ?? "bg-slate-100 text-slate-500")}>
      {label}
    </span>
  )
}

// ── Tab: Resumen ──────────────────────────────────────────────────────────────

function TabResumen({ setActiveTab, onNuevaCampana }: { setActiveTab: (t: string) => void; onNuevaCampana: () => void }) {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#1FA97A]/40 hover:shadow-[0_2px_12px_rgba(31,169,122,0.06)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-slate-500">
                  {kpi.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
              <div className="text-[26px] font-semibold leading-none tracking-tight text-slate-900">
                {kpi.valor}
              </div>
              <p className={cn("text-[12px] mt-1.5 leading-snug", kpi.sublabelClass)}>
                {kpi.sublabel}
              </p>
            </div>
          )
        })}
      </div>

      {/* Fila 2: Campañas (2col) + Fuentes+Próxima (1col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Campañas activas — 2/3 ancho */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1FA97A] animate-pulse" />
              <span className="text-[13px] font-bold text-slate-800">Campañas activas</span>
              <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1FA97A] text-[10px] font-bold rounded-full">3</span>
            </div>
            <button
              onClick={() => setActiveTab("campanas")}
              className="text-[12px] font-medium text-slate-400 hover:text-[#1FA97A] transition-colors"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {CAMPANAS_RESUMEN.map((c, i) => (
              <div
                key={i}
                className="px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  {/* Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      c.estado === "activa" ? "bg-[#1FA97A]" :
                      c.estado === "automatica" ? "bg-blue-400 animate-pulse" :
                      "bg-slate-300"
                    )} />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#1FA97A] transition-colors">
                        {c.nombre}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.audiencia}</div>
                    </div>
                  </div>

                  {/* Métricas inline */}
                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    {/* Enviados */}
                    <div className="text-center">
                      <div className="text-[14px] font-bold text-slate-800">{c.enviados}</div>
                      <div className="text-[10px] text-slate-400">enviados</div>
                    </div>

                    {/* Apertura con mini barra */}
                    <div className="w-28">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-400">Apertura</span>
                        <span className="text-[12px] font-bold text-slate-700">{c.apertura}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#1FA97A] to-[#0B8A5E]"
                          style={{ width: `${c.apertura}%` }}
                        />
                      </div>
                    </div>

                    {/* Clicks */}
                    <div className="text-center">
                      <div className="text-[14px] font-bold text-slate-800">{c.clicks}</div>
                      <div className="text-[10px] text-slate-400">clicks</div>
                    </div>

                    <EstadoBadge estado={c.estado} label={c.estadoLabel} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => { setActiveTab("campanas"); onNuevaCampana() }}
              className="w-full flex items-center justify-center gap-2 text-[12px] font-semibold text-[#1FA97A] hover:text-[#1a9068] transition-colors py-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva campaña
            </button>
          </div>
        </div>

        {/* Fuentes + Próxima campaña — 1/3 ancho */}
        <div className="space-y-4">

          {/* Fuentes de leads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-800">Fuentes de leads</span>
              <span className="text-[11px] text-slate-400">Este mes</span>
            </div>
            <div className="space-y-3">
              {FUENTES.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", f.color)} />
                      <span className="text-[12px] font-medium text-slate-600">{f.nombre}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] font-bold text-slate-800">{f.cantidad}</span>
                      <span className="text-[10px] text-slate-400">({f.porcentaje}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", f.barColor)}
                      style={{ width: `${f.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próxima campaña programada */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <span className="text-[13px] font-bold text-slate-800 block mb-3">Próxima campaña</span>
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200/50 rounded-xl mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-slate-800">Leads sin respuesta — 7 días</div>
                <div className="text-[11px] text-amber-600 font-medium">Programada · Mañana 9:00</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Llegará a{" "}
              <span className="font-bold text-slate-700">8 leads</span>
              {" "}que no han respondido en los últimos 7 días.
            </p>
          </div>

        </div>
      </div>

      {/* Fila 3: Actividad + Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <span className="text-[13px] font-bold text-slate-800 block mb-4">Actividad reciente</span>
          <div className="space-y-3">
            {ACTIVIDAD.map((a, i) => {
              const Icon = a.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", a.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", a.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-700 leading-relaxed">{a.texto}</p>
                    <span className="text-[10px] text-slate-400">{a.tiempo}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rendimiento últimos 30 días */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-bold text-slate-800">Rendimiento · 30 días</span>
            <span className="text-[11px] text-slate-400">vs mes anterior</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Tasa de apertura",   valor: "68.4%", vs: "+8.2%",  positivo: true,  barra: 68   },
              { label: "Click-through rate", valor: "12.3%", vs: "+2.1%",  positivo: true,  barra: 37   },
              { label: "Tasa de conversión", valor: "4.7%",  vs: "-0.3%",  positivo: false, barra: 14   },
              { label: "Baja de suscripción",valor: "0.8%",  vs: "-0.2%",  positivo: true,  barra: 2.4  },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-slate-600">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-slate-800">{m.valor}</span>
                    <span className={cn("text-[10px] font-semibold", m.positivo ? "text-[#1FA97A]" : "text-red-500")}>
                      {m.vs}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", m.positivo ? "bg-[#1FA97A]" : "bg-red-400")}
                    style={{ width: `${m.barra}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Mejor campaña del mes</span>
              <span className="text-[12px] font-semibold text-slate-700">Clientes inactivos Mayo</span>
            </div>
            <span className="text-[13px] font-bold text-[#1FA97A]">89% apertura</span>
          </div>
        </div>

      </div>

      {/* Banner IA */}
      <div className="bg-gradient-to-r from-[#0B1F2A] to-[#1a3040] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1FA97A]/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#1FA97A]" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white mb-0.5">Genera contenido para hoy</div>
            <p className="text-[12px] text-slate-400">
              Tienes 3 proyectos cerrados este mes — crea un post de LinkedIn con ellos
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("contenido")}
          className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white text-[12px] font-semibold rounded-xl hover:bg-[#1a9068] transition-colors flex-shrink-0"
        >
          Generar ahora
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Tab: Campañas ─────────────────────────────────────────────────────────────

const CAMPANAS_LISTA = [
  {
    nombre: "Clientes inactivos Mayo",
    descripcion: "Sin compra en 90 días",
    audiencia: "23 clientes",
    canal: "Email",
    estado: "activa",
    estadoLabel: "Activa",
    enviados: 23,
    total: 23,
    apertura: 89,
    clicks: 14,
    fecha: "Activa desde 2 días",
  },
  {
    nombre: "Bienvenida nuevos clientes",
    descripcion: "Automática al crear cliente",
    audiencia: "Nuevos clientes",
    canal: "Email",
    estado: "automatica",
    estadoLabel: "Automática",
    enviados: 31,
    total: null as number | null,
    apertura: 76,
    clicks: 8,
    fecha: "Siempre activa",
  },
  {
    nombre: "Newsletter Mayo 2026",
    descripcion: "Suscriptores activos",
    audiencia: "156 suscriptores",
    canal: "Email",
    estado: "enviada",
    estadoLabel: "Enviada",
    enviados: 156,
    total: 156,
    apertura: 71,
    clicks: 34,
    fecha: "Enviada hace 5 días",
  },
  {
    nombre: "Leads sin respuesta — 7d",
    descripcion: "Seguimiento automático",
    audiencia: "8 leads",
    canal: "Email",
    estado: "programada",
    estadoLabel: "Mañana 9:00",
    enviados: 0,
    total: 8,
    apertura: null as number | null,
    clicks: null as number | null,
    fecha: "Programada",
  },
  {
    nombre: "Oferta servicios diseño",
    descripcion: "Todos los clientes",
    audiencia: "47 contactos",
    canal: "Email",
    estado: "borrador",
    estadoLabel: "Borrador",
    enviados: 0,
    total: 47,
    apertura: null as number | null,
    clicks: null as number | null,
    fecha: "Sin enviar",
  },
]

const COLS = "2fr 1fr 110px 80px 130px 80px 100px"

function TabCampanas({ onNuevaCampana }: { onNuevaCampana: () => void }) {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  const filtradas = CAMPANAS_LISTA.filter((c) => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Buscar campaña..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none w-64 focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none text-slate-600 cursor-pointer focus:border-[#1FA97A]"
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="automatica">Automáticas</option>
            <option value="programada">Programadas</option>
            <option value="enviada">Enviadas</option>
            <option value="borrador">Borradores</option>
          </select>
          <select className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none text-slate-600 cursor-pointer focus:border-[#1FA97A]">
            <option>Todos los canales</option>
            <option>Email</option>
            <option>WhatsApp</option>
            <option>SMS</option>
          </select>
        </div>
        <button
          onClick={onNuevaCampana}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors shadow-sm shadow-[#1FA97A]/20"
        >
          <Plus className="h-4 w-4" />
          Nueva campaña
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div
          className="grid items-center px-5 py-3 bg-slate-50 border-b border-slate-200"
          style={{ gridTemplateColumns: COLS }}
        >
          {["Campaña", "Audiencia", "Estado", "Enviados", "Apertura", "Clicks", "Acciones"].map((col, i) => (
            <div
              key={i}
              className={cn(
                "text-[10px] font-bold text-slate-400 uppercase tracking-widest",
                i >= 3 && i <= 5 ? "text-center" : i === 6 ? "text-right" : ""
              )}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Filas */}
        {filtradas.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-[13px]">No hay campañas que coincidan</div>
        ) : (
          filtradas.map((c, i) => (
            <div
              key={i}
              className="grid items-center px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer group"
              style={{ gridTemplateColumns: COLS }}
            >
              {/* Campaña */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  c.estado === "activa"     ? "bg-[#1FA97A]" :
                  c.estado === "automatica" ? "bg-blue-400 animate-pulse" :
                  c.estado === "programada" ? "bg-amber-400" :
                  c.estado === "enviada"    ? "bg-slate-300" :
                  "bg-slate-200"
                )} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#1FA97A] transition-colors">
                    {c.nombre}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{c.descripcion}</div>
                </div>
              </div>

              {/* Audiencia */}
              <div>
                <div className="text-[12px] text-slate-600 font-medium">{c.audiencia}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3 text-slate-300" />
                  <span className="text-[10px] text-slate-400">{c.canal}</span>
                </div>
              </div>

              {/* Estado */}
              <div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1",
                  c.estado === "activa"     ? "bg-[#E1F5EE] text-[#1FA97A]" :
                  c.estado === "automatica" ? "bg-blue-50 text-blue-600" :
                  c.estado === "programada" ? "bg-amber-50 text-amber-600" :
                  c.estado === "enviada"    ? "bg-slate-100 text-slate-500" :
                  "bg-slate-100 text-slate-400"
                )}>
                  {c.estado === "activa" && (
                    <span className="w-1 h-1 rounded-full bg-[#1FA97A] inline-block" />
                  )}
                  {c.estadoLabel}
                </span>
                <div className="text-[10px] text-slate-400 mt-1">{c.fecha}</div>
              </div>

              {/* Enviados */}
              <div className="text-center">
                {c.enviados > 0 ? (
                  <>
                    <div className="text-[14px] font-bold text-slate-800">{c.enviados}</div>
                    {c.total !== null && (
                      <div className="text-[10px] text-slate-400">de {c.total}</div>
                    )}
                  </>
                ) : (
                  <span className="text-[12px] text-slate-300">—</span>
                )}
              </div>

              {/* Apertura con mini barra */}
              <div className="px-2">
                {c.apertura !== null ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold text-slate-700">{c.apertura}%</span>
                      <span className={cn(
                        "text-[9px] font-bold",
                        c.apertura >= 70 ? "text-[#1FA97A]" :
                        c.apertura >= 50 ? "text-amber-500" :
                        "text-red-400"
                      )}>
                        {c.apertura >= 70 ? "Excelente" : c.apertura >= 50 ? "Buena" : "Baja"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          c.apertura >= 70 ? "bg-[#1FA97A]" :
                          c.apertura >= 50 ? "bg-amber-400" :
                          "bg-red-400"
                        )}
                        style={{ width: `${c.apertura}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <span className="text-[12px] text-slate-300 block text-center">—</span>
                )}
              </div>

              {/* Clicks */}
              <div className="text-center">
                {c.clicks !== null ? (
                  <>
                    <div className="text-[14px] font-bold text-slate-800">{c.clicks}</div>
                    <div className="text-[10px] text-slate-400">
                      {c.enviados > 0 ? `${Math.round(c.clicks / c.enviados * 100)}% CTR` : ""}
                    </div>
                  </>
                ) : (
                  <span className="text-[12px] text-slate-300">—</span>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Ver estadísticas">
                  <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Editar">
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Duplicar">
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors group/del" title="Eliminar">
                  <Trash2 className="h-3.5 w-3.5 text-slate-400 group-hover/del:text-red-500 transition-colors" />
                </button>
              </div>

            </div>
          ))
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <span className="text-[12px] text-slate-400">
            {filtradas.length} campaña{filtradas.length !== 1 ? "s" : ""} · {filtradas.filter(c => c.estado === "activa" || c.estado === "automatica").length} activas
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Newsletter ───────────────────────────────────────────────────────────

type EdicionForm = {
  titulo: string
  asunto: string
  contenido: string
  estado: string
  programadaPara: string
  hora: string
}

const EDICION_FORM_DEFAULT: EdicionForm = {
  titulo: "",
  asunto: "",
  contenido: "",
  estado: "borrador",
  programadaPara: "",
  hora: "09:00",
}

function TabNewsletter() {
  const { data: session } = useSession()
  const [nlSuscriptores, setNlSuscriptores] = useState<Array<{ id: string; email: string; nombre: string | null; fuente: string; creadoEn: string }>>([])
  const [nlTotal, setNlTotal] = useState(0)
  const [nlEdiciones, setNlEdiciones] = useState<Array<{
    id: string; titulo: string; asunto: string; contenido: string; estado: string
    programadaPara: string | null; enviadaEn: string | null
    totalEnviados: number; totalAbiertos: number; totalClicks: number
    createdAt: string; updatedAt: string
  }>>([])
  const [nlLoading, setNlLoading] = useState(false)
  const [nlSlug, setNlSlug] = useState("")
  const [modalEdicion, setModalEdicion] = useState(false)
  const [edicionForm, setEdicionForm] = useState<EdicionForm>(EDICION_FORM_DEFAULT)
  const [editandoEdicion, setEditandoEdicion] = useState<string | null>(null)

  useEffect(() => {
    cargarNewsletter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (session?.user) {
      const base = (session.user.name || session.user.email || "mi-newsletter")
      const slug = base.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      setNlSlug(slug)
    }
  }, [session])

  const cargarNewsletter = async () => {
    setNlLoading(true)
    try {
      const [subsRes, edRes] = await Promise.all([
        fetch("/api/newsletter/subscribers"),
        fetch("/api/newsletter/ediciones"),
      ])
      const subsData = await subsRes.json()
      const edData = await edRes.json()
      setNlSuscriptores(subsData.suscriptores || [])
      setNlTotal(subsData.total || 0)
      setNlEdiciones(edData.ediciones || [])
    } catch (err) {
      console.error("Newsletter error:", err)
    } finally {
      setNlLoading(false)
    }
  }

  const crearEdicion = async () => {
    try {
      const programadaPara =
        edicionForm.programadaPara && edicionForm.hora
          ? new Date(`${edicionForm.programadaPara}T${edicionForm.hora}:00`).toISOString()
          : null

      const url = editandoEdicion
        ? `/api/newsletter/ediciones/${editandoEdicion}`
        : "/api/newsletter/ediciones"
      const method = editandoEdicion ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: edicionForm.titulo,
          asunto: edicionForm.asunto,
          contenido: edicionForm.contenido,
          estado: edicionForm.estado,
          programadaPara,
        }),
      })

      setModalEdicion(false)
      setEditandoEdicion(null)
      setEdicionForm(EDICION_FORM_DEFAULT)
      cargarNewsletter()
    } catch (err) {
      console.error("Error creando edición:", err)
    }
  }

  const edicionesPorMes = nlEdiciones.reduce<Record<string, typeof nlEdiciones>>((acc, ed) => {
    const fecha = ed.programadaPara ? new Date(ed.programadaPara) : new Date(ed.createdAt)
    const mes = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    if (!acc[mes]) acc[mes] = []
    acc[mes].push(ed)
    return acc
  }, {})

  const enviadas = nlEdiciones.filter(e => e.estado === "enviada")
  const apertura = enviadas.length > 0
    ? Math.round(
        enviadas.filter(e => e.totalEnviados > 0).reduce((a, e) => a + (e.totalAbiertos / e.totalEnviados) * 100, 0) /
        Math.max(1, enviadas.filter(e => e.totalEnviados > 0).length)
      )
    : null

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/newsletter/${nlSlug || "tu-nombre"}`
    : `clientlabs.io/newsletter/${nlSlug || "tu-nombre"}`

  const nuevaSemana = nlSuscriptores.filter(s => {
    const d = new Date(s.creadoEn)
    const hace7 = new Date()
    hace7.setDate(hace7.getDate() - 7)
    return d >= hace7
  }).length

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "SUSCRIPTORES ACTIVOS",
            valor: nlLoading ? "..." : nlTotal.toString(),
            sub: nlTotal > 0 ? `+${nuevaSemana} esta semana` : "Aún sin suscriptores",
            borderColor: "border-l-[#1FA97A]",
            subColor: "text-[#1FA97A]",
          },
          {
            label: "APERTURA MEDIA",
            valor: apertura !== null ? `${apertura}%` : "—",
            sub: "Sector: 21% media",
            borderColor: "border-l-blue-400",
            subColor: "text-blue-500",
          },
          {
            label: "EDICIONES ENVIADAS",
            valor: enviadas.length.toString(),
            sub: `${nlEdiciones.filter(e => e.estado === "programada").length} programada${nlEdiciones.filter(e => e.estado === "programada").length !== 1 ? "s" : ""}`,
            borderColor: "border-l-purple-400",
            subColor: "text-purple-500",
          },
          {
            label: "CLICKS TOTALES",
            valor: nlEdiciones.reduce((s, e) => s + e.totalClicks, 0).toString(),
            sub: "En todas las ediciones",
            borderColor: "border-l-amber-400",
            subColor: "text-amber-500",
          },
        ].map((kpi, i) => (
          <div key={i} className={cn("bg-white rounded-xl border border-slate-200 border-l-4 p-5", kpi.borderColor)}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
            <p className="text-[32px] font-black text-[#0B1F2A] leading-none mb-1">{kpi.valor}</p>
            <p className={cn("text-[11px] font-semibold", kpi.subColor)}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Ediciones — 2 cols */}
        <div className="lg:col-span-2 space-y-5">

          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-slate-800">Ediciones</h3>
            <button
              onClick={() => {
                setEditandoEdicion(null)
                setEdicionForm(EDICION_FORM_DEFAULT)
                setModalEdicion(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-xl text-[12px] font-semibold hover:bg-[#1a9068] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva edición
            </button>
          </div>

          {!nlLoading && nlEdiciones.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-6 w-6 text-slate-300" />
              </div>
              <h4 className="text-[15px] font-bold text-slate-800 mb-2">Aún no hay ediciones</h4>
              <p className="text-[13px] text-slate-400 mb-4">
                Crea tu primera newsletter y programa cuándo se envía.
              </p>
              <button
                onClick={() => setModalEdicion(true)}
                className="px-4 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
              >
                Crear primera edición
              </button>
            </div>
          )}

          {Object.entries(edicionesPorMes).map(([mes, ediciones]) => (
            <div key={mes} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                <span className="text-[12px] font-bold text-slate-600 uppercase tracking-wider capitalize">{mes}</span>
                <span className="text-[11px] text-slate-400">
                  {ediciones.length} edición{ediciones.length !== 1 ? "es" : ""}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {[...ediciones]
                  .sort((a, b) => {
                    const da = a.programadaPara ? new Date(a.programadaPara) : new Date(a.createdAt)
                    const db = b.programadaPara ? new Date(b.programadaPara) : new Date(b.createdAt)
                    return Number(da) - Number(db)
                  })
                  .map(ed => (
                    <div key={ed.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {ed.programadaPara && (
                              <div className="w-8 h-8 rounded-lg bg-[#0B1F2A] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-white">
                                  {new Date(ed.programadaPara).getDate()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-bold text-slate-800">{ed.titulo}</span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[9px] font-bold",
                                  ed.estado === "enviada"
                                    ? "bg-[#E1F5EE] text-[#1FA97A]"
                                    : ed.estado === "programada"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-slate-100 text-slate-500"
                                )}>
                                  {ed.estado === "enviada" ? "Enviada" : ed.estado === "programada" ? "Programada" : "Borrador"}
                                </span>
                              </div>
                              {ed.asunto && (
                                <p className="text-[11px] text-slate-400 italic mt-0.5">&ldquo;{ed.asunto}&rdquo;</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 ml-10">
                            {ed.programadaPara && (
                              <span>
                                {new Date(ed.programadaPara).toLocaleDateString("es-ES", {
                                  day: "numeric", month: "short", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </span>
                            )}
                            {ed.totalEnviados > 0 && <span>· {ed.totalEnviados} enviados</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          {ed.estado === "enviada" && ed.totalEnviados > 0 && (
                            <>
                              <div className="text-center">
                                <div className="text-[16px] font-black text-[#1FA97A]">
                                  {Math.round(ed.totalAbiertos / ed.totalEnviados * 100)}%
                                </div>
                                <div className="text-[9px] text-slate-400">apertura</div>
                              </div>
                              <div className="text-center">
                                <div className="text-[16px] font-black text-slate-700">{ed.totalClicks}</div>
                                <div className="text-[9px] text-slate-400">clicks</div>
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditandoEdicion(ed.id)
                                const fecha = ed.programadaPara ? new Date(ed.programadaPara) : null
                                setEdicionForm({
                                  titulo: ed.titulo,
                                  asunto: ed.asunto,
                                  contenido: ed.contenido,
                                  estado: ed.estado,
                                  programadaPara: fecha ? fecha.toISOString().split("T")[0] : "",
                                  hora: fecha ? fecha.toTimeString().slice(0, 5) : "09:00",
                                })
                                setModalEdicion(true)
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/newsletter/ediciones/${ed.id}`, { method: "DELETE" })
                                cargarNewsletter()
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Panel lateral — 1 col */}
        <div className="space-y-4">

          {/* Crecimiento */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-800">Crecimiento</span>
              <span className="text-[11px] text-slate-400">Últimos 6 meses</span>
            </div>
            <div className="flex items-end gap-2 h-20 mb-2">
              {[
                { mes: "Nov", val: Math.max(1, nlTotal - 65) },
                { mes: "Dic", val: Math.max(1, nlTotal - 51) },
                { mes: "Ene", val: Math.max(1, nlTotal - 39) },
                { mes: "Feb", val: Math.max(1, nlTotal - 25) },
                { mes: "Mar", val: Math.max(1, nlTotal - 12) },
                { mes: "Abr", val: nlTotal || 1 },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn("w-full rounded-t-md transition-all duration-500", i === 5 ? "bg-[#1FA97A]" : "bg-slate-200")}
                    style={{ height: `${(d.val / (nlTotal || 1)) * 100}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{d.mes}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              <span className="font-bold text-[#1FA97A]">{nlTotal} suscriptores</span> en total
            </p>
          </div>

          {/* URL pública */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <span className="text-[13px] font-bold text-slate-800 block mb-1">Tu newsletter pública</span>
            <p className="text-[12px] text-slate-400 mb-3">Comparte este enlace para conseguir suscriptores</p>
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
              <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-[11px] text-slate-600 flex-1 truncate font-mono">{publicUrl}</span>
              <button
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/newsletter/${nlSlug || "tu-nombre"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] font-medium text-slate-600 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                Ver página
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                className="flex items-center justify-center gap-1.5 py-2 bg-[#E1F5EE] hover:bg-[#c8eadd] rounded-xl text-[11px] font-medium text-[#1FA97A] transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Copiar enlace
              </button>
            </div>
          </div>

          {/* Hacer crecer la lista */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <span className="text-[13px] font-bold text-slate-800 block mb-1">Hacer crecer la lista</span>
            <p className="text-[12px] text-slate-400 mb-3">{nlTotal} suscriptores activos</p>
            <div className="space-y-2">
              {[
                {
                  icon: Code2,
                  titulo: "Página de suscripción",
                  desc: "Enlace público listo",
                  color: "bg-blue-50 text-blue-600",
                  accion: () => navigator.clipboard.writeText(publicUrl),
                },
                {
                  icon: UserPlus,
                  titulo: "Añadir manualmente",
                  desc: "Uno a uno",
                  color: "bg-[#E1F5EE] text-[#1FA97A]",
                  accion: () => {
                    const email = prompt("Email del suscriptor:")
                    if (!email) return
                    fetch("/api/newsletter/subscribers", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, fuente: "manual" }),
                    }).then(() => cargarNewsletter())
                  },
                },
              ].map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <button
                    key={i}
                    onClick={item.accion}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all text-left group"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", item.color)}>
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold text-slate-700">{item.titulo}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Modal crear/editar edición */}
      {modalEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalEdicion(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-[16px] font-bold text-slate-900">
                {editandoEdicion ? "Editar edición" : "Nueva edición"}
              </h2>
              <button onClick={() => setModalEdicion(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Título interno
                </label>
                <input
                  value={edicionForm.titulo}
                  onChange={e => setEdicionForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Newsletter Mayo 2026"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Asunto del email
                </label>
                <input
                  value={edicionForm.asunto}
                  onChange={e => setEdicionForm(f => ({ ...f, asunto: e.target.value }))}
                  placeholder="Lo que aprendí este mes..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Contenido
                </label>
                <textarea
                  value={edicionForm.contenido}
                  onChange={e => setEdicionForm(f => ({ ...f, contenido: e.target.value }))}
                  rows={8}
                  placeholder="Escribe aquí el contenido de tu newsletter..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none resize-none font-mono leading-relaxed focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Estado
                  </label>
                  <select
                    value={edicionForm.estado}
                    onChange={e => setEdicionForm(f => ({ ...f, estado: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A]"
                  >
                    <option value="borrador">Borrador</option>
                    <option value="programada">Programada</option>
                    <option value="enviada">Enviada</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Fecha programada
                  </label>
                  <input
                    type="date"
                    value={edicionForm.programadaPara}
                    onChange={e => setEdicionForm(f => ({ ...f, programadaPara: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
                  />
                </div>
              </div>

              {edicionForm.programadaPara && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Hora de envío
                  </label>
                  <select
                    value={edicionForm.hora}
                    onChange={e => setEdicionForm(f => ({ ...f, hora: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A]"
                  >
                    {["07:00","08:00","09:00","10:00","11:00","12:00","17:00","18:00","19:00","20:00"].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setModalEdicion(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearEdicion}
                disabled={!edicionForm.titulo}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors",
                  edicionForm.titulo
                    ? "bg-[#1FA97A] text-white hover:bg-[#1a9068]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {editandoEdicion ? "Guardar cambios" : "Crear edición"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Tab: Contenido IA ─────────────────────────────────────────────────────────

const TEXTO_LINKEDIN = `Este mes cerré 3 proyectos web para restaurantes y me llevo una reflexión importante.

Cuando un cliente dice "quiero una web bonita", lo que realmente necesita son más reservas el jueves y el viernes.

El diseño es el medio.
El negocio es el fin.

Llevo 3 años trabajando con hostelería y aprendí que la mejor web no es la más bonita — es la que convierte más visitas en llamadas.

¿Tú también has tenido que "traducir" lo que pide un cliente a lo que realmente necesita?

#DiseñoWeb #Freelance #Hostelería #NegocioDigital`

type GeneradorId = "linkedin" | "email" | "newsletter" | "twitter"

// (GENERADORES replaced by inline data in TabContenidoIA)
const _UNUSED_GENERADORES: Array<{
  id: GeneradorId
  titulo: string
  descripcion: string
  icono: React.ElementType
  color: string
  bg: string
  resultado: string
}> = [
  {
    id: "linkedin",
    titulo: "Post de LinkedIn",
    descripcion: "Basado en tus proyectos del mes. Listo para publicar.",
    icono: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50",
    resultado: `Este mes cerré 3 proyectos web para restaurantes y me quedo con una reflexión importante...

Cuando un cliente te dice "quiero una web bonita", lo que realmente necesita es más reservas los jueves y viernes.

El diseño es el medio. El negocio es el fin.

Pasé de hablar de colores y tipografías a hablar de conversiones y tickets medios. Desde ese día, nunca he perdido un cliente por precio.

¿Has tenido alguna vez que traducir lo que pide un cliente a lo que realmente necesita?

#DiseñoWeb #Freelance #Hostelería`,
  },
  {
    id: "email",
    titulo: "Email de seguimiento",
    descripcion: "Para leads que llevan más de 7 días sin responder.",
    icono: Mail,
    color: "text-[#1FA97A]",
    bg: "bg-[#E1F5EE]",
    resultado: `Asunto: ¿Seguimos adelante con el proyecto?

Hola [nombre],

Te escribo porque hace unos días hablamos sobre [proyecto] y quería saber si has tenido tiempo de revisarlo.

Entiendo que estás ocupado. Si el momento no es el adecuado, me lo dices y lo dejamos para más adelante sin problema.

Pero si quieres que avancemos, solo necesito 20 minutos esta semana para cerrar los detalles.

¿Tienes un hueco el miércoles o el jueves?

Un saludo,
[Tu nombre]`,
  },
  {
    id: "newsletter",
    titulo: "Intro de newsletter",
    descripcion: "El gancho perfecto para que abran y lean hasta el final.",
    icono: Newspaper,
    color: "text-purple-600",
    bg: "bg-purple-50",
    resultado: `Hola [nombre],

Este mes me ha pasado algo que me hizo replantear cómo presento mis servicios.

Un cliente potencial me dijo que ya tenía web. Le pregunté cuántas consultas recibía al mes. Me dijo "pocas".

Le hice una propuesta diferente: no "te hago una web nueva", sino "te traigo 10 consultas al mes o te devuelvo el dinero".

Firmamos esa misma semana.

En este número te cuento exactamente cómo estructuré esa propuesta y por qué funciona mejor que hablar de diseño.`,
  },
  {
    id: "twitter",
    titulo: "Hilo de Twitter/X",
    descripcion: "Tu aprendizaje del mes en formato viral.",
    icono: MessageSquare,
    color: "text-slate-700",
    bg: "bg-slate-100",
    resultado: `1/ Llevo 3 años como freelance de diseño web y el error que más me costó dinero fue este:

Cobrar por hora.

Hilo sobre cómo cambié el modelo y triipliqué mis ingresos sin trabajar más horas.

2/ Cuando cobras por hora, tu cliente no quiere que seas rápido. Quiere que seas lento.

Cada reunión, cada corrección, cada ajuste → más dinero para ti, menos confianza de él.

3/ El cambio: precio por proyecto cerrado + un retainer mensual de mantenimiento.

Cliente sabe lo que paga. Tú sabes lo que cobras. Todos duermen mejor.

4/ ¿Cómo empezar?

→ Calcula cuánto tardas de media en cada tipo de proyecto
→ Multiplica por tu tarifa hora + 30% de margen de error
→ Ese es tu precio fijo

5/ El primer cliente que acepte el nuevo modelo te cambiará la mentalidad para siempre.

¿Ya trabajas con precio fijo? ¿Qué te costó más, convencerte a ti o a tus clientes?`,
  },
]

function TabContenidoIA() {
  const [tono, setTono] = useState("profesional")
  const [generando, setGenerando] = useState<string | null>(null)
  const [resultadoActivo, setResultadoActivo] = useState<string | null>(null)

  async function handleGenerar(id: string) {
    setGenerando(id)
    setResultadoActivo(null)
    await new Promise((r) => setTimeout(r, 1800))
    setGenerando(null)
    setResultadoActivo(id)
  }

  return (
    <div className="space-y-5">

      {/* HERO — contexto del negocio */}
      <div className="bg-[#0B1F2A] rounded-2xl p-6 relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#1FA97A]/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#1FA97A]/3 rounded-full" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(31,169,122,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#1FA97A]/20 border border-[#1FA97A]/30 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[#1FA97A]" />
            </div>
            <span className="text-[11px] font-bold text-[#1FA97A] uppercase tracking-widest">
              Asistente de contenido
            </span>
          </div>

          <h2 className="text-[20px] font-black text-white mb-1 leading-tight">
            Contenido que suena a ti.{" "}
            <span className="text-[#1FA97A]">Escrito en segundos.</span>
          </h2>
          <p className="text-[13px] text-slate-400 mb-5">
            Genero contenido usando los datos reales de tu negocio — no plantillas genéricas que podrían ser de cualquiera.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Proyectos este mes", valor: "3 cerrados" },
              { label: "Sector principal",   valor: "Diseño web" },
              { label: "Cliente reciente",   valor: "Casa Pepe" },
              { label: "Leads activos",      valor: "23 en pipeline" },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/8 transition-colors">
                <div className="text-[10px] text-slate-500 mb-0.5">{item.label}</div>
                <div className="text-[12px] font-bold text-white">{item.valor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SELECTOR DE TONO */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-semibold text-slate-500">Tono:</span>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          {[
            { id: "profesional",  label: "Profesional" },
            { id: "cercano",      label: "Cercano" },
            { id: "directo",      label: "Directo" },
            { id: "storytelling", label: "Storytelling" },
            { id: "humor",        label: "Con humor" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTono(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150",
                tono === t.id
                  ? "bg-[#1FA97A] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* GENERADORES — 3 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* POST LINKEDIN */}
        <div className={cn(
          "bg-white rounded-2xl border overflow-hidden transition-all duration-200",
          generando === "linkedin" || resultadoActivo === "linkedin"
            ? "ring-2 ring-[#1FA97A]/30 border-[#1FA97A]/50"
            : "border-slate-200"
        )}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[18px]">
                💼
              </div>
              <div>
                <div className="text-[14px] font-bold text-slate-800">Post LinkedIn</div>
                <div className="text-[11px] text-slate-400">Basado en tus proyectos reales</div>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              {["Storytelling de proyecto", "Reflexión profesional", "Consejo para clientes"].map((tipo, i) => (
                <button
                  key={i}
                  onClick={() => handleGenerar("linkedin")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-[12px] text-slate-600 font-medium transition-colors border border-transparent hover:border-blue-200"
                >
                  {tipo}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerar("linkedin")}
              disabled={generando === "linkedin"}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0B1F2A] hover:bg-[#1a3040] text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              {generando === "linkedin" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generando === "linkedin" ? "Generando..." : "Generar post"}
            </button>
          </div>

          {resultadoActivo === "linkedin" && (
            <div className="border-t border-slate-100">
              <div className="p-4 bg-slate-50/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Resultado generado
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigator.clipboard.writeText(TEXTO_LINKEDIN)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                      title="Copiar"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setResultadoActivo(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap bg-white border border-slate-200 rounded-xl p-3 mb-3 max-h-48 overflow-y-auto">
                  {TEXTO_LINKEDIN}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-[#1FA97A] text-white rounded-lg text-[11px] font-semibold hover:bg-[#1a9068] transition-colors">
                    Usar en campaña
                  </button>
                  <button
                    onClick={() => handleGenerar("linkedin")}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Regenerar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EMAIL DE CAPTACIÓN */}
        <div className={cn(
          "bg-white rounded-2xl border overflow-hidden transition-all duration-200",
          generando === "email" || resultadoActivo === "email"
            ? "ring-2 ring-[#1FA97A]/30 border-[#1FA97A]/50"
            : "border-slate-200"
        )}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex items-center justify-center text-[18px]">
                📧
              </div>
              <div>
                <div className="text-[14px] font-bold text-slate-800">Email de captación</div>
                <div className="text-[11px] text-slate-400">Para leads fríos o tibios</div>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              {["Primer contacto frío", "Seguimiento sin respuesta", "Reactivar lead dormido"].map((tipo, i) => (
                <button
                  key={i}
                  onClick={() => handleGenerar("email")}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#E1F5EE] hover:text-[#1FA97A] text-[12px] text-slate-600 font-medium transition-colors border border-transparent hover:border-[#1FA97A]/30"
                >
                  {tipo}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerar("email")}
              disabled={generando === "email"}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0B1F2A] hover:bg-[#1a3040] text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              {generando === "email" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generando === "email" ? "Generando..." : "Generar email"}
            </button>
          </div>

          {resultadoActivo === "email" && (
            <div className="border-t border-slate-100 p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email generado</span>
                <button onClick={() => setResultadoActivo(null)} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
              <div className="text-[11px] text-slate-500 mb-1.5">
                <span className="font-semibold">Asunto:</span> ¿Sigues pensando en mejorar tu web, María?
              </div>
              <div className="text-[12px] text-slate-700 leading-relaxed bg-white border border-slate-200 rounded-xl p-3 mb-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {`Hola María,

Te escribí hace una semana sobre mejorar la web de tu restaurante y no supe de ti.

Entiendo que estás valorando opciones. Solo quería decirte que este mes cerré 3 proyectos para hostelería y los resultados han sido muy buenos.

¿Te interesa que hablemos 15 minutos?

Un saludo,
Iyan`}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-[#1FA97A] text-white rounded-lg text-[11px] font-semibold hover:bg-[#1a9068] transition-colors">
                  Usar en campaña
                </button>
                <button onClick={() => handleGenerar("email")} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition-colors">
                  Regenerar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MÁS FORMATOS */}
        <div className="space-y-3">
          {[
            { id: "newsletter", icon: Newspaper,  iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#1FA97A]",  titulo: "Intro de newsletter", desc: "El gancho que hace que lean",      hover: "hover:bg-[#E1F5EE] hover:text-[#1FA97A] hover:border-[#1FA97A]/30" },
            { id: "twitter",    icon: Share2,      iconBg: "bg-blue-50",    iconColor: "text-blue-600",    titulo: "Hilo de Twitter/X",    desc: "Tu aprendizaje en formato viral", hover: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" },
            { id: "propuesta",  icon: Target,      iconBg: "bg-purple-50",  iconColor: "text-purple-600",  titulo: "Propuesta de valor",   desc: "Para tu web o presentación",      hover: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200" },
          ].map((f) => {
            const FIcon = f.icon
            return (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", f.iconBg)}>
                  <FIcon className={cn("h-4 w-4", f.iconColor)} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-800">{f.titulo}</div>
                  <div className="text-[11px] text-slate-400">{f.desc}</div>
                </div>
              </div>
              <button
                onClick={() => handleGenerar(f.id)}
                disabled={generando === f.id}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 py-2 bg-slate-50 rounded-xl text-[12px] font-semibold text-slate-600 transition-colors border border-slate-200",
                  f.hover
                )}
              >
                {generando === f.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {generando === f.id ? "Generando..." : "Generar"}
              </button>
            </div>
          )})}

          {/* Ideas de la semana */}
          <div className="bg-gradient-to-br from-[#0B1F2A] to-[#1a3040] rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-300" />
              </div>
              <div className="text-[13px] font-bold text-white">10 ideas para esta semana</div>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Basadas en tu sector y tus últimos clientes</p>
            <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1FA97A] hover:bg-[#1a9068] rounded-xl text-[12px] font-semibold text-white transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
              Generar ideas
            </button>
          </div>
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-[13px] font-bold text-slate-800">Contenido generado reciente</span>
          <span className="text-[11px] text-slate-400">Esta semana</span>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { icon: Share2,    iconBg: "bg-blue-50",     iconColor: "text-blue-600",   tipo: "Post LinkedIn",     preview: "Este mes cerré 3 proyectos web para restaurantes...",        fecha: "Hace 2 horas", usado: true  },
            { icon: Mail,      iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#1FA97A]",  tipo: "Email seguimiento", preview: "Hola María, te escribí hace una semana sobre...",             fecha: "Ayer",         usado: false },
            { icon: Newspaper, iconBg: "bg-slate-100",   iconColor: "text-slate-500",  tipo: "Intro newsletter",  preview: "Este mes aprendí que mis mejores clientes no buscan...",      fecha: "Hace 3 días",  usado: true  },
          ].map((item, i) => {
            const HIcon = item.icon
            return (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", item.iconBg)}>
                <HIcon className={cn("h-4 w-4", item.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold text-slate-700">{item.tipo}</span>
                  {item.usado && (
                    <span className="px-1.5 py-0.5 bg-[#E1F5EE] text-[#1FA97A] text-[9px] font-bold rounded-full">
                      Usado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{item.preview}</p>
              </div>
              <span className="text-[11px] text-slate-400 flex-shrink-0">{item.fecha}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          )})}
        </div>
      </div>

    </div>
  )
}

// ── Tab: Audiencias ───────────────────────────────────────────────────────────

function TabAudiencias() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500">{SEGMENTOS_DATA.length} segmentos definidos</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors shadow-lg shadow-[#1FA97A]/25">
          <Plus className="h-4 w-4" />
          Nuevo segmento
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SEGMENTOS_DATA.map((s) => (
          <div key={s.nombre} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[14px] font-bold text-slate-800 mb-1">{s.nombre}</p>
                <p className="text-[12px] text-slate-500">{s.desc}</p>
              </div>
              <span className={cn("text-[28px] font-black px-3 py-1 rounded-xl", s.color, s.bg)}>
                {s.count}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-[#1FA97A] text-white hover:bg-[#1a9068] transition-colors">
                Enviar campaña
              </button>
              <button className="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors">
                Ver contactos
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Analítica ────────────────────────────────────────────────────────────

function TabAnalitica() {
  const meses = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar", "Abr"]
  const enviados = [380, 610, 520, 720, 840, 970, 1240]
  const abiertos = [142, 256, 198, 302, 361, 421, 512]
  const maxVal = Math.max(...enviados)

  return (
    <div className="space-y-5">
      {/* Gráfico */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[14px] font-bold text-slate-800">Emails últimos 7 meses</p>
          <div className="flex items-center gap-4">
            {[{ label: "Enviados", color: "bg-[#1FA97A]" }, { label: "Abiertos", color: "bg-[#86efac]" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-sm", l.color)} />
                <span className="text-[12px] text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-3" style={{ height: 120 }}>
          {meses.map((mes, i) => (
            <div key={mes} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end gap-1" style={{ height: 100 }}>
                <div
                  className="w-full bg-[#1FA97A] rounded-t-md transition-all duration-700"
                  style={{ height: `${(enviados[i] / maxVal) * 80}%`, minHeight: 4 }}
                />
                <div
                  className="w-full bg-[#86efac] rounded-t-md transition-all duration-700"
                  style={{ height: `${(abiertos[i] / maxVal) * 80}%`, minHeight: 4 }}
                />
              </div>
              <span className="text-[11px] text-slate-400">{mes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[13px] font-bold text-slate-800">Rendimiento por campaña</p>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          {["Campaña", "Enviados", "Apertura", "Clics", "Conversión"].map((h) => (
            <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>
        {CAMPANAS_TABLA.filter((c) => c.enviados > 0).map((c, i, arr) => (
          <div
            key={c.nombre}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0"
          >
            <div>
              <p className="text-[13px] font-semibold text-slate-800">{c.nombre}</p>
              <EstadoBadge estado={c.estado} label={c.estadoLabel} />
            </div>
            <span className="text-[13px] text-slate-700">{c.enviados.toLocaleString("es-ES")}</span>
            <span className="text-[13px] font-semibold text-slate-700">{c.apertura}%</span>
            <span className="text-[13px] text-slate-700">{c.clics}%</span>
            <span className="text-[13px] font-black text-[#1FA97A]">{(c.apertura * 0.04).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Landing Pages ────────────────────────────────────────────────────────

function TabLandings() {
  const landings = [
    { nombre: "Servicios de diseño web", url: "clientlabs.io/p/diseno-web", visitas: 312, leads: 18, conversion: 5.8, estado: "activa" },
    { nombre: "Consultoría gratuita 30min", url: "clientlabs.io/p/consultoria", visitas: 189, leads: 34, conversion: 18.0, estado: "activa" },
    { nombre: "Pack mantenimiento web", url: "clientlabs.io/p/mantenimiento", visitas: 0, leads: 0, conversion: 0, estado: "borrador" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500">2 landings publicadas</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors shadow-lg shadow-[#1FA97A]/25">
          <Plus className="h-4 w-4" />
          Nueva landing
        </button>
      </div>

      <div className="space-y-3">
        {landings.map((l) => (
          <div key={l.nombre} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Globe className="h-6 w-6 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[14px] font-bold text-slate-800">{l.nombre}</p>
                <EstadoBadge estado={l.estado} label={l.estado === "activa" ? "Activa" : "Borrador"} />
              </div>
              <p className="text-[12px] text-slate-400">{l.url}</p>
            </div>
            {l.visitas > 0 && (
              <div className="flex items-center gap-6 flex-shrink-0">
                {[
                  { label: "Visitas", valor: l.visitas.toLocaleString("es-ES") },
                  { label: "Leads", valor: l.leads.toString() },
                  { label: "Conversión", valor: `${l.conversion}%`, bold: true },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className={cn("text-[16px]", stat.bold ? "font-black text-[#1FA97A]" : "font-bold text-slate-800")}>
                      {stat.valor}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
            <button className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center hover:border-slate-300 transition-colors flex-shrink-0">
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#0B1F2A] to-[#1a3040] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1FA97A]/20 flex items-center justify-center">
            <Target className="h-5 w-5 text-[#1FA97A]" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white mb-0.5">Crea tu landing en 5 minutos</div>
            <p className="text-[12px] text-slate-400">
              Sin código. Con tu branding. Conectada directamente a tus leads.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white text-[12px] font-semibold rounded-xl hover:bg-[#1a9068] transition-colors flex-shrink-0">
          Crear landing
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Tabs config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "resumen",    label: "Resumen",       icon: LayoutDashboard },
  { id: "campanas",   label: "Campañas",      icon: Send,       badge: "3" },
  { id: "newsletter", label: "Newsletter",    icon: Newspaper,  badge: "156" },
  { id: "contenido",  label: "Contenido IA",  icon: Sparkles },
  { id: "audiencias", label: "Audiencias",    icon: Users2 },
  { id: "analitica",  label: "Analítica",     icon: BarChart3 },
  { id: "landings",   label: "Landing Pages", icon: Globe,      badge: "2" },
]

// ── Campaign creation data ────────────────────────────────────────────────────

type CampanaTipo = "puntual" | "automatica" | "secuencia"
type CampanaForm = {
  nombre: string
  asunto: string
  mensaje: string
  fechaEnvio: string
  fechaProgramada: string
  horaProgramada: string
  trigger: string
  diasEspera: number
}

const CONTENIDOS: Record<string, { asunto: string; mensaje: string }> = {
  // ── Todos los contactos ──
  "tc-novedad":       { asunto: "{{nombre}}, quería contarte algo", mensaje: "Hola {{nombre}},\n\nQuería compartir una novedad que creo que puede interesarte: [describe aquí tu novedad con el beneficio concreto en la primera frase].\n\nSi quieres saber más, responde a este email y hablamos cuando mejor te venga.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-valor":         { asunto: "Algo que puede servirte, {{nombre}}", mensaje: "Hola {{nombre}},\n\nNo te escribo para venderte nada. Hoy solo quería compartir algo que he aprendido trabajando con negocios como el tuyo:\n\n[Describe aquí tu consejo de forma concreta y aplicable. Cuanto más específico, mejor.]\n\nSi lo pruebas y te resulta útil, me alegra. Y si quieres aplicarlo a tu caso, responde aquí y lo hablamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-oferta":        { asunto: "Oferta especial — solo hasta [fecha]", mensaje: "Hola {{nombre}},\n\nDurante las próximas dos semanas tenemos una propuesta especial que no hemos ofrecido antes:\n\n[Describe la oferta con el beneficio principal primero, el precio después]\n\nSi te interesa o quieres más detalles, responde aquí y te lo cuento todo.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-evento":        { asunto: "{{nombre}}, te invito a [evento]", mensaje: "Hola {{nombre}},\n\nEl próximo [fecha] organizo [describe el evento: webinar, taller, sesión gratuita...] y quería invitarte.\n\nVa a durar aproximadamente [duración] y hablaremos sobre [tema principal que les interesa].\n\nSi quieres apuntarte, responde a este email y te mando todos los detalles.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-precios":       { asunto: "{{nombre}}, próximo cambio de precios", mensaje: "Hola {{nombre}},\n\nA partir del [fecha] vamos a actualizar nuestros precios. Quería avisarte con tiempo para que puedas tomar una decisión con calma.\n\nSi tenías algo pendiente que querías hacer o proyectos en mente, este puede ser buen momento para cerrarlos con las condiciones actuales.\n\nDímelo antes del [fecha] y lo reservamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-referidos":     { asunto: "{{nombre}}, ¿conoces a alguien que pueda necesitar esto?", mensaje: "Hola {{nombre}},\n\nUna de las mejores cosas que me pueden pasar es que alguien como tú me recomiende a otro negocio.\n\nSi en tu entorno hay alguien que pueda necesitar [tu servicio principal], te agradecería enormemente que le mencionaras que existo.\n\nSi esa persona acaba siendo cliente, te ofrezco [beneficio concreto] como agradecimiento.\n\nSin compromiso — solo si se te ocurre alguien.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-encuesta":      { asunto: "{{nombre}}, ¿dos minutos para una pregunta?", mensaje: "Hola {{nombre}},\n\nEstoy mejorando cómo trabajo y tu opinión me ayudaría mucho.\n\nSolo una pregunta: [formula aquí tu pregunta concreta — qué valoran, qué les frena, qué mejorarían].\n\nResponde directamente a este email con lo primero que te venga a la cabeza. No hay respuestas incorrectas.\n\nMuchas gracias de antemano.\n\nUn saludo,\n{{usuario.nombre}}" },
  "tc-balance":       { asunto: "{{nombre}}, hacemos balance", mensaje: "Hola {{nombre}},\n\nSe acaba el año y quería hacer una pausa para reflexionar.\n\n[Comparte aquí algo honesto: qué has aprendido, qué ha cambiado en tu negocio, qué viene en el próximo año]\n\nEspero que haya sido un buen año para ti también. Si quieres charlar sobre lo que viene, aquí estoy.\n\nUn abrazo,\n{{usuario.nombre}}" },
  "tc-newsletter":    { asunto: "Lo más destacado de este mes", mensaje: "Hola {{nombre}},\n\nAquí va un resumen de lo más relevante de este mes:\n\n[1. Novedad o aprendizaje principal]\n[2. Recurso o herramienta que te ha servido]\n[3. Lo que viene el próximo mes]\n\nSi alguno de estos puntos te genera alguna pregunta o quieres profundizar, responde aquí mismo.\n\nHasta el próximo mes,\n{{usuario.nombre}}" },
  "tc-disponibilidad":{ asunto: "{{nombre}}, tengo hueco a partir de [mes]", mensaje: "Hola {{nombre}},\n\nA partir de [mes] tengo disponibilidad para nuevos proyectos y quería avisarte antes de comunicarlo al resto.\n\nSi tenías algo en mente o hay algún proyecto que llevas tiempo posponiendo, este puede ser buen momento.\n\nSin compromiso — si no es el momento, lo entiendo perfectamente.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Todos los clientes ──
  "cl-novedad":       { asunto: "{{nombre}}, hay algo nuevo que creo que te va a interesar", mensaje: "Hola {{nombre}},\n\nComo cliente ya sabes cómo trabajamos. Por eso quería contarte algo nuevo antes de anunciarlo públicamente:\n\n[Describe la novedad: nuevo servicio, mejora, nueva forma de trabajar...]\n\nSi quieres ser de los primeros en aprovecharlo o tienes alguna pregunta, responde aquí y lo hablamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-oferta":        { asunto: "Solo para clientes como tú, {{nombre}}", mensaje: "Hola {{nombre}},\n\nHay clientes con los que da gusto trabajar, y tú eres uno de ellos. Por eso quería ofrecerte algo que no hacemos habitualmente:\n\n[Describe la oferta con el beneficio principal primero]\n\nEsta propuesta es válida hasta el [fecha] y es exclusiva para clientes actuales. Si te interesa, responde aquí y lo gestionamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-renovacion":    { asunto: "{{nombre}}, se acerca el momento de revisar lo nuestro", mensaje: "Hola {{nombre}},\n\nYa casi llevamos [tiempo] trabajando juntos y quería hacer una pausa para revisar cómo están las cosas.\n\nPor mi parte ha ido bien y me gustaría continuar. Pero antes de hablar de renovar, quiero saber tu opinión: ¿hay algo que hayas echado de menos o que podría mejorarse?\n\nCon ese feedback podemos plantear la renovación con más sentido para los dos. ¿Cuándo tienes un momento?\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-agradecimiento":{ asunto: "Gracias por confiar en mí, {{nombre}}", mensaje: "Hola {{nombre}},\n\nAhora que hemos terminado el proyecto quería escribirte algo más allá de la última factura.\n\nHa sido un placer. Me gustan los clientes que confían en el criterio del profesional y que hacen que el trabajo valga la pena. Tú eres uno de ellos.\n\nSi en algún momento necesitas algo más, ya sabes dónde estoy.\n\nHa sido un gusto.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-caso-exito":    { asunto: "Un proyecto reciente que creo que te puede interesar, {{nombre}}", mensaje: "Hola {{nombre}},\n\nHace unas semanas terminé un proyecto con [tipo de cliente similar] que me pareció interesante compartir contigo.\n\n[Describe: reto principal, enfoque, resultado concreto en números o impacto]\n\nLo cuento porque creo que hay algo trasladable a tu situación. Si quieres que lo hablemos, dime cuándo te va bien.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-valor":         { asunto: "{{nombre}}, algo que aprendí esta semana", mensaje: "Hola {{nombre}},\n\nTrabajando con negocios como el tuyo me encuentro con patrones que se repiten. Esta semana me di cuenta de algo que creo que puede servirte:\n\n[Describe el aprendizaje de forma concreta — un error común, una buena práctica, una herramienta]\n\nSi quieres aplicarlo a tu caso o tienes alguna pregunta, responde aquí.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-referido":      { asunto: "{{nombre}}, ¿conoces a alguien como tú?", mensaje: "Hola {{nombre}},\n\nLa mayoría de mis mejores clientes han llegado por recomendación de otros clientes como tú. Y eso me parece el mayor cumplido que puedo recibir.\n\nSi en tu entorno hay alguien que pueda necesitar lo que hacemos juntos, te agradecería que le mencionaras que existo.\n\nSi esa persona acaba siendo cliente, te ofrezco [beneficio concreto] como agradecimiento.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-encuesta":      { asunto: "{{nombre}}, ¿cómo lo estamos haciendo?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin preguntarte directamente cómo estás viendo nuestra colaboración.\n\n¿Hay algo que mejorarías? ¿Algo que valoras especialmente? ¿Algo que esperabas y no ha llegado?\n\nResponde con lo primero que te venga a la cabeza. No hay respuesta incorrecta y me ayuda mucho saber tu opinión real.\n\nMuchas gracias.\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-upsell":        { asunto: "{{nombre}}, algo que quizás no sabías que hacemos", mensaje: "Hola {{nombre}},\n\nTrabajar contigo me ha dado contexto suficiente para identificar algo en lo que también podría ayudarte:\n\n[Describe el servicio adicional, el problema que resuelve y por qué es relevante para este cliente concreto]\n\nNo te lo propongo a todos los clientes — solo cuando creo que tiene sentido real. En tu caso creo que sí lo tiene.\n\n¿Te interesa que lo hablemos?\n\nUn saludo,\n{{usuario.nombre}}" },
  "cl-disponibilidad":{ asunto: "{{nombre}}, tengo hueco si tienes algo en mente", mensaje: "Hola {{nombre}},\n\nEl próximo mes tengo disponibilidad para retomar proyectos y pensé en ti.\n\nSi tienes algo pendiente que querías hacer o hay una idea que llevas tiempo posponiendo, este puede ser buen momento para ponernos en marcha.\n\nSin compromiso — solo quería que lo supieras.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Todos los leads ──
  "ld-seguimiento":   { asunto: "¿Tuviste oportunidad de revisar mi propuesta, {{nombre}}?", mensaje: "Hola {{nombre}},\n\nHan pasado unos días desde que te envié la propuesta y quería saber si tuviste oportunidad de revisarla.\n\nSi hay algún punto que no queda claro o quieres ajustar algo, dímelo sin problema. A veces hay detalles que funcionan mejor cuando los hablamos directamente.\n\n¿Cuándo tienes un momento esta semana?\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-caso-exito":    { asunto: "{{nombre}}, un proyecto similar al tuyo que puede inspirarte", mensaje: "Hola {{nombre}},\n\nMientras revisaba tu propuesta pensé en un proyecto que hice hace unos meses con [tipo de negocio similar] y que creo que puede ser relevante para ti.\n\n[Describe: situación inicial similar, enfoque, resultado concreto]\n\nTe lo cuento porque el reto era parecido al tuyo. Si quieres hablarlo, dime cuándo.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-objeciones":    { asunto: "{{nombre}}, quería aclarar algo de la propuesta", mensaje: "Hola {{nombre}},\n\nA veces cuando una propuesta no avanza es porque hay algo que no queda del todo claro o que genera dudas que no se han dicho en voz alta.\n\nSi es así, me ayudaría mucho saberlo. No para convencerte de nada — sino para entender si puedo ajustar algo o si simplemente no es el momento.\n\n¿Hay algo concreto que te frena?\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-urgencia":      { asunto: "{{nombre}}, esta propuesta caduca el [fecha]", mensaje: "Hola {{nombre}},\n\nQuería avisarte de que la propuesta que te envié tiene validez hasta el [fecha]. Después de esa fecha necesitaría revisarla porque [razón concreta: cambio de disponibilidad, precios, etc.].\n\nSi te interesa seguir adelante, dímelo antes del [fecha] y lo cerramos con las condiciones actuales.\n\nSin presión — si no es el momento lo entiendo.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-social-proof":  { asunto: "{{nombre}}, esto es lo que dicen quienes ya han trabajado conmigo", mensaje: "Hola {{nombre}},\n\nSé que tomar una decisión sin conocer de primera mano cómo trabajo puede generar dudas. Por eso quería compartir contigo lo que dice [nombre de cliente o tipo de cliente] que pasó por una situación similar a la tuya:\n\n\"[Testimonio concreto — resultado, experiencia, lo que más valoró]\"\n\nSi quieres hablar con ellos directamente antes de decidir, puedo presentaros. No es habitual pero no tengo ningún problema.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-llamada":       { asunto: "{{nombre}}, ¿hablamos 20 minutos esta semana?", mensaje: "Hola {{nombre}},\n\nCruzar emails tiene sus límites. Creo que en 20 minutos por teléfono o videollamada podemos aclarar todo lo que en los mensajes se pierde.\n\nNo para venderte nada — para entender mejor tu situación y ver si realmente puedo ayudarte o no.\n\n¿Cuándo tienes un hueco esta semana o la que viene?\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-demo":          { asunto: "{{nombre}}, ¿te muestro cómo funciona en la práctica?", mensaje: "Hola {{nombre}},\n\nA veces la mejor forma de ver si algo encaja es verlo funcionando en vivo.\n\nSi quieres, puedo prepararte una muestra gratuita de [describe qué mostrarías — un análisis, un primer entregable, una sesión de trabajo] sin compromiso.\n\nAsí tienes contexto real antes de decidir nada.\n\n¿Te interesa?\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-valor":         { asunto: "{{nombre}}, algo útil mientras lo piensas", mensaje: "Hola {{nombre}},\n\nNo te escribo para presionarte. Solo quería dejarte algo útil mientras valoras la propuesta:\n\n[Comparte un recurso, consejo o insight relevante para su situación concreta]\n\nSin más. Cuando tengas algo claro, aquí estaré.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-propuesta":     { asunto: "{{nombre}}, he revisado la propuesta", mensaje: "Hola {{nombre}},\n\nHe estado pensando en tu situación y he ajustado la propuesta para que encaje mejor con lo que me contaste.\n\nLos cambios principales son:\n— [Cambio 1: qué ajustaste y por qué]\n— [Cambio 2]\n\nSi quieres revisarla juntos, dime cuándo tienes un momento.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ld-ultimo":        { asunto: "{{nombre}}, última vez que te escribo", mensaje: "Hola {{nombre}},\n\nNo quiero molestarte más, así que este es mi último mensaje.\n\nSi en algún momento cambia la situación o surge algo en lo que pueda ayudarte, aquí estaré.\n\nTe deseo mucho éxito con lo que tengas entre manos.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Clientes inactivos (sin compra 90d) ──
  "ci-retoma":        { asunto: "{{nombre}}, quería dar señales de vida", mensaje: "Hola {{nombre}},\n\nHan pasado {{dias_sin_contacto}} días desde que trabajamos juntos y no quería que pasara más tiempo sin escribirte.\n\nNo te escribo para venderte nada — solo para saber cómo estás y cómo va el negocio desde que terminamos.\n\nSi hay algo en lo que pueda ayudarte ahora mismo, dímelo. Y si no, también me alegra saber de ti.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-oferta":        { asunto: "{{nombre}}, algo especial para retomar", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin saber de ti y quería proponerte algo.\n\nPara clientes con los que hemos trabajado antes tengo una propuesta especial para retomar: [describe la oferta de reactivación — descuento, servicio reducido, sesión gratuita de revisión...].\n\nSin compromiso. Si te interesa, responde aquí y hablamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-novedad":       { asunto: "{{nombre}}, mucho ha cambiado desde la última vez", mensaje: "Hola {{nombre}},\n\nDesde que trabajamos juntos han pasado cosas. Quería contarte qué hay de nuevo por aquí:\n\n[Describe la novedad más relevante: nuevo servicio, mejora, nuevo enfoque]\n\nNo sé si ahora mismo tienes algo en marcha, pero si es así o si lo tienes en mente, me gustaría que lo habláramos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-nuevo-servicio":{ asunto: "{{nombre}}, algo nuevo que antes no hacíamos", mensaje: "Hola {{nombre}},\n\nQuería contarte que hemos añadido algo nuevo a lo que hacemos: [describe el nuevo servicio con el problema que resuelve].\n\nPensé en ti porque [razón concreta — sector, necesidad que mencionaste, tipo de proyecto que hicisteis].\n\nSi quieres saber más, responde aquí y te lo cuento.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-mercado":       { asunto: "{{nombre}}, ¿sigues activo en [sector]?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin saber de ti y quería preguntarte directamente: ¿sigues activo en [sector / tipo de proyecto que hacíais juntos]?\n\nNo es una pregunta con trampa — simplemente quiero saber si tiene sentido que sigamos en contacto o si tu situación ha cambiado.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-descuento":     { asunto: "{{nombre}}, algo exclusivo para retomar", mensaje: "Hola {{nombre}},\n\nPara clientes que trabajaron conmigo antes y quieren retomar, tengo algo especial: [descuento concreto o condición preferencial].\n\nEsto no lo ofrezco públicamente — solo a clientes como tú con los que ya tengo contexto y que sé que encajan bien con cómo trabajo.\n\nSi tienes algo en mente, dímelo antes del [fecha].\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-caso":          { asunto: "{{nombre}}, un proyecto reciente que te puede interesar", mensaje: "Hola {{nombre}},\n\nHace unas semanas terminé algo que creo que tiene relación con lo que hacías cuando trabajamos juntos.\n\n[Describe el proyecto: tipo de cliente, reto, resultado en términos concretos]\n\nTe lo cuento por si te sirve de inspiración o por si hay algo trasladable a tu situación actual.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-feedback":      { asunto: "{{nombre}}, ¿qué podría haber hecho mejor?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo pensando en por qué no hemos vuelto a trabajar juntos y quería preguntártelo directamente.\n\n¿Hubo algo que no salió como esperabas? ¿Algo que podría haber hecho de otra forma?\n\nNo te lo pregunto para justificarme — sino porque quiero aprender y mejorar. Si hay algo concreto, me ayudaría mucho saberlo.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-saludo":        { asunto: "Solo decir hola, {{nombre}}", mensaje: "Hola {{nombre}},\n\nNo tengo ninguna propuesta ni nada que venderte. Solo quería decir hola y saber cómo estás.\n\n¿Cómo va el negocio? ¿Hay algo interesante en marcha?\n\nUn saludo,\n{{usuario.nombre}}" },
  "ci-directa":       { asunto: "{{nombre}}, ¿hay algo en lo que pueda ayudarte ahora?", mensaje: "Hola {{nombre}},\n\nVoy al grano: llevo un tiempo sin saber de ti y quería preguntarte directamente si hay algo en marcha en lo que pueda ayudarte.\n\n[Menciona aquí tu servicio principal y el tipo de problema que resuelves — en una frase]\n\nSi hay algo, cuéntame. Si no, sin problema.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Leads sin respuesta 14d ──
  "lf-suave":         { asunto: "{{nombre}}, ¿todo bien?", mensaje: "Hola {{nombre}},\n\nTe escribí hace unos días y no supe de ti. Lo entiendo perfectamente — a veces el día a día no deja margen para nada.\n\nSolo quería asegurarme de que mi mensaje te llegó bien y de que no se quedó ninguna duda sin resolver.\n\nSi necesitas más tiempo o simplemente no es el momento, dímelo sin problema.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-relevante":     { asunto: "{{nombre}}, ¿sigue siendo relevante lo que hablamos?", mensaje: "Hola {{nombre}},\n\nHan pasado unas semanas desde que estuvimos hablando y quería preguntarte directamente: ¿sigue siendo relevante para ti lo que estábamos comentando?\n\nA veces las prioridades cambian y lo que era urgente deja de serlo. Si es así, lo entiendo perfectamente — y me viene bien saberlo para no molestarte más.\n\n¿Cómo están las cosas por tu parte?\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-valor":         { asunto: "{{nombre}}, algo útil mientras lo piensas", mensaje: "Hola {{nombre}},\n\nNo te escribo para presionarte. Mientras estás valorando qué hacer, quería dejarte algo que puede servirte:\n\n[Comparte un recurso, aprendizaje o consejo directamente relacionado con su problema]\n\nSin más. Cuando tengas algo claro, aquí estaré.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-angulo":        { asunto: "{{nombre}}, lo enfoco de otra manera", mensaje: "Hola {{nombre}},\n\nHe estado pensando en lo que hablamos y creo que quizás lo presenté de la forma equivocada.\n\nDejame replantearlo: [describe el mismo servicio/propuesta pero desde un ángulo diferente — enfocado en el resultado, en el problema que evita, en el tiempo que ahorra].\n\n¿Tiene más sentido así? ¿Hablamos?\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-referencia":    { asunto: "{{nombre}}, alguien en una situación muy parecida a la tuya", mensaje: "Hola {{nombre}},\n\nMientras esperaba tu respuesta me acordé de [tipo de cliente] que tenía una situación muy similar a la tuya.\n\nLo que hicimos con ellos fue [describe brevemente el enfoque y el resultado].\n\nTe lo cuento por si te ayuda a ver de forma más concreta cómo podría funcionar en tu caso.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-friccion":      { asunto: "{{nombre}}, ¿qué es lo que frena la decisión?", mensaje: "Hola {{nombre}},\n\nQuiero ser directo: llevamos un tiempo dando vueltas y me gustaría entender qué es lo que frena la decisión.\n\n¿Es el precio? ¿El timing? ¿Hay algo de la propuesta que no encaja del todo?\n\nDímelo sin filtros. Prefiero saberlo que seguir enviando mensajes en el vacío.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-ultima":        { asunto: "{{nombre}}, última vez que te escribo sobre esto", mensaje: "Hola {{nombre}},\n\nNo quiero molestarte más con esto, así que este es mi último mensaje sobre la propuesta.\n\nSi en algún momento cambia la situación o surge algo en lo que pueda ayudarte, ya sabes dónde encontrarme.\n\nTe deseo mucho éxito con lo que tienes entre manos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-silencio":      { asunto: "¿He dicho algo que no encajó, {{nombre}}?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin saber de ti y empiezo a pensar que quizás dije o hice algo que no encajó bien.\n\nSi es así, me gustaría saberlo. No para justificarme — sino porque prefiero un 'no' claro a seguir en el limbo.\n\n¿Hay algo que debería saber?\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-objecion":      { asunto: "{{nombre}}, sobre la duda que creo que tienes", mensaje: "Hola {{nombre}},\n\nCuando una propuesta no avanza, suele haber una duda que no se ha dicho en voz alta. La más común en mi caso es [menciona la objeción más frecuente — precio, tiempo, resultados, confianza].\n\nSi es eso lo que te frena, quiero darte un poco más de contexto: [responde la objeción de forma honesta y con argumentos reales].\n\nSi es otra cosa, dímelo y lo hablamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lf-archivo":       { asunto: "{{nombre}}, ¿lo dejamos aquí o seguimos?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin noticias tuyas y quiero ser respetuoso con tu tiempo.\n\nSi el proyecto ya no está en tus planes o las prioridades han cambiado, puedes decirme simplemente 'lo dejamos' y no te escribiré más.\n\nY si hay algo pendiente o quieres retomarlo en otro momento, también puedes decírmelo y lo tengo en cuenta.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Clientes VIP (>2.000€/año) ──
  "vip-anticipado":   { asunto: "{{nombre}}, acceso anticipado antes de que lo anunciemos", mensaje: "Hola {{nombre}},\n\nAntes de anunciarlo públicamente, quería darte acceso anticipado a [describe: nueva funcionalidad, nuevo servicio, nueva forma de trabajar].\n\nEres de los clientes con los que más me gusta trabajar y me parecía justo que lo supieras antes que nadie.\n\nSi quieres ser de los primeros en aprovecharlo, dímelo y te explico todos los detalles.\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-oferta":       { asunto: "{{nombre}}, algo que no ofrezco a todo el mundo", mensaje: "Hola {{nombre}},\n\nHay clientes con los que la relación va más allá de lo transaccional. Tú eres uno de ellos.\n\nPor eso quería ofrecerte algo que no está en mi web ni en mis propuestas habituales: [describe la oferta VIP — condiciones especiales, acceso preferente, precio exclusivo].\n\nNo tiene fecha de caducidad — es simplemente para ti, cuando te venga bien.\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-evento":       { asunto: "{{nombre}}, invitación privada", mensaje: "Hola {{nombre}},\n\nOrganizo [tipo de evento: cena, sesión de trabajo, presentación privada...] con un grupo muy reducido de personas y quería invitarte.\n\nSerá el [fecha] en [formato / lugar] y participarán [describe brevemente quién más estará].\n\nSi te apetece, dímelo antes del [fecha de confirmación] para reservarte el sitio.\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-revision":     { asunto: "{{nombre}}, ¿revisamos la estrategia juntos?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo queriendo proponerte algo: una sesión de revisión estratégica para ver cómo está lo que hemos construido juntos y qué podría mejorarse.\n\nSin coste adicional — es algo que hago con los clientes con los que tengo una relación más larga porque creo que aporta valor real.\n\n¿Cuándo tienes un par de horas?\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-expansion":    { asunto: "{{nombre}}, una propuesta que llevo tiempo pensando", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo observando cómo has evolucionado y creo que hay una oportunidad que todavía no hemos explorado juntos:\n\n[Describe la propuesta de expansión — nuevo área de trabajo, nueva forma de colaborar, proyecto más ambicioso]\n\nNo es algo que proponga a todos mis clientes. Solo tiene sentido con quienes ya tienen una base sólida como la tuya.\n\n¿Le damos una vuelta?\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-agradecimiento":{ asunto: "{{nombre}}, gracias — de verdad", mensaje: "Hola {{nombre}},\n\nQuería escribirte sin ningún motivo comercial.\n\nLlevamos [tiempo] trabajando juntos y quería decirte que ha sido — y sigue siendo — un placer. No todos los clientes hacen que el trabajo valga la pena. Tú sí.\n\nGracias por la confianza.\n\nUn abrazo,\n{{usuario.nombre}}" },
  "vip-regalo":       { asunto: "{{nombre}}, algo para ti — sin motivo", mensaje: "Hola {{nombre}},\n\nQuería enviarte algo como agradecimiento por este tiempo trabajando juntos: [describe el regalo o bonus — una sesión gratuita, un recurso exclusivo, un descuento, algo tangible].\n\nSin condiciones ni letra pequeña. Solo porque me parecía lo justo.\n\nEspero que te resulte útil.\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-referidos":    { asunto: "{{nombre}}, ¿conoces a alguien de tu nivel?", mensaje: "Hola {{nombre}},\n\nLos mejores clientes que tengo han llegado por recomendación de clientes como tú. Y cuando digo como tú, me refiero a negocios serios, con las ideas claras y que valoran el trabajo bien hecho.\n\nSi conoces a alguien así que pueda necesitar lo que hacemos, me encantaría que nos presentaras.\n\nA cambio, [describe el beneficio concreto para el VIP].\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-partnership":  { asunto: "{{nombre}}, ¿y si colaboramos de otra forma?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo dándole vueltas a algo y quería planteártelo directamente.\n\nCreo que hay una forma en la que podríamos colaborar que va más allá de la relación cliente-proveedor habitual: [describe la propuesta de colaboración — alianza, co-creación, referidos mutuos, proyecto conjunto].\n\nNo sé si encaja con tu situación, pero quería preguntarte antes de descartar la idea.\n\n¿Le damos una vuelta?\n\nUn saludo,\n{{usuario.nombre}}" },
  "vip-exclusivo":    { asunto: "{{nombre}}, algo que no comparto públicamente", mensaje: "Hola {{nombre}},\n\nQuería compartir contigo algo que no publico ni envío a todo el mundo: [describe el contenido exclusivo — análisis, documento, aprendizaje profundo, recurso elaborado].\n\nEres de las pocas personas con las que me apetece compartirlo porque sé que lo vas a aprovechar.\n\nEspero que te resulte útil.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Nuevos clientes (últimos 30 días) ──
  "nc-bienvenida":    { asunto: "Bienvenido al equipo, {{nombre}}", mensaje: "Hola {{nombre}},\n\nQuerida empezar con el pie derecho.\n\nGracias por elegirme. Tomar la decisión de trabajar con alguien nuevo siempre tiene algo de incertidumbre y me tomo muy en serio estar a la altura de esa confianza.\n\nEn los próximos días te explicaré cómo vamos a trabajar juntos. Mientras tanto, si tienes alguna duda o algo no está claro, responde aquí directamente.\n\nEncantado de empezar.\n\n{{usuario.nombre}}" },
  "nc-primeros-pasos":{ asunto: "{{nombre}}, estos son los primeros pasos", mensaje: "Hola {{nombre}},\n\nAhora que hemos empezado, quería darte claridad sobre cómo van a ir las cosas:\n\n1. [Primer paso: qué va a pasar primero]\n2. [Segundo paso: qué necesito de ti]\n3. [Tercer paso: cuándo verás los primeros resultados]\n\nSi algo no está claro o quieres ajustar algo, dímelo ahora — es mucho más fácil corregirlo al principio.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-recursos":      { asunto: "{{nombre}}, recursos útiles para empezar", mensaje: "Hola {{nombre}},\n\nMientras arrancamos, quería dejarte algunos recursos que te pueden ser útiles para [describe el contexto — entender mejor el proceso, preparar lo que necesito de ti, sacar más partido al trabajo que vamos a hacer juntos]:\n\n— [Recurso 1]\n— [Recurso 2]\n— [Recurso 3]\n\nNo es obligatorio revisarlos — solo si tienes curiosidad o quieres profundizar.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-proceso":       { asunto: "{{nombre}}, así es como trabajo", mensaje: "Hola {{nombre}},\n\nAntes de que empecemos de lleno, quería explicarte cómo funciona mi forma de trabajar para que no haya sorpresas:\n\n[Forma de comunicación: canales, tiempos de respuesta]\n[Entregas: cómo, cuándo, en qué formato]\n[Revisiones: cuántas, cómo gestionarlas]\n[Pagos: cuándo y cómo]\n\nSi algo no encaja con tus expectativas, dímelo ahora y lo ajustamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-semana1":       { asunto: "{{nombre}}, ¿cómo va la primera semana?", mensaje: "Hola {{nombre}},\n\nYa llevamos una semana trabajando juntos y quería hacer una pequeña pausa.\n\n¿Cómo lo estás viendo hasta ahora? ¿Hay algo que no está claro o que esperabas de forma diferente?\n\nEs mucho más fácil ajustar las cosas al principio que cuando ya llevamos tiempo. Si hay algo, dímelo sin filtros.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-mes1":          { asunto: "{{nombre}}, primer mes — ¿cómo lo ves?", mensaje: "Hola {{nombre}},\n\nYa llevamos un mes y quería hacer un check-in real.\n\n¿Estás viendo lo que esperabas? ¿Hay algo que no está funcionando como pensabas? ¿Algo que te gustaría cambiar?\n\nEsta es la mejor etapa para hacer ajustes. Si hay algo, cuéntame.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-opinion":       { asunto: "{{nombre}}, ¿cómo lo estamos haciendo?", mensaje: "Hola {{nombre}},\n\nQuería pedirte algo que para mí tiene mucho valor: tu opinión honesta sobre cómo estamos trabajando hasta ahora.\n\n¿Hay algo que mejorarías? ¿Algo que valoras especialmente? ¿Algo que esperabas y no ha llegado?\n\nResponde con lo primero que te venga a la cabeza. No hay respuesta incorrecta.\n\nMuchas gracias.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-ayuda":         { asunto: "{{nombre}}, ¿hay algo más en lo que pueda ayudarte?", mensaje: "Hola {{nombre}},\n\nMás allá de lo que estamos haciendo juntos, quería preguntarte directamente: ¿hay algún otro reto o duda con la que pueda ayudarte?\n\nA veces empezamos por una cosa y hay más debajo. Si hay algo que te ronda la cabeza y crees que podría entrar en mi ámbito, cuéntamelo.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-referidos":     { asunto: "{{nombre}}, ¿conoces a alguien que pueda necesitar esto?", mensaje: "Hola {{nombre}},\n\nSé que llevamos poco tiempo trabajando juntos, pero si lo que estamos haciendo te está resultando útil, quería preguntarte algo.\n\n¿Hay alguien en tu entorno que pueda tener una necesidad similar a la tuya?\n\nSi me lo presentas y acaba siendo cliente, te ofrezco [beneficio concreto] como agradecimiento.\n\nSin compromiso — solo si se te ocurre alguien.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nc-hito":          { asunto: "{{nombre}}, primer hito conseguido", mensaje: "Hola {{nombre}},\n\nQuería escribirte para reconocer algo: [describe el primer resultado o hito conseguido — por pequeño que sea].\n\nSé que es solo el principio, pero creo que vale la pena pararse un momento a reconocerlo.\n\n¿Cómo lo ves tú? ¿Estás notando el avance?\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Seguimiento de propuesta (submenu ld-seguimiento) ──
  "seguimiento-suave":   { asunto: "{{nombre}}, solo quería saber cómo estás", mensaje: "Hola {{nombre}},\n\nTe envié la propuesta hace unos días y no quería presionarte — sé que estas cosas necesitan su tiempo.\n\nSolo quería asegurarme de que no quedó ninguna duda sin respuesta. Si hay algo que no quedó claro o quieres ajustar algo, dímelo sin problema.\n\nCuando tengas un momento, aquí estoy.\n\nUn saludo,\n{{usuario.nombre}}" },
  "sigue-relevante":     { asunto: "{{nombre}}, ¿sigue siendo relevante lo que hablamos?", mensaje: "Hola {{nombre}},\n\nHan pasado unos días desde que te envié la propuesta y quería preguntarte directamente: ¿sigue siendo relevante para ti lo que estábamos hablando?\n\nA veces las prioridades cambian y lo que era urgente deja de serlo. Si es tu caso, lo entiendo perfectamente — y me viene bien saberlo para no molestarte más.\n\n¿Cómo están las cosas?\n\nUn saludo,\n{{usuario.nombre}}" },
  "valor-sin-presion":   { asunto: "{{nombre}}, algo útil mientras lo piensas", mensaje: "Hola {{nombre}},\n\nNo te escribo para presionarte. Mientras valoras la propuesta, quería dejarte algo que puede servirte:\n\n[Comparte aquí un recurso, consejo o insight directamente relacionado con su situación]\n\nSin más. Cuando tengas algo claro, aquí estaré.\n\nUn saludo,\n{{usuario.nombre}}" },
  "nuevo-angulo":        { asunto: "{{nombre}}, lo enfoco de otra forma", mensaje: "Hola {{nombre}},\n\nHe estado pensando en lo que hablamos y creo que quizás lo presenté de la forma equivocada.\n\nDéjame replantearlo: [describe el mismo servicio pero desde un ángulo diferente — enfocado en el resultado, en el problema que evita, en el tiempo que ahorra].\n\n¿Tiene más sentido así? ¿Hablamos?\n\nUn saludo,\n{{usuario.nombre}}" },
  "cliente-similar":     { asunto: "{{nombre}}, alguien en tu misma situación", mensaje: "Hola {{nombre}},\n\nMientras esperaba tu respuesta me acordé de [tipo de cliente] que tenía una situación muy similar a la tuya.\n\nLo que hicimos con ellos fue [describe brevemente el enfoque y el resultado en términos concretos].\n\nTe lo cuento por si te ayuda a ver de forma más concreta cómo podría funcionar en tu caso.\n\nUn saludo,\n{{usuario.nombre}}" },
  "que-te-frena":        { asunto: "{{nombre}}, ¿qué frena la decisión?", mensaje: "Hola {{nombre}},\n\nQuiero ser directo: llevamos un tiempo y me gustaría entender qué es lo que frena la decisión.\n\n¿Es el precio? ¿El timing? ¿Hay algo de la propuesta que no encaja del todo?\n\nDímelo sin filtros. Prefiero saberlo que seguir enviando mensajes sin respuesta.\n\nUn saludo,\n{{usuario.nombre}}" },
  "ultima-llamada":      { asunto: "{{nombre}}, la propuesta caduca el [fecha]", mensaje: "Hola {{nombre}},\n\nQuería avisarte de que la propuesta que te envié tiene validez hasta el [fecha]. Después necesitaría revisarla porque [razón concreta: cambio de disponibilidad, ajuste de precios, etc.].\n\nSi quieres cerrarla con las condiciones actuales, dímelo antes de esa fecha.\n\nSin presión — si no es el momento, lo entiendo.\n\nUn saludo,\n{{usuario.nombre}}" },
  "romper-silencio":     { asunto: "¿He dicho algo que no encajó, {{nombre}}?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin saber de ti y empiezo a preguntarme si dije o hice algo que no encajó bien.\n\nSi es así, me gustaría saberlo. No para justificarme — sino porque prefiero un 'no' claro a seguir en el limbo.\n\n¿Hay algo que debería saber?\n\nUn saludo,\n{{usuario.nombre}}" },
  "resolver-objecion":   { asunto: "{{nombre}}, sobre la duda que creo que tienes", mensaje: "Hola {{nombre}},\n\nCuando una propuesta no avanza, suele haber una duda que no se ha dicho en voz alta. La más frecuente en mi caso es [menciona la objeción más común — precio, tiempo, resultados, confianza].\n\nSi es eso lo que te frena, quiero darte algo más de contexto: [responde la objeción de forma honesta y con argumentos reales].\n\nSi es otra cosa, cuéntamelo y lo hablamos.\n\nUn saludo,\n{{usuario.nombre}}" },
  "lo-dejamos-aqui":     { asunto: "{{nombre}}, ¿lo dejamos aquí?", mensaje: "Hola {{nombre}},\n\nLlevo un tiempo sin noticias tuyas y quiero ser respetuoso con tu tiempo.\n\nSi el proyecto ya no está en tus planes o las prioridades han cambiado, puedes decirme simplemente 'lo dejamos' y no te escribiré más.\n\nY si quieres retomarlo en otro momento, también puedes decírmelo y lo tengo en cuenta.\n\nUn saludo,\n{{usuario.nombre}}" },

  // ── Genéricos ──
  "desde-cero":      { asunto: "", mensaje: "" },
  "automatica-cero": { asunto: "", mensaje: "" },
}

const SECUENCIAS: Record<string, Array<{ dia: number; asunto: string; mensaje: string }>> = {
  "bienvenida-secuencia": [
    { dia: 0,  asunto: "Recibido tu mensaje, {{nombre}}",                        mensaje: "Hola {{nombre}},\n\nMuchas gracias por ponerte en contacto. He recibido tu mensaje y me pondré en contacto en las próximas 24 horas.\n\nUn saludo,\n{{usuario.nombre}}" },
    { dia: 3,  asunto: "¿Tuviste oportunidad de revisar mi mensaje, {{nombre}}?",mensaje: "Hola {{nombre}},\n\nSolo quería asegurarme de que no se perdió mi mensaje. ¿Hay algo que pueda aclararte antes de hablar?\n\nUn saludo,\n{{usuario.nombre}}" },
    { dia: 7,  asunto: "{{nombre}}, última vez que te escribo",                  mensaje: "Hola {{nombre}},\n\nNo quiero molestarte más, así que este es mi último mensaje. Si en algún momento cambias de idea o surge algo en lo que pueda ayudarte, aquí estaré.\n\nTe deseo mucho éxito.\n\nUn saludo,\n{{usuario.nombre}}" },
  ],
  "reactivacion-secuencia": [
    { dia: 0,  asunto: "{{nombre}}, han pasado unos meses",        mensaje: "Hola {{nombre}},\n\nQuería dar señales de vida y saber cómo estás. Si hay algo en lo que pueda ayudarte, aquí estoy.\n\nUn saludo,\n{{usuario.nombre}}" },
    { dia: 14, asunto: "¿Puedo ayudarte con algo, {{nombre}}?",    mensaje: "Hola {{nombre}},\n\nTe escribí hace unas semanas y no supe de ti. Lo entiendo perfectamente.\n\nSi en algún momento necesitas ayuda con algo, ya sabes donde encontrarme.\n\nUn saludo,\n{{usuario.nombre}}" },
  ],
  "seguimiento-presupuesto": [
    { dia: 3,  asunto: "¿Has podido revisar la propuesta, {{nombre}}?",           mensaje: "Hola {{nombre}},\n\nHan pasado unos días desde que te envié la propuesta y quería saber si tuviste oportunidad de revisarla.\n\nSi tienes alguna pregunta o quieres ajustar algo, dímelo.\n\nUn saludo,\n{{usuario.nombre}}" },
    { dia: 7,  asunto: "{{nombre}}, ¿hay algo que no encaja en la propuesta?",    mensaje: "Hola {{nombre}},\n\nQuería asegurarme de que no quedó ninguna duda sin resolver. A veces hay detalles que no quedan del todo claros en un documento.\n\n¿Hablamos 15 minutos esta semana?\n\nUn saludo,\n{{usuario.nombre}}" },
    { dia: 12, asunto: "La propuesta caduca pronto, {{nombre}}",                   mensaje: "Hola {{nombre}},\n\nLa propuesta que te envié caduca en unos días. Quería avisarte por si te había pasado desapercibido.\n\nSi no es el momento, sin problema — puedo preparar una nueva cuando lo necesites.\n\nUn saludo,\n{{usuario.nombre}}" },
  ],
  "desde-cero-secuencia": [],
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const { can } = usePlan()
  const [activeTab, setActiveTab] = useState("resumen")
  const [modalCampana, setModalCampana] = useState(false)
  const [pasoModal, setPasoModal] = useState<1|2|3|4|5>(1)
  const [tipoCampana, setTipoCampana] = useState<CampanaTipo | null>(null)
  const [audienciaSeleccionada, setAudienciaSeleccionada] = useState<string | null>(null)
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<{ id: string; titulo: string; desc?: string } | null>(null)
  const [campanaForm, setCampanaForm] = useState<CampanaForm>({
    nombre: "",
    asunto: "",
    mensaje: "",
    fechaEnvio: "ahora",
    fechaProgramada: "",
    horaProgramada: "09:00",
    trigger: "lead-sin-respuesta",
    diasEspera: 7,
  })
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false)
  const [nombrePlantilla, setNombrePlantilla] = useState("")
  const [viendoMisPlantillas, setViendoMisPlantillas] = useState(false)
  const [subMenuSeguimiento, setSubMenuSeguimiento] = useState(false)
  const [misPlantillas, setMisPlantillas] = useState<Array<{
    id: string
    nombre: string
    asunto: string
    mensaje: string
    tipo: string
    creadaEn: string
  }>>([])

  if (!can("emailMarketing")) return <UpgradeWall feature="Email Marketing" requiredPlan="Business" />

  function handleNuevaCampana() {
    setActiveTab("campanas")
    setModalCampana(true)
  }

  function resetModal() {
    setModalCampana(false)
    setTipoCampana(null)
    setAudienciaSeleccionada(null)
    setPlantillaSeleccionada(null)
    setPasoModal(1)
    setCampanaForm({
      nombre: "",
      asunto: "",
      mensaje: "",
      fechaEnvio: "ahora",
      fechaProgramada: "",
      horaProgramada: "09:00",
      trigger: "lead-sin-respuesta",
      diasEspera: 7,
    })
    setViendoMisPlantillas(false)
    setSubMenuSeguimiento(false)
    setGuardandoPlantilla(false)
    setNombrePlantilla("")
  }

  const misPlantillasCard = { id: "mis-plantillas", icon: Bookmark, iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]", titulo: "Mis plantillas", desc: misPlantillas.length > 0 ? `${misPlantillas.length} guardada${misPlantillas.length !== 1 ? "s" : ""}` : "Guarda tus plantillas para reutilizarlas", preview: misPlantillas.length > 0 ? misPlantillas[0].asunto : "Aún no tienes plantillas guardadas" }
  const desdeCeroId = tipoCampana === "secuencia" ? "desde-cero-secuencia" : tipoCampana === "automatica" ? "automatica-cero" : "desde-cero"
  const desdeCeroCard = { id: desdeCeroId, icon: FileText, iconBg: "bg-slate-100", iconColor: "text-slate-500", titulo: "Desde cero", desc: "Escribe tu propio email sin plantilla previa", preview: "" }

  const PLANTILLAS_BASE: Record<string, Array<{ id: string; icon: LucideIcon; iconBg: string; iconColor: string; titulo: string; desc: string; preview: string }>> = {
    "todos-contactos": [
      { id: "tc-novedad",        icon: Bell,         iconBg: "bg-blue-50",      iconColor: "text-blue-600",     titulo: "Novedad o anuncio",       desc: "Comunica algo nuevo antes de anunciarlo a todo el mundo",           preview: "Quería contarte algo que creo que puede interesarte directamente..." },
      { id: "tc-valor",          icon: Lightbulb,    iconBg: "bg-yellow-50",    iconColor: "text-yellow-600",   titulo: "Contenido de valor",      desc: "Aporta algo útil sin pedir nada a cambio",                          preview: "No te escribo para venderte nada. Hoy solo quería compartir algo..." },
      { id: "tc-oferta",         icon: Gift,         iconBg: "bg-orange-50",    iconColor: "text-orange-600",   titulo: "Oferta especial",         desc: "Una propuesta con fecha límite para toda tu base de contactos",     preview: "Durante las próximas dos semanas tenemos una propuesta especial..." },
      { id: "tc-evento",         icon: CalendarCheck,iconBg: "bg-purple-50",    iconColor: "text-purple-600",   titulo: "Invitación a evento",     desc: "Invita a un webinar, taller o sesión gratuita",                     preview: "El próximo [fecha] organizo algo y quería invitarte..." },
      { id: "tc-precios",        icon: Receipt,      iconBg: "bg-slate-100",    iconColor: "text-slate-600",    titulo: "Aviso cambio de precios", desc: "Notifica antes de actualizar tus tarifas — da margen para decidir", preview: "A partir del [fecha] vamos a actualizar nuestros precios..." },
      { id: "tc-referidos",      icon: Handshake,    iconBg: "bg-[#E1F5EE]",   iconColor: "text-[#1FA97A]",    titulo: "Pedir referidos",         desc: "Pide a tus contactos que te recomienden a alguien",                 preview: "Una de las mejores cosas que me pueden pasar es que alguien como tú..." },
      { id: "tc-encuesta",       icon: HelpCircle,   iconBg: "bg-purple-50",    iconColor: "text-purple-500",   titulo: "Encuesta rápida",         desc: "Una pregunta concreta para mejorar tu negocio",                     preview: "Estoy mejorando cómo trabajo y tu opinión me ayudaría mucho..." },
      { id: "tc-balance",        icon: BarChart3,    iconBg: "bg-slate-100",    iconColor: "text-slate-600",    titulo: "Balance o resumen",       desc: "Cierra el año o un periodo con honestidad y contexto",              preview: "Se acaba el año y quería hacer una pausa para reflexionar..." },
      { id: "tc-newsletter",     icon: Newspaper,    iconBg: "bg-blue-50",      iconColor: "text-blue-600",     titulo: "Newsletter mensual",      desc: "Resumen de lo más relevante del mes",                               preview: "Aquí va un resumen de lo más relevante de este mes..." },
      { id: "tc-disponibilidad", icon: CheckCircle,  iconBg: "bg-[#E1F5EE]",   iconColor: "text-[#1FA97A]",    titulo: "Tengo disponibilidad",    desc: "Avisa cuando tienes hueco antes de abrirlo al público general",     preview: "A partir de [mes] tengo disponibilidad y quería avisarte antes..." },
    ],
    "todos-clientes": [
      { id: "cl-novedad",         icon: Bell,         iconBg: "bg-blue-50",     iconColor: "text-blue-600",     titulo: "Novedad en el servicio",   desc: "Comparte una mejora o nuevo servicio con tus clientes actuales",       preview: "Como cliente ya sabes cómo trabajamos. Quería contarte algo nuevo..." },
      { id: "cl-oferta",          icon: Gift,         iconBg: "bg-orange-50",   iconColor: "text-orange-600",   titulo: "Oferta exclusiva",         desc: "Una propuesta reservada solo para quienes ya han confiado en ti",      preview: "Hay clientes con los que da gusto trabajar, y tú eres uno de ellos..." },
      { id: "cl-renovacion",      icon: RotateCcw,    iconBg: "bg-slate-100",   iconColor: "text-slate-600",    titulo: "Propuesta de renovación",  desc: "Revisa la relación y propón continuar con más sentido",                preview: "Ya casi llevamos [tiempo] trabajando juntos y quería hacer una pausa..." },
      { id: "cl-agradecimiento",  icon: Heart,        iconBg: "bg-rose-50",     iconColor: "text-rose-600",     titulo: "Agradecimiento",           desc: "Cierra un proyecto con una nota personal que va más allá de la factura",preview: "Ahora que hemos terminado quería escribirte algo más allá de la factura..." },
      { id: "cl-caso-exito",      icon: Trophy,       iconBg: "bg-amber-50",    iconColor: "text-amber-600",    titulo: "Caso de éxito",            desc: "Comparte un proyecto reciente relevante para este cliente",             preview: "Hace unas semanas terminé algo que creo que tiene relación con tu caso..." },
      { id: "cl-valor",           icon: Lightbulb,    iconBg: "bg-yellow-50",   iconColor: "text-yellow-600",   titulo: "Consejo de valor",         desc: "Un aprendizaje útil específico para el perfil de este cliente",         preview: "Trabajando con negocios como el tuyo me encuentro con patrones..." },
      { id: "cl-referido",        icon: Handshake,    iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#1FA97A]",    titulo: "Pedir referido",           desc: "Pide a clientes satisfechos que te recomienden a alguien similar",      preview: "La mayoría de mis mejores clientes han llegado por recomendación..." },
      { id: "cl-encuesta",        icon: HelpCircle,   iconBg: "bg-purple-50",   iconColor: "text-purple-500",   titulo: "Encuesta de satisfacción", desc: "Pregunta honestamente qué mejorarían — antes de que se vayan",          preview: "Llevo un tiempo sin preguntarte directamente cómo estás viendo nuestra colaboración..." },
      { id: "cl-upsell",          icon: Rocket,       iconBg: "bg-blue-50",     iconColor: "text-blue-500",     titulo: "Servicio adicional",       desc: "Propón un servicio complementario con contexto real del cliente",        preview: "Trabajar contigo me ha dado contexto suficiente para identificar algo más..." },
      { id: "cl-disponibilidad",  icon: CheckCircle,  iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#1FA97A]",    titulo: "Tengo disponibilidad",     desc: "Avisa a clientes con los que puedas retomar algo pendiente",            preview: "El próximo mes tengo disponibilidad y pensé en ti..." },
    ],
    "todos-leads": [
      { id: "ld-seguimiento",  icon: Mail,         iconBg: "bg-blue-50",     iconColor: "text-blue-600",   titulo: "Seguimiento de propuesta",  desc: "Para leads que recibieron tu propuesta y no han respondido",     preview: "Han pasado unos días desde que te envié la propuesta y quería saber..." },
      { id: "ld-caso-exito",   icon: Trophy,       iconBg: "bg-amber-50",    iconColor: "text-amber-600",  titulo: "Caso de éxito relevante",   desc: "Comparte un caso similar al suyo para generar confianza",         preview: "Mientras revisaba tu propuesta pensé en un proyecto similar..." },
      { id: "ld-objeciones",   icon: HelpCircle,   iconBg: "bg-purple-50",   iconColor: "text-purple-500", titulo: "Resolver objeciones",       desc: "Abre el diálogo sobre lo que realmente les frena",                preview: "A veces cuando una propuesta no avanza hay algo que no se ha dicho..." },
      { id: "ld-urgencia",     icon: Clock,        iconBg: "bg-red-50",      iconColor: "text-red-500",    titulo: "Urgencia / caducidad",      desc: "Avisa que la propuesta tiene fecha límite de validez",            preview: "Quería avisarte de que la propuesta tiene validez hasta el [fecha]..." },
      { id: "ld-social-proof", icon: Star,         iconBg: "bg-amber-50",    iconColor: "text-amber-500",  titulo: "Prueba social",             desc: "Comparte un testimonio de un cliente en situación similar",       preview: "Sé que tomar una decisión sin conocerme puede generar dudas..." },
      { id: "ld-llamada",      icon: MessageSquare,iconBg: "bg-blue-50",     iconColor: "text-blue-500",   titulo: "Proponer llamada",          desc: "Propón 20 minutos de conversación directa para desatascar",       preview: "Cruzar emails tiene sus límites. Creo que en 20 minutos podemos..." },
      { id: "ld-demo",         icon: Eye,          iconBg: "bg-slate-100",   iconColor: "text-slate-600",  titulo: "Muestra gratuita",          desc: "Ofrece algo concreto sin compromiso para que vean cómo trabajas",  preview: "A veces la mejor forma de ver si algo encaja es verlo funcionando..." },
      { id: "ld-valor",        icon: Lightbulb,    iconBg: "bg-yellow-50",   iconColor: "text-yellow-600", titulo: "Valor sin presión",         desc: "Aporta algo útil mientras valoran tu propuesta",                  preview: "No te escribo para presionarte. Solo quería dejarte algo útil..." },
      { id: "ld-propuesta",    icon: FileText,     iconBg: "bg-slate-100",   iconColor: "text-slate-600",  titulo: "Propuesta revisada",        desc: "Ajusta la propuesta y explica por qué los cambios tienen sentido", preview: "He estado pensando en tu situación y he ajustado la propuesta..." },
      { id: "ld-ultimo",       icon: DoorOpen,     iconBg: "bg-red-50",      iconColor: "text-red-500",    titulo: "Último seguimiento",        desc: "El mensaje final, sin presión, que deja la puerta abierta",       preview: "No quiero molestarte más, así que este es mi último mensaje..." },
    ],
    "clientes-inactivos": [
      { id: "ci-retoma",          icon: UserCheck,    iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Retomar contacto",          desc: "Rompe el silencio de forma natural y sin presión",                   preview: "Han pasado meses sin escribirte y no quería que pasara más tiempo..." },
      { id: "ci-oferta",          icon: Gift,         iconBg: "bg-orange-50",  iconColor: "text-orange-600", titulo: "Oferta de reactivación",    desc: "Una propuesta especial solo para quienes ya trabajaron contigo",     preview: "Para clientes con los que hemos trabajado antes tengo algo especial..." },
      { id: "ci-novedad",         icon: Bell,         iconBg: "bg-blue-50",    iconColor: "text-blue-600",   titulo: "Qué hay de nuevo",          desc: "Comparte lo que ha cambiado desde la última vez que trabajasteis",   preview: "Desde que trabajamos juntos han pasado cosas. Quería contarte..." },
      { id: "ci-nuevo-servicio",  icon: Sparkles,     iconBg: "bg-purple-50",  iconColor: "text-purple-600", titulo: "Nuevo servicio",            desc: "Preséntale algo que ahora ofreces y que puede ser relevante",        preview: "Quería contarte que hemos añadido algo nuevo que pensé en ti..." },
      { id: "ci-mercado",         icon: HelpCircle,   iconBg: "bg-purple-50",  iconColor: "text-purple-500", titulo: "¿Sigues activo?",           desc: "Pregunta directa para saber si tiene sentido seguir en contacto",    preview: "Llevo un tiempo sin saber de ti y quería preguntarte directamente..." },
      { id: "ci-descuento",       icon: Receipt,      iconBg: "bg-slate-100",  iconColor: "text-slate-600",  titulo: "Descuento especial",        desc: "Ofrece condiciones preferenciales para clientes que vuelven",        preview: "Para clientes que trabajaron conmigo antes tengo algo exclusivo..." },
      { id: "ci-caso",            icon: Trophy,       iconBg: "bg-amber-50",   iconColor: "text-amber-600",  titulo: "Nuevo caso de éxito",       desc: "Un proyecto reciente relevante que puede hacerle reconsiderar",      preview: "Hace unas semanas terminé algo relacionado con lo que hacíamos juntos..." },
      { id: "ci-feedback",        icon: MessageCircle,iconBg: "bg-blue-50",    iconColor: "text-blue-500",   titulo: "¿Qué pasó?",               desc: "Pregunta honestamente si hubo algo que no salió como esperaban",     preview: "Llevo un tiempo pensando en por qué no hemos vuelto a trabajar juntos..." },
      { id: "ci-saludo",          icon: MessageSquare,iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Solo saludar",              desc: "Un contacto sin agenda ni propuesta — solo mantener la relación",    preview: "No tengo ninguna propuesta ni nada que venderte. Solo quería decir hola..." },
      { id: "ci-directa",         icon: Target,       iconBg: "bg-red-50",     iconColor: "text-red-500",    titulo: "Propuesta directa",         desc: "Pregunta directo si hay algo en lo que puedas ayudar ahora",         preview: "Voy al grano: quería preguntarte si hay algo en marcha en lo que pueda ayudarte..." },
    ],
    "leads-frios": [
      { id: "lf-suave",     icon: Mail,         iconBg: "bg-pink-50",    iconColor: "text-pink-600",   titulo: "Seguimiento suave",          desc: "Un toque sin presión para quien no respondió al primer mensaje",      preview: "Te escribí hace unos días y no supe de ti. Lo entiendo perfectamente..." },
      { id: "lf-relevante", icon: HelpCircle,   iconBg: "bg-purple-50",  iconColor: "text-purple-500", titulo: "¿Sigue siendo relevante?",   desc: "Pregunta directa para saber si la necesidad sigue en pie",            preview: "Quería preguntarte directamente: ¿sigue siendo relevante lo que hablamos?" },
      { id: "lf-valor",     icon: Lightbulb,    iconBg: "bg-yellow-50",  iconColor: "text-yellow-600", titulo: "Valor sin presión",          desc: "Aporta algo útil relacionado con su problema mientras esperas",       preview: "No te escribo para presionarte. Mientras valoras qué hacer..." },
      { id: "lf-angulo",    icon: RotateCcw,    iconBg: "bg-slate-100",  iconColor: "text-slate-600",  titulo: "Nuevo ángulo",               desc: "Replantea la propuesta desde una perspectiva diferente",              preview: "He estado pensando en lo que hablamos y creo que lo enfoqué mal..." },
      { id: "lf-referencia",icon: Trophy,       iconBg: "bg-amber-50",   iconColor: "text-amber-600",  titulo: "Cliente similar",            desc: "Comparte el caso de alguien con un problema muy parecido al suyo",    preview: "Mientras esperaba tu respuesta me acordé de alguien en tu misma situación..." },
      { id: "lf-friccion",  icon: Shuffle,      iconBg: "bg-slate-100",  iconColor: "text-slate-500",  titulo: "¿Qué te frena?",            desc: "Pregunta directa para identificar la barrera real de la decisión",    preview: "Quiero ser directo: quería entender qué es lo que frena la decisión..." },
      { id: "lf-ultima",    icon: DoorOpen,     iconBg: "bg-red-50",     iconColor: "text-red-500",    titulo: "Última llamada",             desc: "El mensaje final antes de cerrar el seguimiento",                     preview: "No quiero molestarte más sobre esto, así que este es mi último mensaje..." },
      { id: "lf-silencio",  icon: MessageCircle,iconBg: "bg-blue-50",    iconColor: "text-blue-500",   titulo: "Romper el silencio",         desc: "Pregunta si dijiste algo que no encajó bien",                        preview: "Llevo un tiempo sin saber de ti y empiezo a pensar que algo no encajó..." },
      { id: "lf-objecion",  icon: AlertCircle,  iconBg: "bg-orange-50",  iconColor: "text-orange-600", titulo: "Resolver la objeción",       desc: "Anticipa y responde la duda más frecuente en tu proceso de venta",    preview: "Cuando una propuesta no avanza suele haber una duda que no se ha dicho..." },
      { id: "lf-archivo",   icon: FolderOpen,   iconBg: "bg-slate-100",  iconColor: "text-slate-500",  titulo: "¿Lo dejamos aquí?",          desc: "Da la opción de cerrar o retomar — respeto total, respuesta clara",   preview: "Quiero ser respetuoso con tu tiempo. ¿Lo dejamos aquí o retomamos?" },
    ],
    "clientes-vip": [
      { id: "vip-anticipado",    icon: Zap,         iconBg: "bg-amber-50",   iconColor: "text-amber-600",  titulo: "Acceso anticipado",         desc: "Dales acceso a algo antes que al resto como señal de privilegio",     preview: "Antes de anunciarlo públicamente, quería darte acceso anticipado..." },
      { id: "vip-oferta",        icon: Star,        iconBg: "bg-purple-50",  iconColor: "text-purple-600", titulo: "Oferta VIP exclusiva",      desc: "Una propuesta que no está en ningún sitio público ni para nadie más", preview: "Hay clientes con los que la relación va más allá de lo transaccional..." },
      { id: "vip-evento",        icon: CalendarCheck,iconBg: "bg-blue-50",   iconColor: "text-blue-600",   titulo: "Invitación privada",        desc: "Invitación a un espacio reducido y selecto solo para tu inner circle",preview: "Organizo algo con un grupo muy reducido y quería invitarte..." },
      { id: "vip-revision",      icon: BarChart3,   iconBg: "bg-slate-100",  iconColor: "text-slate-600",  titulo: "Revisión estratégica",      desc: "Ofrece una sesión de revisión gratuita como servicio de alto valor",   preview: "Quería proponerte una sesión de revisión de lo que hemos construido..." },
      { id: "vip-expansion",     icon: Rocket,      iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Propuesta de expansión",    desc: "Propón dar el siguiente paso en la relación hacia algo más ambicioso", preview: "Llevo tiempo pensando en algo que todavía no hemos explorado juntos..." },
      { id: "vip-agradecimiento",icon: Heart,       iconBg: "bg-rose-50",    iconColor: "text-rose-600",   titulo: "Agradecimiento especial",   desc: "Reconoce explícitamente su valor como cliente — sin ninguna agenda",   preview: "Quería escribirte sin ningún motivo comercial. Llevamos tiempo juntos y..." },
      { id: "vip-regalo",        icon: Gift,        iconBg: "bg-orange-50",  iconColor: "text-orange-600", titulo: "Regalo o bonus",            desc: "Envía algo de valor sin condiciones como gesto de reciprocidad",       preview: "Quería enviarte algo como agradecimiento por este tiempo juntos..." },
      { id: "vip-referidos",     icon: Handshake,   iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Pedir referidos",           desc: "Pide que te recomienden a alguien de su mismo nivel",                 preview: "Los mejores clientes que tengo han llegado por recomendación de clientes como tú..." },
      { id: "vip-partnership",   icon: Link2,       iconBg: "bg-blue-50",    iconColor: "text-blue-500",   titulo: "Propuesta de colaboración", desc: "Explora una forma de trabajar juntos que va más allá del cliente-proveedor", preview: "Llevo tiempo dándole vueltas a algo y quería planteártelo directamente..." },
      { id: "vip-exclusivo",     icon: Snowflake,   iconBg: "bg-slate-100",  iconColor: "text-slate-500",  titulo: "Contenido exclusivo",       desc: "Comparte algo que no publicas y que sabes que les va a servir",        preview: "Quería compartir algo que no comparto públicamente..." },
    ],
    "nuevos-clientes": [
      { id: "nc-bienvenida",    icon: UserCheck,    iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Bienvenida cálida",        desc: "El primer email que reciben — marca el tono de toda la relación",    preview: "Quería empezar con el pie derecho. Gracias por elegirme..." },
      { id: "nc-primeros-pasos",icon: ArrowRight,   iconBg: "bg-blue-50",   iconColor: "text-blue-600",   titulo: "Primeros pasos",           desc: "Explica qué va a pasar ahora y qué necesitas de ellos",              preview: "Ahora que hemos empezado, quería darte claridad sobre cómo van a ir las cosas..." },
      { id: "nc-recursos",      icon: Bookmark,     iconBg: "bg-blue-50",   iconColor: "text-blue-500",   titulo: "Recursos útiles",          desc: "Comparte materiales para que saquen más partido desde el principio",  preview: "Mientras arrancamos, quería dejarte algunos recursos útiles..." },
      { id: "nc-proceso",       icon: Code2,        iconBg: "bg-slate-100", iconColor: "text-slate-600",  titulo: "Así trabajamos",           desc: "Explica tu forma de trabajar para evitar malentendidos después",      preview: "Antes de que empecemos de lleno, quería explicarte cómo funciono..." },
      { id: "nc-semana1",       icon: CalendarCheck,iconBg: "bg-purple-50", iconColor: "text-purple-500", titulo: "Check-in semana 1",        desc: "Primera revisión rápida para detectar cualquier fricción temprana",   preview: "Ya llevamos una semana trabajando juntos y quería hacer una pausa..." },
      { id: "nc-mes1",          icon: TrendingUp,   iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Check-in mes 1",           desc: "Primer balance real de cómo está yendo la colaboración",              preview: "Ya llevamos un mes y quería hacer un check-in real..." },
      { id: "nc-opinion",       icon: MessageCircle,iconBg: "bg-blue-50",   iconColor: "text-blue-500",   titulo: "Primera opinión",          desc: "Pide feedback honesto mientras todavía pueden cambiarse cosas",       preview: "Quería pedirte algo que para mí tiene mucho valor: tu opinión honesta..." },
      { id: "nc-ayuda",         icon: Users,        iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "¿Puedo ayudarte más?",     desc: "Identifica si hay otras necesidades más allá de lo que está en marcha",preview: "Más allá de lo que estamos haciendo juntos, quería preguntarte algo más..." },
      { id: "nc-referidos",     icon: Handshake,    iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "¿Conoces a alguien?",      desc: "Pide un referido una vez que ya están satisfechos con el inicio",     preview: "Sé que llevamos poco tiempo, pero si lo que hacemos te está sirviendo..." },
      { id: "nc-hito",          icon: Trophy,       iconBg: "bg-amber-50",  iconColor: "text-amber-600",  titulo: "Primer resultado",         desc: "Reconoce el primer hito conseguido juntos — por pequeño que sea",     preview: "Quería escribirte para reconocer algo: [primer resultado conseguido]..." },
    ],
  }

  const plantillasActuales = [
    ...(PLANTILLAS_BASE[audienciaSeleccionada ?? "todos-contactos"] ?? PLANTILLAS_BASE["todos-contactos"]),
    desdeCeroCard,
    misPlantillasCard,
  ]

  const audienciaLabel = audienciaSeleccionada?.replace(/-/g, " ") ?? ""

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Marketing</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Alcanzaste 2.722 personas este mes · 68.4% de apertura media
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:border-slate-300 transition-colors shadow-sm">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
          <button
            onClick={handleNuevaCampana}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva campaña
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 -mt-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-[13px] font-medium whitespace-nowrap relative transition-all duration-150",
                  active ? "text-[#1FA97A]" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {"badge" in tab && tab.badge && (
                  <span className="px-1.5 py-0.5 bg-[#1FA97A] text-white text-[9px] font-bold rounded-full leading-none">
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1FA97A] rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "resumen"    && <TabResumen setActiveTab={setActiveTab} onNuevaCampana={handleNuevaCampana} />}
      {activeTab === "campanas"   && <TabCampanas onNuevaCampana={handleNuevaCampana} />}
      {activeTab === "newsletter" && <TabNewsletter />}
      {activeTab === "contenido"  && <TabContenidoIA />}
      {activeTab === "audiencias" && <TabAudiencias />}
      {activeTab === "analitica"  && <TabAnalitica />}
      {activeTab === "landings"   && <TabLandings />}

      {/* ── MODAL ÚNICO — Crear campaña (5 pasos) ─────────────────────────── */}
      {modalCampana && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={resetModal} />

          <div className={cn(
            "relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh]",
            pasoModal === 3 ? "max-w-5xl" : "max-w-2xl"
          )}>

            {/* Header fijo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                {pasoModal > 1 && (
                  <button
                    onClick={() => setPasoModal(p => (p - 1) as 1|2|3|4|5)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 text-slate-500" />
                  </button>
                )}
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">
                    {pasoModal === 1 && "Crear campaña"}
                    {pasoModal === 2 && "¿A quién va dirigida?"}
                    {pasoModal === 3 && "Elige una plantilla"}
                    {pasoModal === 4 && "Edita el contenido"}
                    {pasoModal === 5 && "Revisa y envía"}
                  </h2>
                  {tipoCampana && pasoModal > 1 && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#1FA97A] font-medium">
                        {tipoCampana === "puntual" ? "Puntual" : tipoCampana === "automatica" ? "Automática" : "Secuencia"}
                      </span>
                      {audienciaSeleccionada && pasoModal > 2 && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-400 capitalize">{audienciaLabel}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Step indicators */}
                <div className="flex items-center gap-1">
                  {([1,2,3,4,5] as const).map(p => (
                    <div
                      key={p}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        p === pasoModal ? "w-6 bg-[#1FA97A]" : p < pasoModal ? "w-3 bg-[#1FA97A]/40" : "w-3 bg-slate-200"
                      )}
                    />
                  ))}
                </div>
                <button onClick={resetModal} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* PASO 1 — TIPO */}
              {pasoModal === 1 && (
                <div className="space-y-3">
                  {[
                    { id: "puntual" as const,    iconBg: "bg-[#E1F5EE]", titulo: "Campaña puntual",     color: "hover:border-[#1FA97A] hover:bg-[#E1F5EE]/20",   descripcion: "Un email enviado ahora o programado a una fecha concreta. Ideal para anuncios, ofertas o comunicaciones importantes.", ejemplos: ["Anuncio de subida de precios", "Oferta de temporada", "Novedad en tus servicios"] },
                    { id: "automatica" as const,  iconBg: "bg-blue-50",   titulo: "Campaña automática",  color: "hover:border-blue-400 hover:bg-blue-50/30",       descripcion: "Se envía sola cuando ocurre algo en tu negocio. Sin que tengas que hacer nada. Trabaja por ti mientras duermes.",    ejemplos: ["Lead sin respuesta 7 días",   "Cliente inactivo 90 días", "Factura vencida sin pagar"] },
                    { id: "secuencia" as const,   iconBg: "bg-purple-50", titulo: "Secuencia de emails", color: "hover:border-purple-400 hover:bg-purple-50/30",   descripcion: "Serie de emails enviados automáticamente en el tiempo. Email 1 el día 0, Email 2 el día 3, Email 3 el día 7...",   ejemplos: ["Bienvenida a nuevo lead (3 emails)", "Seguimiento de presupuesto", "Onboarding cliente nuevo"] },
                  ].map(tipo => (
                    <button
                      key={tipo.id}
                      onClick={() => { setTipoCampana(tipo.id); setPasoModal(2) }}
                      className={cn("w-full text-left p-4 rounded-2xl border-2 border-slate-200 transition-all duration-150 group", tipo.color)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", tipo.iconBg)}>
                          {tipo.id === "puntual"    && <Megaphone className="h-5 w-5 text-[#1FA97A]" />}
                          {tipo.id === "automatica" && <Zap className="h-5 w-5 text-blue-600" />}
                          {tipo.id === "secuencia"  && <ArrowRight className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[15px] font-bold text-slate-900">{tipo.titulo}</span>
                          </div>
                          <p className="text-[12px] text-slate-500 mb-2 leading-relaxed">{tipo.descripcion}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tipo.ejemplos.map((ej, j) => (
                              <span key={j} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-lg">{ej}</span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* PASO 2 — AUDIENCIA */}
              {pasoModal === 2 && (
                <div className="space-y-2">
                  {[
                    { id: "todos-contactos",    label: "Todos los contactos",        count: 70,  desc: "Clientes y leads activos",       tag: null },
                    { id: "todos-clientes",     label: "Todos los clientes",         count: 47,  desc: "Solo clientes activos",          tag: null },
                    { id: "todos-leads",        label: "Todos los leads",            count: 23,  desc: "Leads en pipeline",              tag: null },
                    { id: "clientes-inactivos", label: "Clientes sin compra 90d",    count: 11,  desc: "En riesgo de perderlos",         tag: "Recomendado" },
                    { id: "leads-frios",        label: "Leads sin respuesta 14d",    count: 8,   desc: "Necesitan seguimiento",          tag: null },
                    { id: "clientes-vip",       label: "Clientes VIP",               count: 8,   desc: "Facturación > 2.000€/año",      tag: null },
                    { id: "nuevos-clientes",    label: "Nuevos clientes",            count: 5,   desc: "Alta en los últimos 30 días",   tag: null },
                  ].map(seg => (
                    <button
                      key={seg.id}
                      onClick={() => setAudienciaSeleccionada(seg.id)}
                      className={cn(
                        "w-full text-left flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all duration-150",
                        audienciaSeleccionada === seg.id
                          ? "border-[#1FA97A] bg-[#E1F5EE]/30"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-slate-800">{seg.label}</span>
                          {seg.tag && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full uppercase tracking-wide">
                              {seg.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{seg.desc}</span>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[20px] font-black text-slate-700">{seg.count}</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider">contactos</div>
                      </div>
                      {audienciaSeleccionada === seg.id && (
                        <CheckCircle className="h-5 w-5 text-[#1FA97A] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* PASO 3 — PLANTILLAS */}
              {pasoModal === 3 && (
                <div className="space-y-4">
                  {subMenuSeguimiento ? (
                    /* Submenu seguimiento de propuesta */
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSubMenuSeguimiento(false)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4 text-slate-500" />
                        </button>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900">Seguimiento de propuesta</h3>
                          <p className="text-[12px] text-slate-400">Elige el tipo de seguimiento para este lead</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: "seguimiento-suave",  icon: Mail,         iconBg: "bg-blue-50",    iconColor: "text-blue-600",   titulo: "Seguimiento suave",      desc: "Un toque sin presión para quien no respondió aún" },
                          { id: "sigue-relevante",    icon: HelpCircle,   iconBg: "bg-purple-50",  iconColor: "text-purple-500", titulo: "¿Sigue siendo relevante?",desc: "Pregunta directa para saber si la necesidad sigue en pie" },
                          { id: "valor-sin-presion",  icon: Lightbulb,    iconBg: "bg-yellow-50",  iconColor: "text-yellow-600", titulo: "Valor sin presión",       desc: "Aporta algo útil mientras valoran tu propuesta" },
                          { id: "nuevo-angulo",       icon: RotateCcw,    iconBg: "bg-slate-100",  iconColor: "text-slate-600",  titulo: "Nuevo ángulo",            desc: "Replantea la propuesta desde una perspectiva diferente" },
                          { id: "cliente-similar",    icon: Trophy,       iconBg: "bg-amber-50",   iconColor: "text-amber-600",  titulo: "Cliente similar",         desc: "Comparte el caso de alguien con un reto parecido" },
                          { id: "que-te-frena",       icon: AlertCircle,  iconBg: "bg-orange-50",  iconColor: "text-orange-600", titulo: "¿Qué te frena?",          desc: "Pregunta directa para identificar la barrera real" },
                          { id: "ultima-llamada",     icon: Clock,        iconBg: "bg-red-50",     iconColor: "text-red-500",    titulo: "Última llamada",          desc: "Avisa que la propuesta tiene fecha límite de validez" },
                          { id: "romper-silencio",    icon: MessageCircle,iconBg: "bg-blue-50",    iconColor: "text-blue-500",   titulo: "Romper el silencio",       desc: "Pregunta si dijiste algo que no encajó bien" },
                          { id: "resolver-objecion",  icon: CheckCircle,  iconBg: "bg-[#E1F5EE]", iconColor: "text-[#1FA97A]",  titulo: "Resolver objeción",        desc: "Anticipa y responde la duda más frecuente" },
                          { id: "lo-dejamos-aqui",    icon: DoorOpen,     iconBg: "bg-red-50",     iconColor: "text-red-500",    titulo: "¿Lo dejamos aquí?",        desc: "Da la opción de cerrar o retomar — respeto total" },
                        ].map(p => {
                          const SIcon = p.icon
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                setPlantillaSeleccionada({ id: p.id, titulo: p.titulo })
                                setCampanaForm(f => ({
                                  ...f,
                                  asunto:  CONTENIDOS[p.id]?.asunto  ?? "",
                                  mensaje: CONTENIDOS[p.id]?.mensaje ?? "",
                                }))
                                setSubMenuSeguimiento(false)
                                setPasoModal(4)
                              }}
                              className="relative text-left p-3 rounded-2xl border-2 border-slate-200 hover:border-[#1FA97A]/50 hover:bg-[#E1F5EE]/10 transition-all group"
                            >
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", p.iconBg)}>
                                <SIcon className={cn("h-4 w-4", p.iconColor)} />
                              </div>
                              <div className="text-[12px] font-bold text-slate-800 mb-1 leading-snug">{p.titulo}</div>
                              <div className="text-[10px] text-slate-400 leading-relaxed">{p.desc}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : !viendoMisPlantillas ? (
                    /* Vista normal — grid de plantillas */
                    <>
                      <p className="text-[13px] text-slate-500">
                        Elige una base para tu campaña. Podrás editar todo el contenido en el siguiente paso.
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {plantillasActuales.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              if (p.id === "mis-plantillas") {
                                setViendoMisPlantillas(true)
                                return
                              }
                              if (p.id === "ld-seguimiento") {
                                setSubMenuSeguimiento(true)
                                return
                              }
                              setPlantillaSeleccionada(p)
                              setCampanaForm(f => ({
                                ...f,
                                asunto:  CONTENIDOS[p.id]?.asunto  ?? "",
                                mensaje: CONTENIDOS[p.id]?.mensaje ?? "",
                              }))
                              setPasoModal(4)
                            }}
                            className="relative text-left p-3 rounded-2xl border-2 border-slate-200 hover:border-[#1FA97A]/50 hover:bg-[#E1F5EE]/10 transition-all group"
                          >
                            {/* Badge contador — solo en card "Mis plantillas" */}
                            {p.id === "mis-plantillas" && misPlantillas.length > 0 && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-[#1FA97A] rounded-full flex items-center justify-center">
                                <span className="text-[9px] font-bold text-white">{misPlantillas.length}</span>
                              </div>
                            )}
                            {(() => { const PIcon = p.icon; return (
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", p.iconBg)}>
                                <PIcon className={cn("h-4 w-4", p.iconColor)} />
                              </div>
                            ) })()}
                            <div className="text-[12px] font-bold text-slate-800 mb-1 leading-snug">{p.titulo}</div>
                            <div className="text-[10px] text-slate-400 mb-1.5 leading-relaxed">{p.desc}</div>
                            {p.preview && (
                              <div className="text-[10px] text-slate-400 italic bg-slate-50 rounded-lg p-1.5 border border-slate-200 line-clamp-2 overflow-hidden">
                                &ldquo;{p.preview}&rdquo;
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Vista "Mis plantillas" */
                    <div className="space-y-4">
                      {/* Header con botón volver */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setViendoMisPlantillas(false)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4 text-slate-500" />
                        </button>
                        <div>
                          <h3 className="text-[15px] font-bold text-slate-900">Mis plantillas</h3>
                          <p className="text-[12px] text-slate-400">
                            {misPlantillas.length > 0
                              ? `${misPlantillas.length} plantilla${misPlantillas.length > 1 ? "s" : ""} guardada${misPlantillas.length > 1 ? "s" : ""}`
                              : "Aún no tienes plantillas guardadas"
                            }
                          </p>
                        </div>
                      </div>

                      {/* Estado vacío */}
                      {misPlantillas.length === 0 && (
                        <div className="text-center py-12 px-6">
                          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bookmark className="h-6 w-6 text-slate-300" />
                          </div>
                          <h4 className="text-[15px] font-bold text-slate-800 mb-2">
                            Aún no tienes plantillas guardadas
                          </h4>
                          <p className="text-[13px] text-slate-400 mb-4 leading-relaxed max-w-sm mx-auto">
                            Elige cualquier plantilla, edita el contenido y pulsa
                            &ldquo;Guardar como plantilla&rdquo; para reutilizarla en el futuro.
                          </p>
                          <button
                            onClick={() => setViendoMisPlantillas(false)}
                            className="px-4 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
                          >
                            Ver plantillas disponibles
                          </button>
                        </div>
                      )}

                      {/* Grid de mis plantillas */}
                      {misPlantillas.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {misPlantillas.map(p => (
                            <div
                              key={p.id}
                              className="relative bg-white rounded-2xl border-2 border-[#1FA97A]/20 hover:border-[#1FA97A] transition-all group overflow-hidden"
                            >
                              {/* Botón eliminar */}
                              <button
                                onClick={() => setMisPlantillas(prev => prev.filter(t => t.id !== p.id))}
                                className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white shadow-sm hover:bg-red-50 transition-all z-10"
                              >
                                <X className="h-3.5 w-3.5 text-slate-300 hover:text-red-500 transition-colors" />
                              </button>

                              {/* Contenido clickeable */}
                              <button
                                className="w-full text-left p-4"
                                onClick={() => {
                                  setPlantillaSeleccionada({ id: p.id, titulo: p.nombre })
                                  setCampanaForm(f => ({
                                    ...f,
                                    asunto: p.asunto,
                                    mensaje: p.mensaje,
                                  }))
                                  setViendoMisPlantillas(false)
                                  setPasoModal(4)
                                }}
                              >
                                <div className="w-9 h-9 rounded-xl bg-[#E1F5EE] flex items-center justify-center mb-2">
                                  <BookmarkCheck className="h-4 w-4 text-[#1FA97A]" />
                                </div>
                                <div className="text-[13px] font-bold text-slate-800 mb-1 pr-6">{p.nombre}</div>
                                <div className="text-[10px] text-[#1FA97A] font-medium mb-2">Guardada el {p.creadaEn}</div>
                                <div className="text-[10px] text-slate-400 italic bg-slate-50 rounded-lg p-2 border border-slate-200 line-clamp-2">
                                  {p.asunto ? `"${p.asunto}"` : "Sin asunto"}
                                </div>
                              </button>

                              {/* Footer con tipo */}
                              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 capitalize">
                                  {p.tipo === "puntual" ? "Puntual" : p.tipo === "automatica" ? "Automática" : "Secuencia"}
                                </span>
                                <span className="text-[10px] font-semibold text-[#1FA97A]">Usar</span>
                              </div>
                            </div>
                          ))}

                          {/* Card — crear nueva */}
                          <button
                            onClick={() => setViendoMisPlantillas(false)}
                            className="text-left p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#1FA97A]/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-center min-h-[140px]"
                          >
                            <Plus className="h-6 w-6 text-slate-300 mb-2" />
                            <div className="text-[13px] font-semibold text-slate-500">Crear nueva plantilla</div>
                            <div className="text-[11px] text-slate-400 mt-1">Elige una base y guárdala</div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PASO 4 — EDITAR CONTENIDO */}
              {pasoModal === 4 && (
                <div className="space-y-5">
                  {plantillaSeleccionada && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                        <BookmarkCheck className="h-3.5 w-3.5 text-[#1FA97A]" />
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold text-slate-700">{plantillaSeleccionada.titulo}</span>
                        <span className="text-[11px] text-slate-400 ml-2">— Edita el contenido a tu gusto</span>
                      </div>
                    </div>
                  )}

                  {/* Selector cargar plantilla propia — solo en "desde cero" */}
                  {(plantillaSeleccionada?.id === "desde-cero" || plantillaSeleccionada?.id === "automatica-cero" || plantillaSeleccionada?.id === "desde-cero-secuencia") && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-[12px] text-slate-500 flex-1">Empezando desde cero</span>
                      {misPlantillas.length > 0 ? (
                        <select
                          onChange={e => {
                            const plantilla = misPlantillas.find(p => p.id === e.target.value)
                            if (plantilla) {
                              setCampanaForm(f => ({
                                ...f,
                                asunto: plantilla.asunto,
                                mensaje: plantilla.mensaje,
                              }))
                            }
                          }}
                          defaultValue=""
                          className="text-[12px] font-medium text-[#1FA97A] border border-[#1FA97A]/30 bg-[#E1F5EE]/50 rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                        >
                          <option value="" disabled>Cargar plantilla guardada...</option>
                          {misPlantillas.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Guarda plantillas para cargarlas aquí</span>
                      )}
                    </div>
                  )}

                  {tipoCampana === "secuencia" ? (
                    <div className="space-y-4">
                      {(SECUENCIAS[plantillaSeleccionada?.id ?? ""] ?? []).map((email, i) => (
                        <div key={i}>
                          <div className="border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#1FA97A] flex items-center justify-center text-[11px] font-bold text-white">
                                  {i + 1}
                                </div>
                                <div>
                                  <span className="text-[13px] font-bold text-slate-700">Email {i + 1}</span>
                                  {email.dia > 0 && <span className="text-[11px] text-slate-400 ml-2">· Día {email.dia}</span>}
                                </div>
                              </div>
                              {i > 0 && <div className="text-[11px] text-slate-400">Si no respondió en {email.dia} días</div>}
                            </div>
                            <div className="p-4 space-y-3">
                              <input
                                defaultValue={email.asunto}
                                placeholder="Asunto del email"
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A]"
                              />
                              <textarea
                                defaultValue={email.mensaje}
                                rows={4}
                                placeholder="Contenido del email..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[13px] outline-none bg-white resize-none focus:border-[#1FA97A] font-mono leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[13px] font-medium text-slate-400 hover:border-[#1FA97A]/50 hover:text-[#1FA97A] transition-colors flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" />
                        Añadir otro email a la secuencia
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Nombre interno de la campaña
                        </label>
                        <input
                          value={campanaForm.nombre}
                          onChange={e => setCampanaForm(f => ({ ...f, nombre: e.target.value }))}
                          placeholder="Ej: Reactivación clientes Mayo"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Asunto del email
                        </label>
                        <input
                          value={campanaForm.asunto}
                          onChange={e => setCampanaForm(f => ({ ...f, asunto: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {["{{nombre}}", "{{empresa}}", "{{ultimo_proyecto}}"].map(v => (
                            <button key={v} onClick={() => setCampanaForm(f => ({ ...f, asunto: f.asunto + v }))} className="px-2 py-0.5 bg-slate-100 hover:bg-[#E1F5EE] hover:text-[#1FA97A] text-slate-500 text-[10px] font-mono rounded-lg transition-colors">{v}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mensaje</label>
                          <button className="flex items-center gap-1 text-[11px] font-medium text-[#1FA97A]">
                            <Sparkles className="h-3 w-3" />
                            Mejorar con IA
                          </button>
                        </div>
                        <textarea
                          value={campanaForm.mensaje}
                          onChange={e => setCampanaForm(f => ({ ...f, mensaje: e.target.value }))}
                          rows={10}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none bg-white resize-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 font-mono leading-relaxed"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {["{{nombre}}", "{{empresa}}", "{{ultimo_proyecto}}", "{{factura_total}}", "{{dias_sin_contacto}}", "{{usuario.nombre}}"].map(v => (
                            <button key={v} onClick={() => setCampanaForm(f => ({ ...f, mensaje: f.mensaje + v }))} className="px-2 py-0.5 bg-slate-100 hover:bg-[#E1F5EE] hover:text-[#1FA97A] text-slate-500 text-[10px] font-mono rounded-lg transition-colors">{v}</button>
                          ))}
                        </div>
                      </div>

                      {/* Guardar como plantilla */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">¿Quieres reutilizar esta plantilla?</span>
                        <button
                          onClick={() => setGuardandoPlantilla(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#E1F5EE] hover:text-[#1FA97A] text-slate-600 text-[12px] font-medium rounded-lg transition-colors"
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                          Guardar como plantilla
                        </button>
                      </div>

                      {guardandoPlantilla && (
                        <div className="p-4 bg-[#E1F5EE]/50 border border-[#1FA97A]/20 rounded-xl space-y-3">
                          <p className="text-[12px] font-semibold text-[#1FA97A]">Guardar como plantilla propia</p>
                          <div className="flex gap-2">
                            <input
                              value={nombrePlantilla}
                              onChange={e => setNombrePlantilla(e.target.value)}
                              placeholder="Nombre de la plantilla..."
                              className="flex-1 px-3 py-2 border border-[#1FA97A]/30 rounded-xl text-[13px] outline-none bg-white focus:border-[#1FA97A]"
                            />
                            <button
                              onClick={() => {
                                if (!nombrePlantilla.trim()) return
                                const nueva = {
                                  id: `custom-${Date.now()}`,
                                  nombre: nombrePlantilla,
                                  asunto: campanaForm.asunto,
                                  mensaje: campanaForm.mensaje,
                                  tipo: tipoCampana || "puntual",
                                  creadaEn: new Date().toLocaleDateString("es-ES"),
                                }
                                setMisPlantillas(p => [...p, nueva])
                                setGuardandoPlantilla(false)
                                setNombrePlantilla("")
                              }}
                              disabled={!nombrePlantilla.trim()}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors",
                                nombrePlantilla.trim()
                                  ? "bg-[#1FA97A] text-white hover:bg-[#1a9068]"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => { setGuardandoPlantilla(false); setNombrePlantilla("") }}
                              className="px-3 py-2 rounded-xl text-[13px] text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {(campanaForm.asunto || campanaForm.mensaje) && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                            </div>
                            <span className="text-[10px] text-slate-400 flex-1 text-center">Preview — así lo verá tu contacto</span>
                          </div>
                          <div className="p-4 bg-white">
                            <div className="text-[11px] text-slate-400 mb-0.5">De: <span className="font-medium text-slate-600">hola@clientlabs.io</span></div>
                            <div className="text-[11px] text-slate-400 mb-3 pb-3 border-b border-slate-100">
                              Asunto: <span className="font-semibold text-slate-700">
                                {campanaForm.asunto.replace(/{{nombre}}/g, "María García").replace(/{{empresa}}/g, "Casa Pepe")}
                              </span>
                            </div>
                            <div className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {campanaForm.mensaje
                                .replace(/{{nombre}}/g, "María García")
                                .replace(/{{empresa}}/g, "Casa Pepe")
                                .replace(/{{usuario\.nombre}}/g, "Iyan")
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* PASO 5 — RESUMEN Y TIMING */}
              {pasoModal === 5 && (
                <div className="space-y-5">
                  {tipoCampana === "puntual" && (
                    <div>
                      <h3 className="text-[14px] font-bold text-slate-900 mb-3">¿Cuándo se envía?</h3>
                      <div className="space-y-2">
                        {[
                          { id: "ahora",      titulo: "Ahora mismo",     desc: "Se envía en los próximos minutos" },
                          { id: "programado", titulo: "Programar envío", desc: "Elige fecha y hora exacta" },
                        ].map(op => (
                          <button
                            key={op.id}
                            onClick={() => setCampanaForm(f => ({ ...f, fechaEnvio: op.id }))}
                            className={cn(
                              "w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                              campanaForm.fechaEnvio === op.id
                                ? "border-[#1FA97A] bg-[#E1F5EE]/30"
                                : "border-slate-200 hover:border-slate-300"
                            )}
                          >
                            <div className="flex-1">
                              <div className="text-[13px] font-bold text-slate-800">{op.titulo}</div>
                              <div className="text-[11px] text-slate-400">{op.desc}</div>
                            </div>
                            {campanaForm.fechaEnvio === op.id && <CheckCircle className="h-5 w-5 text-[#1FA97A] flex-shrink-0" />}
                          </button>
                        ))}
                        {campanaForm.fechaEnvio === "programado" && (
                          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Fecha</label>
                              <input
                                type="date"
                                value={campanaForm.fechaProgramada}
                                onChange={e => setCampanaForm(f => ({ ...f, fechaProgramada: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Hora</label>
                              <select
                                value={campanaForm.horaProgramada}
                                onChange={e => setCampanaForm(f => ({ ...f, horaProgramada: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A]"
                              >
                                {["08:00","09:00","10:00","11:00","12:00","17:00","18:00","19:00"].map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0B1F2A] rounded-2xl p-5">
                    <span className="text-[11px] font-bold text-[#1FA97A] uppercase tracking-wider block mb-4">
                      Resumen de la campaña
                    </span>
                    <div className="space-y-3">
                      {[
                        { label: "Tipo",      valor: tipoCampana === "puntual" ? "Campaña puntual" : tipoCampana === "automatica" ? "Automática" : "Secuencia de emails" },
                        { label: "Audiencia", valor: audienciaLabel || "—" },
                        { label: "Plantilla", valor: plantillaSeleccionada?.titulo ?? "—" },
                        { label: "Asunto",    valor: campanaForm.asunto || "Sin asunto" },
                        ...(tipoCampana === "puntual" ? [{
                          label: "Envío",
                          valor: campanaForm.fechaEnvio === "ahora"
                            ? "Inmediato"
                            : `${campanaForm.fechaProgramada} a las ${campanaForm.horaProgramada}`,
                        }] : []),
                      ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                          <span className="text-[11px] text-slate-500 flex-shrink-0">{item.label}</span>
                          <span className="text-[12px] font-semibold text-white text-right capitalize">{item.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer fijo */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
              <button
                onClick={resetModal}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              {pasoModal < 5 ? (
                <button
                  disabled={pasoModal === 2 && !audienciaSeleccionada}
                  onClick={() => setPasoModal(p => (p + 1) as 1|2|3|4|5)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors",
                    pasoModal === 2 && !audienciaSeleccionada
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-[#1FA97A] text-white hover:bg-[#1a9068]"
                  )}
                >
                  {pasoModal === 3 ? "Saltar — sin plantilla" : "Siguiente"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={resetModal}
                  className="flex-1 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1FA97A]/25"
                >
                  {tipoCampana === "puntual" && campanaForm.fechaEnvio === "ahora" ? "Enviar campaña ahora" : "Guardar campaña"}
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
