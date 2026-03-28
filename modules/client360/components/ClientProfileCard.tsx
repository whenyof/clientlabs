"use client"

import { useState } from "react"
import { Pencil, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Client360Base } from "../types"

interface ClientProfileCardProps {
  client: Client360Base
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
}

export function ClientProfileCard({ client }: ClientProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    email: client.email ?? "",
    phone: client.phone ?? "",
    company: client.companyName ?? "",
    country: client.country ?? "",
  })

  const handleCancel = () => {
    setForm({
      email: client.email ?? "",
      phone: client.phone ?? "",
      company: client.companyName ?? "",
      country: client.country ?? "",
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success("Cliente actualizado")
        setIsEditing(false)
      } else {
        toast.error("Error al guardar")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  const editableFields: { label: string; field: keyof typeof form; type: string }[] = [
    { label: "EMAIL",    field: "email",   type: "email" },
    { label: "TELÉFONO", field: "phone",   type: "tel"   },
    { label: "EMPRESA",  field: "company", type: "text"  },
    { label: "PAÍS",     field: "country", type: "text"  },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <span className="text-[13px] font-semibold text-slate-900">
          Perfil del cliente
        </span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="text-[12px] text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="text-[12px] font-medium text-white bg-[#1FA97A] px-3 py-1 rounded hover:bg-[#178f68] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                Guardar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[12px] text-slate-500 hover:text-slate-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Campos */}
      <div className="px-4 divide-y divide-slate-100">
        {editableFields.map(({ label, field, type }) => (
          <div key={field} className="py-3">
            <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-slate-400 block mb-1">
              {label}
            </span>
            {isEditing ? (
              <input
                type={type}
                value={form[field]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [field]: e.target.value }))
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 outline-none transition-all"
              />
            ) : (
              <span className="text-[13px] text-slate-900">
                {form[field] || "—"}
              </span>
            )}
          </div>
        ))}

        {/* Read-only: Origen */}
        <div className="py-3">
          <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-slate-400 block mb-1">
            ORIGEN
          </span>
          <span className="text-[13px] text-slate-900 capitalize">
            {client.source || "—"}
          </span>
        </div>

        {/* Read-only: Cliente desde */}
        <div className="py-3">
          <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-slate-400 block mb-1">
            CLIENTE DESDE
          </span>
          <span className="text-[13px] text-slate-900">
            {formatDate(client.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
