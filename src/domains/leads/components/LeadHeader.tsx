"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Mail, StickyNote, Megaphone, ExternalLink, X, MessageSquare, UserCheck, AlertTriangle, Check, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  formatSource,
  getInitials,
  STATUS_LABELS,
  TEMP_LABELS,
} from "@domains/leads/utils/formatting"
import { LeadInteractionModal } from "@domains/leads/components/LeadInteractionModal"
import { convertLeadToClient, markLeadLost, deleteLead } from "@/modules/leads/actions"

export interface LeadHeaderLead {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  leadStatus: string
  score: number
  source: string
  temperature?: string | null
  createdAt: Date
  lastActionAt?: Date | null
}

interface LeadHeaderProps {
  lead: LeadHeaderLead
}

function Badge({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 6,
        border: "0.5px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  )
}


export function LeadHeader({ lead }: LeadHeaderProps) {
  const router = useRouter()
  const [converting, setConverting] = useState(false)
  const [markingLost, setMarkingLost] = useState(false)
  const [showEmailChoice, setShowEmailChoice] = useState(false)
  const [showInteractionModal, setShowInteractionModal] = useState(false)
  const [localScore, setLocalScore] = useState(lead.score)
  const [convertDialog, setConvertDialog] = useState(false)
  const [lostDialog, setLostDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lostReason, setLostReason] = useState("")

  const initials = getInitials(lead.name, lead.email)
  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature ? TEMP_LABELS[lead.temperature] ?? lead.temperature : null

  const handleEmail = () => {
    if (!lead.email) return
    setShowEmailChoice(v => !v)
  }

  const handleDirectEmail = () => {
    window.location.href = `mailto:${lead.email}?subject=Contacto`
    setShowEmailChoice(false)
  }

  const handleGmail = () => {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email ?? "")}`,
      "_blank", "noopener"
    )
    setShowEmailChoice(false)
  }

  const handleMarketing = () => {
    router.push("/dashboard/marketing")
    setShowEmailChoice(false)
  }

  const handleConvert = () => setConvertDialog(true)

  const doConvert = async () => {
    setConverting(true)
    try {
      await convertLeadToClient(lead.id)
      setConvertDialog(false)
      toast.success("Lead convertido a cliente")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al convertir")
    } finally {
      setConverting(false)
    }
  }

  const handleLost = () => setLostDialog(true)

  const doLost = async () => {
    setMarkingLost(true)
    try {
      await markLeadLost(lead.id, lostReason || "Sin motivo especificado")
      setLostDialog(false)
      setLostReason("")
      toast.success("Lead marcado como perdido")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado")
    } finally {
      setMarkingLost(false)
    }
  }

  const doDelete = async () => {
    setDeleting(true)
    try {
      await deleteLead(lead.id)
      setDeleteDialog(false)
      toast.success("Lead eliminado")
      router.push("/dashboard/leads")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setDeleting(false)
    }
  }

  const createdFormatted = format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })
  const lastActivityFormatted = lead.lastActionAt
    ? format(new Date(lead.lastActionAt), "d MMM yyyy", { locale: es })
    : "Sin actividad"

  const showConvert = lead.leadStatus !== "CONVERTED"
  const showLost = lead.leadStatus !== "LOST" && lead.leadStatus !== "CONVERTED"

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/leads")}
        style={{ marginBottom: 12, paddingLeft: 0, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Volver a leads
      </Button>

      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-subtle)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        {/* Top row: avatar + info + buttons */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          {/* Left: avatar + identity */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--green-badge-bg)",
                color: "var(--green-badge-text)",
                border: "0.5px solid var(--green-badge-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>
                {lead.name || "Sin nombre"}
              </h1>
              {(lead.email || lead.phone) && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  {[lead.email, lead.phone].filter(Boolean).join(" · ")}
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                <Badge>{statusLabel}</Badge>
                {tempLabel && <Badge>{tempLabel}</Badge>}
                <Badge>{localScore} pts</Badge>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {/* Email button + choice dropdown */}
            <div style={{ position: "relative" }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEmail}
                disabled={!lead.email}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  borderColor: showEmailChoice ? "#1FA97A" : undefined,
                  color: showEmailChoice ? "#1FA97A" : undefined,
                }}
              >
                <Mail style={{ width: 14, height: 14 }} />
                Email
              </Button>

              {showEmailChoice && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  width: 240, zIndex: 100,
                  background: "var(--bg-card)",
                  border: "0.5px solid var(--border-subtle)",
                  borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                  overflow: "hidden",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px 8px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Enviar a {lead.name || lead.email}
                    </span>
                    <button type="button" onClick={() => setShowEmailChoice(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", padding: 0 }}>
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                  {[
                    { icon: <Mail style={{ width: 15, height: 15, color: "#1FA97A" }} />, label: "Enviar email", sub: "Abre tu cliente de email", action: handleDirectEmail },
                    { icon: <ExternalLink style={{ width: 15, height: 15, color: "#4285F4" }} />, label: "Abrir en Gmail", sub: "Abre Gmail en el navegador", action: handleGmail },
                    { icon: <Megaphone style={{ width: 15, height: 15, color: "#8B5CF6" }} />, label: "Email marketing", sub: "Ir a campañas de marketing", action: handleMarketing },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={opt.action}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 14px",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottom: "0.5px solid var(--border-subtle)",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-surface)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <div style={{ flexShrink: 0 }}>{opt.icon}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{opt.label}</p>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => {
                const el = document.getElementById("lead-notes-textarea")
                if (el) { el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }) }
              }}
            >
              <StickyNote style={{ width: 14, height: 14 }} />
              Nota
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowInteractionModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <MessageSquare style={{ width: 14, height: 14 }} />
              Interacción
            </Button>
            {showConvert && (
              <button
                type="button"
                onClick={handleConvert}
                disabled={converting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: "none",
                  background: "var(--green-btn)",
                  color: "#fff",
                  cursor: converting ? "not-allowed" : "pointer",
                  opacity: converting ? 0.6 : 1,
                }}
              >
                {converting ? "Convirtiendo..." : "Convertir en cliente"}
              </button>
            )}
            {showLost && (
              <button
                type="button"
                onClick={handleLost}
                disabled={markingLost}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 8,
                  border: "0.5px solid var(--danger-soft-text)",
                  background: "var(--danger-soft-bg)",
                  color: "var(--danger-soft-text)",
                  cursor: markingLost ? "not-allowed" : "pointer",
                  opacity: markingLost ? 0.6 : 1,
                }}
              >
                {markingLost ? "Marcando..." : "Perdido"}
              </button>
            )}
            {lead.leadStatus !== "CONVERTED" && (
              <button
                type="button"
                onClick={() => setDeleteDialog(true)}
                title="Eliminar lead"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "0.5px solid #fca5a5",
                  background: "#fff5f5",
                  color: "#EF4444",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>

      <LeadInteractionModal
        open={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        leadId={lead.id}
        onSuccess={(newScore) => {
          if (newScore !== undefined) setLocalScore(newScore)
          router.refresh()
        }}
      />

      {/* Convert to client dialog */}
      <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
        <DialogContent className="bg-white border-[0.5px] border-slate-200 rounded-xl p-0 overflow-hidden max-w-md shadow-sm">
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E6F6F1] border border-[#9FE1CB] flex items-center justify-center">
              <UserCheck style={{ width: 18, height: 18, color: "#1FA97A" }} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
                Convertir en cliente
              </DialogTitle>
              <p className="text-[13px] text-slate-500 mt-0.5">Esta acción es permanente y no se puede deshacer</p>
            </div>
          </div>
          <div className="mx-6 mb-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-[14px] font-semibold text-slate-900">{lead.name || "Sin nombre"}</p>
            {lead.email && <p className="text-[12px] text-slate-500 mt-0.5">{lead.email}</p>}
          </div>
          <div className="mx-6 mb-5 space-y-2">
            {[
              "Se creará un nuevo cliente con los datos de este lead",
              "El historial de actividad quedará registrado",
              "El lead se marcará como Convertido",
            ].map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[#E6F6F1] border border-[#9FE1CB] flex items-center justify-center mt-0.5">
                  <Check style={{ width: 9, height: 9, color: "#1FA97A" }} />
                </div>
                <p className="text-[12.5px] text-slate-600 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => setConvertDialog(false)}
              disabled={converting}
              className="h-9 px-4 text-[13px] font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <button
              type="button"
              onClick={doConvert}
              disabled={converting}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                height: 36, padding: "0 16px",
                fontSize: 13, fontWeight: 500, borderRadius: 8,
                background: converting ? "#9FE1CB" : "#1FA97A",
                color: "#fff", border: "none",
                cursor: converting ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {converting && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
              {converting ? "Convirtiendo..." : "Confirmar conversión"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as lost dialog */}
      <Dialog open={lostDialog} onOpenChange={setLostDialog}>
        <DialogContent className="bg-white border-[0.5px] border-slate-200 rounded-xl p-0 overflow-hidden max-w-md shadow-sm">
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
              <AlertTriangle style={{ width: 18, height: 18 }} className="text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
                Marcar como perdido
              </DialogTitle>
              <p className="text-[13px] text-slate-500 mt-0.5">{lead.name || lead.email || "Lead"}</p>
            </div>
          </div>
          <div className="px-6 pb-5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Ej: Presupuesto insuficiente, eligió a la competencia..."
              onKeyDown={(e) => { if (e.key === "Enter") doLost() }}
              style={{
                width: "100%", height: 40, padding: "0 12px",
                fontSize: 13, color: "#1e293b",
                background: "#f8fafc", border: "1px solid #e2e8f0",
                borderRadius: 8, outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => { setLostDialog(false); setLostReason("") }}
              disabled={markingLost}
              className="h-9 px-4 text-[13px] font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <button
              type="button"
              onClick={doLost}
              disabled={markingLost}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                height: 36, padding: "0 16px",
                fontSize: 13, fontWeight: 500, borderRadius: 8,
                background: markingLost ? "#fbbf24" : "#D97706",
                color: "#fff", border: "none",
                cursor: markingLost ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {markingLost && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
              {markingLost ? "Marcando..." : "Marcar como perdido"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-white border-[0.5px] border-slate-200 rounded-xl p-0 overflow-hidden max-w-md shadow-sm">
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
              <Trash2 style={{ width: 18, height: 18 }} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
                Eliminar lead
              </DialogTitle>
              <p className="text-[13px] text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <div className="mx-6 mb-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-[13px] text-slate-500 mb-0.5">Lead a eliminar</p>
            <p className="text-[14px] font-semibold text-slate-900">{lead.name || "Sin nombre"}</p>
            {lead.email && <p className="text-[12px] text-slate-400 mt-0.5">{lead.email}</p>}
          </div>
          <div className="mx-6 mb-5 flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle style={{ width: 15, height: 15 }} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-red-700 leading-relaxed">
              Se eliminarán el lead y todo su historial de actividad de forma permanente.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleting}
              className="h-9 px-4 text-[13px] font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <button
              type="button"
              onClick={doDelete}
              disabled={deleting}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                height: 36, padding: "0 16px",
                fontSize: 13, fontWeight: 500, borderRadius: 8,
                background: deleting ? "#fca5a5" : "#EF4444",
                color: "#fff", border: "none",
                cursor: deleting ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {deleting && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
              {deleting ? "Eliminando..." : "Eliminar lead"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: "0.5px solid var(--border-subtle)",
            marginTop: 20,
            paddingTop: 16,
          }}
        >
          {[
            { label: "Fuente", value: formatSource(lead.source) },
            { label: "Creado", value: createdFormatted },
            { label: "Última actividad", value: lastActivityFormatted },
            { label: "Estado", value: statusLabel },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                padding: "0 16px",
                borderLeft: i > 0 ? "0.5px solid var(--border-subtle)" : "none",
              }}
            >
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", margin: 0, fontWeight: 500 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", margin: "4px 0 0 0" }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
