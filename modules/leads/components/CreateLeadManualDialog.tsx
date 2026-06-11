"use client"

import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Loader2, ChevronDown, Upload } from "lucide-react"
import { createLead, importLeads } from "../actions"
import { toast } from "sonner"
import type { Lead } from "@prisma/client"
import { useLeadsOptimistic } from "../context/LeadsOptimisticContext"

type Mode = "manual" | "paste" | "csv"

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "QUALIFIED", label: "Cualificado" },
  { value: "CONVERTED", label: "Convertido" },
  { value: "LOST", label: "Perdido" },
]

const SOURCE_OPTIONS = [
  { value: "web", label: "Web" },
  { value: "manual", label: "Manual" },
  { value: "referido", label: "Referido" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google Ads" },
  { value: "otro", label: "Otro" },
]

const CSV_FIELDS = ["name", "email", "phone", "source", "—"] as const
const CSV_LABELS: Record<string, string> = {
  name: "Nombre", email: "Email", phone: "Teléfono", source: "Fuente", "—": "Ignorar"
}

function extractFromPaste(text: string) {
  const email = text.match(/[\w.+%-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] ?? ""
  const phone = text.match(/(?:\+?\d[\d\s()./-]{6,14}\d)/)?.[0]?.replace(/[\s().-]/g, "") ?? ""
  const name = text.split("\n").map(l => l.trim())
    .find(l => l.length > 1 && !l.includes("@") && !/^\+?\d[\d\s]{5}/.test(l) && !l.startsWith("http")) ?? ""
  return { name, email, phone }
}

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (!lines.length) return { headers: [] as string[], rows: [] as string[][] }
  const split = (l: string) => l.split(",").map(c => c.trim().replace(/^"|"$/g, ""))
  return { headers: split(lines[0]), rows: lines.slice(1).map(split) }
}

const inp: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 7,
  border: "1px solid #e8e8e8", fontSize: 13.5, color: "#0a0a0a",
  background: "#fafafa", outline: "none", boxSizing: "border-box",
}
const lbl: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 600, letterSpacing: "0.07em",
  textTransform: "uppercase", color: "#737373", display: "block", marginBottom: 5,
}
const btnPrimary = (disabled: boolean): React.CSSProperties => ({
  padding: "7px 16px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 550,
  color: "white", background: disabled ? "#a3a3a3" : "#0a0a0a",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
})
const btnSecondary: React.CSSProperties = {
  padding: "7px 16px", borderRadius: 7, border: "1px solid #e8e8e8",
  fontSize: 13, fontWeight: 500, color: "#404040", background: "white", cursor: "pointer",
}

