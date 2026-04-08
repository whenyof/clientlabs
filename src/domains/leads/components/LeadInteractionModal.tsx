"use client"

import { useState } from "react"
import { Phone, Mail, Video, MessageCircle, StickyNote, Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"

interface LeadInteractionModalProps {
  open: boolean
  onClose: () => void
  leadId: string
  onSuccess?: (score?: number) => void
}

const TYPES = [
  { value: "CALL",      label: "Llamada",   Icon: Phone,          color: "#1FA97A" },
  { value: "EMAIL",     label: "Email",     Icon: Mail,           color: "#378ADD" },
  { value: "MEETING",   label: "Reunión",   Icon: Video,          color: "#8B5CF6" },
  { value: "WHATSAPP",  label: "WhatsApp",  Icon: MessageCircle,  color: "#22C55E" },
  { value: "NOTE",      label: "Nota",      Icon: StickyNote,     color: "#EF9F27" },
] as const

const TYPE_TITLES: Record<string, string> = {
  CALL:     "Llamada realizada",
  EMAIL:    "Email enviado",
  MEETING:  "Reunión realizada",
  WHATSAPP: "WhatsApp enviado",
  NOTE:     "Nota añadida",
}

export function LeadInteractionModal({ open, onClose, leadId, onSuccess }: LeadInteractionModalProps) {
  const [type, setType] = useState<string>("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selected = TYPES.find((t) => t.value === type)

  const handleClose = () => {
    setType("")
    setDescription("")
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !selected) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: TYPE_TITLES[type] ?? type,
          description: description.trim() || null,
        }),
      })
      if (!res.ok) throw new Error("Error al registrar")
      const data = await res.json()
      setType("")
      setDescription("")
      onClose()
      onSuccess?.(data.score ?? undefined)
    } catch {
      // silent — user can retry
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="p-0" style={{ maxWidth: 480, width: "calc(100vw - 32px)" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "0.5px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#F0FDF8", border: "0.5px solid #BBF7D0",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Phone style={{ width: 16, height: 16, color: "#1FA97A" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
                Registrar interacción
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Añade un contacto al historial del lead
              </p>
            </div>
          </div>
          <DialogClose style={{
            width: 28, height: 28, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)",
          }}>
            <X style={{ width: 14, height: 14 }} />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
        </div>

        {/* Body */}
        <form id="lead-interaction-form" onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Type selector */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: 8 }}>
              Tipo <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {TYPES.map(({ value, label, Icon, color }) => {
                const active = type === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 6, padding: "10px 4px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                      border: "0.5px solid",
                      borderColor: active ? `${color}50` : "var(--border-subtle)",
                      background: active ? `${color}10` : "var(--bg-surface)",
                      color: active ? color : "var(--text-secondary)",
                      cursor: "pointer", transition: "all 0.12s",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16, color: active ? color : "var(--text-secondary)" }} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", marginBottom: 6 }}>
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="¿De qué trató la interacción?"
              style={{
                width: "100%", borderRadius: 8, padding: "10px 14px",
                fontSize: 14, color: "var(--text-primary)", resize: "none",
                border: "0.5px solid var(--border-subtle)", background: "var(--bg-surface)",
                outline: "none", boxSizing: "border-box",
                fontFamily: "inherit",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1FA97A" }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)" }}
            />
          </div>
        </form>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8,
          padding: "14px 24px", borderTop: "0.5px solid var(--border-subtle)",
          background: "var(--bg-surface)",
        }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
              border: "0.5px solid var(--border-subtle)", background: "none",
              color: "var(--text-secondary)", cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="lead-interaction-form"
            disabled={submitting || !type}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: "#1FA97A", color: "#fff", border: "none", cursor: "pointer",
              opacity: submitting || !type ? 0.45 : 1, transition: "opacity 0.12s",
            }}
          >
            {submitting && <Loader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />}
            {submitting ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
