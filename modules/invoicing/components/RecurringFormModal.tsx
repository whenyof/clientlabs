"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { X, Plus, Trash2 } from "lucide-react"
import { FiscalDataModal } from "@/components/finance/FiscalDataModal"
import { ALLOWED_VAT_RATES } from "@/modules/invoicing/utils/vatRates"

export type RecurringTemplate = {
  id: string
  clientId: string
  clientName: string | null
  type: "F1" | "F2"
  frequency: "MONTHLY" | "QUARTERLY" | "ANNUAL" | "CUSTOM"
  intervalMonths: number | null
  dayOfMonth: number | null
  startDate: string
  endDate: string | null
  nextRunDate: string
  status: "ACTIVE" | "PAUSED" | "ENDED"
  irpfRate: number
  currency: string
  notes: string | null
  generatedCount: number
  lastGeneratedAt: string | null
  items: { id: string; description: string; quantity: number; unitPrice: number; taxPercent: number; discountPercent: number }[]
}

type LineForm = { description: string; quantity: string; unitPrice: string; taxPercent: number }

const FREQS = [
  { v: "MONTHLY", l: "Mensual" },
  { v: "QUARTERLY", l: "Trimestral" },
  { v: "ANNUAL", l: "Anual" },
  { v: "CUSTOM", l: "Personalizada" },
]

const today = () => new Date().toISOString().slice(0, 10)
const emptyLine = (): LineForm => ({ description: "", quantity: "1", unitPrice: "0", taxPercent: 21 })

const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 7, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", background: "white", outline: "none", boxSizing: "border-box" }

// Columnas compartidas entre cabecera y filas de líneas (Concepto/Cantidad/Precio/IVA/Total/borrar)
const LINE_COLS = "1fr 64px 92px 84px 80px 30px"
const colHead: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }

/** Select con estilo consistente con el módulo de facturación (appearance-none + chevron). */
function StyledSelect({ value, onChange, disabled, children }: {
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-[13px] text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  )
}

