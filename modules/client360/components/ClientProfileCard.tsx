"use client"

import { useState, useRef } from "react"
import { Pencil, Loader2, Mail, Phone, Building2, Globe, Compass, Calendar } from "lucide-react"
import { toast } from "sonner"
import type { Client360Base } from "../types"

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
}

const FIELDS: { label: string; field: "email" | "phone" | "company" | "country"; type: string; Icon: React.ElementType }[] = [
  { label: "Email",    field: "email",   type: "email", Icon: Mail      },
  { label: "Teléfono", field: "phone",   type: "tel",   Icon: Phone     },
  { label: "Empresa",  field: "company", type: "text",  Icon: Building2 },
  { label: "País",     field: "country", type: "text",  Icon: Globe     },
]

interface ClientProfileCardProps {
  client: Client360Base
}

export function ClientProfileCard({ client }: ClientProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving,  setIsSaving]  = useState(false)
  const isSubmitting = useRef(false)
  const [form, setForm] = useState({
    email:          client.email          ?? "",
    phone:          client.phone          ?? "",
    company:        client.companyName    ?? "",
    country:        client.country        ?? "",
    additionalInfo: client.additionalInfo ?? "",
  })

  const handleCancel = () => {
    setForm({ email: client.email ?? "", phone: client.phone ?? "", company: client.companyName ?? "", country: client.country ?? "", additionalInfo: client.additionalInfo ?? "" })
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (isSubmitting.current) return
    isSubmitting.current = true
    setIsSaving(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:          form.email          || null,
          phone:          form.phone          || null,
          company:        form.company        || null,
          country:        form.country        || null,
          additionalInfo: form.additionalInfo || null,
        }),
      })
      const data = await res.json()
      if (res.ok) { toast.success("Guardado"); setIsEditing(false) }
      else toast.error(data.error || "Error al guardar")
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsSaving(false)
      isSubmitting.current = false
    }
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Información del cliente
        </span>
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={handleCancel}
              className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 rounded-md hover:bg-[var(--bg-surface)] transition-colors">
              Cancelar
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving}
              className="text-[11px] font-semibold text-white bg-[#1FA97A] px-3 py-1 rounded-md hover:opacity-90 transition-opacity inline-flex items-center gap-1 disabled:opacity-50">
              {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
              Guardar
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-md hover:bg-[var(--bg-surface)] transition-colors">
            <Pencil className="h-3 w-3" />
            Editar
          </button>
        )}
      </div>

      {/* Editable fields */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {FIELDS.map(({ label, field, type, Icon }) => (
          <div key={field} className="flex items-center gap-3 px-5 py-3">
            <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0 opacity-50" aria-hidden="true" />
            <span className="text-[11px] text-[var(--text-secondary)] w-16 shrink-0">{label}</span>
            {isEditing ? (
              <input
                type={type} value={form[field]} placeholder={`—`}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                className="flex-1 min-w-0 text-[13px] text-[var(--text-primary)] bg-[var(--bg-surface)] rounded-md px-2.5 py-1.5 border border-[var(--border-subtle)] focus:outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 transition-all"
              />
            ) : (
              <span className="text-[13px] text-[var(--text-primary)] flex-1 truncate">
                {form[field] || <span className="text-[var(--text-secondary)]">—</span>}
              </span>
            )}
          </div>
        ))}

        {/* Read-only */}
        <div className="flex items-center gap-3 px-5 py-3">
          <Compass className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0 opacity-50" />
          <span className="text-[11px] text-[var(--text-secondary)] w-16 shrink-0">Origen</span>
          <span className="text-[13px] text-[var(--text-primary)] capitalize">{client.source || "—"}</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-3">
          <Calendar className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0 opacity-50" />
          <span className="text-[11px] text-[var(--text-secondary)] w-16 shrink-0">Desde</span>
          <span className="text-[13px] text-[var(--text-primary)]">{formatDate(client.createdAt)}</span>
        </div>

        {/* Info adicional */}
        <div className="px-5 py-3">
          <span className="text-[11px] text-[var(--text-secondary)] block mb-1.5">Info adicional</span>
          {isEditing ? (
            <textarea
              value={form.additionalInfo}
              onChange={(e) => setForm((p) => ({ ...p, additionalInfo: e.target.value }))}
              placeholder="Información extra del cliente..."
              rows={3}
              className="w-full text-[13px] text-[var(--text-primary)] bg-[var(--bg-surface)] rounded-md px-2.5 py-1.5 border border-[var(--border-subtle)] focus:outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 transition-all resize-none placeholder:text-[var(--text-secondary)]"
            />
          ) : (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
              {client.additionalInfo
                ? <span className="text-[var(--text-primary)]">{client.additionalInfo}</span>
                : <span className="text-[var(--text-secondary)]">—</span>
              }
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
