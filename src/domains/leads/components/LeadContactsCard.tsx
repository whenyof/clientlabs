"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Plus, Pencil, Trash2, X, Check, UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean
  createdAt: string
}

interface ContactForm {
  name: string
  email: string
  phone: string
  role: string
}

const EMPTY_FORM: ContactForm = { name: "", email: "", phone: "", role: "" }

interface Props { leadId: string }

const inputCls = "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 outline-none transition-all"

function InlineForm({ initial, onSave, onCancel, saving }: {
  initial: ContactForm; onSave: (f: ContactForm) => void; onCancel: () => void; saving: boolean
}) {
  const [form, setForm] = useState<ContactForm>(initial)
  const set = (k: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))
  return (
    <div className="flex flex-col gap-2 py-3 px-1">
      <input placeholder="Nombre *" value={form.name} onChange={set("name")} className={inputCls} />
      <input type="email" placeholder="Email" value={form.email} onChange={set("email")} className={inputCls} />
      <input type="tel" placeholder="Teléfono" value={form.phone} onChange={set("phone")} className={inputCls} />
      <input placeholder="Cargo / rol" value={form.role} onChange={set("role")} className={inputCls} />
      <div className="flex items-center justify-end gap-2 mt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">
          <X className="h-3 w-3" /> Cancelar
        </button>
        <button type="button" onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim() || saving}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F766E] text-white text-[12px] font-medium hover:bg-[#0E665F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Guardar
        </button>
      </div>
    </div>
  )
}

export function LeadContactsCard({ leadId }: Props) {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["lead-contacts", leadId],
    queryFn: () => fetch(`/api/leads/${leadId}/contacts`).then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ["lead-contacts", leadId] })
  const jsonFetch = (url: string, method: string, body?: unknown) =>
    fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined })
      .then(r => { if (!r.ok) throw new Error() })

  const addMutation = useMutation({
    mutationFn: (body: ContactForm) => jsonFetch(`/api/leads/${leadId}/contacts`, "POST", body),
    onSuccess: () => { toast.success("Contacto añadido"); setShowAdd(false); invalidate() },
    onError: () => toast.error("Error al añadir contacto"),
  })
  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ContactForm }) => jsonFetch(`/api/leads/${leadId}/contacts/${id}`, "PATCH", body),
    onSuccess: () => { toast.success("Contacto actualizado"); setEditingId(null); invalidate() },
    onError: () => toast.error("Error al actualizar contacto"),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jsonFetch(`/api/leads/${leadId}/contacts/${id}`, "DELETE"),
    onSuccess: () => { toast.success("Contacto eliminado"); invalidate() },
    onError: () => toast.error("Error al eliminar contacto"),
  })
  const primaryMutation = useMutation({
    mutationFn: (id: string) => jsonFetch(`/api/leads/${leadId}/contacts/${id}/primary`, "PATCH"),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Error al establecer contacto principal"),
  })

  const handleDelete = (id: string) => { if (window.confirm("¿Eliminar este contacto?")) deleteMutation.mutate(id) }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-slate-900">Contactos</h3>
          {contacts.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {contacts.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setShowAdd(v => !v); setEditingId(null) }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <Plus className="h-3 w-3" /> Añadir
        </button>
      </div>

      {showAdd && (
        <div className="border border-slate-100 rounded-xl bg-slate-50 mb-3 px-2">
          <InlineForm
            initial={EMPTY_FORM}
            onSave={f => addMutation.mutate(f)}
            onCancel={() => setShowAdd(false)}
            saving={addMutation.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse" />)}
        </div>
      ) : contacts.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
          <UserPlus className="h-8 w-8 stroke-1" />
          <p className="text-[13px]">Sin contactos. Añade el primero.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {contacts.map(c => (
            <div key={c.id}>
              {editingId === c.id ? (
                <div className="py-1 px-1">
                  <InlineForm
                    initial={{ name: c.name, email: c.email ?? "", phone: c.phone ?? "", role: c.role ?? "" }}
                    onSave={f => editMutation.mutate({ id: c.id, body: f })}
                    onCancel={() => setEditingId(null)}
                    saving={editMutation.isPending}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-2.5 py-3 group">
                  <button
                    type="button"
                    onClick={() => primaryMutation.mutate(c.id)}
                    disabled={primaryMutation.isPending}
                    title={c.isPrimary ? "Contacto principal" : "Establecer como principal"}
                    className="mt-0.5 shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className="h-4 w-4"
                      style={{ fill: c.isPrimary ? "#F59E0B" : "none", color: c.isPrimary ? "#F59E0B" : "#CBD5E1", strokeWidth: 1.5 }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-slate-900 truncate">{c.name}</span>
                      {c.role && <span className="text-[11px] text-slate-400 truncate">· {c.role}</span>}
                    </div>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">
                      {[c.email, c.phone].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => { setEditingId(c.id); setShowAdd(false) }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleteMutation.isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
