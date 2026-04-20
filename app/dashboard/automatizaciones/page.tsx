"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Bell, Clock, TrendingDown, FileText, Calendar,
  CheckCircle, Send, Users, Gift, AlertTriangle,
  Zap, Mail, X, Sparkles, CheckSquare, Building2, Package, Star,
} from "lucide-react"

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
  CONFIRMACION_LEAD:          { icon: CheckCircle,   dot: "bg-[#1FA97A]" },
  SEGUIMIENTO_DIA_3:          { icon: Send,          dot: "bg-blue-400" },
  SEGUIMIENTO_DIA_7:          { icon: Send,          dot: "bg-slate-400" },
  BIENVENIDA_CLIENTE:         { icon: Users,         dot: "bg-[#1FA97A]" },
  FACTURA_VENCIDA:            { icon: FileText,      dot: "bg-red-400" },
  PRESUPUESTO_EXPIRA:         { icon: AlertTriangle, dot: "bg-orange-400" },
  PRESUPUESTO_EXPIRADO:       { icon: AlertTriangle, dot: "bg-orange-400" },
  CUMPLEANOS_CLIENTE:         { icon: Gift,          dot: "bg-pink-400" },
  CONFIRMACION_PEDIDO:        { icon: Package,       dot: "bg-[#1FA97A]" },
  AVISO_ENTREGA:              { icon: Package,       dot: "bg-[#1FA97A]" },
  SOLICITUD_VALORACION:       { icon: Star,          dot: "bg-pink-400" },
}

const MOD_COLORS: Record<string, string> = {
  Leads:        "text-blue-600 bg-blue-50 border-blue-100",
  Facturación:  "text-red-600 bg-red-50 border-red-100",
  Finanzas:     "text-purple-600 bg-purple-50 border-purple-100",
  Clientes:     "text-[#1FA97A] bg-[#E1F5EE] border-[#1FA97A]/20",
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
  const [automatizaciones, setAutomatizaciones] = useState<DbAuto[]>([])
  const [actividad, setActividad] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Drawer
  const [drawerAuto, setDrawerAuto] = useState<DbAuto | null>(null)
  const [drawerAsunto, setDrawerAsunto] = useState("")
  const [drawerMensaje, setDrawerMensaje] = useState("")
  const [drawerDias, setDrawerDias] = useState(1)

  useEffect(() => {
    fetch("/api/automatizaciones")
      .then((r) => r.json())
      .then((data) => {
        setAutomatizaciones(data.automatizaciones ?? [])
        setActividad(data.actividadReciente ?? [])
      })
      .catch(() => toast.error("Error cargando automatizaciones"))
      .finally(() => setLoading(false))
  }, [])

  const totalActivas = automatizaciones.filter((a) => a.activa).length
  const pct = automatizaciones.length > 0
    ? Math.round((totalActivas / automatizaciones.length) * 100)
    : 0

  const toggle = async (id: string, activa: boolean) => {
    // Optimistic update
    setAutomatizaciones((prev) => prev.map((a) => a.id === id ? { ...a, activa: !activa } : a))
    try {
      const res = await fetch(`/api/automatizaciones/${id}/toggle`, { method: "PATCH" })
      if (!res.ok) throw new Error()
    } catch {
      // Revert
      setAutomatizaciones((prev) => prev.map((a) => a.id === id ? { ...a, activa } : a))
      toast.error("Error al actualizar")
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

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="pb-2">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
          Automatizaciones
        </h1>
        <p className="mt-0.5 text-[14px] text-[var(--text-secondary)]">
          Configura acciones automáticas para leads, clientes y facturas
        </p>
        <div className="mt-3 flex items-center justify-between gap-4 w-full p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-[#1FA97A] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Los emails se envían desde{" "}
                <span className="text-[var(--text-primary)] font-medium">hola@clientlabs.io</span>
                {" "}en tu nombre. Tus contactos verán tu nombre como remitente.
                Próximamente podrás conectar tu propio dominio.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/automatizaciones/email-info"
            className="shrink-0 text-[11px] font-medium text-[#1FA97A] hover:underline whitespace-nowrap"
          >
            Saber más
          </a>
        </div>
      </div>

      {/* ── Layout: lanes + sidebar ─────────────────────────────────────────── */}
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
          accentClass="border-[#1FA97A]/30"
          headerBg="bg-[#1FA97A]/5"
          dotColor="bg-[#1FA97A]"
          icon={Mail}
          iconClass="text-[#1FA97A]"
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
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1FA97A, #0B8A5E)" }}
              />
            </div>
            <p className="text-[11px] text-[#1FA97A] font-semibold mt-2 text-right">{pct}% activo</p>
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
                  <div className="w-5 h-5 rounded-full bg-[#E1F5EE] text-[#1FA97A] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
                    log.resultado === "SUCCESS" ? "bg-[#1FA97A]" : "bg-red-400"
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
        backgroundColor: checked ? "#1FA97A" : "var(--bg-surface)",
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

const INPUT = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-800 outline-none bg-white focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 transition-all"

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
              <div className="w-1.5 h-1.5 rounded-full bg-[#1FA97A]" />
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
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-[#E1F5EE] hover:text-[#1FA97A] text-slate-500 font-mono transition-colors"
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
            style={{ background: "linear-gradient(135deg, #1FA97A, #0B8A5E)" }}
          >
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  )
}
