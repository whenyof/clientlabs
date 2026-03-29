"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, Video, Mail, MessageCircle, MapPin, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog"
import { registerClientInteraction } from "@/modules/clients/actions"

interface InteractionModalProps {
  open: boolean
  onClose: () => void
  clientId: string
}

const TYPES = [
  { value: "llamada",   label: "Llamada",   api: "CALL"      as const, Icon: Phone,          color: "#3B82F6" },
  { value: "reunion",   label: "Reunión",   api: "MEETING"   as const, Icon: Video,          color: "#8B5CF6" },
  { value: "email",     label: "Email",     api: "EMAIL"     as const, Icon: Mail,           color: "#6B7280" },
  { value: "whatsapp",  label: "WhatsApp",  api: "WHATSAPP"  as const, Icon: MessageCircle,  color: "#22C55E" },
  { value: "visita",    label: "Visita",    api: "VISITA"    as const, Icon: MapPin,         color: "#F59E0B" },
] as const

export function InteractionModal({ open, onClose, clientId }: InteractionModalProps) {
  const router = useRouter()
  const [type, setType] = useState<typeof TYPES[number]["value"] | "">("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selected = TYPES.find((t) => t.value === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !selected) return
    setIsSubmitting(true)
    try {
      const result = await registerClientInteraction(clientId, selected.api, description.trim() || "—")
      if (result && typeof result === "object" && "success" in result && result.success) {
        setType(""); setDescription("")
        onClose()
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
      <DialogContent className="p-0" style={{ maxWidth: "480px", width: "calc(100vw - 32px)" }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">Registrar interacción</h2>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Añade un contacto al historial del cliente</p>
            </div>
          </div>
          <DialogClose className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">
            <X className="w-4 h-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        {/* Body */}
        <form id="interaction-modal-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Tipo <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TYPES.map(({ value, label, Icon, color }) => {
                const isActive = type === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className="flex flex-col items-center gap-1.5 rounded-lg border py-3 text-[11px] font-medium transition-all"
                    style={
                      isActive
                        ? { background: `${color}12`, borderColor: `${color}40`, color }
                        : { borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "var(--bg-surface)" }
                    }
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? color : undefined }} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 transition-all resize-none"
              placeholder="¿De qué trató la interacción?"
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
            form="interaction-modal-form"
            disabled={isSubmitting || !type}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1FA97A] text-[13px] font-semibold text-white hover:opacity-90 transition-all disabled:opacity-40"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
