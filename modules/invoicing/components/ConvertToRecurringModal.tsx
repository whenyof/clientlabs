"use client"

import { useState } from "react"
import { toast } from "sonner"
import { X, ChevronDown } from "lucide-react"

const FREQS = [
  { v: "MONTHLY", l: "Mensual" },
  { v: "QUARTERLY", l: "Trimestral" },
  { v: "ANNUAL", l: "Anual" },
  { v: "CUSTOM", l: "Personalizada" },
]
const today = () => new Date().toISOString().slice(0, 10)
const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", background: "white", outline: "none", boxSizing: "border-box" }

/**
 * Convierte una factura existente en plantilla recurrente. Siembra la plantilla en
 * el backend con las líneas/tipo/IRPF de la factura. NO modifica la factura original.
 */
export function ConvertToRecurringModal({ invoiceId, invoiceNumber, onClose, onDone }: {
  invoiceId: string
  invoiceNumber?: string | null
  onClose: () => void
  onDone?: () => void
}) {
  const [frequency, setFrequency] = useState("MONTHLY")
  const [intervalMonths, setIntervalMonths] = useState("2")
  const [startDate, setStartDate] = useState(today())
  const [noEnd, setNoEnd] = useState(true)
  const [endDate, setEndDate] = useState(today())
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)
    try {
      const res = await fetch("/api/billing/recurring/from-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId, frequency,
          intervalMonths: frequency === "CUSTOM" ? Number(intervalMonths) || 1 : null,
          startDate, endDate: noEnd ? null : endDate,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) { toast.error(data.error ?? "Error al convertir"); return }
      toast.success("Plantilla recurrente creada desde la factura")
      onDone?.(); onClose()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 12, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>Convertir en recurrente</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px" }}>
          Se creará una plantilla con el cliente, líneas, tipo e IRPF de {invoiceNumber ? `la factura ${invoiceNumber}` : "esta factura"}. La factura original no se modifica.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: frequency === "CUSTOM" ? "1fr 120px" : "1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Frecuencia</label>
              <div style={{ position: "relative" }}>
                <select style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none", MozAppearance: "none", cursor: "pointer", paddingRight: 32 }} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {FREQS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#a3a3a3", pointerEvents: "none" }} />
              </div>
            </div>
            {frequency === "CUSTOM" && (
              <div>
                <label style={labelStyle}>Cada (meses)</label>
                <input style={inputStyle} type="number" min={1} max={60} value={intervalMonths} onChange={(e) => setIntervalMonths(e.target.value)} />
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Fecha de inicio</label>
              <input style={inputStyle} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Fin</label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569", marginBottom: 6 }}>
                <input type="checkbox" checked={noEnd} onChange={(e) => setNoEnd(e.target.checked)} /> Indefinido
              </label>
              {!noEnd && <input style={inputStyle} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", fontSize: 13, cursor: "pointer", color: "#64748b" }}>Cancelar</button>
          <button onClick={submit} disabled={saving} style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: "#0F766E", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Creando..." : "Crear plantilla"}
          </button>
        </div>
      </div>
    </div>
  )
}
