"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, RefreshCw, Pause, Play, Trash2, Pencil, FilePlus2, Ban } from "lucide-react"
import { FiscalDataModal } from "@/components/finance/FiscalDataModal"
import { RecurringFormModal, type RecurringTemplate } from "./RecurringFormModal"

const FREQ_LABELS: Record<string, string> = { MONTHLY: "Mensual", QUARTERLY: "Trimestral", ANNUAL: "Anual", CUSTOM: "Personalizada" }
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  ACTIVE: { label: "Activa", bg: "#0F766E18", color: "#0F766E" },
  PAUSED: { label: "Pausada", bg: "#f59e0b18", color: "#b45309" },
  ENDED: { label: "Terminada", bg: "#94a3b818", color: "#64748b" },
}

// Tabla: mismas columnas en cabecera y filas. Cliente | Frecuencia | Próxima | Importe | Estado | Generadas | Acciones
const GRID = "minmax(140px,1.6fr) 1fr 1.1fr 1fr 104px 92px 250px"
const ROW_MIN_WIDTH = 880
const colHead: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }
const cell: React.CSSProperties = { fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }

const fmt = (n: number) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
function periodTotal(t: RecurringTemplate) {
  const gross = t.items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 + i.taxPercent / 100), 0)
  return gross - t.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) * ((t.irpfRate || 0) / 100)
}

