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
    if (!to.trim()) {
      alert("Indica el destinatario")
      return
    }
    setIsSubmitting(true)
    try {
      const result = await logClientEmailSent(clientId, {
        to: to.trim(),
        subject: subject.trim() || "(Sin asunto)",
        body: message.trim() || "(Sin contenido)",
      })
      if (result && typeof result === "object" && "success" in result && result.success) {
        onClose()
        setSubject("")
        setMessage("")
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar email</DialogTitle>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Se guardará en el historial del cliente (no se envía por correo).
          </p>
        </DialogHeader>
        <DialogBody>
          <form id="email-modal-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Para</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="cliente@ejemplo.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Asunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                placeholder="Asunto del email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] min-h-[120px]"
                placeholder="Escribe tu mensaje..."
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
            form="email-modal-form"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Registrando..." : "Registrar"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
