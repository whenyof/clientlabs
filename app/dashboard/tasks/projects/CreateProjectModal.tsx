"use client"

import { useState, useEffect } from "react"
import { X, FolderKanban, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

interface TeamMember { id: string; name: string | null; email: string; image: string | null }
interface Client { id: string; name: string }

const PROJECT_COLORS = [
  "#0F766E", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
]

const inputStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
      {children}
    </label>
  )
}

function getInitials(name: string | null, email: string): string {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  return email.slice(0, 2).toUpperCase()
}

const MEMBER_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16", "#F97316"]

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const qc = useQueryClient()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#0F766E")
  const [clientId, setClientId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch("/api/workspace/members").then(r => r.ok ? r.json() : []).then(setTeamMembers).catch(() => {})
    fetch("/api/clients").then(r => r.ok ? r.json() : []).then(setClients).catch(() => {})
  }, [open])

  const handleClose = () => {
    setName(""); setDescription(""); setColor("#0F766E"); setClientId("")
    setStartDate(""); setEndDate(""); setSelectedMembers([])
    onClose()
  }

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
          clientId: clientId || null,
          startDate: startDate || null,
          endDate: endDate || null,
          memberIds: selectedMembers,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Proyecto creado")
      qc.invalidateQueries({ queryKey: ["projects"] })
      qc.invalidateQueries({ queryKey: ["tasks"] })
      handleClose()
    } catch {
      toast.error("Error al crear el proyecto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => !next && handleClose()}>
      <DialogContent className="p-0" style={{ maxWidth: 520, width: "calc(100vw - 32px)" }}>
        <div>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0F766E15", border: "1px solid #0F766E25", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FolderKanban style={{ width: 16, height: 16, color: "#0F766E" }} />
            </div>
            <div style={{ flex: 1 }}>
              <DialogTitle style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text-primary)", lineHeight: 1.2 }}>
                Nuevo proyecto
              </DialogTitle>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Organiza tareas y equipo en un proyecto
              </p>
            </div>
            <DialogClose style={{ background: "none", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, color: "var(--text-secondary)" }}>
              <X style={{ width: 14, height: 14 }} />
            </DialogClose>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18, maxHeight: "60vh", overflowY: "auto" }}>
            {/* Name */}
            <div>
              <Label>Nombre del proyecto <span style={{ color: "#EF4444" }}>*</span></Label>
              <input
                autoFocus value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && name.trim() && handleCreate()}
                placeholder="Ej: Web Estudio Forma"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Descripción <span style={{ color: "var(--text-secondary)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(opcional)</span></Label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="¿De qué trata este proyecto?"
                style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
              />
            </div>

            {/* Color */}
            <div>
              <Label>Color</Label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c} type="button" onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                      border: color === c ? `3px solid #fff` : "2px solid transparent",
                      outline: color === c ? `2px solid ${c}` : "none",
                      transition: "all 0.12s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Client */}
            {clients.length > 0 && (
              <div>
                <Label>Cliente vinculado <span style={{ color: "var(--text-secondary)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(opcional)</span></Label>
                <Select value={clientId} onValueChange={(v) => setClientId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Fecha inicio</Label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Team members */}
            {teamMembers.length > 1 && (
              <div>
                <Label>Miembros del proyecto</Label>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px" }}>Selecciona quién trabaja en este proyecto</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {teamMembers.map((m, idx) => {
                    const isSelected = selectedMembers.includes(m.id)
                    return (
                      <label
                        key={m.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                          borderRadius: 8, cursor: "pointer",
                          border: isSelected ? `1px solid #0F766E` : "1px solid var(--border-subtle)",
                          background: isSelected ? "#0F766E10" : "var(--bg-card)",
                          transition: "all 0.12s",
                        }}
                      >
                        <input
                          type="checkbox" checked={isSelected} onChange={() => toggleMember(m.id)}
                          style={{ width: 14, height: 14, accentColor: "#0F766E", cursor: "pointer" }}
                        />
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                          background: MEMBER_COLORS[idx % MEMBER_COLORS.length],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 9, fontWeight: 700, color: "#fff",
                        }}>
                          {getInitials(m.name, m.email)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{m.name ?? m.email}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "16px 24px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <button type="button" onClick={handleClose}
              style={{ padding: "9px 18px", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}>
              Cancelar
            </button>
            <button type="button" onClick={handleCreate} disabled={!name.trim() || isSubmitting}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 22px", background: "#0F766E", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", opacity: (!name.trim() || isSubmitting) ? 0.45 : 1 }}>
              {isSubmitting && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
              Crear proyecto
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
