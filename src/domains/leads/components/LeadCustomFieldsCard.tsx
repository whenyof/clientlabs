"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Settings, Plus, Sliders, X, Check, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface CustomField {
  id: string
  name: string
  type: "text" | "number" | "date" | "select"
  options?: string[] | null
}

interface CustomFieldValue {
  id: string
  customFieldId: string
  value: string
  customField: CustomField
}

interface Props {
  leadId: string
}

const QUERY_OPTS = { staleTime: 60_000, refetchOnWindowFocus: false, refetchOnMount: false, retry: 0 } as const

const inputCls =
  "w-full px-2 py-1 rounded-lg border text-[13px] text-[var(--text-primary)] bg-[var(--bg-surface)] border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all"

export function LeadCustomFieldsCard({ leadId }: Props) {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<CustomField["type"]>("text")
  const [newOptions, setNewOptions] = useState("")

  const { data: fieldValues = [], isLoading } = useQuery<CustomFieldValue[]>({
    queryKey: ["lead-custom-field-values", leadId],
    queryFn: () => fetch(`/api/leads/${leadId}/custom-field-values`).then((r) => r.json()),
    ...QUERY_OPTS,
  })

  const { data: allFields = [] } = useQuery<CustomField[]>({
    queryKey: ["custom-fields", "lead"],
    queryFn: () => fetch("/api/custom-fields?entity=lead").then((r) => r.json()),
    select: (d: unknown) => Array.isArray(d) ? (d as CustomField[]) : ((d as { fields?: CustomField[] })?.fields ?? []),
    ...QUERY_OPTS,
  })

  const upsertMutation = useMutation({
    mutationFn: ({ customFieldId, value }: { customFieldId: string; value: string }) =>
      fetch(`/api/leads/${leadId}/custom-field-values`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customFieldId, value }),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lead-custom-field-values", leadId] })
      setEditingId(null)
    },
    onError: () => toast.error("Error al guardar el valor"),
  })

  const createFieldMutation = useMutation({
    mutationFn: (payload: { name: string; type: string; entity: string; options?: string[] }) =>
      fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => { if (!r.ok) throw new Error(); return r.json() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom-fields", "lead"] })
      qc.invalidateQueries({ queryKey: ["lead-custom-field-values", leadId] })
      toast.success("Campo creado")
      setShowForm(false)
      setNewName("")
      setNewType("text")
      setNewOptions("")
    },
    onError: () => toast.error("Error al crear el campo"),
  })

  const startEdit = (fv: CustomFieldValue) => {
    setEditingId(fv.customFieldId)
    setEditValue(fv.value ?? "")
  }

  const commitEdit = (customFieldId: string) => {
    upsertMutation.mutate({ customFieldId, value: editValue })
  }

  const handleCreateField = () => {
    const name = newName.trim()
    if (!name) return
    const payload: Parameters<typeof createFieldMutation.mutate>[0] = { name, type: newType, entity: "lead" }
    if (newType === "select" && newOptions.trim()) {
      payload.options = newOptions.split(",").map((o) => o.trim()).filter(Boolean)
    }
    createFieldMutation.mutate(payload)
  }

  const fieldsToRender = Array.isArray(allFields) ? allFields.map((field) => {
    const existing = fieldValues.find((fv) => fv.customFieldId === field.id)
    return { field, value: existing?.value ?? "" }
  }) : []

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          <h3 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Campos personalizados
          </h3>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
          style={{ border: "0.5px solid var(--border-subtle)", color: "var(--text-secondary)", background: "var(--bg-surface)" }}
        >
          {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showForm ? "Cancelar" : "+ Campo"}
        </button>
      </div>

      {/* Field rows */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "var(--bg-surface)" }} />)}
        </div>
      ) : fieldsToRender.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <Sliders className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          <p className="text-[12px] text-center" style={{ color: "var(--text-secondary)" }}>
            Sin campos personalizados. Añade el primero.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {fieldsToRender.map(({ field, value }) => {
            const isEditing = editingId === field.id
            return (
              <div key={field.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                <span className="text-[12px] font-medium shrink-0 w-1/3" style={{ color: "var(--text-secondary)" }}>
                  {field.name}
                </span>
                <div className="flex-1 flex items-center gap-1">
                  {isEditing ? (
                    <>
                      {field.type === "select" ? (
                        <div className="relative flex-1">
                          <select
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(field.id)}
                            className={`${inputCls} appearance-none pr-8`}
                          >
                            <option value="">Seleccionar...</option>
                            {(field.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                      ) : (
                        <input
                          autoFocus
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(field.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") commitEdit(field.id); if (e.key === "Escape") setEditingId(null) }}
                          className={inputCls}
                        />
                      )}
                      <button onClick={() => commitEdit(field.id)} className="p-1 rounded-md hover:opacity-80 transition-opacity" style={{ color: "var(--accent)" }}>
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit({ id: "", customFieldId: field.id, value, customField: field })}
                      className="text-left text-[13px] w-full px-2 py-1 rounded-lg transition-colors hover:opacity-80"
                      style={{ color: value ? "var(--text-primary)" : "var(--text-secondary)", background: "transparent" }}
                    >
                      {value || <span style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>—</span>}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create field mini-form */}
      {showForm && (
        <div className="mt-4 flex flex-col gap-2 pt-4" style={{ borderTop: "0.5px solid var(--border-subtle)" }}>
          <input
            type="text"
            placeholder="Nombre del campo"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={inputCls}
          />
          <div className="relative">
            <select value={newType} onChange={(e) => setNewType(e.target.value as CustomField["type"])} className={`${inputCls} appearance-none pr-8`}>
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="date">Fecha</option>
              <option value="select">Selección</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          {newType === "select" && (
            <input
              type="text"
              placeholder="Opciones separadas por coma"
              value={newOptions}
              onChange={(e) => setNewOptions(e.target.value)}
              className={inputCls}
            />
          )}
          <button
            onClick={handleCreateField}
            disabled={!newName.trim() || createFieldMutation.isPending}
            className="self-end px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            {createFieldMutation.isPending ? "Creando..." : "Crear campo"}
          </button>
        </div>
      )}
    </div>
  )
}