export function CreateLeadManualDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const { addLead } = useLeadsOptimistic()
  const [mode, setMode] = useState<Mode>("manual")
  const [loading, setLoading] = useState(false)

  // Manual
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "", leadStatus: "NEW", estimatedValue: "" })

  // Paste
  const [pasteText, setPasteText] = useState("")
  const [pasteForm, setPasteForm] = useState({ name: "", email: "", phone: "" })

  // CSV
  const fileRef = useRef<HTMLInputElement>(null)
  const [csv, setCsv] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})

  function handleClose() {
    setForm({ name: "", email: "", phone: "", source: "", leadStatus: "NEW", estimatedValue: "" })
    setPasteText(""); setPasteForm({ name: "", email: "", phone: "" })
    setCsv(null); setMapping({})
    onOpenChange(false)
  }

  function optimisticAdd(id: string, name: string, email: string, phone: string, source: string, status: string) {
    const now = new Date()
    addLead({
      id, userId: "", name, email: email || null, phone: phone || null,
      source: source || "manual", leadStatus: status as Lead["leadStatus"],
      status: status as Lead["status"], temperature: "COLD", score: 0,
      priority: null, tags: [], notes: null, converted: false, clientId: null,
      lastActionAt: now, createdAt: now, updatedAt: now,
      conversionProbability: null, aiSegment: null, metadata: {},
    } as unknown as Lead)
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["leads"] })
    queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
    queryClient.invalidateQueries({ queryKey: ["leads-kanban"] })
    queryClient.invalidateQueries({ queryKey: ["activation-checklist"] })
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      await queryClient.cancelQueries({ queryKey: ["leads"] })
      const r = await createLead(form)
      optimisticAdd(r.leadId, form.name, form.email, form.phone, form.source, form.leadStatus)
      invalidate()
      toast.success("Lead creado correctamente")
      handleClose()
    } catch { toast.error("Error al crear lead") } finally { setLoading(false) }
  }

  async function submitPaste(e: React.FormEvent) {
    e.preventDefault()
    if (!pasteForm.name.trim()) return
    setLoading(true)
    try {
      await queryClient.cancelQueries({ queryKey: ["leads"] })
      const r = await createLead({ ...pasteForm, source: "manual", leadStatus: "NEW" })
      optimisticAdd(r.leadId, pasteForm.name, pasteForm.email, pasteForm.phone, "manual", "NEW")
      invalidate()
      toast.success("Lead creado correctamente")
      handleClose()
    } catch { toast.error("Error al crear lead") } finally { setLoading(false) }
  }

  async function submitCSV() {
    if (!csv) return
    const col = (field: string) => Object.entries(mapping).find(([, f]) => f === field)?.[0]
    const nameCol = col("name"), emailCol = col("email"), phoneCol = col("phone"), srcCol = col("source")
    const idx = (h?: string) => h ? csv.headers.indexOf(h) : -1
    const leads = csv.rows
      .filter(r => r.some(c => c.trim()))
      .map(r => ({
        name: idx(nameCol) >= 0 ? r[idx(nameCol)] ?? "" : "",
        email: idx(emailCol) >= 0 ? r[idx(emailCol)] ?? "" : "",
        phone: idx(phoneCol) >= 0 ? r[idx(phoneCol)] ?? "" : "",
        source: idx(srcCol) >= 0 ? r[idx(srcCol)] ?? "" : "csv",
      }))
      .filter(l => l.name || l.email)

    if (!leads.length) { toast.error("No se encontraron leads válidos"); return }
    setLoading(true)
    try {
      const r = await importLeads(leads, "csv")
      invalidate()
      toast.success(`${r.created} leads importados${r.skipped ? ` · ${r.skipped} duplicados omitidos` : ""}`)
      handleClose()
    } catch { toast.error("Error al importar leads") } finally { setLoading(false) }
  }

  function onPasteChange(text: string) {
    setPasteText(text)
    if (text.trim()) setPasteForm(extractFromPaste(text))
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const parsed = parseCSV(ev.target?.result as string)
      setCsv(parsed)
      const auto: Record<string, string> = {}
      parsed.headers.forEach(h => {
        const l = h.toLowerCase()
        if (l.includes("nombre") || l === "name") auto[h] = "name"
        else if (l.includes("email") || l.includes("correo")) auto[h] = "email"
        else if (l.includes("tel") || l.includes("phone") || l.includes("movil")) auto[h] = "phone"
        else if (l.includes("fuente") || l.includes("source")) auto[h] = "source"
        else auto[h] = "—"
      })
      setMapping(auto)
    }
    reader.readAsText(file)
  }

  const MODES: Array<{ id: Mode; label: string }> = [
    { id: "manual", label: "Manual" },
    { id: "paste", label: "Copiar y pegar" },
    { id: "csv", label: "Importar CSV" },
  ]

  const validLeads = csv?.rows.filter(r => r.some(c => c.trim())).length ?? 0
  const canImport = !!csv && Object.values(mapping).includes("name") && !loading

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white p-0 !max-w-[520px] w-full overflow-hidden border-0 shadow-xl rounded-2xl">
        <VisuallyHidden.Root><DialogTitle>Nuevo lead</DialogTitle></VisuallyHidden.Root>

        {/* Header + mode tabs */}
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #eeeeee" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 14px", color: "#0a0a0a" }}>Nuevo lead</h2>
          <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 8, padding: 3, gap: 2 }}>
            {MODES.map(m => (
              <button key={m.id} type="button" onClick={() => setMode(m.id)} style={{
                flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 12.5,
                fontWeight: mode === m.id ? 600 : 450, border: "none", cursor: "pointer",
                color: mode === m.id ? "#0a0a0a" : "#737373",
                background: mode === m.id ? "white" : "transparent",
                boxShadow: mode === m.id ? "0 0 0 1px #e8e8e8 inset, 0 1px 2px rgba(0,0,0,.04)" : "none",
              }}>{m.label}</button>
            ))}
          </div>
        </div>

        {/* ── MANUAL ── */}
        {mode === "manual" && (
          <form onSubmit={submitManual}>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>NOMBRE <span style={{ color: "#16986e" }}>*</span></label>
                <input style={inp} type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Juan García" required />
              </div>
              <div>
                <label style={lbl}>EMAIL</label>
                <input style={inp} type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="juan@empresa.com" />
              </div>
              <div>
                <label style={lbl}>TELÉFONO</label>
                <input style={inp} type="tel" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+34 600 000 000" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>ESTADO</label>
                  <div style={{ position: "relative" }}>
                    <select style={{ ...inp, appearance: "none", cursor: "pointer", paddingRight: 32 }}
                      value={form.leadStatus} onChange={e => setForm({ ...form, leadStatus: e.target.value })}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#a3a3a3", pointerEvents: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>FUENTE</label>
                  <div style={{ position: "relative" }}>
                    <select style={{ ...inp, appearance: "none", cursor: "pointer", paddingRight: 32 }}
                      value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#a3a3a3", pointerEvents: "none" }} />
                  </div>
                </div>
              </div>
              <div>
                <label style={lbl}>VALOR ESTIMADO (€)</label>
                <input style={inp} type="number" min={0} step="0.01" inputMode="decimal" value={form.estimatedValue}
                  onChange={e => setForm({ ...form, estimatedValue: e.target.value })}
                  placeholder="0,00" />
              </div>
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid #eeeeee", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={handleClose} style={btnSecondary}>Cancelar</button>
              <button type="submit" disabled={loading || !form.name.trim()} style={btnPrimary(loading || !form.name.trim())}>
                {loading && <Loader2 size={13} className="animate-spin" />}
                {loading ? "Creando..." : "Crear lead"}
              </button>
            </div>
          </form>
        )}

        {/* ── PASTE ── */}
        {mode === "paste" && (
          <form onSubmit={submitPaste}>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={lbl}>PEGAR TEXTO</label>
                <textarea
                  value={pasteText}
                  onChange={e => onPasteChange(e.target.value)}
                  placeholder={"Juan García\njuan@empresa.com\n+34 600 000 000"}
                  rows={4}
                  style={{ ...inp, resize: "none", lineHeight: 1.6 }}
                />
                <p style={{ fontSize: 11.5, color: "#a3a3a3", margin: "5px 0 0" }}>
                  Pega cualquier texto. Detectamos email y teléfono automáticamente.
                </p>
              </div>
              {pasteText.trim() && (
                <>
                  <div style={{ height: 1, background: "#f0f0f0" }} />
                  <div>
                    <label style={lbl}>NOMBRE <span style={{ color: "#16986e" }}>*</span></label>
                    <input style={inp} type="text" value={pasteForm.name}
                      onChange={e => setPasteForm({ ...pasteForm, name: e.target.value })}
                      placeholder="Detectado automáticamente" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={lbl}>EMAIL</label>
                      <input style={inp} type="email" value={pasteForm.email}
                        onChange={e => setPasteForm({ ...pasteForm, email: e.target.value })} placeholder="—" />
                    </div>
                    <div>
                      <label style={lbl}>TELÉFONO</label>
                      <input style={inp} type="tel" value={pasteForm.phone}
                        onChange={e => setPasteForm({ ...pasteForm, phone: e.target.value })} placeholder="—" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid #eeeeee", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={handleClose} style={btnSecondary}>Cancelar</button>
              <button type="submit" disabled={loading || !pasteForm.name.trim()} style={btnPrimary(loading || !pasteForm.name.trim())}>
                {loading && <Loader2 size={13} className="animate-spin" />}
                {loading ? "Creando..." : "Crear lead"}
              </button>
            </div>
          </form>
        )}

        {/* ── CSV ── */}
        {mode === "csv" && (
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={onFileChange} style={{ display: "none" }} />

            {!csv ? (
              <button type="button" onClick={() => fileRef.current?.click()} style={{
                width: "100%", padding: "36px 24px", border: "1.5px dashed #e8e8e8",
                borderRadius: 10, background: "#fafafa", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                <Upload size={22} strokeWidth={1.5} style={{ color: "#a3a3a3" }} />
                <span style={{ fontWeight: 550, fontSize: 13.5, color: "#0a0a0a" }}>Seleccionar archivo CSV</span>
                <span style={{ fontSize: 12, color: "#a3a3a3" }}>Máx. 3.000 filas · UTF-8</span>
              </button>
            ) : (
              <>
                {/* Column mapping */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label style={lbl}>MAPEAR COLUMNAS</label>
                    <button type="button" onClick={() => { setCsv(null); setMapping({}); if (fileRef.current) fileRef.current.value = "" }}
                      style={{ fontSize: 11.5, color: "#737373", background: "none", border: "none", cursor: "pointer" }}>
                      Cambiar archivo
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {csv.headers.map(h => (
                      <div key={h} style={{ display: "grid", gridTemplateColumns: "1fr 20px 1fr", gap: 8, alignItems: "center" }}>
                        <div style={{ padding: "6px 10px", border: "1px solid #e8e8e8", borderRadius: 6, fontSize: 12, color: "#0a0a0a", background: "#f5f5f5", fontFamily: "ui-monospace,monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</div>
                        <span style={{ color: "#a3a3a3", fontSize: 13, textAlign: "center" }}>→</span>
                        <select value={mapping[h] ?? "—"}
                          onChange={e => setMapping({ ...mapping, [h]: e.target.value })}
                          style={{ padding: "6px 10px", border: "1px solid #e8e8e8", borderRadius: 6, fontSize: 12.5, color: "#0a0a0a", background: "white", cursor: "pointer" }}>
                          {CSV_FIELDS.map(f => <option key={f} value={f}>{CSV_LABELS[f]}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label style={{ ...lbl, marginBottom: 8 }}>VISTA PREVIA · {csv.rows.length} filas</label>
                  <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, overflow: "hidden", fontSize: 11.5 }}>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(csv.headers.length, 4)}, 1fr)`, background: "#f5f5f5", padding: "6px 10px", gap: 8, borderBottom: "1px solid #eeeeee", fontFamily: "ui-monospace,monospace", color: "#737373" }}>
                      {csv.headers.slice(0, 4).map(h => <span key={h} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h}</span>)}
                    </div>
                    {csv.rows.slice(0, 3).map((row, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(csv.headers.length, 4)}, 1fr)`, padding: "6px 10px", gap: 8, borderBottom: i < 2 ? "1px solid #f5f5f5" : "none", color: "#404040" }}>
                        {row.slice(0, 4).map((cell, j) => <span key={j} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cell || "—"}</span>)}
                      </div>
                    ))}
                    {csv.rows.length > 3 && (
                      <div style={{ padding: "5px 10px", color: "#a3a3a3", fontFamily: "ui-monospace,monospace", fontSize: 10.5, background: "#fafafa" }}>
                        +{csv.rows.length - 3} filas más
                      </div>
                    )}
                  </div>
                  {!Object.values(mapping).includes("name") && (
                    <p style={{ fontSize: 11.5, color: "#c2410c", marginTop: 6 }}>
                      Asigna al menos una columna a "Nombre" para continuar.
                    </p>
                  )}
                </div>
              </>
            )}

            <div style={{ borderTop: "1px solid #eeeeee", paddingTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={handleClose} style={btnSecondary}>Cancelar</button>
              {csv && (
                <button type="button" onClick={submitCSV} disabled={!canImport} style={btnPrimary(!canImport)}>
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  {loading ? "Importando..." : `Importar ${validLeads} leads`}
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
