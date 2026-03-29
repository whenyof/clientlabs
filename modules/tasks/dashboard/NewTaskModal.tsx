"use client"

import { useState, useEffect } from "react"
import { X, Loader2, CheckSquare, ChevronDown } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import type { TaskPriority, TaskStatus, DashboardTask } from "./types"
import { PRIORITY_CONFIG } from "./types"

interface EntityOption { id: string; name: string }

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  defaultPriority?: TaskPriority
  defaultDueDate?: string
  defaultDueTime?: string
  editTask?: DashboardTask
}

// Fully reset native select styles
const selectResetStyle: React.CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  background: "var(--bg-card)",
  backgroundImage: "none",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "10px 36px 10px 12px",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  cursor: "pointer",
  boxSizing: "border-box" as const,
}

const inputStyle: React.CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  background: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box" as const,
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-secondary)", pointerEvents: "none" }} />
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
      {children}
    </label>
  )
}

export function NewTaskModal({ open, onClose, defaultPriority = "MEDIUM", defaultDueDate, defaultDueTime, editTask }: NewTaskModalProps) {
  const qc = useQueryClient()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority)
  const [status] = useState<TaskStatus>("PENDING")
  const [dueDate, setDueDate] = useState(defaultDueDate ?? "")
  const [dueTime, setDueTime] = useState(defaultDueTime ?? "")
  const [entityType, setEntityType] = useState<"" | "CLIENT" | "LEAD">("")
  const [entityId, setEntityId] = useState("")

  useEffect(() => {
    if (!open) return
    if (editTask) {
      setTitle(editTask.title)
      setDescription(editTask.description ?? "")
      setPriority(editTask.priority)
      const dateStr = editTask.startAt
        ? new Date(editTask.startAt).toISOString().slice(0, 10)
        : editTask.dueDate ? editTask.dueDate.slice(0, 10) : ""
      const timeStr = editTask.startAt
        ? new Date(editTask.startAt).toTimeString().slice(0, 5)
        : ""
      setDueDate(dateStr)
      setDueTime(timeStr)
      if (editTask.clientId) { setEntityType("CLIENT"); setEntityId(editTask.clientId) }
      else if (editTask.leadId) { setEntityType("LEAD"); setEntityId(editTask.leadId) }
      else { setEntityType(""); setEntityId("") }
    } else {
      setTitle("")
      setDescription("")
      setPriority(defaultPriority)
      setDueDate(defaultDueDate ?? "")
      setDueTime(defaultDueTime ?? "")
      setEntityType("")
      setEntityId("")
    }
  }, [open, editTask, defaultPriority, defaultDueDate, defaultDueTime])

  const { data: clients = [], isFetching: fetchingClients } = useQuery<EntityOption[]>({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const res = await fetch("/api/clients")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: entityType === "CLIENT" && open,
    staleTime: 60_000,
  })

  const { data: leadsRaw, isFetching: fetchingLeads } = useQuery({
    queryKey: ["leads-list"],
    queryFn: async () => {
      const res = await fetch("/api/leads?limit=200")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: entityType === "LEAD" && open,
    staleTime: 60_000,
  })

  const leads: EntityOption[] = Array.isArray(leadsRaw)
    ? leadsRaw
    : (leadsRaw?.leads ?? leadsRaw?.data ?? [])

  const entityOptions: EntityOption[] = entityType === "CLIENT" ? clients : entityType === "LEAD" ? leads : []
  const isFetchingEntities = entityType === "CLIENT" ? fetchingClients : fetchingLeads

  const handleClose = () => {
    setTitle(""); setDescription(""); setEntityType(""); setEntityId("")
    onClose()
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      // Build startAt from date + time
      let startAt: string | null = null
      let dueDateISO: string | null = null

      if (dueDate) {
        const timeStr = dueTime || "00:00"
        const dt = new Date(`${dueDate}T${timeStr}:00`)
        dueDateISO = dt.toISOString()
        if (dueTime) startAt = dt.toISOString()
      }

      const body = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: dueDateISO,
        startAt,
        entityType: entityType || null,
        entityId: entityId || null,
      }
      const url = editTask ? `/api/tasks/${editTask.id}` : "/api/tasks"
      const method = editTask ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(editTask ? "Failed to update task" : "Failed to create task")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] })
      qc.invalidateQueries({ queryKey: ["tasks-kpis"] })
      handleClose()
    },
  })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="p-0" style={{ maxWidth: 520, width: "calc(100vw - 32px)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1FA97A15", border: "1px solid #1FA97A25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CheckSquare style={{ width: 16, height: 16, color: "#1FA97A" }} />
          </div>
          <div style={{ flex: 1 }}>
            <DialogTitle style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text-primary)", lineHeight: 1.2 }}>
              {editTask ? "Editar tarea" : "Nueva tarea"}
            </DialogTitle>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
              {editTask ? "Modifica los datos de la tarea" : "Añade una tarea a tu lista"}
            </p>
          </div>
          <DialogClose style={{ background: "none", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, color: "var(--text-secondary)" }}>
            <X style={{ width: 14, height: 14 }} />
          </DialogClose>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, maxHeight: "62vh", overflowY: "auto" }}>

          {/* Title */}
          <div>
            <Label>Título <span style={{ color: "#EF4444" }}>*</span></Label>
            <input
              autoFocus type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && title.trim() && createMutation.mutate()}
              placeholder="Ej. Llamar al cliente para seguimiento"
              style={{ ...inputStyle, fontSize: 14, fontWeight: 400 }}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Descripción <span style={{ color: "var(--text-secondary)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(opcional)</span></Label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              placeholder="Detalles adicionales..."
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
            />
          </div>

          {/* Priority */}
          <div>
            <Label>Prioridad</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {(["HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((p) => {
                const cfg = PRIORITY_CONFIG[p]
                const active = priority === p
                return (
                  <button key={p} type="button" onClick={() => setPriority(p)} style={{
                    padding: "10px 0", borderRadius: 8,
                    border: `1px solid ${active ? cfg.color : "var(--border-subtle)"}`,
                    background: active ? cfg.bg : "var(--bg-card)",
                    color: active ? cfg.color : "var(--text-secondary)",
                    fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
                    transition: "all 0.12s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? cfg.color : "var(--border-subtle)", flexShrink: 0 }} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Fecha límite</Label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <Label>Hora</Label>
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Linked entity — type + entity select */}
          <div>
            <Label>Vinculada a</Label>
            <div style={{ display: "grid", gridTemplateColumns: entityType ? "1fr 1.6fr" : "1fr", gap: 10 }}>
              <SelectWrapper>
                <select value={entityType} onChange={(e) => { setEntityType(e.target.value as "" | "CLIENT" | "LEAD"); setEntityId("") }} style={selectResetStyle}>
                  <option value="">Ninguno</option>
                  <option value="CLIENT">Cliente</option>
                  <option value="LEAD">Lead</option>
                </select>
              </SelectWrapper>

              {entityType && (
                <SelectWrapper>
                  <select value={entityId} onChange={(e) => setEntityId(e.target.value)} style={selectResetStyle} disabled={isFetchingEntities || entityOptions.length === 0}>
                    <option value="">
                      {isFetchingEntities ? "Cargando..." : entityOptions.length === 0 ? "Sin resultados" : "Seleccionar..."}
                    </option>
                    {entityOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </SelectWrapper>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
          <button type="button" onClick={handleClose} style={{
            padding: "9px 18px", background: "transparent", border: "1px solid var(--border-subtle)",
            borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={!title.trim() || createMutation.isPending}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 22px", background: "#1FA97A", border: "none",
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
              opacity: !title.trim() || createMutation.isPending ? 0.45 : 1,
              transition: "opacity 0.12s",
            }}
          >
            {createMutation.isPending && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
            {editTask ? "Guardar cambios" : "Crear tarea"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
