"use client"

import { useState, useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Bell, Clock, TrendingDown, FileText, Calendar,
  CheckCircle, Send, Users, Gift, AlertTriangle,
  Zap, Mail, X, Sparkles, CheckSquare, Building2, Package, Star,
} from "lucide-react"
import { usePlan } from "@/hooks/use-plan"
import { UpgradeWall } from "@/components/ui/upgrade-wall"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DbAuto {
  id: string
  tipo: string
  nombre: string
  descripcion: string | null
  categoria: string
  activa: boolean
  config: Record<string, unknown> | null
  vecesEjecutada: number
  ultimaEjecucion: string | null
  logs: Array<{ id: string; ejecutadaEn: string; resultado: string; detalle: string | null }>
}

interface LogEntry {
  id: string
  ejecutadaEn: string
  resultado: string
  detalle: string | null
  entidadTipo: string | null
  automatizacion: { nombre: string }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCfg(auto: DbAuto) {
  const c = (auto.config ?? {}) as Record<string, unknown>
  const dias = (c.dias ?? c.diasTrasVencimiento ?? c.diasAntes ?? c.diasInactividad ?? c.diasSinRespuesta) as number | undefined
  const asunto = c.asunto as string | undefined
  const mensaje = (c.mensaje ?? c.cuerpo) as string | undefined
  return { dias, asunto, mensaje, tieneConfig: !!(dias || asunto || mensaje) }
}

function diasLabelFromTipo(tipo: string) {
  if (tipo.includes("EXPIRA") || tipo.includes("TRIMESTRE")) return "Días de antelación"
  if (tipo.includes("STALLED") || tipo.includes("CONTACTAR")) return "Días de inactividad"
  if (tipo.includes("SEGUIMIENTO")) return "Días sin respuesta"
  return "Días tras vencimiento"
}

const ICON_MAP: Record<string, { icon: React.ElementType; dot: string }> = {
  LEAD_NUEVO:                 { icon: Bell,          dot: "bg-blue-400" },
  LEAD_SIN_CONTACTAR:         { icon: Clock,         dot: "bg-amber-400" },
  LEAD_STALLED:               { icon: TrendingDown,  dot: "bg-slate-400" },
  FACTURA_VENCIDA_AVISO:      { icon: FileText,      dot: "bg-red-400" },
  PRESUPUESTO_EXPIRA_AVISO:   { icon: AlertTriangle, dot: "bg-orange-400" },
  TRIMESTRE_PROXIMO:          { icon: Calendar,      dot: "bg-purple-400" },
  TAREA_VENCIDA:              { icon: CheckSquare,   dot: "bg-amber-400" },
  TAREAS_HOY:                 { icon: CheckSquare,   dot: "bg-blue-400" },
  PROVEEDOR_FACTURA_VENCER:   { icon: Building2,     dot: "bg-slate-400" },
  MES_BENEFICIO_NEGATIVO:     { icon: TrendingDown,  dot: "bg-red-400" },
  CONFIRMACION_LEAD:          { icon: CheckCircle,   dot: "bg-[#0F766E]" },
  SEGUIMIENTO_DIA_3:          { icon: Send,          dot: "bg-blue-400" },
  SEGUIMIENTO_DIA_7:          { icon: Send,          dot: "bg-slate-400" },
  BIENVENIDA_CLIENTE:         { icon: Users,         dot: "bg-[#0F766E]" },
  FACTURA_VENCIDA:            { icon: FileText,      dot: "bg-red-400" },
  PRESUPUESTO_EXPIRA:         { icon: AlertTriangle, dot: "bg-orange-400" },
  PRESUPUESTO_EXPIRADO:       { icon: AlertTriangle, dot: "bg-orange-400" },
  CUMPLEANOS_CLIENTE:         { icon: Gift,          dot: "bg-pink-400" },
  CONFIRMACION_PEDIDO:        { icon: Package,       dot: "bg-[#0F766E]" },
  AVISO_ENTREGA:              { icon: Package,       dot: "bg-[#0F766E]" },
  SOLICITUD_VALORACION:       { icon: Star,          dot: "bg-pink-400" },
}

const MOD_COLORS: Record<string, string> = {
  Leads:        "text-blue-600 bg-blue-50 border-blue-100",
  Facturación:  "text-red-600 bg-red-50 border-red-100",
  Finanzas:     "text-purple-600 bg-purple-50 border-purple-100",
  Clientes:     "text-[#0F766E] bg-[#E1F5EE] border-[#0F766E]/20",
  Tareas:       "text-amber-600 bg-amber-50 border-amber-100",
  Proveedores:  "text-slate-600 bg-slate-100 border-slate-200",
}

function tipoToModulo(tipo: string): string {
  if (tipo.includes("LEAD")) return "Leads"
  if (tipo.includes("TAREA")) return "Tareas"
  if (tipo.includes("PROVEEDOR")) return "Proveedores"
  if (tipo.includes("BENEFICIO")) return "Finanzas"
  if (tipo.includes("TRIMESTRE")) return "Finanzas"
  if (
    tipo.includes("CLIENTE") || tipo.includes("BIENVENIDA") || tipo.includes("CUMPLE") ||
    tipo.includes("PEDIDO") || tipo.includes("ENTREGA") || tipo.includes("VALORACION")
  ) return "Clientes"
  return "Facturación"
}

const VARS_TI = [
  "{{lead.nombre}}", "{{lead.email}}", "{{lead.fecha}}", "{{lead.estado}}", "{{lead.ultimoContacto}}",
  "{{cliente.nombre}}",
  "{{factura.numero}}", "{{factura.total}}", "{{factura.vencimiento}}", "{{factura.diasRetraso}}",
  "{{presupuesto.numero}}", "{{presupuesto.total}}", "{{presupuesto.expira}}", "{{presupuesto.dias}}",
  "{{trimestre}}", "{{fechaLimite}}", "{{dias}}",
  "{{proveedor.nombre}}", "{{ingresos}}", "{{gastos}}", "{{diferencia}}",
  "{{usuario.nombre}}",
]
const VARS_CONTACTOS = [
  "{{lead.nombre}}", "{{cliente.nombre}}", "{{usuario.nombre}}",
  "{{factura.numero}}", "{{factura.total}}", "{{factura.vencimiento}}",
  "{{presupuesto.numero}}", "{{presupuesto.expira}}",
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AutomatizacionesPage() {
  const { can } = usePlan()
  const queryClient = useQueryClient()
  const [automatizaciones, setAutomatizaciones] = useState<DbAuto[]>([])
  const [actividad, setActividad] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Drawer
  const [drawerAuto, setDrawerAuto] = useState<DbAuto | null>(null)
  const [drawerAsunto, setDrawerAsunto] = useState("")
  const [drawerMensaje, setDrawerMensaje] = useState("")
  const [drawerDias, setDrawerDias] = useState(1)

  const canUse = can("automations")

  useEffect(() => {
    if (!canUse) return
    fetch("/api/automatizaciones")
      .then((r) => r.json())
      .then((data) => {
        setAutomatizaciones(data.automatizaciones ?? [])
        setActividad(data.actividadReciente ?? [])
      })
      .catch(() => toast.error("Error cargando automatizaciones"))
      .finally(() => setLoading(false))
  }, [canUse])

  if (!canUse) return <UpgradeWall feature="Automatizaciones" requiredPlan="Pro" />

  const totalActivas = automatizaciones.filter((a) => a.activa).length
  const pct = automatizaciones.length > 0
    ? Math.round((totalActivas / automatizaciones.length) * 100)
    : 0

  const toggle = async (id: string, activa: boolean) => {
    // Optimistic update
    setAutomatizaciones((prev) => prev.map((a) => a.id === id ? { ...a, activa: !activa } : a))
    try {
      const res = await fetch(`/api/automatizaciones/${id}/toggle`, { method: "PATCH" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Error al actualizar")
      }
      queryClient.invalidateQueries({ queryKey: ["activation-checklist"] })
    } catch (e) {
      // Revert
      setAutomatizaciones((prev) => prev.map((a) => a.id === id ? { ...a, activa } : a))
      toast.error(e instanceof Error ? e.message : "Error al actualizar")
    }
  }

  const openDrawer = (auto: DbAuto) => {
    const { dias, asunto, mensaje } = getCfg(auto)
    setDrawerAuto(auto)
    setDrawerDias(dias ?? 1)
    setDrawerAsunto(asunto ?? "")
    setDrawerMensaje(mensaje ?? "")
  }

  const closeDrawer = () => setDrawerAuto(null)

  const saveDrawer = async () => {
    if (!drawerAuto) return
    const { dias, asunto, mensaje } = getCfg(drawerAuto)
    const newConfig = {
      ...(drawerAuto.config ?? {}),
      ...(dias !== undefined ? { dias: drawerDias } : {}),
      ...(asunto !== undefined ? { asunto: drawerAsunto } : {}),
      ...(mensaje !== undefined ? { mensaje: drawerMensaje } : {}),
    }
    // Optimistic local update
    setAutomatizaciones((prev) =>
      prev.map((a) => a.id === drawerAuto.id ? { ...a, config: newConfig } : a)
    )
    closeDrawer()
    try {
      await fetch(`/api/automatizaciones/${drawerAuto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: newConfig }),
      })
      toast.success("Guardado")
    } catch {
      toast.error("Error al guardar")
    }
  }

  const paraTi        = automatizaciones.filter((a) => a.categoria === "para_ti")
  const paraContactos = automatizaciones.filter((a) => a.categoria === "para_contactos")
  const drawerVars    = drawerAuto?.categoria === "para_ti" ? VARS_TI : VARS_CONTACTOS

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div>
          <div className="h-7 w-52 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
          <div className="h-4 w-80 bg-[var(--bg-surface)] rounded-xl animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
              <div className="h-12 bg-[var(--bg-surface)] animate-pulse" />
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-16 border-t border-[var(--border-subtle)] px-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-[var(--bg-surface)] rounded animate-pulse" />
                    <div className="h-2.5 w-48 bg-[var(--bg-surface)] rounded animate-pulse" />
                  </div>
                  <div className="w-8 h-4 bg-[var(--bg-surface)] rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">

      {/* ── INSTITUTIONAL HEADER ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, paddingBottom: 18, borderBottom: "1px solid #eeeeee" }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: "#0a0a0a" }}>Automatizaciones</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#737373", flexWrap: "wrap" }}>
            <span>{totalActivas} workflows activos</span>
            <span style={{ color: "#d4d4d4" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "#16986e", boxShadow: "0 0 0 3px #ecf6f1", display: "inline-block" }} />
              ejecutando en tiempo real
            </span>
            <span style={{ color: "#d4d4d4" }}>·</span>
            <span>{automatizaciones.length} configuradas</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <Zap className="h-3 w-3" />
            Conectar app
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#0a0a0a", color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Sparkles className="h-3 w-3" />
            Nuevo workflow
          </button>
        </div>
      </div>

      {/* ── KPI ROW ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid #e8e8e8", borderRadius: 10, background: "#ffffff", overflow: "hidden" }}>
        {[
          { label: "Workflows activos",  value: String(totalActivas),                                                             sub: `de ${automatizaciones.length} configurados` },
          { label: "Ejecuciones · 30d",  value: automatizaciones.reduce((s, a) => s + a.vecesEjecutada, 0).toLocaleString("es-ES"), sub: "total acumulado" },
          { label: "Tasa de activación", value: `${pct}%`,                                                                        sub: "workflows activos" },
          { label: "Con errores",        value: String(automatizaciones.filter(a => a.logs.some(l => l.resultado === "error")).length), sub: "requieren atención" },
        ].map((k, i, arr) => (
          <div key={k.label} style={{ padding: "18px 22px", borderRight: i < arr.length - 1 ? "1px solid #eeeeee" : "none" }}>
            <div style={{ fontSize: 11.5, color: "#737373", fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.028em", fontSize: 28, fontVariantNumeric: "tabular-nums", color: "#0a0a0a" }}>{k.value}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: "#737373", marginTop: 8 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── INFO BANNER (email domain) ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 w-full p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
        <div className="flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Los emails se envían desde <span className="text-[var(--text-primary)] font-medium">hola@clientlabs.io</span> en tu nombre. Próximamente podrás conectar tu propio dominio.
          </p>
        </div>
        <a href="/dashboard/automatizaciones/email-info" className="shrink-0 text-[11px] font-medium text-[#0F766E] hover:underline whitespace-nowrap">
          Saber más
        </a>
      </div>

      {/* ── FLOW PREVIEW (highlighted workflow) ─────────────────────────────── */}
      <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeeeee" }}>
          <div>
            <h3 style={{ fontWeight: 600, letterSpacing: "-0.012em", fontSize: 13.5, margin: 0, color: "#0a0a0a" }}>
              Cobro recibido · seguimiento automático
            </h3>
            <div style={{ fontSize: 11.5, color: "#737373", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: "#16986e", display: "inline-block" }} />
                Activo
              </span>
              {" · "}Última ejecución hace 12 min
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, auto)", gap: "10px 20px", fontSize: 12, color: "#737373", fontFamily: "ui-monospace,monospace" }}>
              {[["Ejecuciones · 30d", "1.284"], ["Tasa de éxito", <span key="s" style={{ color: "#16986e", fontWeight: 600 }}>99,4%</span>], ["Tiempo ahorrado", "42h/mes"], ["Duración media", "1,2 s"]].map(([l, v]) => (
                <div key={String(l)}>
                  <div style={{ fontSize: 10, color: "#a3a3a3", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{l}</div>
                  <div style={{ fontWeight: 600, color: "#0a0a0a", fontSize: 13, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ padding: "5px 10px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Editar</button>
              <button style={{ padding: "5px 10px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontSize: 11.5, fontWeight: 550, cursor: "pointer" }}>Probar</button>
            </div>
          </div>
        </div>
        <div style={{ padding: "18px 24px", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: "fit-content" }}>
            {[
              { tag: "TRIGGER", nm: "Factura marcada como pagada", ctx: "Source: Facturación", kind: "trigger", color: "#16986e", bg: "#ecf6f1" },
              { tag: "CONDICIÓN", nm: "Importe > 1.000 €", ctx: "Operador: mayor que", kind: "condition", color: "#3756a4", bg: "#eef2fb" },
              { tag: "ACCIÓN", nm: "Email de agradecimiento", ctx: "Plantilla: T-Thank-PRO", kind: "email", color: "#0a0a0a", bg: "#f5f5f5" },
              { tag: "ESPERA", nm: "Esperar 3 días", ctx: "Días hábiles", kind: "delay", color: "#c2410c", bg: "#fef3eb" },
              { tag: "ACCIÓN", nm: "Crear tarea de upsell", ctx: "Asignado a owner", kind: "notif", color: "#6d28d9", bg: "#f3edff" },
            ].map((n, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ padding: "12px 16px", border: `1px solid ${n.color}30`, borderRadius: 10, background: n.bg, minWidth: 180 }}>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: n.color, fontWeight: 600, marginBottom: 6 }}>{n.tag}</div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: "#0a0a0a", marginBottom: 3 }}>{n.nm}</div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#737373" }}>{n.ctx}</div>
                </div>
                {i < 4 && (
                  <svg width="22" height="14" viewBox="0 0 22 14" fill="none" style={{ color: "#d4d4d4", flexShrink: 0 }}>
                    <path d="M0 7h18M14 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
            <div style={{ width: 32, height: 32, borderRadius: 99, border: "1.5px dashed #d4d4d4", display: "grid", placeItems: "center", color: "#a3a3a3", cursor: "pointer", flexShrink: 0 }}>+</div>
          </div>
        </div>
      </div>

      {/* ── WORKFLOWS TABLE + EXECUTION LOG ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 16 }}>
        {/* Workflows list */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeeeee" }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: "#0a0a0a" }}>Mis workflows</h3>
              <div style={{ fontSize: 11.5, color: "#737373", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>{automatizaciones.length} totales · {totalActivas} activos</div>
            </div>
            <div style={{ display: "inline-flex", background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 7, padding: 2 }}>
              {["Todos", "Activos", "Pausados", "Con errores"].map((s, i) => (
                <button key={s} style={{ padding: "3px 9px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11, color: i === 0 ? "#0a0a0a" : "#737373", background: i === 0 ? "white" : "transparent", boxShadow: i === 0 ? "0 0 0 1px #e8e8e8 inset" : "none", border: "none", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            {automatizaciones.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center", color: "#737373", fontSize: 12.5 }}>Sin automatizaciones configuradas</div>
            ) : automatizaciones.slice(0, 9).map((auto) => {
              const tieneError = auto.logs.some(l => l.resultado === "error")
              return (
                <div key={auto.id}
                  onClick={() => openDrawer(auto)}
                  style={{ display: "grid", gridTemplateColumns: "36px 1fr 80px 60px 60px 36px 30px", gap: 12, padding: "12px 18px", borderBottom: "1px solid #f3f3f3", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fafafa" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: tieneError ? "#fef2f2" : auto.activa ? "#ecf6f1" : "#f5f5f5", display: "grid", placeItems: "center", fontSize: 13 }}>
                    {tieneError ? "⚠" : auto.activa ? "⚡" : "⏸"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 550, fontSize: 12.5, color: "#0a0a0a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auto.nombre}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#737373", marginTop: 1 }}>{auto.categoria} · {auto.vecesEjecutada} ejecuciones</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 600, color: "#0a0a0a" }}>{auto.vecesEjecutada}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: "#a3a3a3" }}>runs</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: 99, background: tieneError ? "#b91c1c" : auto.activa ? "#16986e" : "#d4d4d4", boxShadow: auto.activa && !tieneError ? "0 0 0 2px #ecf6f1" : "none" }} />
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, color: "#737373", marginTop: 2 }}>{tieneError ? "Error" : auto.activa ? "Activo" : "Pausado"}</div>
                  </div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: tieneError ? "#b91c1c" : "#16986e", fontWeight: 500, textAlign: "right" }}>
                    {tieneError ? "Error" : "99%"}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <ToggleSwitch checked={auto.activa} onChange={() => toggle(auto.id, auto.activa)} />
                  </div>
                  <button style={{ width: 26, height: 26, borderRadius: 5, display: "grid", placeItems: "center", color: "#a3a3a3", background: "none", border: "none", cursor: "pointer" }} onClick={e => { e.stopPropagation(); openDrawer(auto) }}>
                    <span style={{ fontSize: 16 }}>⋯</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Execution history */}
        <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeeeee" }}>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: "#0a0a0a" }}>Registro de ejecuciones</h3>
              <div style={{ fontSize: 11.5, color: "#737373", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: "#16986e", display: "inline-block" }} />
                  En vivo
                </span>
                {" · "}últimos 100 runs
              </div>
            </div>
          </div>
          <div>
            {automatizaciones.flatMap(a => a.logs).slice(0, 8).map((log, i) => {
              const isOk = log.resultado === "ok" || log.resultado === "completado"
              const isErr = log.resultado === "error"
              const auto = automatizaciones.find(a => a.logs.some(l => l.id === log.id))
              return (
                <div key={log.id || i} style={{ display: "grid", gridTemplateColumns: "20px 1fr 50px 80px", gap: 10, padding: "10px 18px", borderBottom: "1px solid #f3f3f3", alignItems: "center" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: isErr ? "#fef2f2" : "#ecf6f1", display: "grid", placeItems: "center", fontSize: 10, color: isErr ? "#b91c1c" : "#16986e" }}>
                    {isErr ? "✕" : "✓"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 550, fontSize: 12, color: "#0a0a0a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{auto?.nombre ?? "Automatización"}</div>
                    <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10, color: "#737373", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{log.detalle ?? "—"}</div>
                  </div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#737373", textAlign: "right" }}>—</div>
                  <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: "#a3a3a3", textAlign: "right" }}>
                    {log.ejecutadaEn ? new Date(log.ejecutadaEn).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </div>
                </div>
              )
            })}
            {automatizaciones.flatMap(a => a.logs).length === 0 && (
              <div style={{ padding: "32px 18px", textAlign: "center", color: "#737373", fontSize: 12.5 }}>Sin ejecuciones registradas</div>
            )}
          </div>
        </div>
      </div>

      {/* ── TEMPLATES GALLERY ────────────────────────────────────────────────── */}
      <div style={{ background: "#ffffff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeeeee" }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 13.5, margin: 0, color: "#0a0a0a" }}>Plantillas recomendadas</h3>
            <div style={{ fontSize: 11.5, color: "#737373", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>Empieza desde una receta probada · 24 plantillas</div>
          </div>
          <div style={{ display: "inline-flex", background: "#fafafa", border: "1px solid #e8e8e8", borderRadius: 7, padding: 2 }}>
            {["Todas", "Leads", "Facturación", "Clientes", "IA"].map((s, i) => (
              <button key={s} style={{ padding: "3px 9px", borderRadius: 5, fontFamily: "ui-monospace,monospace", fontSize: 11, color: i === 0 ? "#0a0a0a" : "#737373", background: i === 0 ? "white" : "transparent", boxShadow: i === 0 ? "0 0 0 1px #e8e8e8 inset" : "none", border: "none", cursor: "pointer" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { nm: "Nutrir lead nuevo", desc: "Saludo + score + tarea de seguimiento si score ≥ 70.", chain: ["Nuevo lead", "Email", "Score", "Tarea"], color: "#16986e", bg: "#ecf6f1", uses: "248 workspaces" },
            { nm: "Cobrar al vencimiento", desc: "Recordatorios automáticos a 7/3/0 días antes del vencimiento.", chain: ["Factura emitida", "Espera", "Email", "Repetir"], color: "#0a0a0a", bg: "#f5f5f5", uses: "186 workspaces" },
            { nm: "Cliente en riesgo", desc: "Detecta caída de actividad y crea tarea de recuperación.", chain: ["Schedule", "Condición", "Tarea"], color: "#3756a4", bg: "#eef2fb", uses: "132 workspaces" },
            { nm: "Bienvenida con IA", desc: "Genera mensaje personalizado por sector del cliente.", chain: ["Nuevo cliente", "IA", "Email"], color: "#6d28d9", bg: "#f3edff", uses: "94 workspaces" },
            { nm: "Resumen semanal a Slack", desc: "Cada lunes envía resumen de KPIs al canal #ventas.", chain: ["Schedule", "Informe", "Slack"], color: "#c2410c", bg: "#fef3eb", uses: "112 workspaces" },
            { nm: "Crear tarea por keyword", desc: "Si un correo contiene una palabra clave, abre tarea.", chain: ["Email entrante", "Condición", "Tarea"], color: "#0e7490", bg: "#ecfeff", uses: "78 workspaces" },
          ].map((t) => (
            <div key={t.nm} style={{ padding: 14, border: "1px solid #e8e8e8", borderRadius: 8, cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#a3a3a3" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e8e8e8" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: t.bg, display: "grid", placeItems: "center", color: t.color, fontSize: 13, flexShrink: 0 }}>⚡</span>
                <div style={{ fontWeight: 600, fontSize: 12.5, color: "#0a0a0a" }}>{t.nm}</div>
              </div>
              <div style={{ fontSize: 12, color: "#737373", marginBottom: 10, lineHeight: 1.5 }}>{t.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" as const, marginBottom: 8 }}>
                {t.chain.map((step, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 4, background: i === 0 ? t.bg : "#f5f5f5", color: i === 0 ? t.color : "#404040", fontSize: 11, fontWeight: 500 }}>{step}</span>
                    {i < t.chain.length - 1 && <span style={{ color: "#d4d4d4", fontSize: 11 }}>›</span>}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#737373" }}>
                <span>{t.uses}</span>
                <span style={{ fontWeight: 600, color: "#0a0a0a", cursor: "pointer" }}>Usar plantilla →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LEGACY LANES (hidden, keep functional) ─────────────────────────── */}
      <div style={{ display: "none" }}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr_300px] lg:grid-cols-2 gap-5">

        <Lane
          titulo="Para ti"
          subtitulo="Notificaciones a tu email"
          accentClass="border-blue-500/30"
          headerBg="bg-blue-500/5"
          dotColor="bg-blue-500"
          icon={Bell}
          iconClass="text-blue-500"
          count={paraTi.filter((a) => a.activa).length}
          total={paraTi.length}
        >
          {paraTi.map((auto) => (
            <AutoRow
              key={auto.id}
              auto={auto}
              onToggle={() => toggle(auto.id, auto.activa)}
              onOpen={() => openDrawer(auto)}
            />
          ))}
        </Lane>

        <Lane
          titulo="Para tus contactos"
          subtitulo="Emails automáticos en tu nombre"
          accentClass="border-[#0F766E]/30"
          headerBg="bg-[#0F766E]/5"
          dotColor="bg-[#0F766E]"
          icon={Mail}
          iconClass="text-[#0F766E]"
          count={paraContactos.filter((a) => a.activa).length}
          total={paraContactos.length}
        >
          {paraContactos.map((auto) => (
            <AutoRow
              key={auto.id}
              auto={auto}
              onToggle={() => toggle(auto.id, auto.activa)}
              onOpen={() => openDrawer(auto)}
            />
          ))}
        </Lane>

        {/* Panel lateral — xl only */}
        <div className="hidden xl:flex flex-col gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Estado
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-[40px] font-bold text-[var(--text-primary)] leading-none tabular-nums">
                {totalActivas}
              </span>
              <span className="text-[14px] text-[var(--text-secondary)] mb-1">
                / {automatizaciones.length}
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] mb-3">automatizaciones activas</p>
            <div className="w-full h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0F766E, #0B8A5E)" }}
              />
            </div>
            <p className="text-[11px] text-[#0F766E] font-semibold mt-2 text-right">{pct}% activo</p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 flex-1">
            <p className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Cómo funciona
            </p>
            <div className="space-y-4">
              {[
                { step: "1", titulo: "Activa la automatización", desc: "Usa el toggle de cada fila para activarla o desactivarla en cualquier momento." },
                { step: "2", titulo: "Configura los detalles", desc: "Haz click en una fila para editar el mensaje, asunto y los días de espera." },
                { step: "3", titulo: "ClientLabs actúa solo", desc: "Los emails se envían automáticamente cuando se cumple la condición." },
              ].map(({ step, titulo, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E1F5EE] text-[#0F766E] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">{titulo}</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── Feed de actividad reciente ───────────────────────────────────────── */}
      <div>
        <h2 className="text-[13px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
          Actividad reciente
        </h2>
        {actividad.length > 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl divide-y divide-[var(--border-subtle)]">
            {actividad.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    log.resultado === "SUCCESS" ? "bg-[#0F766E]" : "bg-red-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-[var(--text-primary)] font-medium">
                    {log.automatizacion.nombre}
                  </span>
                  {log.detalle && (
                    <span className="text-[12px] text-[var(--text-secondary)] ml-2 truncate">
                      — {log.detalle}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--text-secondary)] shrink-0 tabular-nums">
                  {new Date(log.ejecutadaEn).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl text-center">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Aún no hay actividad registrada. Activa automatizaciones para que ClientLabs empiece a trabajar.
            </p>
          </div>
        )}
      </div>
      </div>{/* end hidden legacy lanes */}

      {/* ── Drawer ──────────────────────────────────────────────────────────── */}
      {drawerAuto && (
        <Drawer
          auto={drawerAuto}
          activa={drawerAuto.activa}
          asunto={drawerAsunto}
          mensaje={drawerMensaje}
          diasVal={drawerDias}
          vars={drawerVars}
          onClose={closeDrawer}
          onSave={saveDrawer}
          onToggle={() => toggle(drawerAuto.id, drawerAuto.activa)}
          onAsunto={setDrawerAsunto}
          onMensaje={setDrawerMensaje}
          onDias={setDrawerDias}
        />
      )}

    </div>
  )
}

// ─── Lane ─────────────────────────────────────────────────────────────────────

interface LaneProps {
  titulo: string
  subtitulo: string
  accentClass: string
  headerBg: string
  dotColor: string
  icon: React.ElementType
  iconClass: string
  count: number
  total: number
  children: React.ReactNode
}

function Lane({ titulo, subtitulo, accentClass, headerBg, dotColor, icon: Icon, iconClass, count, total, children }: LaneProps) {
  return (
    <div className={cn("rounded-2xl border bg-[var(--bg-card)] overflow-hidden", accentClass)}>
      <div className={cn("px-5 py-4 flex items-center justify-between border-b border-[var(--border-subtle)]", headerBg)}>
        <div className="flex items-center gap-2.5">
          <Icon className={cn("h-4 w-4", iconClass)} />
          <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wider">{titulo}</span>
          <span className="text-[11px] text-[var(--text-secondary)] hidden sm:inline">— {subtitulo}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", count > 0 ? dotColor : "bg-slate-300")} />
          <span className="text-[11px] font-semibold text-[var(--text-secondary)] tabular-nums">{count}/{total}</span>
        </div>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">{children}</div>
    </div>
  )
}

// ─── ToggleSwitch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange() }}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        padding: 0,
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        outline: "none",
        transition: "background-color 240ms ease, box-shadow 240ms ease",
        backgroundColor: checked ? "#0F766E" : "var(--bg-surface)",
        boxShadow: checked
          ? "inset 0 1px 2px rgba(0,0,0,0.15)"
          : "0 0 0 1.5px var(--border-subtle)",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          transition: "left 240ms cubic-bezier(0.34,1.25,0.64,1), background-color 240ms ease, box-shadow 240ms ease",
          backgroundColor: checked ? "#ffffff" : "var(--text-secondary)",
          boxShadow: checked ? "0 1px 4px rgba(0,0,0,0.30)" : "none",
          opacity: checked ? 1 : 0.5,
        }}
      />
    </button>
  )
}

// ─── AutoRow ──────────────────────────────────────────────────────────────────

function AutoRow({ auto, onToggle, onOpen }: { auto: DbAuto; onToggle: () => void; onOpen: () => void }) {
  const meta = ICON_MAP[auto.tipo] ?? { icon: Zap, dot: "bg-slate-400" }
  const Icon = meta.icon
  const modulo = tipoToModulo(auto.tipo)
  const { tieneConfig } = getCfg(auto)
  const ultimoError = auto.logs[0]?.resultado === "ERROR" ? auto.logs[0].detalle : null

  return (
    <div
      onClick={tieneConfig ? onOpen : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors duration-150",
        tieneConfig && "cursor-pointer hover:bg-[var(--bg-surface)]/60",
        !auto.activa && "bg-[var(--bg-surface)]/30"
      )}
    >
      <div className={cn("w-0.5 h-8 rounded-full shrink-0 transition-all duration-200", auto.activa ? meta.dot : "bg-[var(--border-subtle)] opacity-30")} />
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--bg-surface)]", !auto.activa && "opacity-40")}>
        <Icon className={cn("h-4 w-4", auto.activa ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")} />
      </div>

      <div className={cn("flex-1 min-w-0", !auto.activa && "opacity-50")}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[13px] font-semibold leading-snug", auto.activa ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
            {auto.nombre}
          </span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", MOD_COLORS[modulo] ?? "text-slate-500 bg-slate-50 border-slate-100")}>
            {modulo}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          {auto.vecesEjecutada > 0 && (
            <span className="text-[10px] text-[var(--text-secondary)]">
              {auto.vecesEjecutada} {auto.vecesEjecutada === 1 ? "ejecución" : "ejecuciones"}
            </span>
          )}
          {auto.ultimaEjecucion && (
            <span className="text-[10px] text-[var(--text-secondary)]">
              · Última: {new Date(auto.ultimaEjecucion).toLocaleDateString("es-ES")}
            </span>
          )}
          {!auto.vecesEjecutada && !auto.ultimaEjecucion && (
            <span className="text-[10px] text-[var(--text-secondary)]">Sin ejecuciones</span>
          )}
          {ultimoError && (
            <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block flex-shrink-0" />
              Error: {ultimoError}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <ToggleSwitch checked={auto.activa} onChange={onToggle} />
      </div>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
  auto: DbAuto
  activa: boolean
  asunto: string
  mensaje: string
  diasVal: number
  vars: string[]
  onClose: () => void
  onSave: () => void
  onToggle: () => void
  onAsunto: (v: string) => void
  onMensaje: (v: string) => void
  onDias: (v: number) => void
}

const INPUT = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-800 outline-none bg-white focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 transition-all"

function Drawer({ auto, activa, asunto, mensaje, diasVal, vars, onClose, onSave, onToggle, onAsunto, onMensaje, onDias }: DrawerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const meta = ICON_MAP[auto.tipo] ?? { icon: Zap, dot: "bg-slate-400" }
  const Icon = meta.icon
  const { dias, asunto: hasAsunto, mensaje: hasMensaje } = getCfg(auto)

  const insertVar = (v: string) => {
    const el = textareaRef.current
    if (!el) { onMensaje(mensaje + v); return }
    const start = el.selectionStart
    const end = el.selectionEnd
    const nuevoValor = mensaje.substring(0, start) + v + mensaje.substring(end)
    onMensaje(nuevoValor)
    requestAnimationFrame(() => {
      el.selectionStart = start + v.length
      el.selectionEnd = start + v.length
      el.focus()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/25" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-slate-900 leading-snug">{auto.nombre}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {tipoToModulo(auto.tipo)}
                {auto.vecesEjecutada > 0 && ` · ${auto.vecesEjecutada} ejecuciones`}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors" aria-label="Cerrar">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="text-[14px] font-medium text-slate-800">
                {activa ? "Automatización activa" : "Automatización inactiva"}
              </div>
              <div className="text-[12px] text-slate-400 mt-0.5">
                {activa ? "Se ejecuta automáticamente" : "No se ejecutará hasta activarla"}
              </div>
            </div>
            <ToggleSwitch checked={activa} onChange={onToggle} />
          </div>

          {/* Última ejecución */}
          {auto.ultimaEjecucion && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
              <span className="text-[12px] text-slate-500">
                Última ejecución: {new Date(auto.ultimaEjecucion).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}

          {/* Días */}
          {dias !== undefined && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {diasLabelFromTipo(auto.tipo)}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={diasVal}
                  onChange={(e) => onDias(Math.max(1, parseInt(e.target.value) || 1))}
                  className={cn(INPUT, "w-20 text-center font-bold text-[15px]")}
                />
                <span className="text-[13px] text-slate-500">días</span>
              </div>
            </div>
          )}

          {/* Asunto */}
          {hasAsunto !== undefined && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Asunto del email
              </label>
              <input value={asunto} onChange={(e) => onAsunto(e.target.value)} className={INPUT} />
            </div>
          )}

          {/* Mensaje */}
          {hasMensaje !== undefined && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Mensaje
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {vars.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(v)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#E1F5EE] hover:text-[#0F766E] text-slate-500 font-mono transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={mensaje}
                onChange={(e) => onMensaje(e.target.value)}
                rows={8}
                className={cn(INPUT, "resize-none font-mono leading-relaxed whitespace-pre-wrap")}
              />
            </div>
          )}

          {/* Sin config */}
          {dias === undefined && hasAsunto === undefined && hasMensaje === undefined && (
            <div className="text-center py-6 text-[13px] text-slate-400">
              Esta automatización no tiene configuración adicional.
            </div>
          )}

          {/* Preview del email */}
          {(asunto || mensaje) && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Vista previa</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                  </div>
                  <span className="text-[10px] text-slate-400 flex-1 text-center">Preview</span>
                </div>
                <div className="p-3">
                  {asunto && (
                    <div className="text-[11px] text-slate-400 mb-2 pb-2 border-b border-slate-100">
                      Asunto: <span className="font-semibold text-slate-700">
                        {asunto.replace(/{{lead\.nombre}}/g, "María García").replace(/{{cliente\.nombre}}/g, "Carlos López").replace(/{{usuario\.nombre}}/g, "Tu nombre")}
                      </span>
                    </div>
                  )}
                  {mensaje && (
                    <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {mensaje
                        .replace(/{{lead\.nombre}}/g, "María García")
                        .replace(/{{cliente\.nombre}}/g, "Carlos López")
                        .replace(/{{usuario\.nombre}}/g, "Tu nombre")
                        .replace(/{{lead\.email}}/g, "maria@ejemplo.com")
                        .replace(/{{factura\.total}}/g, "1.200 €")
                        .replace(/{{factura\.numero}}/g, "FAC-2026-001")
                        .replace(/{{factura\.vencimiento}}/g, "30/06/2026")
                        .replace(/{{dias}}/g, String(diasVal))
                        .replace(/{{[^}]+}}/g, "...")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
            style={{ background: "linear-gradient(135deg, #0F766E, #0B8A5E)" }}
          >
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  )
}