export function RecurringFormModal({ open, onClose, onSaved, editing }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editing?: RecurringTemplate | null
}) {
  const [clientId, setClientId] = useState("")
  const [type, setType] = useState<"F1" | "F2">("F1")
  const [frequency, setFrequency] = useState("MONTHLY")
  const [intervalMonths, setIntervalMonths] = useState("2")
  const [dayOfMonth, setDayOfMonth] = useState("")
  const [startDate, setStartDate] = useState(today())
  const [noEnd, setNoEnd] = useState(true)
  const [endDate, setEndDate] = useState(today())
  const [irpfRate, setIrpfRate] = useState("0")
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<LineForm[]>([emptyLine()])
  const [saving, setSaving] = useState(false)
  const [fiscalClientId, setFiscalClientId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setClientId(editing.clientId)
      setType(editing.type)
      setFrequency(editing.frequency)
      setIntervalMonths(String(editing.intervalMonths ?? 2))
      setDayOfMonth(editing.dayOfMonth != null ? String(editing.dayOfMonth) : "")
      setStartDate(editing.startDate.slice(0, 10))
      setNoEnd(!editing.endDate)
      setEndDate((editing.endDate ?? new Date().toISOString()).slice(0, 10))
      setIrpfRate(String(editing.irpfRate ?? 0))
      setNotes(editing.notes ?? "")
      setLines(editing.items.map((i) => ({ description: i.description, quantity: String(i.quantity), unitPrice: String(i.unitPrice), taxPercent: i.taxPercent })))
    } else {
      setClientId(""); setType("F1"); setFrequency("MONTHLY"); setIntervalMonths("2"); setDayOfMonth("")
      setStartDate(today()); setNoEnd(true); setEndDate(today()); setIrpfRate("0"); setNotes(""); setLines([emptyLine()])
    }
  }, [open, editing])

  const { data: clientsData } = useQuery<{ id: string; name: string | null }[]>({
    queryKey: ["clients-list"],
    queryFn: () => fetch("/api/clients").then((r) => r.json()),
    staleTime: 60_000, refetchOnWindowFocus: false, retry: 0,
  })
  const clients = Array.isArray(clientsData) ? clientsData : []

  const subtotal = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0)
  const tax = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0) * (l.taxPercent / 100), 0)
  const irpfAmt = subtotal * ((Number(irpfRate) || 0) / 100)
  const total = subtotal + tax - irpfAmt

  if (!open) return null

  const updateLine = (idx: number, patch: Partial<LineForm>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  async function submit() {
    if (!clientId) { toast.error("Selecciona un cliente"); return }
    const cleanLines = lines
      .filter((l) => l.description.trim())
      .map((l) => ({ description: l.description.trim(), quantity: Number(l.quantity) || 1, unitPrice: Number(l.unitPrice) || 0, taxPercent: l.taxPercent, discountPercent: 0 }))
    if (cleanLines.length === 0) { toast.error("Añade al menos una línea"); return }

    const body = {
      clientId, type, frequency,
      intervalMonths: frequency === "CUSTOM" ? Number(intervalMonths) || 1 : null,
      dayOfMonth: dayOfMonth.trim() ? Math.min(31, Math.max(1, Math.round(Number(dayOfMonth) || 1))) : null,
      startDate, endDate: noEnd ? null : endDate,
      irpfRate: Number(irpfRate) || 0, currency: "EUR",
      notes: notes.trim() || null, items: cleanLines,
    }
    setSaving(true)
    try {
      const url = editing ? `/api/billing/recurring/${editing.id}` : "/api/billing/recurring"
      const res = await fetch(url, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        // F1 sin datos fiscales del cliente → formulario para completarlos y reintentar.
        if (data.needsClientFiscalData && data.clientId) { setFiscalClientId(data.clientId); return }
        toast.error(data.error ?? "Error al guardar"); return
      }
      toast.success(editing ? "Plantilla actualizada" : "Plantilla recurrente creada")
      onSaved(); onClose()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 12, padding: 24, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>{editing ? "Editar plantilla" : "Nueva factura recurrente"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 12 }}>
            <div>
              <label style={labelStyle}>Cliente *</label>
              <StyledSelect value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={!!editing}>
                <option value="">Seleccionar cliente</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name ?? c.id}</option>)}
              </StyledSelect>
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <StyledSelect value={type} onChange={(e) => setType(e.target.value as "F1" | "F2")}>
                <option value="F1">F1 — Completa</option>
                <option value="F2">F2 — Simplificada</option>
              </StyledSelect>
            </div>
          </div>

          {/* Líneas */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Líneas</label>
              <button onClick={() => setLines((p) => [...p, emptyLine()])} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#0F766E", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={13} /> Añadir línea
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Cabeceras de columna (como en NewOrderModal) */}
              <div style={{ display: "grid", gridTemplateColumns: LINE_COLS, gap: 6, padding: "0 2px" }}>
                <span style={colHead}>Concepto</span>
                <span style={{ ...colHead, textAlign: "center" }}>Cantidad</span>
                <span style={{ ...colHead, textAlign: "right" }}>Precio</span>
                <span style={{ ...colHead, textAlign: "center" }}>IVA</span>
                <span style={{ ...colHead, textAlign: "right" }}>Total</span>
                <span />
              </div>
              {lines.map((l, idx) => {
                const lineTotal = (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0)
                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: LINE_COLS, gap: 6, alignItems: "center" }}>
                    <input style={inputStyle} placeholder="Concepto" value={l.description} onChange={(e) => updateLine(idx, { description: e.target.value })} />
                    <input style={{ ...inputStyle, textAlign: "center" }} type="number" min={0} step={0.01} value={l.quantity} onChange={(e) => updateLine(idx, { quantity: e.target.value })} />
                    <input style={{ ...inputStyle, textAlign: "right" }} type="number" min={0} step={0.01} value={l.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: e.target.value })} />
                    <StyledSelect value={l.taxPercent} onChange={(e) => updateLine(idx, { taxPercent: Number(e.target.value) })}>
                      {ALLOWED_VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </StyledSelect>
                    <span style={{ fontSize: 13, textAlign: "right", color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>€{lineTotal.toFixed(2)}</span>
                    <button onClick={() => setLines((p) => (p.length > 1 ? p.filter((_, i) => i !== idx) : p))} disabled={lines.length <= 1} style={{ background: "none", border: "none", cursor: lines.length <= 1 ? "default" : "pointer", color: "#ef4444", opacity: lines.length <= 1 ? 0.3 : 1 }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div style={{ display: "grid", gridTemplateColumns: frequency === "CUSTOM" ? "1fr 110px 120px 100px" : "1fr 120px 100px", gap: 12 }}>
              <div>
                <label style={labelStyle}>Frecuencia</label>
                <StyledSelect value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {FREQS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
                </StyledSelect>
              </div>
              {frequency === "CUSTOM" && (
                <div>
                  <label style={labelStyle}>Cada (meses)</label>
                  <input style={inputStyle} type="number" min={1} max={60} value={intervalMonths} onChange={(e) => setIntervalMonths(e.target.value)} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Día del mes</label>
                <input style={inputStyle} type="number" min={1} max={31} placeholder="—" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>IRPF %</label>
                <input style={inputStyle} type="number" min={0} max={100} value={irpfRate} onChange={(e) => setIrpfRate(e.target.value)} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 0" }}>
              Día del mes en que se genera la factura. Si lo dejas vacío, se usa el día de la fecha de inicio. Si el mes no tiene ese día (p. ej. 31 en febrero), se ajusta al último día.
            </p>
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

          <div>
            <label style={labelStyle}>Notas</label>
            <textarea style={{ ...inputStyle, minHeight: 56, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 16, fontSize: 13, color: "#475569", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
            <span>Base: <strong>{subtotal.toFixed(2)} €</strong></span>
            <span>IVA: <strong>{tax.toFixed(2)} €</strong></span>
            {irpfAmt > 0 && <span style={{ color: "#dc2626" }}>IRPF: -{irpfAmt.toFixed(2)} €</span>}
            <span style={{ color: "#0f172a" }}>Total: <strong>{total.toFixed(2)} €</strong></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "white", fontSize: 13, cursor: "pointer", color: "#64748b" }}>Cancelar</button>
          <button onClick={submit} disabled={saving} style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: "#0F766E", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear plantilla"}
          </button>
        </div>
      </div>

      {fiscalClientId && (
        <FiscalDataModal
          clientId={fiscalClientId}
          onClose={() => setFiscalClientId(null)}
          onSaved={() => { setFiscalClientId(null); submit() }}
        />
      )}
    </div>
  )
}
