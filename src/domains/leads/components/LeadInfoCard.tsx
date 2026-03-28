"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Pencil, Loader2, ChevronDown } from "lucide-react"
import { formatSource, STATUS_LABELS, TEMP_LABELS, getScoreColors } from "@domains/leads/utils/formatting"
import { toast } from "sonner"

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

export interface LeadInfoCardLead {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  source: string
  leadStatus: string
  score: number
  temperature?: string | null
  createdAt: Date
}

interface LeadInfoCardProps {
  lead: LeadInfoCardLead
  onUpdate?: () => void
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const { barColor, numColor } = getScoreColors(score)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: barColor, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: numColor, minWidth: 36, textAlign: "right", whiteSpace: "nowrap" }}>
        {score} pts
      </span>
    </div>
  )
}

export function LeadInfoCard({ lead, onUpdate }: LeadInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    source: lead.source || "",
  })

  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature ? TEMP_LABELS[lead.temperature] ?? lead.temperature : "—"
  const createdFormatted = format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })

  const handleCancel = () => {
    setIsEditing(false)
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "",
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Lead actualizado")
        setIsEditing(false)
        onUpdate?.()
      } else {
        toast.error("Error al guardar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = "w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none transition-all"

  const fields = [
    { key: "name" as const, label: "Nombre", type: "text" },
    { key: "email" as const, label: "Email", type: "email" },
    { key: "phone" as const, label: "Teléfono", type: "tel" },
    { key: "source" as const, label: "Fuente", type: "select" },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-500">
          Información del lead
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1FA97A] text-white text-[11px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Editable fields */}
      <div>
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-0.5 py-3 border-b border-slate-100 last:border-0">
            <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">
              {field.label}
            </span>
            {isEditing ? (
              field.type === "select" ? (
                <div className="relative mt-0.5">
                  <select
                    value={form[field.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    className={`${inputClass} appearance-none cursor-pointer pr-8`}
                  >
                    <option value="">Seleccionar...</option>
                    {SOURCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              ) : (
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                  className={`${inputClass} mt-0.5`}
                />
              )
            ) : (
              <span className="text-[13px] text-slate-900">
                {field.key === "source" ? formatSource(form[field.key]) : (form[field.key] || "—")}
              </span>
            )}
          </div>
        ))}

        {/* Read-only fields */}
        <div className="flex flex-col gap-0.5 py-3 border-b border-slate-100">
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">Temperatura</span>
          <span className="text-[13px] text-slate-900">{tempLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 py-3 border-b border-slate-100">
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">Score</span>
          <ScoreBar score={lead.score} />
        </div>
        <div className="flex flex-col gap-0.5 py-3">
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">Creado</span>
          <span className="text-[13px] text-slate-900">{createdFormatted}</span>
        </div>
      </div>
    </div>
  )
}
