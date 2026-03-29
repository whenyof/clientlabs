"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckSquare, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog"
import { createTask } from "@/app/dashboard/tasks/actions"

interface TaskModalProps {
  open: boolean
  onClose: () => void
  clientId: string
}

const PRIORITIES = [
  { value: "low",    label: "Baja",  color: "#6B7280" },
  { value: "medium", label: "Media", color: "#F59E0B" },
  { value: "high",   label: "Alta",  color: "#EF4444" },
] as const

export function TaskModal({ open, onClose, clientId }: TaskModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      const priorityMap = { low: "LOW" as const, medium: "MEDIUM" as const, high: "HIGH" as const }
      const result = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority: priorityMap[priority],
        clientId,
      })
      if (result && typeof result === "object" && "success" in result && result.success) {
        setTitle(""); setDescription(""); setDueDate(""); setPriority("medium")
        onClose()
        router.refresh()
      } else {
        const err = result && typeof result === "object" && "error" in result ? (result as { error?: string }).error : "Error al crear la tarea"
        alert(err ?? "Error al crear la tarea")
      }
    } catch (err) {
      console.error(err)
      alert("Error al crear la tarea")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="p-0" style={{ maxWidth: "480px", width: "calc(100vw - 32px)" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">Nueva tarea</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Se vinculará a este cliente</p>
            </div>
          </div>
          <DialogClose className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
            <X className="w-4 h-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        {/* Body */}
        <form id="task-modal-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
              placeholder="Ej. Llamar para seguimiento"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all resize-none"
              placeholder="Detalles opcionales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Fecha límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Prioridad
              </label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className="flex-1 rounded-lg border py-2 text-[12px] font-medium transition-all"
                    style={
                      priority === p.value
                        ? { background: `${p.color}15`, borderColor: `${p.color}40`, color: p.color }
                        : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--bg-surface)" }
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-white hover:text-[var(--text-primary)] transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="task-modal-form"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1FA97A] text-[13px] font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Creando..." : "Crear tarea"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