export function RecurringInvoicesView() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RecurringTemplate | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [fiscalClientId, setFiscalClientId] = useState<string | null>(null)
  const [pendingGenerateId, setPendingGenerateId] = useState<string | null>(null)

  const { data, isLoading } = useQuery<{ recurring: RecurringTemplate[] }>({
    queryKey: ["recurring-invoices"],
    queryFn: () => fetch("/api/billing/recurring").then((r) => r.json()),
    staleTime: 60_000, refetchOnWindowFocus: false, retry: 0,
  })
  const recurring = data?.recurring ?? []
  const refresh = () => qc.invalidateQueries({ queryKey: ["recurring-invoices"] })

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/billing/recurring/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      if (!res.ok) { toast.error("Error al actualizar"); return }
      refresh()
    } finally { setBusyId(null) }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta plantilla recurrente?")) return
    setBusyId(id)
    try {
      await fetch(`/api/billing/recurring/${id}`, { method: "DELETE" })
      toast.success("Plantilla eliminada"); refresh()
    } finally { setBusyId(null) }
  }

  async function generate(id: string) {
    setBusyId(id)
    try {
      const res = await fetch(`/api/billing/recurring/${id}/generate`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        if (data.needsClientFiscalData && data.clientId) { setPendingGenerateId(id); setFiscalClientId(data.clientId); return }
        toast.error(data.error ?? "Error al generar"); return
      }
      toast.success(`Factura ${data.number} creada como borrador. Revísala y emítela desde Facturas.`)
      refresh()
    } catch { toast.error("Error de conexión") }
    finally { setBusyId(null) }
  }

  const iconBtn = (onClick: () => void, title: string, node: React.ReactNode, danger = false) => (
    <button onClick={onClick} disabled={!!busyId} title={title}
      style={{ padding: 6, borderRadius: 6, border: `1px solid ${danger ? "#fecaca" : "var(--border-subtle)"}`, background: "transparent", cursor: busyId ? "default" : "pointer", display: "flex", alignItems: "center", opacity: busyId ? 0.6 : 1 }}>
      {node}
    </button>
  )

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Facturas recurrentes</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Plantillas para generar facturas en borrador. Cada generación crea una factura real que revisas y emites con el flujo normal.
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "#0F766E", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus style={{ width: 14, height: 14 }} /> Nueva
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)", fontSize: 13 }}>Cargando...</div>
      ) : recurring.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
          <RefreshCw style={{ width: 32, height: 32, color: "var(--text-secondary)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>Sin facturas recurrentes</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Crea una plantilla o convierte una factura existente en recurrente</p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflowX: "auto", background: "var(--bg-card)" }}>
          {/* Cabecera de tabla */}
          <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, alignItems: "center", minWidth: ROW_MIN_WIDTH, padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <span style={colHead}>Cliente</span>
            <span style={colHead}>Frecuencia</span>
            <span style={colHead}>Próxima generación</span>
            <span style={{ ...colHead, textAlign: "right" }}>Importe/período</span>
            <span style={colHead}>Estado</span>
            <span style={{ ...colHead, textAlign: "center" }}>Generadas</span>
            <span style={{ ...colHead, textAlign: "right" }}>Acciones</span>
          </div>
          {recurring.map((r, idx) => {
            const st = STATUS_META[r.status] ?? STATUS_META.ENDED
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, alignItems: "center", minWidth: ROW_MIN_WIDTH, padding: "12px 16px", borderTop: idx === 0 ? "none" : "1px solid var(--border-subtle)", opacity: r.status === "ENDED" ? 0.6 : 1 }}>
                {/* Cliente + tipo */}
                <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.clientName ?? "Cliente"}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#64748b12", color: "#64748b", flexShrink: 0 }}>{r.type}</span>
                </div>
                {/* Frecuencia */}
                <span style={cell}>{FREQ_LABELS[r.frequency]}{r.frequency === "CUSTOM" && r.intervalMonths ? ` · ${r.intervalMonths}m` : ""}{r.dayOfMonth ? ` · día ${r.dayOfMonth}` : ""}</span>
                {/* Próxima generación */}
                <span style={cell}>{fmtDate(r.nextRunDate)}</span>
                {/* Importe / período */}
                <span style={{ ...cell, textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{fmt(periodTotal(r))}</span>
                {/* Estado */}
                <span><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: st.bg, color: st.color }}>{st.label}</span></span>
                {/* Nº generadas */}
                <span style={{ ...cell, textAlign: "center" }}>{r.generatedCount}</span>
                {/* Acciones */}
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                  {r.status === "ACTIVE" && (
                    <button onClick={() => generate(r.id)} disabled={!!busyId} title="Generar una factura en borrador ahora"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "none", background: "#0F766E", color: "white", fontSize: 12.5, fontWeight: 600, cursor: busyId ? "default" : "pointer", opacity: busyId ? 0.6 : 1, whiteSpace: "nowrap" }}>
                      <FilePlus2 style={{ width: 13, height: 13 }} /> Generar
                    </button>
                  )}
                  {r.status === "ACTIVE" && iconBtn(() => patch(r.id, { status: "PAUSED" }), "Pausar", <Pause style={{ width: 13, height: 13, color: "var(--text-secondary)" }} />)}
                  {r.status === "PAUSED" && iconBtn(() => patch(r.id, { status: "ACTIVE" }), "Reanudar", <Play style={{ width: 13, height: 13, color: "#0F766E" }} />)}
                  {r.status !== "ENDED" && iconBtn(() => { setEditing(r); setShowForm(true) }, "Editar", <Pencil style={{ width: 13, height: 13, color: "var(--text-secondary)" }} />)}
                  {r.status !== "ENDED" && iconBtn(() => { if (confirm("¿Terminar esta plantilla? Dejará de generar facturas.")) patch(r.id, { status: "ENDED" }) }, "Terminar (deja de generar)", <Ban style={{ width: 13, height: 13, color: "var(--text-secondary)" }} />)}
                  {iconBtn(() => remove(r.id), "Eliminar", <Trash2 style={{ width: 13, height: 13, color: "#ef4444" }} />, true)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RecurringFormModal open={showForm} editing={editing} onClose={() => setShowForm(false)} onSaved={refresh} />

      {fiscalClientId && (
        <FiscalDataModal
          clientId={fiscalClientId}
          onClose={() => { setFiscalClientId(null); setPendingGenerateId(null) }}
          onSaved={() => { const id = pendingGenerateId; setFiscalClientId(null); setPendingGenerateId(null); if (id) generate(id) }}
        />
      )}
    </div>
  )
}
