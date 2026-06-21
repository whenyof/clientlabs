"use client"

import { useState, useEffect } from "react"
import { X, FolderKanban, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export interface ProjectEditable {
  id: string
  name: string
  description: string | null
  endDate: string | null
  clientId: string | null
  status: string
  color: string
}

interface ClientOption { id: string; name: string }

const PROJECT_COLORS = ["#0F766E", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"]
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ACTIVE", label: "Activo" },
  { value: "PAUSED", label: "Pausado" },
  { value: "COMPLETED", label: "Completado" },
]

const inputStyle: React.CSSProperties = {
  background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8,
  padding: "10px 12px", fontSize: 13, color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
}
function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{children}</label>
}

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  /** Si se pasa, el modal edita ese proyecto; si no, crea uno nuevo. */
  project?: ProjectEditable | null
  onSaved?: (id: string) => void
}

export function ProjectModal({ open, onClose, project, onSaved }: ProjectModalProps) {
  const qc = useQueryClient()
  const isEdit = !!project
  const [name, setName] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [color, setColor] = useState("#0F766E")
  const [clientId, setClientId] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState("ACTIVE")
  const [clients, setClients] = useState<ClientOption[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/clients").then(r => r.ok ? r.json() : []).then((d) => setClients(Array.isArray(d) ? d : [])).catch(() => {})
    // precargar valores en edición / resetear en creación
    setName(project?.name ?? "")
    setObjetivo(project?.description ?? "")
    setColor(project?.color ?? "#0F766E")
    setClientId(project?.clientId ?? "")
    setEndDate(project?.endDate ? project.endDate.slice(0, 10) : "")
    setStatus(project?.status ?? "ACTIVE")
  }, [open, project])

  const handleSave = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: objetivo.trim() || null,
        color,
        clientId: clientId || null,
        endDate: endDate || null,
        status,
      }
      const res = await fetch(isEdit ? `/api/projects/${project!.id}` : "/api/projects", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed")
      const saved = await res.json().catch(() => null)
      toast.success(isEdit ? "Proyecto actualizado" : "Proyecto creado")
      qc.invalidateQueries({ queryKey: ["projects"] })
      qc.invalidateQueries({ queryKey: ["tasks"] })
      onSaved?.(saved?.id ?? project?.id ?? "")
      onClose()
    } catch {
      toast.error(isEdit ? "Error al actualizar el proyecto" : "Error al crear el proyecto")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="p-0" style={{ maxWidth: 500, width: "calc(100vw - 32px)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0F766E15", border: "1px solid #0F766E25", display: "grid", placeItems: "center" }}>
              <FolderKanban style={{ width: 16, height: 16, color: "#0F766E" }} />
            </div>
            <div style={{ flex: 1 }}>
              <DialogTitle style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {isEdit ? "Editar proyecto" : "Nuevo proyecto"}
              </DialogTitle>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>Organiza tus tareas por proyecto</p>
            </div>
            <DialogClose style={{ background: "none", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, color: "var(--text-secondary)" }}>
              <X style={{ width: 14, height: 14 }} />
            </DialogClose>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, maxHeight: "60vh", overflowY: "auto" }}>
            <div>
              <Label>Nombre <span style={{ color: "#EF4444" }}>*</span></Label>
              <input autoFocus value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && handleSave()}
                placeholder="Ej: Rediseño web cliente X" style={inputStyle} />
            </div>
            <div>
              <Label>Objetivo</Label>
              <textarea value={objetivo} onChange={e => setObjetivo(e.target.value)} rows={2}
                placeholder="¿Qué se quiere conseguir con este proyecto?" style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Fecha límite</Label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <Label>Estado</Label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Cliente (opcional)</Label>
              <select value={clientId} onChange={e => setClientId(e.target.value)} style={inputStyle}>
                <option value="">Sin cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Color</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PROJECT_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "3px solid #fff" : "2px solid transparent", outline: color === c ? `2px solid ${c}` : "none" }} />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "9px 18px", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}>Cancelar</button>
            <button type="button" onClick={handleSave} disabled={!name.trim() || submitting}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 22px", background: "#0F766E", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: (!name.trim() || submitting) ? 0.45 : 1 }}>
              {submitting && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear proyecto"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
