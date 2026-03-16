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
import { registerClientInteraction } from "@/modules/clients/actions"

interface InteractionModalProps {
  open: boolean
  onClose: () => void
  clientId: string
}

const TYPES = [
  { value: "llamada", label: "Llamada", api: "CALL" as const },
  { value: "reunion", label: "Reunión", api: "MEETING" as const },
  { value: "email", label: "Email", api: "EMAIL" as const },
  { value: "whatsapp", label: "WhatsApp", api: "WHATSAPP" as const },
  { value: "visita", label: "Visita", api: "VISITA" as const },
] as const

export function InteractionModal({ open, onClose, clientId }: InteractionModalProps) {
  const router = useRouter()
  const [type, setType] = useState<typeof TYPES[number]["value"] | "">("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type) return
    const entry = TYPES.find((t) => t.value === type)
    if (!entry) return
    setIsSubmitting(true)
    try {
      const result = await registerClientInteraction(
        clientId,
        entry.api,
        description.trim() || "—"
      )
      if (result && typeof result === "object" && "success" in result && result.success) {
        onClose()
        setType("")
        setDescription("")
        router.refresh()
      } else {
        const err = result && typeof result === "object" && "error" in result ? (result as { error?: string }).error : "Error al registrar la interacción"
        alert(err ?? "Error al registrar la interacción")
      }
    } catch (err) {
      console.error(err)
      alert("Error al registrar la interacción")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar interacción</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form id="interaction-modal-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as typeof TYPES[number]["value"] | "")
                }
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              >
                <option value="">Seleccionar tipo</option>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] min-h-[100px]"
                placeholder="Detalles de la interacción"
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
            form="interaction-modal-form"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Registrando..." : "Registrar interacción"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
