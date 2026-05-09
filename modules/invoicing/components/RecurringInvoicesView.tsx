"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, RefreshCw, Pause, Play, Trash2, Calendar } from "lucide-react"

interface RecurringItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
}

interface Recurring {
  id: string
  clientId: string
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  nextRunAt: string
  lastRunAt: string | null
  active: boolean
  currency: string
  irpfRate: number
  notes: string | null
  items: RecurringItem[]
  createdAt: string
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  YEARLY: "Anual",
}

function fmt(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

function lineTotal(items: RecurringItem[]) {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 + i.taxPercent / 100), 0)
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clientId, setClientId] = useState("")
  const [frequency, setFrequency] = useState("MONTHLY")
  const [nextRunAt, setNextRunAt] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10)
  })
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [taxPercent, setTaxPercent] = useState(21)
  const [saving, setSaving] = useState(false)

  const { data: clientsData } = useQuery<{ id: string; name: string | null }[]>({
    queryKey: ["clients-list"],
    queryFn: () => fetch("/api/clients").then((r) => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  })
  const clients = Array.isArray(clientsData) ? clientsData : []

  const handleSave = async () => {
    if (!clientId || !description.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/billing/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          frequency,
          nextRunAt,
          items: [{ description: description.trim(), quantity, unitPrice, taxPercent, discountPercent: 0 }],
        }),
      })
      const data = await res.json()
      if (!data.success) { toast.error(data.error ?? "Error"); return }
      toast.success("Factura recurrente creada")
      onCreated()
      onClose()
    } catch {
      toast.error("Error al crear")
    } finally {
      setSaving(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 700, color: "#64748b",
    marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em",
  }
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a",
    background: "white", outline: "none", boxSizing: "border-box",
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        style={{ background: "white", borderRadius: 12, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#0f172a" }}>Nueva factura recurrente</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Cliente *</label>
            <select style={inputStyle} value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name ?? c.id}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Frecuencia</label>
              <select style={inputStyle} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Próximo envío</label>
              <input type="date" style={inputStyle} value={nextRunAt} onChange={(e) => setNextRunAt(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Descripción de la línea *</label>
            <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Servicio mensual de mantenimiento" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Cantidad</label>
              <input type="number" min={0.01} step={0.01} style={inputStyle} value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)} />
            </div>
            <div>
              <label style={labelStyle}>Precio unit.</label>
              <input type="number" min={0} step={0.01} style={inputStyle} value={unitPrice} onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label style={labelStyle}>IVA %</label>
              <input type="number" min={0} max={100} style={inputStyle} value={taxPercent} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !clientId || !description.trim()}
            style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: "#1FA97A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Guardando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function RecurringInvoicesView() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery<{ recurring: Recurring[] }>({
    queryKey: ["recurring-invoices"],
    queryFn: () => fetch("/api/billing/recurring").then((r) => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
  })

  const recurring = data?.recurring ?? []

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      fetch(`/api/billing/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recurring-invoices"] }),
    onError: () => toast.error("Error al actualizar"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/billing/recurring/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => { toast.success("Eliminada"); qc.invalidateQueries({ queryKey: ["recurring-invoices"] }) },
    onError: () => toast.error("Error al eliminar"),
  })

  return (
    <div style={{ padding: "24px 28px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Facturas recurrentes</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Se generan automáticamente como borrador según la frecuencia configurada
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "#1FA97A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Nueva
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)", fontSize: 13 }}>Cargando...</div>
      ) : recurring.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
          <RefreshCw style={{ width: 32, height: 32, color: "var(--text-secondary)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 6px" }}>Sin facturas recurrentes</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Crea una plantilla y se generará automáticamente cada período</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recurring.map((r) => (
            <div key={r.id} style={{
              background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16, opacity: r.active ? 1 : 0.6,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: r.active ? "#1FA97A18" : "var(--bg-surface)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <RefreshCw style={{ width: 16, height: 16, color: r.active ? "#1FA97A" : "var(--text-secondary)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {r.items[0]?.description ?? "Sin descripción"}
                    {r.items.length > 1 && <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 4 }}>+{r.items.length - 1} líneas</span>}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                    background: r.active ? "#1FA97A18" : "var(--bg-surface)",
                    color: r.active ? "#1FA97A" : "var(--text-secondary)",
                  }}>
                    {FREQ_LABELS[r.frequency]}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--text-secondary)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar style={{ width: 11, height: 11 }} />
                    Próximo: {new Date(r.nextRunAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{fmt(lineTotal(r.items))}/período</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => toggleMutation.mutate({ id: r.id, active: !r.active })}
                  title={r.active ? "Pausar" : "Reanudar"}
                  style={{ padding: "6px", borderRadius: 6, border: "1px solid var(--border-subtle)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  {r.active ? <Pause style={{ width: 13, height: 13, color: "var(--text-secondary)" }} /> : <Play style={{ width: 13, height: 13, color: "#1FA97A" }} />}
                </button>
                <button
                  onClick={() => { if (confirm("¿Eliminar esta factura recurrente?")) deleteMutation.mutate(r.id) }}
                  style={{ padding: "6px", borderRadius: 6, border: "1px solid #fecaca", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Trash2 style={{ width: 13, height: 13, color: "#ef4444" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["recurring-invoices"] })} />}
    </div>
  )
}
