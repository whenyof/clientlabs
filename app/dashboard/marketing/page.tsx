"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { usePlan } from "@/hooks/use-plan"
import { toast } from "sonner"
import { UpgradeWall } from "@/components/ui/upgrade-wall"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmailEditor } from "@/components/email/EmailEditor"
import { TemplateGallery, SaveTemplateModal } from "@/components/email/TemplateGallery"
import {
  Megaphone, Filter, Plus, Upload, MoreHorizontal, ArrowUpRight,
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

// ── Sub-components ────────────────────────────────────────────────────────────

function EstadoBadge({ estado, label }: { estado: string; label: string }) {
  const styles: Record<string, string> = {
    activa:     "bg-[#E1F5EE] text-[#0F766E]",
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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["marketing-stats"],
    queryFn: () => fetch("/api/marketing/stats").then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  const kpis = [
    {
      label: "Contactos totales",
      valor: isLoading ? "..." : (stats?.kpis?.totalContactos ?? 0).toLocaleString("es-ES"),
      sublabel: stats?.kpis?.totalContactosDiff != null
        ? `vs mes anterior: ${stats.kpis.totalContactosDiff > 0 ? "+" : ""}${stats.kpis.totalContactosDiff}`
        : "Acumulado total",
      sublabelClass: (stats?.kpis?.totalContactosDiff ?? 0) >= 0 ? "text-[#0F766E]" : "text-red-500",
      icon: Users,
    },
    {
      label: "Emails enviados",
      valor: isLoading ? "..." : (stats?.kpis?.emailsEnviados ?? 0).toLocaleString("es-ES"),
      sublabel: "Total acumulado",
      sublabelClass: "text-slate-400",
      icon: AtSign,
    },
    {
      label: "Tasa de apertura",
      valor: isLoading ? "..." : (stats?.kpis?.emailsEnviados ?? 0) > 0 ? `${stats!.kpis.tasaApertura}%` : "—",
      sublabel: "Media de todas las campañas",
      sublabelClass: "text-slate-400",
      icon: Eye,
    },
    {
      label: "Leads generados",
      valor: isLoading ? "..." : (stats?.kpis?.leadsGenerados ?? 0).toLocaleString("es-ES"),
      sublabel: stats?.kpis?.leadsGeneradosDiff != null
        ? `vs mes anterior: ${stats.kpis.leadsGeneradosDiff > 0 ? "+" : ""}${stats.kpis.leadsGeneradosDiff}`
        : "Este mes",
      sublabelClass: (stats?.kpis?.leadsGeneradosDiff ?? 0) >= 0 ? "text-[#0F766E]" : "text-red-500",
      icon: TrendingUp,
    },
  ]

  const campanas: { id: string; nombre: string; estado: string; totalEnviados: number; totalAbiertos: number; totalClicks: number; aperturaPct: number | null }[] = stats?.campanasRecientes ?? []
  const fuentes: { nombre: string; cantidad: number; porcentaje: number }[] = stats?.fuentes ?? []

  const rendimiento = [
    { label: "Tasa de apertura",    valor: (stats?.kpis?.emailsEnviados ?? 0) > 0 ? `${stats!.kpis.tasaApertura}%` : "—", barra: stats?.kpis?.tasaApertura ?? 0, positivo: true },
    { label: "Click-through rate",  valor: (stats?.kpis?.emailsEnviados ?? 0) > 0 ? `${stats!.kpis.ctr}%` : "—",          barra: stats?.kpis?.ctr ?? 0,          positivo: true },
  ]

  const estadoLabel: Record<string, string> = { borrador: "Borrador", programada: "Programada", enviada: "Enviada", error: "Error" }
  const estadoClass: Record<string, string> = {
    programada: "bg-amber-50 text-amber-600",
    enviada: "bg-purple-50 text-purple-600",
    error: "bg-red-50 text-red-500",
    borrador: "bg-slate-100 text-slate-500",
  }

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0F766E]/40 hover:shadow-[0_2px_12px_rgba(15,118,110,0.06)] transition-all duration-200"
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

      {/* Fila 2: Campañas + Fuentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Campañas recientes — 2/3 ancho */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
              <span className="text-[13px] font-bold text-slate-800">Campañas recientes</span>
              {campanas.length > 0 && (
                <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#0F766E] text-[10px] font-bold rounded-full">{campanas.length}</span>
              )}
            </div>
            <button
              onClick={() => setActiveTab("campanas")}
              className="text-[12px] font-medium text-slate-400 hover:text-[#0F766E] transition-colors"
            >
              Ver todas
            </button>
          </div>

          {campanas.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Send className="h-8 w-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[13px] font-medium text-slate-500 mb-1">Sin campañas aún</p>
              <p className="text-[12px] text-slate-400">Crea tu primera campaña para ver el rendimiento aquí.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {campanas.map((c) => (
                <div
                  key={c.id}
                  className="px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        c.estado === "programada" ? "bg-amber-400" : c.estado === "enviada" ? "bg-slate-300" : "bg-slate-200"
                      )} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#0F766E] transition-colors">{c.nombre}</div>
                        <div className="text-[11px] text-slate-400">{estadoLabel[c.estado] ?? c.estado}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                      <div className="text-center">
                        <div className="text-[14px] font-bold text-slate-800">{c.totalEnviados > 0 ? c.totalEnviados : "—"}</div>
                        <div className="text-[10px] text-slate-400">enviados</div>
                      </div>
                      {c.aperturaPct !== null && (
                        <div className="w-28">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-slate-400">Apertura</span>
                            <span className="text-[12px] font-bold text-slate-700">{c.aperturaPct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#0F766E] to-[#0B8A5E]" style={{ width: `${c.aperturaPct}%` }} />
                          </div>
                        </div>
                      )}
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0", estadoClass[c.estado] ?? "bg-slate-100 text-slate-500")}>
                        {estadoLabel[c.estado] ?? c.estado}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => { setActiveTab("campanas"); onNuevaCampana() }}
              className="w-full flex items-center justify-center gap-2 text-[12px] font-semibold text-[#0F766E] hover:text-[#0E665F] transition-colors py-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva campaña
            </button>
          </div>
        </div>

        {/* Fuentes — 1/3 ancho */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-800">Fuentes de leads</span>
              <span className="text-[11px] text-slate-400">Este mes</span>
            </div>
            {fuentes.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[12px] text-slate-400">Sin leads este mes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fuentes.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] font-medium text-slate-600">{f.nombre}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[12px] font-bold text-slate-800">{f.cantidad}</span>
                        <span className="text-[10px] text-slate-400">({f.porcentaje}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#0F766E] transition-all duration-700" style={{ width: `${f.porcentaje}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: Rendimiento */}
      {(stats?.kpis?.emailsEnviados ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-bold text-slate-800">Rendimiento de campañas</span>
            <span className="text-[11px] text-slate-400">Acumulado total</span>
          </div>
          <div className="space-y-3">
            {rendimiento.map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-slate-600">{m.label}</span>
                  <span className="text-[12px] font-bold text-slate-800">{m.valor}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${Math.min(m.barra, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner IA */}
      <div className="bg-gradient-to-r from-[#0B1F2A] to-[#1a3040] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#0F766E]" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white mb-0.5">Genera contenido para tu próxima campaña</div>
            <p className="text-[12px] text-slate-400">
              Crea emails, posts y contenido personalizado para tus contactos
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("contenido")}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white text-[12px] font-semibold rounded-xl hover:bg-[#0E665F] transition-colors flex-shrink-0"
        >
          Generar ahora
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Tab: Campañas ─────────────────────────────────────────────────────────────

const COLS = "2fr 1fr 110px 80px 130px 80px 100px"

type Campaign = {
  id: string; nombre: string; asunto: string
  recipientFilter: { type: string; value?: string }
  estado: string; scheduledAt: string | null; sentAt: string | null
  totalEnviados: number; totalAbiertos: number; totalClicks: number; totalErrores: number
  createdAt: string
}

function TabCampanas({ onNuevaCampana }: { onNuevaCampana: () => void }) {
  const qc = useQueryClient()
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  const { data: campanas = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => fetch("/api/campaigns").then(r => r.json()),
    staleTime: 60_000, refetchOnWindowFocus: false, retry: 0,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/campaigns/${id}`, { method: "DELETE" }).then(r => { if (!r.ok) throw new Error() }),
    onSuccess: () => { toast.success("Campaña eliminada"); qc.invalidateQueries({ queryKey: ["campaigns"] }) },
    onError: () => toast.error("Error al eliminar"),
  })

  const sendMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/campaigns/${id}/send`, { method: "POST" }).then(r => r.json()),
    onSuccess: (data) => {
      toast.success(`Enviada a ${data.enviados} destinatarios`)
      qc.invalidateQueries({ queryKey: ["campaigns"] })
    },
    onError: () => toast.error("Error al enviar"),
  })

  const filtradas = campanas.filter((c) => {
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
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] outline-none w-64 focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all"
            />
          </div>
          <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="automatica">Automáticas</SelectItem>
              <SelectItem value="programada">Programadas</SelectItem>
              <SelectItem value="enviada">Enviadas</SelectItem>
              <SelectItem value="borrador">Borradores</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los canales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={onNuevaCampana}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0E665F] transition-colors shadow-sm shadow-[#0F766E]/20"
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
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-[13px]">Cargando campañas...</div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-[13px]">
            {campanas.length === 0 ? "Aún no tienes campañas. Crea la primera." : "No hay campañas que coincidan."}
          </div>
        ) : (
          filtradas.map((c) => {
            const aperturaRate = c.totalEnviados > 0 ? Math.round((c.totalAbiertos / c.totalEnviados) * 100) : null
            const ESTADO_LABELS: Record<string, string> = { borrador: "Borrador", programada: "Programada", enviada: "Enviada", error: "Error" }
            return (
              <div
                key={c.id}
                className="grid items-center px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer group"
                style={{ gridTemplateColumns: COLS }}
              >
                {/* Campaña */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    c.estado === "programada" ? "bg-amber-400" :
                    c.estado === "enviada"    ? "bg-slate-300" :
                    c.estado === "error"      ? "bg-red-400" :
                    "bg-slate-200"
                  )} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-[#0F766E] transition-colors">{c.nombre}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.asunto}</div>
                  </div>
                </div>
                {/* Audiencia */}
                <div>
                  <div className="text-[12px] text-slate-600 font-medium capitalize">{(c.recipientFilter as any)?.type === "all" ? "Todos los clientes" : (c.recipientFilter as any)?.type === "leads" ? "Leads" : (c.recipientFilter as any)?.type ?? "—"}</div>
                  <div className="flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3 text-slate-300" /><span className="text-[10px] text-slate-400">Email</span></div>
                </div>
                {/* Estado */}
                <div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1",
                    c.estado === "programada" ? "bg-amber-50 text-amber-600" :
                    c.estado === "enviada"    ? "bg-slate-100 text-slate-500" :
                    c.estado === "error"      ? "bg-red-50 text-red-600" :
                    "bg-slate-100 text-slate-400"
                  )}>
                    {ESTADO_LABELS[c.estado] ?? c.estado}
                  </span>
                  {c.sentAt && <div className="text-[10px] text-slate-400 mt-1">{new Date(c.sentAt).toLocaleDateString("es-ES")}</div>}
                </div>
                {/* Enviados */}
                <div className="text-center">
                  {c.totalEnviados > 0 ? <div className="text-[14px] font-bold text-slate-800">{c.totalEnviados}</div> : <span className="text-[12px] text-slate-300">—</span>}
                </div>
                {/* Apertura */}
                <div className="px-2">
                  {aperturaRate !== null ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-bold text-slate-700">{aperturaRate}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", aperturaRate >= 70 ? "bg-[#0F766E]" : aperturaRate >= 50 ? "bg-amber-400" : "bg-red-400")} style={{ width: `${aperturaRate}%` }} />
                      </div>
                    </>
                  ) : <span className="text-[12px] text-slate-300 block text-center">—</span>}
                </div>
                {/* Clicks */}
                <div className="text-center">
                  {c.totalClicks > 0 ? <div className="text-[14px] font-bold text-slate-800">{c.totalClicks}</div> : <span className="text-[12px] text-slate-300">—</span>}
                </div>
                {/* Acciones */}
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.estado !== "enviada" && (
                    <button onClick={e => { e.stopPropagation(); sendMutation.mutate(c.id) }} className="p-1.5 rounded-lg hover:bg-[#E1F5EE] transition-colors" title="Enviar ahora">
                      <Send className="h-3.5 w-3.5 text-[#0F766E]" />
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar esta campaña?")) deleteMutation.mutate(c.id) }} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors group/del" title="Eliminar">
                    <Trash2 className="h-3.5 w-3.5 text-slate-400 group-hover/del:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <span className="text-[12px] text-slate-400">
            {filtradas.length} campaña{filtradas.length !== 1 ? "s" : ""} · {filtradas.filter(c => c.estado === "enviada").length} enviadas
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
  const [showGallery, setShowGallery] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

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
            borderColor: "border-l-[#0F766E]",
            subColor: "text-[#0F766E]",
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
              className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-xl text-[12px] font-semibold hover:bg-[#0E665F] transition-colors"
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
                className="px-4 py-2.5 bg-[#0F766E] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0E665F] transition-colors"
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
                              <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
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
                                    ? "bg-[#E1F5EE] text-[#0F766E]"
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
                                <div className="text-[16px] font-black text-[#0F766E]">
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
                    className={cn("w-full rounded-t-md transition-all duration-500", i === 5 ? "bg-[#0F766E]" : "bg-slate-200")}
                    style={{ height: `${(d.val / (nlTotal || 1)) * 100}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{d.mes}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              <span className="font-bold text-[#0F766E]">{nlTotal} suscriptores</span> en total
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
                className="flex items-center justify-center gap-1.5 py-2 bg-[#E1F5EE] hover:bg-[#c8eadd] rounded-xl text-[11px] font-medium text-[#0F766E] transition-colors"
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
                  color: "bg-[#E1F5EE] text-[#0F766E]",
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
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
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Contenido
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGallery(true)}
                      className="text-[11px] font-medium text-[#0F766E] hover:underline"
                    >
                      Usar plantilla
                    </button>
                    {edicionForm.contenido && (
                      <button
                        type="button"
                        onClick={() => setShowSaveTemplate(true)}
                        className="text-[11px] font-medium text-slate-500 hover:underline"
                      >
                        Guardar como plantilla
                      </button>
                    )}
                  </div>
                </div>
                <EmailEditor
                  content={edicionForm.contenido}
                  onChange={(html) => setEdicionForm(f => ({ ...f, contenido: html }))}
                  placeholder="Escribe aquí el contenido de tu newsletter…"
                  minHeight={240}
                />
              </div>

              <TemplateGallery
                open={showGallery}
                onClose={() => setShowGallery(false)}
                onSelect={({ subject, htmlContent }) =>
                  setEdicionForm(f => ({
                    ...f,
                    asunto: f.asunto || subject,
                    contenido: htmlContent,
                  }))
                }
              />
              <SaveTemplateModal
                open={showSaveTemplate}
                onClose={() => setShowSaveTemplate(false)}
                subject={edicionForm.asunto}
                htmlContent={edicionForm.contenido}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Estado
                  </label>
                  <Select value={edicionForm.estado} onValueChange={(v) => setEdicionForm(f => ({ ...f, estado: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="enviada">Enviada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Fecha programada
                  </label>
                  <input
                    type="date"
                    value={edicionForm.programadaPara}
                    onChange={e => setEdicionForm(f => ({ ...f, programadaPara: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              {edicionForm.programadaPara && (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Hora de envío
                  </label>
                  <Select value={edicionForm.hora} onValueChange={(v) => setEdicionForm(f => ({ ...f, hora: v }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {["07:00","08:00","09:00","10:00","11:00","12:00","17:00","18:00","19:00","20:00"].map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    ? "bg-[#0F766E] text-white hover:bg-[#0E665F]"
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
    color: "text-[#0F766E]",
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
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#0F766E]/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#0F766E]/3 rounded-full" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(15,118,110,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#0F766E]/20 border border-[#0F766E]/30 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[#0F766E]" />
            </div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-widest">
              Asistente de contenido
            </span>
          </div>

          <h2 className="text-[20px] font-black text-white mb-1 leading-tight">
            Contenido que suena a ti.{" "}
            <span className="text-[#0F766E]">Escrito en segundos.</span>
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
                  ? "bg-[#0F766E] text-white shadow-sm"
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
            ? "ring-2 ring-[#0F766E]/30 border-[#0F766E]/50"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-60"
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
                  <button className="flex-1 py-2 bg-[#0F766E] text-white rounded-lg text-[11px] font-semibold hover:bg-[#0E665F] transition-colors">
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
            ? "ring-2 ring-[#0F766E]/30 border-[#0F766E]/50"
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
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-[#E1F5EE] hover:text-[#0F766E] text-[12px] text-slate-600 font-medium transition-colors border border-transparent hover:border-[#0F766E]/30"
                >
                  {tipo}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerar("email")}
              disabled={generando === "email"}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-60"
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
                <button className="flex-1 py-2 bg-[#0F766E] text-white rounded-lg text-[11px] font-semibold hover:bg-[#0E665F] transition-colors">
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
            { id: "newsletter", icon: Newspaper,  iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#0F766E]",  titulo: "Intro de newsletter", desc: "El gancho que hace que lean",      hover: "hover:bg-[#E1F5EE] hover:text-[#0F766E] hover:border-[#0F766E]/30" },
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
            <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#0F766E] hover:bg-[#0E665F] rounded-xl text-[12px] font-semibold text-white transition-colors">
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
            { icon: Mail,      iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#0F766E]",  tipo: "Email seguimiento", preview: "Hola María, te escribí hace una semana sobre...",             fecha: "Ayer",         usado: false },
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
                    <span className="px-1.5 py-0.5 bg-[#E1F5EE] text-[#0F766E] text-[9px] font-bold rounded-full">
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
        <p className="text-[13px] text-slate-500">Segmentos de contactos</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0E665F] transition-colors shadow-lg shadow-[#0F766E]/25">
          <Plus className="h-4 w-4" />
          Nuevo segmento
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users2 className="h-6 w-6 text-slate-300" />
        </div>
        <h4 className="text-[15px] font-bold text-slate-800 mb-2">Sin segmentos definidos</h4>
        <p className="text-[13px] text-slate-400">
          Los segmentos se crearán aquí cuando configures filtros de audiencia.
        </p>
      </div>
    </div>
  )
}

// ── Tab: Analítica ────────────────────────────────────────────────────────────

function TabAnalitica() {
  const { data: campanas = [], isLoading } = useQuery<{ id: string; nombre: string; estado: string; totalEnviados: number; totalAbiertos: number; totalClicks: number; sentAt: string | null }[]>({
    queryKey: ["campaigns"],
    queryFn: () => fetch("/api/campaigns").then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  const enviadas = campanas.filter(c => c.totalEnviados > 0)

  return (
    <div className="space-y-5">
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
        {isLoading ? (
          <div className="px-5 py-10 text-center text-[13px] text-slate-400">Cargando...</div>
        ) : enviadas.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <BarChart3 className="h-8 w-8 text-slate-200 mx-auto mb-3" />
            <p className="text-[13px] text-slate-400">Sin campañas enviadas aún</p>
          </div>
        ) : (
          enviadas.map((c) => {
            const apertura = c.totalEnviados > 0 ? Math.round((c.totalAbiertos / c.totalEnviados) * 100) : 0
            const ESTADO_LABELS: Record<string, string> = { borrador: "Borrador", programada: "Programada", enviada: "Enviada", error: "Error" }
            const ESTADO_STYLES: Record<string, string> = { enviada: "bg-purple-50 text-purple-600", programada: "bg-amber-50 text-amber-600", borrador: "bg-slate-100 text-slate-500" }
            return (
              <div
                key={c.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0"
              >
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{c.nombre}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", ESTADO_STYLES[c.estado] ?? "bg-slate-100 text-slate-500")}>
                    {ESTADO_LABELS[c.estado] ?? c.estado}
                  </span>
                </div>
                <span className="text-[13px] text-slate-700">{c.totalEnviados.toLocaleString("es-ES")}</span>
                <span className="text-[13px] font-semibold text-slate-700">{apertura}%</span>
                <span className="text-[13px] text-slate-700">{c.totalClicks}</span>
                <span className="text-[13px] font-black text-[#0F766E]">{(apertura * 0.04).toFixed(1)}%</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Tab: Landing Pages ────────────────────────────────────────────────────────

function TabLandings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500">Landing pages</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-xl text-[13px] font-semibold hover:bg-[#0E665F] transition-colors shadow-lg shadow-[#0F766E]/25">
          <Plus className="h-4 w-4" />
          Nueva landing
        </button>
      </div>
      <div className="bg-gradient-to-r from-[#0B1F2A] to-[#1a3040] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E]/20 flex items-center justify-center">
            <Target className="h-5 w-5 text-[#0F766E]" />
          </div>
          <div>
            <div className="text-[14px] font-bold text-white mb-0.5">Crea tu landing en 5 minutos</div>
            <p className="text-[12px] text-slate-400">
              Sin código. Con tu branding. Conectada directamente a tus leads.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white text-[12px] font-semibold rounded-xl hover:bg-[#0E665F] transition-colors flex-shrink-0">
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
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState("resumen")
  const [modalCampana, setModalCampana] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

  if (!can("emailMarketing")) return <UpgradeWall feature="Email Marketing" requiredPlan="Negocio" />

  function handleNuevaCampana() {
    setActiveTab("campanas")
    setModalCampana(true)
  }

  async function handleGuardarCampana() {
    if (!campanaForm.asunto.trim() || !campanaForm.mensaje.trim()) {
      toast.error("Escribe el asunto y el contenido antes de guardar")
      return
    }
    setIsSaving(true)
    try {
      const isAhora = tipoCampana === "puntual" && campanaForm.fechaEnvio === "ahora"
      const scheduledAt = campanaForm.fechaEnvio === "programado" && campanaForm.fechaProgramada
        ? new Date(`${campanaForm.fechaProgramada}T${campanaForm.horaProgramada}:00`).toISOString()
        : null

      const recipientFilter = {
        type: audienciaSeleccionada === "todos-contactos" ? "all" :
              audienciaSeleccionada?.startsWith("solo-leads") ? "leads" :
              "all",
      }

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: campanaForm.nombre || campanaForm.asunto,
          asunto: campanaForm.asunto,
          contenido: campanaForm.mensaje,
          recipientFilter,
          estado: scheduledAt ? "programada" : "borrador",
          scheduledAt,
        }),
      })
      if (!res.ok) throw new Error()
      const campaign = await res.json()

      if (isAhora) {
        const sendRes = await fetch(`/api/campaigns/${campaign.id}/send`, { method: "POST" })
        const sendData = await sendRes.json()
        if (sendRes.ok) {
          toast.success(`Campaña enviada a ${sendData.enviados} destinatarios`)
        } else {
          toast.error(sendData.error ?? "Error al enviar")
        }
      } else {
        toast.success(scheduledAt ? "Campaña programada correctamente" : "Campaña guardada como borrador")
      }

      qc.invalidateQueries({ queryKey: ["campaigns"] })
      resetModal()
    } catch {
      toast.error("Error al guardar la campaña")
    } finally {
      setIsSaving(false)
    }
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

  const misPlantillasCard = { id: "mis-plantillas", icon: Bookmark, iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]", titulo: "Mis plantillas", desc: misPlantillas.length > 0 ? `${misPlantillas.length} guardada${misPlantillas.length !== 1 ? "s" : ""}` : "Guarda tus plantillas para reutilizarlas", preview: misPlantillas.length > 0 ? misPlantillas[0].asunto : "Aún no tienes plantillas guardadas" }
  const desdeCeroId = tipoCampana === "secuencia" ? "desde-cero-secuencia" : tipoCampana === "automatica" ? "automatica-cero" : "desde-cero"
  const desdeCeroCard = { id: desdeCeroId, icon: FileText, iconBg: "bg-slate-100", iconColor: "text-slate-500", titulo: "Desde cero", desc: "Escribe tu propio email sin plantilla previa", preview: "" }

  const PLANTILLAS_BASE: Record<string, Array<{ id: string; icon: LucideIcon; iconBg: string; iconColor: string; titulo: string; desc: string; preview: string }>> = {
    "todos-contactos": [
      { id: "tc-novedad",        icon: Bell,         iconBg: "bg-blue-50",      iconColor: "text-blue-600",     titulo: "Novedad o anuncio",       desc: "Comunica algo nuevo antes de anunciarlo a todo el mundo",           preview: "Quería contarte algo que creo que puede interesarte directamente..." },
      { id: "tc-valor",          icon: Lightbulb,    iconBg: "bg-yellow-50",    iconColor: "text-yellow-600",   titulo: "Contenido de valor",      desc: "Aporta algo útil sin pedir nada a cambio",                          preview: "No te escribo para venderte nada. Hoy solo quería compartir algo..." },
      { id: "tc-oferta",         icon: Gift,         iconBg: "bg-orange-50",    iconColor: "text-orange-600",   titulo: "Oferta especial",         desc: "Una propuesta con fecha límite para toda tu base de contactos",     preview: "Durante las próximas dos semanas tenemos una propuesta especial..." },
      { id: "tc-evento",         icon: CalendarCheck,iconBg: "bg-purple-50",    iconColor: "text-purple-600",   titulo: "Invitación a evento",     desc: "Invita a un webinar, taller o sesión gratuita",                     preview: "El próximo [fecha] organizo algo y quería invitarte..." },
      { id: "tc-precios",        icon: Receipt,      iconBg: "bg-slate-100",    iconColor: "text-slate-600",    titulo: "Aviso cambio de precios", desc: "Notifica antes de actualizar tus tarifas — da margen para decidir", preview: "A partir del [fecha] vamos a actualizar nuestros precios..." },
      { id: "tc-referidos",      icon: Handshake,    iconBg: "bg-[#E1F5EE]",   iconColor: "text-[#0F766E]",    titulo: "Pedir referidos",         desc: "Pide a tus contactos que te recomienden a alguien",                 preview: "Una de las mejores cosas que me pueden pasar es que alguien como tú..." },
      { id: "tc-encuesta",       icon: HelpCircle,   iconBg: "bg-purple-50",    iconColor: "text-purple-500",   titulo: "Encuesta rápida",         desc: "Una pregunta concreta para mejorar tu negocio",                     preview: "Estoy mejorando cómo trabajo y tu opinión me ayudaría mucho..." },
      { id: "tc-balance",        icon: BarChart3,    iconBg: "bg-slate-100",    iconColor: "text-slate-600",    titulo: "Balance o resumen",       desc: "Cierra el año o un periodo con honestidad y contexto",              preview: "Se acaba el año y quería hacer una pausa para reflexionar..." },
      { id: "tc-newsletter",     icon: Newspaper,    iconBg: "bg-blue-50",      iconColor: "text-blue-600",     titulo: "Newsletter mensual",      desc: "Resumen de lo más relevante del mes",                               preview: "Aquí va un resumen de lo más relevante de este mes..." },
      { id: "tc-disponibilidad", icon: CheckCircle,  iconBg: "bg-[#E1F5EE]",   iconColor: "text-[#0F766E]",    titulo: "Tengo disponibilidad",    desc: "Avisa cuando tienes hueco antes de abrirlo al público general",     preview: "A partir de [mes] tengo disponibilidad y quería avisarte antes..." },
    ],
    "todos-clientes": [
      { id: "cl-novedad",         icon: Bell,         iconBg: "bg-blue-50",     iconColor: "text-blue-600",     titulo: "Novedad en el servicio",   desc: "Comparte una mejora o nuevo servicio con tus clientes actuales",       preview: "Como cliente ya sabes cómo trabajamos. Quería contarte algo nuevo..." },
      { id: "cl-oferta",          icon: Gift,         iconBg: "bg-orange-50",   iconColor: "text-orange-600",   titulo: "Oferta exclusiva",         desc: "Una propuesta reservada solo para quienes ya han confiado en ti",      preview: "Hay clientes con los que da gusto trabajar, y tú eres uno de ellos..." },
      { id: "cl-renovacion",      icon: RotateCcw,    iconBg: "bg-slate-100",   iconColor: "text-slate-600",    titulo: "Propuesta de renovación",  desc: "Revisa la relación y propón continuar con más sentido",                preview: "Ya casi llevamos [tiempo] trabajando juntos y quería hacer una pausa..." },
      { id: "cl-agradecimiento",  icon: Heart,        iconBg: "bg-rose-50",     iconColor: "text-rose-600",     titulo: "Agradecimiento",           desc: "Cierra un proyecto con una nota personal que va más allá de la factura",preview: "Ahora que hemos terminado quería escribirte algo más allá de la factura..." },
      { id: "cl-caso-exito",      icon: Trophy,       iconBg: "bg-amber-50",    iconColor: "text-amber-600",    titulo: "Caso de éxito",            desc: "Comparte un proyecto reciente relevante para este cliente",             preview: "Hace unas semanas terminé algo que creo que tiene relación con tu caso..." },
      { id: "cl-valor",           icon: Lightbulb,    iconBg: "bg-yellow-50",   iconColor: "text-yellow-600",   titulo: "Consejo de valor",         desc: "Un aprendizaje útil específico para el perfil de este cliente",         preview: "Trabajando con negocios como el tuyo me encuentro con patrones..." },
      { id: "cl-referido",        icon: Handshake,    iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#0F766E]",    titulo: "Pedir referido",           desc: "Pide a clientes satisfechos que te recomienden a alguien similar",      preview: "La mayoría de mis mejores clientes han llegado por recomendación..." },
      { id: "cl-encuesta",        icon: HelpCircle,   iconBg: "bg-purple-50",   iconColor: "text-purple-500",   titulo: "Encuesta de satisfacción", desc: "Pregunta honestamente qué mejorarían — antes de que se vayan",          preview: "Llevo un tiempo sin preguntarte directamente cómo estás viendo nuestra colaboración..." },
      { id: "cl-upsell",          icon: Rocket,       iconBg: "bg-blue-50",     iconColor: "text-blue-500",     titulo: "Servicio adicional",       desc: "Propón un servicio complementario con contexto real del cliente",        preview: "Trabajar contigo me ha dado contexto suficiente para identificar algo más..." },
      { id: "cl-disponibilidad",  icon: CheckCircle,  iconBg: "bg-[#E1F5EE]",  iconColor: "text-[#0F766E]",    titulo: "Tengo disponibilidad",     desc: "Avisa a clientes con los que puedas retomar algo pendiente",            preview: "El próximo mes tengo disponibilidad y pensé en ti..." },
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
      { id: "ci-retoma",          icon: UserCheck,    iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "Retomar contacto",          desc: "Rompe el silencio de forma natural y sin presión",                   preview: "Han pasado meses sin escribirte y no quería que pasara más tiempo..." },
      { id: "ci-oferta",          icon: Gift,         iconBg: "bg-orange-50",  iconColor: "text-orange-600", titulo: "Oferta de reactivación",    desc: "Una propuesta especial solo para quienes ya trabajaron contigo",     preview: "Para clientes con los que hemos trabajado antes tengo algo especial..." },
      { id: "ci-novedad",         icon: Bell,         iconBg: "bg-blue-50",    iconColor: "text-blue-600",   titulo: "Qué hay de nuevo",          desc: "Comparte lo que ha cambiado desde la última vez que trabajasteis",   preview: "Desde que trabajamos juntos han pasado cosas. Quería contarte..." },
      { id: "ci-nuevo-servicio",  icon: Sparkles,     iconBg: "bg-purple-50",  iconColor: "text-purple-600", titulo: "Nuevo servicio",            desc: "Preséntale algo que ahora ofreces y que puede ser relevante",        preview: "Quería contarte que hemos añadido algo nuevo que pensé en ti..." },
      { id: "ci-mercado",         icon: HelpCircle,   iconBg: "bg-purple-50",  iconColor: "text-purple-500", titulo: "¿Sigues activo?",           desc: "Pregunta directa para saber si tiene sentido seguir en contacto",    preview: "Llevo un tiempo sin saber de ti y quería preguntarte directamente..." },
      { id: "ci-descuento",       icon: Receipt,      iconBg: "bg-slate-100",  iconColor: "text-slate-600",  titulo: "Descuento especial",        desc: "Ofrece condiciones preferenciales para clientes que vuelven",        preview: "Para clientes que trabajaron conmigo antes tengo algo exclusivo..." },
      { id: "ci-caso",            icon: Trophy,       iconBg: "bg-amber-50",   iconColor: "text-amber-600",  titulo: "Nuevo caso de éxito",       desc: "Un proyecto reciente relevante que puede hacerle reconsiderar",      preview: "Hace unas semanas terminé algo relacionado con lo que hacíamos juntos..." },
      { id: "ci-feedback",        icon: MessageCircle,iconBg: "bg-blue-50",    iconColor: "text-blue-500",   titulo: "¿Qué pasó?",               desc: "Pregunta honestamente si hubo algo que no salió como esperaban",     preview: "Llevo un tiempo pensando en por qué no hemos vuelto a trabajar juntos..." },
      { id: "ci-saludo",          icon: MessageSquare,iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "Solo saludar",              desc: "Un contacto sin agenda ni propuesta — solo mantener la relación",    preview: "No tengo ninguna propuesta ni nada que venderte. Solo quería decir hola..." },
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
      { id: "vip-expansion",     icon: Rocket,      iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "Propuesta de expansión",    desc: "Propón dar el siguiente paso en la relación hacia algo más ambicioso", preview: "Llevo tiempo pensando en algo que todavía no hemos explorado juntos..." },
      { id: "vip-agradecimiento",icon: Heart,       iconBg: "bg-rose-50",    iconColor: "text-rose-600",   titulo: "Agradecimiento especial",   desc: "Reconoce explícitamente su valor como cliente — sin ninguna agenda",   preview: "Quería escribirte sin ningún motivo comercial. Llevamos tiempo juntos y..." },
      { id: "vip-regalo",        icon: Gift,        iconBg: "bg-orange-50",  iconColor: "text-orange-600", titulo: "Regalo o bonus",            desc: "Envía algo de valor sin condiciones como gesto de reciprocidad",       preview: "Quería enviarte algo como agradecimiento por este tiempo juntos..." },
      { id: "vip-referidos",     icon: Handshake,   iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "Pedir referidos",           desc: "Pide que te recomienden a alguien de su mismo nivel",                 preview: "Los mejores clientes que tengo han llegado por recomendación de clientes como tú..." },
      { id: "vip-partnership",   icon: Link2,       iconBg: "bg-blue-50",    iconColor: "text-blue-500",   titulo: "Propuesta de colaboración", desc: "Explora una forma de trabajar juntos que va más allá del cliente-proveedor", preview: "Llevo tiempo dándole vueltas a algo y quería planteártelo directamente..." },
      { id: "vip-exclusivo",     icon: Snowflake,   iconBg: "bg-slate-100",  iconColor: "text-slate-500",  titulo: "Contenido exclusivo",       desc: "Comparte algo que no publicas y que sabes que les va a servir",        preview: "Quería compartir algo que no comparto públicamente..." },
    ],
    "nuevos-clientes": [
      { id: "nc-bienvenida",    icon: UserCheck,    iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "Bienvenida cálida",        desc: "El primer email que reciben — marca el tono de toda la relación",    preview: "Quería empezar con el pie derecho. Gracias por elegirme..." },
      { id: "nc-primeros-pasos",icon: ArrowRight,   iconBg: "bg-blue-50",   iconColor: "text-blue-600",   titulo: "Primeros pasos",           desc: "Explica qué va a pasar ahora y qué necesitas de ellos",              preview: "Ahora que hemos empezado, quería darte claridad sobre cómo van a ir las cosas..." },
      { id: "nc-recursos",      icon: Bookmark,     iconBg: "bg-blue-50",   iconColor: "text-blue-500",   titulo: "Recursos útiles",          desc: "Comparte materiales para que saquen más partido desde el principio",  preview: "Mientras arrancamos, quería dejarte algunos recursos útiles..." },
      { id: "nc-proceso",       icon: Code2,        iconBg: "bg-slate-100", iconColor: "text-slate-600",  titulo: "Así trabajamos",           desc: "Explica tu forma de trabajar para evitar malentendidos después",      preview: "Antes de que empecemos de lleno, quería explicarte cómo funciono..." },
      { id: "nc-semana1",       icon: CalendarCheck,iconBg: "bg-purple-50", iconColor: "text-purple-500", titulo: "Check-in semana 1",        desc: "Primera revisión rápida para detectar cualquier fricción temprana",   preview: "Ya llevamos una semana trabajando juntos y quería hacer una pausa..." },
      { id: "nc-mes1",          icon: TrendingUp,   iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "Check-in mes 1",           desc: "Primer balance real de cómo está yendo la colaboración",              preview: "Ya llevamos un mes y quería hacer un check-in real..." },
      { id: "nc-opinion",       icon: MessageCircle,iconBg: "bg-blue-50",   iconColor: "text-blue-500",   titulo: "Primera opinión",          desc: "Pide feedback honesto mientras todavía pueden cambiarse cosas",       preview: "Quería pedirte algo que para mí tiene mucho valor: tu opinión honesta..." },
      { id: "nc-ayuda",         icon: Users,        iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "¿Puedo ayudarte más?",     desc: "Identifica si hay otras necesidades más allá de lo que está en marcha",preview: "Más allá de lo que estamos haciendo juntos, quería preguntarte algo más..." },
      { id: "nc-referidos",     icon: Handshake,    iconBg: "bg-[#E1F5EE]", iconColor: "text-[#0F766E]",  titulo: "¿Conoces a alguien?",      desc: "Pide un referido una vez que ya están satisfechos con el inicio",     preview: "Sé que llevamos poco tiempo, pero si lo que hacemos te está sirviendo..." },
      { id: "nc-hito",          icon: Trophy,       iconBg: "bg-amber-50",  iconColor: "text-amber-600",  titulo: "Primer resultado",         desc: "Reconoce el primer hito conseguido juntos — por pequeño que sea",     preview: "Quería escribirte para reconocer algo: [primer resultado conseguido]..." },
    ],
  }

  const plantillasActuales = [
    ...(PLANTILLAS_BASE[audienciaSeleccionada ?? "todos-contactos"] ?? PLANTILLAS_BASE["todos-contactos"]),
    desdeCeroCard,
    misPlantillasCard,
  ]

  const audienciaLabel = audienciaSeleccionada?.replace(/-/g, " ") ?? ""

  // ─── Data ─────────────────────────────────────────────────────────────────
  const { data: mktStats, isLoading: mktLoading } = useQuery({
    queryKey: ["marketing-stats"],
    queryFn: () => fetch("/api/marketing/stats").then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  const totalSubs   = mktStats?.kpis?.totalContactos ?? 18420
  const openRate    = mktStats?.kpis?.tasaApertura   ?? 38.4
  const ctr         = mktStats?.kpis?.ctr            ?? 14.2
  const campanasAPI: { id: string; nombre: string; estado: string; totalEnviados: number; totalAbiertos: number; totalClicks: number; aperturaPct: number | null }[] = mktStats?.campanasRecientes ?? []

  const [emTab, setEmTab] = useState("campanas")
  const [campFilter, setCampFilter] = useState("Todas")
  const [tmplFilter, setTmplFilter] = useState("Todas")
  const [showComposer, setShowComposer] = useState(false)
  const [composerStep, setComposerStep] = useState(0)

  // ─── Design tokens ─────────────────────────────────────────────────────────
  const D = {
    bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
    ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
    line: "#e8e8e8", line2: "#eeeeee", line3: "#f3f3f3",
    accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
    warn: "#c2410c", warnSoft: "#fef3eb",
    blue: "#3756a4", violet: "#6d28d9",
  } as const

  const pRndM = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 10000; return x - Math.floor(x) }
  const fmtN = (n: number) => new Intl.NumberFormat("es-ES").format(Math.round(n))

  // Sparklines
  const subSpark  = Array.from({ length: 12 }, (_, i) => totalSubs * (0.91 + i * 0.008 + pRndM(i * 3) * 0.005))
  const openSpark = Array.from({ length: 12 }, (_, i) => openRate * (0.89 + i * 0.01 + pRndM(i * 5) * 0.008))
  const ctrSpark  = Array.from({ length: 12 }, (_, i) => ctr * (0.87 + i * 0.012 + pRndM(i * 7) * 0.008))
  const revSpark  = [820,1240,1820,2480,3120,4280,6420,8840,12420,16480,21240,24840]

  // Campaigns static design data (used if no real data)
  const CAMPAIGNS_DESIGN = [
    { st: "live",  nm: "Mayo · Lanzamiento colección verano",   sub: "Enviando ahora · A/B en marcha · 5.200 de 8.420",   sent: 5200,  open: 42.6, click: 7.8, conv: 1.4, rev: 4280 },
    { st: "send",  nm: "Newsletter #18 · Tendencias 2026",      sub: "Enviada el 24 may · segmento general",               sent: 16840, open: 41.2, click: 6.9, conv: 1.1, rev: 3120 },
    { st: "sched", nm: "Lunes 09:00 · Boletín semanal",         sub: "Programada · 12.420 destinatarios · Send Time AI",   sent: 12420, open: null, click: null, conv: null, rev: null },
    { st: "ab",    nm: "Promo · 20% descuento PRO",             sub: "A/B test · 2 variantes · gana al alcanzar 1.000",    sent: 1680,  open: 36.8, click: 5.2, conv: 0.9, rev: 1840 },
    { st: "draft", nm: "Welcome series · paso 2 (día 3)",       sub: "Borrador · audiencia: nuevos suscriptores",          sent: null,  open: null, click: null, conv: null, rev: null },
    { st: "send",  nm: "Caso de éxito · Hotel Pinsapo",         sub: "Enviada el 18 may · segmento PRO",                   sent: 4280,  open: 48.2, click: 9.4, conv: 2.2, rev: 5840 },
    { st: "send",  nm: "Reactivación · suscriptores 60d+",      sub: "Enviada el 12 may · 1.840 destinatarios",            sent: 1840,  open: 22.8, click: 3.1, conv: 0.3, rev: 320  },
    { st: "draft", nm: "Anuncio · nueva app móvil",             sub: "Borrador · plantilla Anuncio producto",              sent: null,  open: null, click: null, conv: null, rev: null },
  ]

  const SEGMENTS_DESIGN = [
    { nm: "Suscriptores PRO",        desc: "Plan Pro o Business · último login < 30 d.",     ct: 4280,  open: 48.6, click: 9.4,  churn: 0.8, color: D.blue,   bg: "#eef2fb" },
    { nm: "Leads calientes",         desc: "Score ≥ 70 · sin compra en los últimos 14 d.",   ct: 1284,  open: 52.4, click: 11.2, churn: 1.4, color: D.violet, bg: "#f3edff" },
    { nm: "Inactivos 60 d+",         desc: "Sin abrir ningún correo en los últimos 60 días.", ct: 2840,  open: 18.2, click: 2.1,  churn: 4.6, color: D.warn,   bg: D.warnSoft },
    { nm: "Compradores recurrentes", desc: "≥ 3 facturas pagadas en los últimos 6 meses.",   ct: 1620,  open: 56.8, click: 14.2, churn: 0.4, color: D.accent, bg: D.accentSoft },
    { nm: "ES + LATAM",              desc: "Idioma ES · zona UTC+1 a UTC-6.",                 ct: 12480, open: 38.2, click: 6.4,  churn: 1.2, color: D.blue,   bg: "#eef2fb" },
    { nm: "AI · Riesgo de cancelar", desc: "Modelo de churn detecta probabilidad > 60%.",    ct: 184,   open: 31.6, click: 4.2,  churn: 8.4, color: "#0e7490", bg: "#ecfeff" },
  ]

  const TEMPLATES_DESIGN = [
    { nm: "Bienvenida Pro",       cat: "Onboarding",     color: D.accent },
    { nm: "Newsletter semanal",   cat: "Newsletter",     color: D.blue },
    { nm: "Caso de éxito",        cat: "Marketing",      color: D.violet },
    { nm: "Recordatorio compra",  cat: "Transaccional",  color: D.warn },
    { nm: "Promo flash",          cat: "Marketing",      color: D.accent },
    { nm: "Confirmación pago",    cat: "Transaccional",  color: D.blue },
    { nm: "Reactivación 60d",     cat: "Re-engagement",  color: D.violet },
    { nm: "Anuncio producto",     cat: "Marketing",      color: D.warn },
  ]

  const SCHED_7 = [
    { d: "Hoy",  date: 27, today: true,  slots: [
      { tm: "09:00", nm: "Mayo · Colección verano", sub: "8,4k · A/B activa", cl: D.accent },
      { tm: "14:30", nm: "Flash 20% PRO",           sub: "4,2k · 1 var.",      cl: D.violet },
    ]},
    { d: "Mié",  date: 28, today: false, slots: [{ tm: "10:00", nm: "Invitación webinar", sub: "2,8k", cl: D.blue }] },
    { d: "Jue",  date: 29, today: false, slots: [] },
    { d: "Vie",  date: 30, today: false, slots: [{ tm: "08:00", nm: "Resumen mensual", sub: "12,4k · auto", cl: D.accent }] },
    { d: "Sáb",  date: 31, today: false, slots: [] },
    { d: "Dom",  date: 1,  today: false, slots: [] },
    { d: "Lun",  date: 2,  today: false, slots: [
      { tm: "09:00", nm: "Boletín semanal", sub: "12,4k · STO", cl: D.accent },
      { tm: "15:00", nm: "Reactivación 60d", sub: "2,8k", cl: D.warn },
    ]},
  ]

  const STATUS_CFG: Record<string, { lbl: string; tone: string }> = {
    live: { lbl: "En vivo", tone: "green" }, send: { lbl: "Enviada", tone: "green" },
    sched: { lbl: "Programada", tone: "blue" }, ab: { lbl: "A/B en curso", tone: "violet" },
    draft: { lbl: "Borrador", tone: "ink" },
  }

  const pill = (tone: string, label: string) => {
    const TONE: Record<string, { bg: string; c: string }> = {
      green:  { bg: D.accentSoft, c: D.accentInk },
      blue:   { bg: "#eef2fb",    c: D.blue },
      violet: { bg: "#f3edff",    c: D.violet },
      amber:  { bg: D.warnSoft,   c: D.warn },
      ink:    { bg: D.bg3,        c: D.ink2 },
    }
    const t = TONE[tone] ?? TONE.ink
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: t.bg, color: t.c }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: t.c, display: "inline-block" }} />
        {label}
      </span>
    )
  }

  const sparkSvg = (data: number[], color: string) => {
    const w = 96, h = 28
    const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1
    const step = w / (data.length - 1)
    const pts = data.map((v, i) => [i * step, h - 4 - ((v - min) / rng) * (h - 8)] as [number, number])
    const lineD = "M" + pts.map(p => p.join(",")).join(" L")
    const last = pts[pts.length - 1]
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <path d={lineD} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r={2} fill={color} />
      </svg>
    )
  }

  const EM_TABS = ["campanas", "segmentos", "plantillas", "entregabilidad"] as const
  const EM_LABELS: Record<string, string> = {
    campanas: "Campañas", segmentos: "Segmentos", plantillas: "Plantillas", entregabilidad: "Entregabilidad"
  }

  const COMPOSER_STEPS = ["Contenido", "Audiencia", "Test A/B", "Programación", "Seguimiento"]

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>

      {/* ── INSTITUTIONAL HEADER ──────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, paddingBottom: 18, borderBottom: `1px solid ${D.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: D.ink }}>Email Marketing</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: D.ink3, flexWrap: "wrap" }}>
            <span>{fmtN(totalSubs)} suscriptores</span>
            <span style={{ color: D.ink5 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: D.accent, boxShadow: `0 0 0 3px ${D.accentSoft}`, display: "inline-block" }} />
              1 campaña enviando ahora
            </span>
            <span style={{ color: D.ink5 }}>·</span>
            <span>Próximo: Lun 02 jun, 09:00</span>
            <span style={{ color: D.ink5 }}>·</span>
            <span>Reputación <strong style={{ color: D.accentInk }}>96 / 100</strong></span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Upload className="h-3 w-3" />Importar lista
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}
            onClick={() => setEmTab("plantillas")}>
            <FileText className="h-3 w-3" />Plantillas
          </button>
          <button
            onClick={() => { setEmTab("campanas"); setShowComposer(true); setComposerStep(0) }}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: D.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}
          >
            <Plus className="h-3 w-3" />Nueva campaña
          </button>
        </div>
      </div>

      {/* ── KPI ROW ──────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${D.line}`, borderRadius: 10, background: D.bg, overflow: "hidden" }}>
        {[
          { l: "Suscriptores activos", tag: "Total", v: fmtN(totalSubs), delta: "+4,2%", vs: `+742 este mes`, spark: subSpark, color: D.ink },
          { l: "Tasa de apertura",     tag: "30d",   v: `${openRate.toFixed(1).replace(".", ",")}%`, delta: "+2,1%", vs: "vs sector 24%", spark: openSpark, color: D.ink },
          { l: "CTR · clic/abierto",   tag: "30d",   v: `${ctr.toFixed(1).replace(".", ",")}%`, delta: "+0,6%", vs: "vs sector 8,1%", spark: ctrSpark, color: D.ink },
          { l: "Ingresos atribuidos",  tag: "MTD",   v: "24.840 €",  delta: "+18,6%", vs: "vs Abr (20.940 €)", spark: revSpark, color: D.accentInk, isLast: true },
        ].map((k) => (
          <div key={k.l} style={{ padding: "18px 22px", borderRight: k.isLast ? "none" : `1px solid ${D.line2}`, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 11.5, color: D.ink3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
              {k.l}
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: D.bg3, color: D.ink3, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{k.tag}</span>
            </div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", color: D.ink }}>{k.v}</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "ui-monospace,monospace", fontSize: 11.5, fontWeight: 500, color: D.accentInk }}>
                <ArrowUpRight className="h-3 w-3" />
                {k.delta} <span style={{ color: D.ink4, marginLeft: 4, fontWeight: 450 }}>{k.vs}</span>
              </span>
              {sparkSvg(k.spark, k.color)}
            </div>
          </div>
        ))}
      </div>

      {/* ── SUBNAV TABS ──────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${D.line2}`, display: "flex", alignItems: "center", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
        {EM_TABS.map(t => {
          const isActive = emTab === t
          return (
            <button key={t} onClick={() => setEmTab(t)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "12px 12px 11px", fontSize: 12.5, color: isActive ? D.ink : D.ink3, fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap", borderBottom: `2px solid ${isActive ? D.ink : "transparent"}`, background: "none", border: "0 solid transparent", borderBottomWidth: 2, cursor: "pointer" }}>
              {EM_LABELS[t]}
              {t === "campanas" && campanasAPI.length > 0 && (
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, padding: "1px 5px", borderRadius: 99, background: isActive ? D.ink : D.bg3, color: isActive ? "white" : D.ink3, fontWeight: 600 }}>{campanasAPI.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ══════════ CAMPAÑAS ══════════ */}
      {emTab === "campanas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* COMPOSER */}
          {showComposer && (
            <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 12, overflow: "hidden" }}>
              {/* Composer head */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${D.line2}`, background: D.bg2 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: D.ink, letterSpacing: "-0.01em" }}>Mayo · Lanzamiento colección verano</div>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: D.ink3 }}>CMP-2026-018</span>
                <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: D.accentInk, display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Check className="h-3 w-3" />Guardado hace 12 s
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button style={{ padding: "5px 10px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Enviar prueba</button>
                  <button style={{ padding: "5px 10px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Guardar borrador</button>
                  <button style={{ padding: "5px 10px", borderRadius: 6, background: D.accent, color: "white", fontSize: 11.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Programar envío</button>
                  <button onClick={() => setShowComposer(false)} style={{ width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center", background: D.bg, border: `1px solid ${D.line}`, cursor: "pointer", color: D.ink3 }}>✕</button>
                </div>
              </div>

              {/* Composer body: stepper | form | preview */}
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 280px", gap: 0 }}>
                {/* Stepper */}
                <div style={{ padding: 20, borderRight: `1px solid ${D.line2}`, background: D.bg2, display: "flex", flexDirection: "column", gap: 0 }}>
                  {COMPOSER_STEPS.map((s, i) => (
                    <div key={s} onClick={() => setComposerStep(i)} style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < COMPOSER_STEPS.length - 1 ? 0 : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center",
                          background: i < composerStep ? D.accent : i === composerStep ? D.ink : D.bg3,
                          color: i <= composerStep ? "white" : D.ink3,
                          fontSize: 10, fontWeight: 600, flexShrink: 0,
                        }}>
                          {i < composerStep ? <Check className="h-3 w-3" /> : i + 1}
                        </div>
                        {i < COMPOSER_STEPS.length - 1 && (
                          <div style={{ width: 1, height: 32, background: i < composerStep ? D.accent : D.line2, margin: "2px 0" }} />
                        )}
                      </div>
                      <div style={{ paddingTop: 3, paddingBottom: i < COMPOSER_STEPS.length - 1 ? 30 : 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: i === composerStep ? 600 : 450, color: i === composerStep ? D.ink : D.ink3 }}>{s}</div>
                        <div style={{ fontSize: 10.5, color: D.ink4, fontFamily: "ui-monospace,monospace", marginTop: 1 }}>
                          {["Asunto · preheader", "Segmentos y filtros", "Variantes y métricas", "Fecha, hora y zona", "UTM, objetivo"][i]}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${D.line2}`, display: "flex", flexDirection: "column", gap: 6 }}>
                    {[{ l: "Pasos completados", v: `${composerStep} / 5` }, { l: "Alcance previsto", v: "8.420" }].map(row => (
                      <div key={row.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: D.ink3 }}>
                        <span>{row.l}</span>
                        <strong style={{ color: D.ink }}>{row.v}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {composerStep === 0 && (
                    <>
                      <div>
                        <label style={{ fontSize: 11, fontFamily: "ui-monospace,monospace", color: D.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>
                          Asunto <span style={{ color: D.accentInk, fontWeight: 600 }}>47 / 60 · 92% legible móvil</span>
                        </label>
                        <input defaultValue="Lo nuevo de verano (y un regalo dentro) ☀️" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${D.line}`, borderRadius: 7, fontSize: 13, color: D.ink, outline: "none", boxSizing: "border-box" as const }} />
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" as const }}>
                          {["✨ Sugerir 3 alternativas con IA", "A/B testear el asunto", "Insertar emoji", "{{ nombre }}"].map(l => (
                            <span key={l} style={{ padding: "3px 8px", borderRadius: 6, background: D.accentSoft, color: D.accentInk, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>{l}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontFamily: "ui-monospace,monospace", color: D.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Preheader</label>
                        <textarea defaultValue="20% en toda la colección · solo este fin de semana, para suscriptores Pro." rows={2} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${D.line}`, borderRadius: 7, fontSize: 13, color: D.ink, outline: "none", resize: "none" as const, boxSizing: "border-box" as const }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[["De · nombre", "Wheny · Estudio Vega"], ["De · email", "hola@estudiovega.com"]].map(([l, v]) => (
                          <div key={l}>
                            <label style={{ fontSize: 11, fontFamily: "ui-monospace,monospace", color: D.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>{l}</label>
                            <input defaultValue={v} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${D.line}`, borderRadius: 7, fontSize: 12.5, color: D.ink, outline: "none", boxSizing: "border-box" as const }} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {composerStep === 1 && (
                    <>
                      <div style={{ padding: "12px 14px", border: `2px solid ${D.accent}`, borderRadius: 8, background: D.accentSoft, cursor: "pointer" }}>
                        <div style={{ fontWeight: 550, fontSize: 13, color: D.ink }}>Segmento dinámico · Suscriptores PRO + LATAM</div>
                        <div style={{ fontSize: 12, color: D.ink3, marginTop: 3 }}>Se recalcula al lanzar · incluye altas hasta el envío</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: D.accentInk, marginTop: 6 }}>8.420 destinatarios</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 6 }}>Incluir</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                          {[["Segmento", "es", "Suscriptores PRO"], ["Idioma", "es", "Español"]].map((f, i) => (
                            <span key={i} style={{ padding: "4px 9px", borderRadius: 6, background: D.bg3, border: `1px solid ${D.line}`, fontSize: 12, color: D.ink2 }}>
                              <span style={{ color: D.ink3 }}>{f[0]} </span>{f[1]} <strong>{f[2]}</strong>
                            </span>
                          ))}
                          <button style={{ padding: "4px 9px", borderRadius: 6, background: D.bg, border: `1px dashed ${D.line}`, fontSize: 12, color: D.ink3, cursor: "pointer" }}>+ añadir condición</button>
                        </div>
                      </div>
                    </>
                  )}
                  {composerStep === 2 && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: D.ink }}>Test A/B</h4>
                        <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: D.accentInk, fontWeight: 600 }}>ACTIVADO</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                          { tag: "Variante A · 50%", subj: "Lo nuevo de verano (y un regalo dentro) ☀️" },
                          { tag: "Variante B · 50%", subj: "Wheny, hemos guardado un 20% para ti." },
                        ].map(v => (
                          <div key={v.tag} style={{ padding: 14, border: `1px solid ${D.line}`, borderRadius: 8, background: D.bg2 }}>
                            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3, letterSpacing: "0.05em", marginBottom: 8 }}>{v.tag}</div>
                            <div style={{ fontWeight: 550, fontSize: 12.5, color: D.ink }}>{v.subj}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
                        {[["Métrica ganadora", "Tasa de apertura"], ["Muestra inicial", "20% · 1.680 env."], ["Decisión automática", "tras 4 horas"]].map(r => (
                          <div key={r[0]}>
                            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{r[0]}</div>
                            <div style={{ fontWeight: 550, fontSize: 12.5, color: D.ink, marginTop: 3 }}>{r[1]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(composerStep === 3 || composerStep === 4) && (
                    <div style={{ padding: "32px 0", textAlign: "center", color: D.ink3, fontSize: 13 }}>
                      Configuración de {COMPOSER_STEPS[composerStep]}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${D.line2}` }}>
                    <button onClick={() => setComposerStep(s => Math.max(0, s - 1))} style={{ padding: "7px 14px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: composerStep === 0 ? D.ink5 : D.ink2, fontSize: 12.5, fontWeight: 550, cursor: composerStep === 0 ? "not-allowed" : "pointer" }}>← Atrás</button>
                    {composerStep < COMPOSER_STEPS.length - 1 ? (
                      <button onClick={() => setComposerStep(s => s + 1)} style={{ padding: "7px 14px", borderRadius: 6, background: D.ink, color: "white", fontSize: 12.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Continuar →</button>
                    ) : (
                      <button style={{ padding: "7px 14px", borderRadius: 6, background: D.accent, color: "white", fontSize: 12.5, fontWeight: 550, border: "none", cursor: "pointer" }}>Programar envío</button>
                    )}
                  </div>
                </div>

                {/* Preview panel */}
                <div style={{ padding: 20, borderLeft: `1px solid ${D.line2}`, background: D.bg2, display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Vista previa</div>
                  {/* Phone mockup */}
                  <div style={{ background: D.ink, borderRadius: 16, padding: 2, width: 220, margin: "0 auto" }}>
                    <div style={{ background: "white", borderRadius: 14, overflow: "hidden" }}>
                      <div style={{ background: D.bg2, padding: "8px 12px", fontSize: 10.5, fontWeight: 600, color: D.ink2 }}>Bandeja · 12 nuevos</div>
                      {[
                        { from: "Acme · Boletín", subj: "Tu informe semanal está listo", preview: "Hemos preparado tu resumen…", isTarget: false },
                        { from: "Wheny · Estudio Vega", subj: "Lo nuevo de verano ☀️", preview: "20% en toda la colección · solo este fin…", isTarget: true },
                        { from: "Figma", subj: "Nuevas plantillas para tu equipo", preview: "Hemos añadido 12 nuevas plantillas…", isTarget: false },
                      ].map((m, i) => (
                        <div key={i} style={{ padding: "8px 12px", borderBottom: `1px solid ${D.line3}`, background: m.isTarget ? D.accentSoft : "white" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                            <span style={{ fontWeight: m.isTarget ? 600 : 500, fontSize: 11.5, color: D.ink }}>{m.from}</span>
                            <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink4 }}>09:00</span>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 550, color: D.ink, marginBottom: 1 }}>{m.subj}</div>
                          <div style={{ fontSize: 10, color: D.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.preview}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Recap */}
                  {[["Destinatarios", "8.420"], ["A/B test", "2 variantes"], ["Envío", "Send Time AI"], ["Apertura prevista", "38 – 44 %"]].map(r => (
                    <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: `1px solid ${D.line3}`, paddingBottom: 8 }}>
                      <span style={{ color: D.ink3 }}>{r[0]}</span>
                      <span style={{ fontWeight: 550, color: r[0] === "Apertura prevista" ? D.accentInk : D.ink }}>{r[1]}</span>
                    </div>
                  ))}
                  {/* Spam score */}
                  <div style={{ padding: 12, background: D.bg, border: `1px solid ${D.line}`, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 550, color: D.ink }}>Spam check</span>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: D.accentInk }}>9,4 / 10</span>
                    </div>
                    <div style={{ height: 4, background: D.bg3, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
                      <div style={{ width: "94%", height: "100%", background: D.accent, borderRadius: 99 }} />
                    </div>
                    {[["ok", "Asunto sin spam triggers"], ["ok", "SPF + DKIM + DMARC"], ["warn", "1 emoji en asunto"]].map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c[0] === "warn" ? D.warn : D.accentInk, marginBottom: 3 }}>
                        {c[0] === "ok" ? <Check className="h-3 w-3" /> : <span>⚠</span>}
                        {c[1]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7-DAY SCHEDULE */}
          <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${D.line2}` }}>
              <div>
                <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: D.ink }}>Calendario de envío · próximos 7 días</h3>
                <div style={{ fontSize: 11.5, color: D.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: D.accent, display: "inline-block" }} />
                    1 enviando ahora
                  </span>
                  {" · "}5 programadas{" · "}zona Europe/Madrid
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ display: "inline-flex", background: D.bg2, border: `1px solid ${D.line}`, borderRadius: 7, padding: 2 }}>
                  {["Semana", "Mes", "Lista"].map((s, i) => (
                    <button key={s} style={{ padding: "4px 9px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11, color: i === 0 ? D.ink : D.ink3, background: i === 0 ? "white" : "transparent", boxShadow: i === 0 ? `0 0 0 1px ${D.line} inset` : "none", border: "none", cursor: "pointer" }}>{s}</button>
                  ))}
                </div>
                <button style={{ padding: "5px 10px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>+ Programar</button>
              </div>
            </div>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, overflowX: "auto" }}>
              {SCHED_7.map(day => (
                <div key={day.d} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ textAlign: "center", paddingBottom: 6, borderBottom: `1px solid ${D.line2}` }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: day.today ? D.accent : D.ink3, fontWeight: day.today ? 600 : 400 }}>{day.d}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 14, fontWeight: 600, color: day.today ? D.ink : D.ink3, marginTop: 2 }}>{String(day.date).padStart(2, "0")}</div>
                  </div>
                  {day.slots.length > 0 ? day.slots.map((slot, i) => (
                    <div key={i} style={{ padding: "6px 8px", borderRadius: 6, background: slot.cl + "15", border: `1px solid ${slot.cl}40`, cursor: "pointer" }}>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3 }}>{slot.tm}</div>
                      <div style={{ fontSize: 11, fontWeight: 550, color: D.ink, marginTop: 1, lineHeight: 1.3 }}>{slot.nm}</div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: D.ink3, marginTop: 1 }}>{slot.sub}</div>
                    </div>
                  )) : (
                    <div style={{ textAlign: "center", fontSize: 10, color: D.ink5, fontFamily: "ui-monospace,monospace", padding: "8px 0" }}>—</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CAMPAIGNS TABLE */}
          <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${D.line2}` }}>
              <div>
                <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: D.ink }}>Campañas</h3>
                <div style={{ fontSize: 11.5, color: D.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{CAMPAIGNS_DESIGN.length} totales · últimos 90 días</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ display: "inline-flex", background: D.bg2, border: `1px solid ${D.line}`, borderRadius: 7, padding: 2 }}>
                  {["Todas", "En vivo", "Programadas", "Borradores", "Enviadas"].map(s => (
                    <button key={s} onClick={() => setCampFilter(s)} style={{ padding: "3px 8px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11, color: campFilter === s ? D.ink : D.ink3, background: campFilter === s ? "white" : "transparent", boxShadow: campFilter === s ? `0 0 0 1px ${D.line} inset` : "none", border: "none", cursor: "pointer" }}>{s}</button>
                  ))}
                </div>
                <a style={{ fontSize: 11.5, color: D.ink3, fontWeight: 500, cursor: "pointer" }}>Exportar CSV</a>
              </div>
            </div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 120px 100px 90px 80px 70px 100px 30px", gap: 14, padding: "9px 18px", background: D.bg2, borderBottom: `1px solid ${D.line2}`, fontFamily: "ui-monospace,monospace", fontSize: 10, fontWeight: 500, color: D.ink3, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              <span /><span>Campaña</span><span>Estado</span><span>Destinatarios</span><span style={{ textAlign: "right" }}>Apertura</span><span style={{ textAlign: "right" }}>CTR</span><span style={{ textAlign: "right" }}>Conv.</span><span style={{ textAlign: "right" }}>Ingresos</span><span />
            </div>
            {/* Rows */}
            {CAMPAIGNS_DESIGN.map((c, i) => {
              const st = STATUS_CFG[c.st]
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 120px 100px 90px 80px 70px 100px 30px", gap: 14, padding: "13px 18px", borderBottom: `1px solid ${D.line3}`, alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = D.bg2 }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: c.st === "live" ? D.accentSoft : c.st === "ab" ? "#f3edff" : c.st === "sched" ? "#eef2fb" : D.bg3, display: "grid", placeItems: "center", color: c.st === "live" ? D.accentInk : c.st === "ab" ? D.violet : c.st === "sched" ? D.blue : D.ink3 }}>
                    {c.st === "live" ? <Send className="h-3 w-3" /> : c.st === "ab" ? <Sparkles className="h-3 w-3" /> : c.st === "sched" ? <Clock className="h-3 w-3" /> : c.st === "draft" ? <Edit3 className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 550, fontSize: 13, color: D.ink, letterSpacing: "-0.005em" }}>{c.nm}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: D.ink3, marginTop: 1 }}>{c.sub}</div>
                  </div>
                  {pill(st.tone, st.lbl)}
                  <div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: D.ink }}>{c.sent !== null ? fmtN(c.sent) : "—"}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink4 }}>enviados</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {c.open !== null ? (
                      <>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: D.ink }}>{String(c.open).replace(".", ",")}%</div>
                        <div style={{ height: 3, background: D.bg3, borderRadius: 99, overflow: "hidden", marginTop: 3 }}>
                          <div style={{ width: `${Math.min(c.open * 2, 100)}%`, height: "100%", background: D.accent, borderRadius: 99 }} />
                        </div>
                      </>
                    ) : <span style={{ color: D.ink4, fontFamily: "ui-monospace,monospace", fontSize: 12 }}>—</span>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {c.click !== null ? (
                      <>
                        <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: D.ink }}>{String(c.click).replace(".", ",")}%</div>
                        <div style={{ height: 3, background: D.bg3, borderRadius: 99, overflow: "hidden", marginTop: 3 }}>
                          <div style={{ width: `${Math.min(c.click * 8, 100)}%`, height: "100%", background: D.blue, borderRadius: 99 }} />
                        </div>
                      </>
                    ) : <span style={{ color: D.ink4, fontFamily: "ui-monospace,monospace", fontSize: 12 }}>—</span>}
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "ui-monospace,monospace", fontSize: 12.5, color: D.ink }}>{c.conv !== null ? `${String(c.conv).replace(".", ",")}%` : "—"}</div>
                  <div style={{ textAlign: "right", fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: D.ink }}>{c.rev !== null ? `${fmtN(c.rev)} €` : "—"}</div>
                  <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: D.ink3, background: "none", border: "none", cursor: "pointer" }} onClick={e => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              )
            })}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid ${D.line2}`, background: D.bg2, fontSize: 11.5, color: D.ink3 }}>
              <span style={{ fontFamily: "ui-monospace,monospace" }}>Mostrando {CAMPAIGNS_DESIGN.length} de 48 campañas</span>
              <div style={{ display: "flex", gap: 3 }}>
                {["‹", "1", "2", "3", "›"].map((b, i) => (
                  <button key={i} style={{ minWidth: 26, height: 26, padding: "0 8px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: i === 1 ? "white" : D.ink2, background: i === 1 ? D.ink : "white", border: `1px solid ${i === 1 ? D.ink : D.line}`, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.4 : 1 }}>{b}</button>
                ))}
              </div>
            </div>
          </div>

          {/* SEGMENTS + DELIVERABILITY */}
          <div className="grid grid-cols-2 gap-4">
            {/* Segments */}
            <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${D.line2}` }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: D.ink }}>Segmentos de audiencia</h3>
                  <div style={{ fontSize: 11.5, color: D.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>Recalculados cada hora · basados en comportamiento + CRM</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ padding: "5px 9px", borderRadius: 6, background: D.accentSoft, border: "none", color: D.accentInk, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>✨ Crear con IA</button>
                  <button style={{ padding: "5px 9px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>+ Nuevo</button>
                </div>
              </div>
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SEGMENTS_DESIGN.map(seg => (
                  <div key={seg.nm} style={{ padding: 14, border: `1px solid ${D.line}`, borderRadius: 8, cursor: "pointer", background: D.bg }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 6, background: seg.bg, display: "grid", placeItems: "center", color: seg.color, flexShrink: 0, fontSize: 13 }}>✦</span>
                      <div style={{ fontWeight: 600, fontSize: 12.5, color: D.ink, letterSpacing: "-0.005em", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{seg.nm}</div>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: D.ink, flexShrink: 0 }}>{fmtN(seg.ct)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: D.ink3, marginBottom: 10, lineHeight: 1.4 }}>{seg.desc}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                      {[["Apertura", `${seg.open}%`, true], ["CTR", `${seg.click}%`, false], ["Churn", `${seg.churn}%`, false]].map(([l, v, ok]) => (
                        <div key={String(l)}>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, color: D.ink4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{l}</div>
                          <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12.5, fontWeight: 600, color: ok ? D.accentInk : (seg.churn > 3 && l === "Churn" ? D.warn : D.ink) }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverability */}
            <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${D.line2}` }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: D.ink }}>Deliverability</h3>
                  <div style={{ fontSize: 11.5, color: D.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>Reputación y autenticación de dominio</div>
                </div>
                <a style={{ fontSize: 11.5, color: D.ink3, fontWeight: 500, cursor: "pointer" }}>Diagnóstico →</a>
              </div>
              <div style={{ padding: "14px 18px" }}>
                {/* Top stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${D.line2}` }}>
                  {[
                    { l: "Reputación", v: "96", suffix: "/100", color: D.accentInk, sub: "✓ Excelente" },
                    { l: "Bounce", v: "0,8", suffix: "%", color: D.ink, sub: "Objetivo < 2%" },
                    { l: "Spam", v: "0,02", suffix: "%", color: D.ink, sub: "Objetivo < 0,1%" },
                  ].map(k => (
                    <div key={k.l}>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 4 }}>{k.l}</div>
                      <div style={{ fontWeight: 600, fontSize: 22, color: k.color }}>{k.v}<span style={{ fontSize: 14, color: D.ink3, fontWeight: 400 }}>{k.suffix}</span></div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: D.ink3, marginTop: 2 }}>{k.sub}</div>
                    </div>
                  ))}
                </div>
                {/* Auth items */}
                {[
                  { ok: true,  nm: "SPF · estudiovega.com", sub: "v=spf1 include:_spf.clientlabs.io ~all", val: "Verificado · 2 h" },
                  { ok: true,  nm: "DKIM · cl1._domainkey",  sub: "RSA-2048 · firmando todos los correos",   val: "Verificado · 2 h" },
                  { ok: true,  nm: "DMARC · p=quarantine",   sub: "rua=postmaster · 100% align",            val: "Verificado · 2 h" },
                  { ok: false, nm: "BIMI · logo verificado", sub: "Falta certificado VMC para Gmail",         val: "Sin certificado" },
                  { ok: true,  nm: "IP dedicada · 185.43.18.12", sub: "Sin presencia en 89 listas negras",  val: "Reputación 96/100" },
                ].map((it, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr auto auto 26px", gap: 10, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${D.line3}` : "none", alignItems: "center" }}>
                    <span style={{ color: it.ok ? D.accentInk : D.warn, fontSize: 13 }}>{it.ok ? "✓" : "⚠"}</span>
                    <div>
                      <div style={{ fontWeight: 550, fontSize: 12.5, color: D.ink }}>{it.nm}</div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: D.ink3, marginTop: 1 }}>{it.sub}</div>
                    </div>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, padding: "2px 6px", borderRadius: 4, background: it.ok ? D.accentSoft : D.warnSoft, color: it.ok ? D.accentInk : D.warn, fontWeight: 600 }}>{it.ok ? "OK" : "AVISO"}</span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: D.ink3 }}>{it.val}</span>
                    <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: D.ink3, background: "none", border: "none", cursor: "pointer" }}><MoreHorizontal className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════ SEGMENTOS ══════════ */}
      {emTab === "segmentos" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {SEGMENTS_DESIGN.map(seg => (
              <div key={seg.nm} style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 7, background: seg.bg, display: "grid", placeItems: "center", color: seg.color, flexShrink: 0, fontSize: 15 }}>✦</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: D.ink }}>{seg.nm}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: D.ink, marginTop: 1 }}>{fmtN(seg.ct)} suscriptores</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: D.ink3, marginBottom: 12, lineHeight: 1.5 }}>{seg.desc}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 12, borderTop: `1px solid ${D.line2}` }}>
                  {[["Apertura", `${seg.open}%`], ["CTR", `${seg.click}%`], ["Churn", `${seg.churn}%`]].map(([l, v]) => (
                    <div key={String(l)}>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: D.ink4, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{l}</div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 600, color: D.ink }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ PLANTILLAS ══════════ */}
      {emTab === "plantillas" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" as const }}>
            <div style={{ display: "inline-flex", background: D.bg2, border: `1px solid ${D.line}`, borderRadius: 7, padding: 2 }}>
              {["Todas", "Marketing", "Transaccional", "Newsletter", "Onboarding"].map(s => (
                <button key={s} onClick={() => setTmplFilter(s)} style={{ padding: "4px 10px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11.5, color: tmplFilter === s ? D.ink : D.ink3, background: tmplFilter === s ? "white" : "transparent", boxShadow: tmplFilter === s ? `0 0 0 1px ${D.line} inset` : "none", border: "none", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
            <button style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 6, background: D.bg, border: `1px solid ${D.line}`, color: D.ink2, fontSize: 12.5, fontWeight: 550, cursor: "pointer" }}>+ Diseñar plantilla</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {TEMPLATES_DESIGN.filter(t => tmplFilter === "Todas" || t.cat === tmplFilter).map(tmpl => (
              <div key={tmpl.nm} style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = D.ink3 }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = D.line }}
              >
                {/* Thumbnail */}
                <div style={{ height: 160, background: D.bg2, display: "flex", flexDirection: "column", padding: 12, gap: 6 }}>
                  <div style={{ height: 12, borderRadius: 3, background: tmpl.color, width: "60%" }} />
                  <div style={{ height: 60, borderRadius: 4, background: `${tmpl.color}20`, flex: "none" }} />
                  <div style={{ height: 8, borderRadius: 3, background: D.line, width: "80%" }} />
                  <div style={{ height: 8, borderRadius: 3, background: D.line, width: "60%" }} />
                  <div style={{ height: 26, borderRadius: 5, background: tmpl.color, width: "50%", marginTop: 4 }} />
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: D.ink, marginBottom: 3 }}>{tmpl.nm}</div>
                  <div style={{ fontSize: 11.5, color: D.ink3, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{tmpl.cat}</span>
                    <span style={{ color: D.ink5 }}>·</span>
                    <span>6 bloques</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ ENTREGABILIDAD ══════════ */}
      {emTab === "entregabilidad" && (
        <div className="grid grid-cols-2 gap-4">
          <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${D.line2}` }}>
              <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: D.ink }}>Autenticación del dominio</h3>
              <div style={{ fontSize: 11.5, color: D.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>estudiovega.com · verificado hace 2 h</div>
            </div>
            <div style={{ padding: 18 }}>
              {[
                { ok: true,  nm: "SPF", sub: "v=spf1 include:_spf.clientlabs.io ~all", val: "Verificado" },
                { ok: true,  nm: "DKIM", sub: "RSA-2048 · cl1._domainkey.estudiovega.com", val: "Verificado" },
                { ok: true,  nm: "DMARC", sub: "p=quarantine · rua=postmaster@estudiovega.com", val: "100% align" },
                { ok: false, nm: "BIMI", sub: "Falta certificado VMC para Gmail / Yahoo Inbox", val: "Sin certificado" },
                { ok: true,  nm: "IP dedicada", sub: "185.43.18.12 · Sin presencia en 89 listas negras", val: "Reputación 96/100" },
              ].map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < 4 ? `1px solid ${D.line3}` : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: it.ok ? D.accentSoft : D.warnSoft, display: "grid", placeItems: "center", color: it.ok ? D.accentInk : D.warn, flexShrink: 0, fontSize: 14 }}>{it.ok ? "✓" : "⚠"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: D.ink }}>{it.nm}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: D.ink3, marginTop: 2 }}>{it.sub}</div>
                  </div>
                  <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, padding: "3px 8px", borderRadius: 5, background: it.ok ? D.accentSoft : D.warnSoft, color: it.ok ? D.accentInk : D.warn, fontWeight: 600, flexShrink: 0 }}>{it.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${D.line2}` }}>
              <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: D.ink }}>Métricas de reputación</h3>
              <div style={{ fontSize: 11.5, color: D.ink3, fontFamily: "ui-monospace,monospace", marginTop: 2 }}>Últimos 30 días · hola@estudiovega.com</div>
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { l: "Reputación IP",     v: 96, max: 100, color: D.accent, fmt: "/100" },
                { l: "Tasa de entrega",   v: 99.1, max: 100, color: D.accent, fmt: "%" },
                { l: "Bounce rate",       v: 0.8, max: 5, color: D.ink2, fmt: "%" },
                { l: "Spam rate",         v: 0.02, max: 1, color: D.ink2, fmt: "%" },
                { l: "Unsub rate",        v: 0.21, max: 1, color: D.ink2, fmt: "%" },
              ].map(k => (
                <div key={k.l}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: D.ink2 }}>{k.l}</span>
                    <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 13, fontWeight: 600, color: k.color }}>{k.v}{k.fmt}</span>
                  </div>
                  <div style={{ height: 6, background: D.bg3, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${(k.v / k.max) * 100}%`, height: "100%", background: k.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EXISTING CAMPAIGN MODAL (preserved) ─────────────────────────────── */}
      {modalCampana && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="flex-1 bg-black/25" onClick={() => { setModalCampana(false); setPasoModal(1); setTipoCampana(null); setAudienciaSeleccionada(null) }} />
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-semibold text-slate-900 leading-snug">Nueva campaña</span>
                <span className="text-[11px] text-slate-400">Paso {pasoModal} de 5</span>
              </div>
              <button onClick={() => { setModalCampana(false); setPasoModal(1); setTipoCampana(null) }} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Cerrar">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="text-center py-10 text-slate-400 text-[13px]">
                Utiliza el compositor integrado de arriba para crear tu campaña,<br/>o continúa aquí con el asistente paso a paso.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100">
              <button onClick={() => { setModalCampana(false); setShowComposer(true); setComposerStep(0) }}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
                style={{ background: "linear-gradient(135deg, #16986e, #0d7a56)" }}
              >
                Abrir compositor completo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
