"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { createTask } from "@/app/dashboard/tasks/actions"

interface TaskModalProps {
  open: boolean
  onClose: () => void
  clientId: string
}

export function TaskModal({ open, onClose, clientId }: TaskModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setIsSubmitting(true)
    try {
      const priorityMap = {
        low: "LOW" as const,
        medium: "MEDIUM" as const,
        high: "HIGH" as const,
        "": "MEDIUM" as const,
      }
      const result = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority: priorityMap[priority],
        clientId,
      })
      if (result && typeof result === "object" && "success" in result && result.success) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear tarea</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form id="task-modal-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="Ej. Llamar al cliente"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] min-h-[80px]"
                placeholder="Detalles de la tarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "low" | "medium" | "high" | "")
                  }
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="">Seleccionar</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="task-modal-form"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear tarea"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
