"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StickyNote, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogClose,
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
        setNote("")
        onClose()
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
      <DialogContent className="p-0" style={{ maxWidth: "480px", width: "calc(100vw - 32px)" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
              <StickyNote className="w-4 h-4 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">Añadir nota</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Nota interna visible solo para ti</p>
            </div>
          </div>
          <DialogClose className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
            <X className="w-4 h-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        {/* Body */}
        <form id="note-modal-form" onSubmit={handleSubmit} className="px-6 py-5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
            rows={6}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all resize-none"
            placeholder="Escribe una nota interna sobre este cliente..."
          />
          <p className="mt-2 text-[11px] text-[var(--text-secondary)]">{note.length} caracteres</p>
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
            form="note-modal-form"
            disabled={isSubmitting || !note.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1FA97A] text-[13px] font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar nota"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
