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
import { addClientNote } from "@/modules/clients/actions"

interface NoteModalProps {
  open: boolean
  onClose: () => void
  clientId: string
}

export function NoteModal({ open, onClose, clientId }: NoteModalProps) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!note.trim()) return
    setIsSubmitting(true)
    try {
      const result = await addClientNote(clientId, note.trim())
      if (result && typeof result === "object" && "success" in result && result.success) {
        onClose()
        setNote("")
        router.refresh()
      } else {
        const err = result && typeof result === "object" && "error" in result ? (result as { error?: string }).error : "Error al guardar la nota"
        alert(err ?? "Error al guardar la nota")
      }
    } catch (err) {
      console.error(err)
      alert("Error al guardar la nota")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir nota</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form id="note-modal-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Nota
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] min-h-[120px]"
                placeholder="Escribe una nota interna sobre este cliente..."
              />
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
            form="note-modal-form"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Guardando..." : "Guardar nota"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
