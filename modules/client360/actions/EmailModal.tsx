"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog"
import { logClientEmailSent } from "@/modules/clients/actions"

interface EmailModalProps {
  open: boolean
  onClose: () => void
  clientId: string
  defaultTo?: string | null
}

export function EmailModal({ open, onClose, clientId, defaultTo }: EmailModalProps) {
  const router = useRouter()
  const [to, setTo] = useState(defaultTo ?? "")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!to.trim()) return
    setIsSubmitting(true)
    try {
      const result = await logClientEmailSent(clientId, {
        to: to.trim(),
        subject: subject.trim() || "(Sin asunto)",
        body: message.trim() || "(Sin contenido)",
      })
      if (result && typeof result === "object" && "success" in result && result.success) {
        setSubject(""); setMessage("")
        onClose()
        router.refresh()
      } else {
        const err = result && typeof result === "object" && "error" in result ? (result as { error?: string }).error : "Error al registrar el email"
        alert(err ?? "Error al registrar el email")
      }
    } catch (err) {
      console.error(err)
      alert("Error al registrar el email")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="p-0" style={{ maxWidth: "520px", width: "calc(100vw - 32px)" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">Registrar email</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Se guarda en el historial — no se envía</p>
            </div>
          </div>
          <DialogClose className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
            <X className="w-4 h-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        {/* Body */}
        <form id="email-modal-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Para <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
              placeholder="cliente@ejemplo.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Asunto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all"
              placeholder="Asunto del email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all resize-none"
              placeholder="Escribe el cuerpo del email..."
            />
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
            form="email-modal-form"
            disabled={isSubmitting || !to.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1FA97A] text-[13px] font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Registrando..." : "Registrar email"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
