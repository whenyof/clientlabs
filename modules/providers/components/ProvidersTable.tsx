"use client"

import { useState, useRef, useEffect, memo } from "react"
import { ShoppingBag, CheckSquare, Mail, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { updateProvider } from "@/app/dashboard/providers/actions"
import { RegisterOrderDialog } from "./RegisterOrderDialog"
import { CreateTaskDialog } from "./CreateTaskDialog"

type Provider = {
  id: string; name: string; type: string | null; monthlyCost: number | null
  dependencyLevel: string; status: string; isCritical: boolean
  operationalState: string; createdAt: Date; updatedAt: Date
  payments: any[]; tasks: any[]; contactEmail?: string | null
  _count: { payments: number; tasks: number }
}

type Props = {
  providers: Provider[]; onProviderClick: (p: Provider) => void
  onProviderUpdate: (id: string, data: any) => void
  resultCount?: number; totalCount?: number
  hasActiveFilters?: boolean; onCreateClick?: () => void
}

type DropOpt = { label: string; bg: string; text: string; dot: string }

const S: Record<string, DropOpt> = {
  OK:      { label: "Estable",    bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  ACTIVE:  { label: "Activo",     bg: "#DCFCE7", text: "#166534", dot: "#22C55E" },
  PAUSED:  { label: "Pausado",    bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  PENDING: { label: "Pendiente",  bg: "#FEF9C3", text: "#854D0E", dot: "#EAB308" },
  ISSUE:   { label: "Incidencia", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  BLOCKED: { label: "Bloqueado",  bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
}

const D: Record<string, DropOpt> = {
  LOW:      { label: "Baja",    bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  MEDIUM:   { label: "Media",   bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  HIGH:     { label: "Alta",    bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
  CRITICAL: { label: "Crítica", bg: "#FEE2E2", text: "#7F1D1D", dot: "#B91C1C" },
}

const TYPE_LABELS: Record<string, string> = { SERVICE: "Servicio", PRODUCT: "Producto", SOFTWARE: "Software", OTHER: "Otro" }

const initials = (n: string) => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
const fEUR = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

// ── Inline dropdown ──────────────────────────────────────────────────────────
function InlineSelect({ current, opts, onChange, zBase = 30 }: { current: string; opts: Record<string, DropOpt>; onChange: (v: string) => void; zBase?: number }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<"top" | "bottom">("bottom")
  const wrapRef = useRef<HTMLDivElement>(null)
  const trigRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [open])

  const cfg = opts[current] ?? { label: current, bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" }

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (trigRef.current) {
      const r = trigRef.current.getBoundingClientRect()
      setPos(window.innerHeight - r.bottom < 220 && r.top > 220 ? "top" : "bottom")
    }
    setOpen(v => !v)
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={trigRef}
        onClick={handleOpen}
        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: cfg.bg, color: cfg.text, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
        {cfg.label}
      </button>
      {open && (
        <div style={{ position: "absolute", ...(pos === "top" ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }), left: 0, zIndex: zBase + 20, minWidth: 150, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          {Object.entries(opts).map(([key, o]) => (
            <button
              key={key}
              onClick={e => { e.stopPropagation(); onChange(key); setOpen(false) }}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 12px", fontSize: 12, color: key === current ? o.text : "#334155", background: key === current ? o.bg : "transparent", border: "none", cursor: "pointer", fontWeight: key === current ? 600 : 400, textAlign: "left" }}
              onMouseEnter={e => { if (key !== current) e.currentTarget.style.background = "#F8FAFB" }}
              onMouseLeave={e => { if (key !== current) e.currentTarget.style.background = "transparent" }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: o.dot, flexShrink: 0 }} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Row ──────────────────────────────────────────────────────────────────────
function ProviderRow({ p, onProviderClick, onProviderUpdate, onOrder, onTask }: {
  p: Provider; onProviderClick: (p: Provider) => void; onProviderUpdate: (id: string, d: any) => void
  onOrder: () => void; onTask: () => void
}) {
  const [status, setStatus] = useState(p.status)
  const [dep, setDep] = useState(p.dependencyLevel)
  const isIncident = status === "ISSUE"
  const isInactive = status === "PAUSED" || status === "BLOCKED"

  const changeStatus = async (v: string) => {
    const prev = status; setStatus(v)
    const r = await updateProvider(p.id, { status: v })
    if (r.success) { onProviderUpdate(p.id, { status: v }); toast.success(`Estado: ${S[v]?.label ?? v}`) }
    else { setStatus(prev); toast.error("Error al cambiar estado") }
  }

  const changeDep = async (v: string) => {
    const prev = dep; setDep(v)
    const r = await updateProvider(p.id, { dependency: v })
    if (r.success) { onProviderUpdate(p.id, { dependencyLevel: v }); toast.success(`Dependencia: ${D[v]?.label ?? v}`) }
    else { setDep(prev); toast.error("Error al cambiar dependencia") }
  }

  return (
    <tr
      onClick={() => onProviderClick(p)}
      style={{ borderBottom: "0.5px solid var(--border-subtle)", cursor: "pointer", transition: "background 0.12s", background: isIncident ? "rgba(245,158,11,0.04)" : "transparent", opacity: isInactive ? 0.6 : 1 }}
      onMouseEnter={e => (e.currentTarget.style.background = isIncident ? "rgba(245,158,11,0.08)" : "var(--bg-surface)")}
      onMouseLeave={e => (e.currentTarget.style.background = isIncident ? "rgba(245,158,11,0.04)" : "transparent")}
    >
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(31,169,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1FA97A" }}>{initials(p.name)}</span>
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>{p.name}</span>
            {p.isCritical && <span style={{ fontSize: 10, fontWeight: 600, background: "#FEE2E2", color: "#991B1B", borderRadius: 4, padding: "1px 5px" }}>CRÍTICO</span>}
          </div>
        </div>
      </td>
      <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{TYPE_LABELS[p.type ?? "OTHER"] ?? "Otro"}</span></td>
      <td style={{ padding: "12px 16px" }}>
        {p.monthlyCost
          ? <><span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>{fEUR(p.monthlyCost)}</span><span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fEUR(p.monthlyCost * 12)}/año</span></>
          : <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>—</span>}
      </td>
      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
        <InlineSelect current={status} opts={S} onChange={changeStatus} />
      </td>
      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
        <InlineSelect current={dep} opts={D} onChange={changeDep} zBase={20} />
      </td>
      <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true, locale: es })}</span></td>
      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          {([
            { Icon: ShoppingBag, title: "Nuevo pedido", color: "#1FA97A", bg: "rgba(31,169,122,0.08)", fn: onOrder },
            { Icon: CheckSquare, title: "Nueva tarea", color: "#D97706", bg: "rgba(217,119,6,0.08)", fn: onTask },
            { Icon: Mail, title: "Enviar email", color: "#0EA5E9", bg: "rgba(14,165,233,0.08)", fn: () => p.contactEmail ? window.open(`mailto:${p.contactEmail}`) : onProviderClick(p) },
          ] as const).map(({ Icon, title, color, bg, fn }) => (
            <button key={title} title={title} onClick={fn as any}
              style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color, transition: "background 0.12s" }}
              onMouseEnter={e => (e.currentTarget.style.background = bg)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </td>
    </tr>
  )
}

// ── Table ────────────────────────────────────────────────────────────────────
function ProvidersTableComponent({ providers, onProviderClick, onProviderUpdate, resultCount, totalCount, hasActiveFilters, onCreateClick }: Props) {
  const [orderFor, setOrderFor] = useState<Provider | null>(null)
  const [taskFor, setTaskFor] = useState<Provider | null>(null)

  if (providers.length === 0) return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 48, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-surface)", border: "0.5px solid var(--border-subtle)" }}>
          <Package size={24} style={{ color: "var(--text-secondary)" }} />
        </div>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{hasActiveFilters ? "Sin resultados" : "Sin proveedores"}</h3>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{hasActiveFilters ? "Ajusta los filtros para ver más." : "Añade el primer proveedor para empezar."}</p>
      {!hasActiveFilters && onCreateClick && (
        <button onClick={onCreateClick} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#1FA97A", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>Nuevo proveedor</button>
      )}
    </div>
  )

  return (
    <>
      <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "0.5px solid var(--border-subtle)" }}>
                {["PROVEEDOR", "TIPO", "COSTE / MES", "ESTADO", "DEPENDENCIA", "ÚLTIMA ACCIÓN", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 16px", textAlign: i === 6 ? "right" : "left", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <ProviderRow key={p.id} p={p} onProviderClick={onProviderClick} onProviderUpdate={onProviderUpdate} onOrder={() => setOrderFor(p)} onTask={() => setTaskFor(p)} />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "0.5px solid var(--border-subtle)", fontSize: 12, color: "var(--text-secondary)" }}>
          <span>Mostrando {hasActiveFilters ? `${resultCount ?? providers.length} de ${totalCount}` : providers.length} {providers.length === 1 ? "proveedor" : "proveedores"}</span>
          <span>Clic en fila para ver detalle</span>
        </div>
      </div>
      {orderFor && <RegisterOrderDialog providerId={orderFor.id} providerName={orderFor.name} open onOpenChange={o => !o && setOrderFor(null)} onSuccess={() => onProviderUpdate(orderFor.id, {})} />}
      {taskFor && <CreateTaskDialog providerId={taskFor.id} providerName={taskFor.name} open onOpenChange={o => !o && setTaskFor(null)} onSuccess={() => onProviderUpdate(taskFor.id, {})} />}
    </>
  )
}

export const ProvidersTable = memo(ProvidersTableComponent)
