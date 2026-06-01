"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Mail, Phone, Trash2, Check, Loader2, CheckSquare } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { toast } from "sonner"
import { convertLeadToClient, markLeadLost, deleteLead } from "@/modules/leads/actions"
import { LeadInteractionModal } from "@domains/leads/components/LeadInteractionModal"
import { NewTaskModal } from "@/modules/tasks/dashboard/NewTaskModal"
import { getInitials, formatSource } from "@domains/leads/utils/formatting"

// ─── Design tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1", accentInk: "#0d7a56",
  red: "#b91c1c", redSoft: "#fef2f2",
  warn: "#c2410c", warnSoft: "#fef3eb",
  blue: "#3756a4", blueSoft: "#eef2fb",
}

const PIPELINE = [
  { id: "NEW",       nm: "Nuevo" },
  { id: "CONTACTED", nm: "Contactado" },
  { id: "QUALIFIED", nm: "Cualificado" },
  { id: "STALLED",   nm: "En negociación" },
  { id: "CONVERTED", nm: "Ganado" },
]

const STATUS_PILL: Record<string, { bg: string; color: string; dot: string }> = {
  NEW:       { bg: C.accentSoft, color: C.accentInk, dot: C.accent },
  CONTACTED: { bg: C.blueSoft,   color: C.blue,      dot: C.blue },
  QUALIFIED: { bg: C.accentSoft, color: C.accentInk, dot: C.accent },
  STALLED:   { bg: C.warnSoft,   color: C.warn,      dot: C.warn },
  CONVERTED: { bg: C.ink,        color: "white",      dot: "white" },
  LOST:      { bg: C.redSoft,    color: C.red,        dot: C.red },
}

const STATUS_LABEL: Record<string, string> = {
  NEW: "Nuevo", CONTACTED: "Contactado", QUALIFIED: "Cualificado",
  STALLED: "En negociación", CONVERTED: "Ganado", LOST: "Perdido",
}
const TEMP_LABEL: Record<string, string> = { HOT: "Caliente", WARM: "Tibia", COLD: "Fría" }

function Pill({ children, bg, color, dot }: { children: React.ReactNode; bg: string; color: string; dot: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 500, background: bg, color, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: dot, flexShrink: 0 }} />
      {children}
    </span>
  )
}

function GroupBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 5, fontSize: 12, fontWeight: 500, background: "transparent", border: 0, cursor: "pointer", color: C.ink2 }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "white"; el.style.boxShadow = `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,.03)` }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.boxShadow = "none" }}>
      {children}
    </button>
  )
}

export interface LeadHeaderLead {
  id: string; name: string | null; email: string | null; phone: string | null
  leadStatus: string; score: number; source: string; temperature?: string | null
  createdAt: Date; lastActionAt?: Date | null; additionalInfo?: string | null
}

export function LeadHeader({ lead, onRefresh }: { lead: LeadHeaderLead; onRefresh?: () => void }) {
  const router = useRouter()
  const [localStatus, setLocalStatus]         = useState(lead.leadStatus)
  const [showInteraction, setShowInteraction] = useState(false)
  const [interactionType, setInteractionType] = useState<"email" | "call">("email")
  const [showTaskModal, setShowTaskModal]       = useState(false)
  const [converting, setConverting]           = useState(false)
  const [markingLost, setMarkingLost]         = useState(false)
  const [deleting, setDeleting]               = useState(false)
  const [lostReason, setLostReason]           = useState("")
  const [convertDialog, setConvertDialog]     = useState(false)
  const [lostDialog, setLostDialog]           = useState(false)
  const [deleteDialog, setDeleteDialog]       = useState(false)

  const initials   = getInitials(lead.name, lead.email)
  const pill       = STATUS_PILL[localStatus] ?? STATUS_PILL.NEW
  const tempLabel  = TEMP_LABEL[lead.temperature ?? "COLD"] ?? "Fría"
  const pipeIdx    = PIPELINE.findIndex(s => s.id === localStatus)

  async function doConvert() {
    setConverting(true)
    try {
      await convertLeadToClient(lead.id)
      setLocalStatus("CONVERTED"); setConvertDialog(false); toast.success("Lead convertido en cliente"); setTimeout(() => router.refresh(), 600)
    } catch (err) { toast.error(err instanceof Error ? err.message : "Error al convertir") } finally { setConverting(false) }
  }

  async function doLost() {
    setMarkingLost(true)
    try {
      await markLeadLost(lead.id, lostReason)
      setLocalStatus("LOST"); setLostDialog(false); toast.success("Lead marcado como perdido"); setTimeout(() => router.refresh(), 600)
    } catch { toast.error("Error al marcar como perdido") } finally { setMarkingLost(false) }
  }

  async function doDelete() {
    setDeleting(true)
    try { await deleteLead(lead.id); toast.success("Lead eliminado"); router.push("/dashboard/leads") }
    catch { toast.error("Error al eliminar") } finally { setDeleting(false) }
  }

  function openNote() {
    const ta = document.querySelector<HTMLTextAreaElement>(".lead-notes-ta")
    if (ta) { ta.focus(); ta.scrollIntoView({ behavior: "smooth", block: "center" }) }
  }

  const dlgBtnBase: React.CSSProperties = { padding: "7px 16px", borderRadius: 7, border: `1px solid ${C.line}`, fontSize: 13, fontWeight: 500, color: C.ink2, background: C.bg, cursor: "pointer" }
  const dlgBtnPrimary = (bg: string, disabled: boolean): React.CSSProperties => ({ padding: "7px 16px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 550, color: "white", background: bg, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: 6 })

  return (
    <>
      <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>

        {/* ── Top section ───────────────────────────────── */}
        <div style={{ padding: "20px 22px 18px", display: "flex", alignItems: "flex-start", gap: 16 }}>
          {/* Avatar */}
          <div style={{ width: 52, height: 52, borderRadius: 10, background: C.accentSoft, color: C.accentInk, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(13,122,86,0.08)" }}>
            {initials}
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 22, lineHeight: 1.15, margin: 0 }}>
              {lead.name || "Sin nombre"}
              {lead.additionalInfo && <span style={{ color: C.ink3, fontWeight: 500, fontSize: 14, letterSpacing: "-0.005em", marginLeft: 6 }}>· {lead.additionalInfo}</span>}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: C.ink3 }}>
              {lead.email && (
                <a href={`mailto:${lead.email}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.ink2, textDecoration: "none", borderBottom: "1px solid transparent", paddingBottom: 1 }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.ink; el.style.borderBottomColor = C.ink3 }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.ink2; el.style.borderBottomColor = "transparent" }}>
                  <Mail size={13} style={{ color: C.ink4 }} />{lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone.replace(/\s/g, "")}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.ink2, textDecoration: "none", borderBottom: "1px solid transparent", paddingBottom: 1 }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.ink; el.style.borderBottomColor = C.ink3 }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.ink2; el.style.borderBottomColor = "transparent" }}>
                  <Phone size={13} style={{ color: C.ink4 }} />{lead.phone}
                </a>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap" }}>
              <Pill bg={pill.bg} color={pill.color} dot={pill.dot}>{STATUS_LABEL[localStatus] ?? localStatus}</Pill>
              <Pill bg={C.bg3} color={C.ink2} dot={C.ink4}>Score {lead.score} pts</Pill>
              <Pill bg={C.bg3} color={C.ink2} dot={C.ink4}>{formatSource(lead.source)}</Pill>
              <Pill bg={C.bg3} color={C.ink2} dot={C.ink4}>Temperatura · {tempLabel}</Pill>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: 3, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 8 }}>
              <GroupBtn onClick={() => lead.email && window.open(`mailto:${lead.email}`, "_blank")}><Mail size={12} />Email</GroupBtn>
              <GroupBtn onClick={openNote}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4z"/></svg>
                Nota
              </GroupBtn>
              <GroupBtn onClick={() => setShowInteraction(true)}><Phone size={12} />Interacción</GroupBtn>
              <GroupBtn onClick={() => setShowTaskModal(true)}><CheckSquare size={12} />Tarea</GroupBtn>
            </div>

            {localStatus !== "CONVERTED" && (
              <button onClick={() => setConvertDialog(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.accent, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.accentInk }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.accent }}>
                <Check size={12} strokeWidth={2.5} />Convertir en cliente
              </button>
            )}

            {localStatus !== "LOST" && localStatus !== "CONVERTED" && (
              <button onClick={() => setLostDialog(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, background: C.bg, color: C.red, fontWeight: 550, fontSize: 12.5, border: `1px solid ${C.redSoft}`, cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.redSoft }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.bg }}>
                Perdido
              </button>
            )}

            {localStatus !== "CONVERTED" && (
              <button onClick={() => setDeleteDialog(true)} aria-label="Eliminar lead" style={{ width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center", color: C.ink3, border: `1px solid ${C.line}`, background: C.bg, cursor: "pointer" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.red; el.style.color = C.red; el.style.background = C.redSoft }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = C.line; el.style.color = C.ink3; el.style.background = C.bg }}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Meta strip ────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `1px solid ${C.line2}`, background: C.bg2 }}>
          {[
            { lbl: "Fuente",           v: formatSource(lead.source),   mono: true,  muted: false },
            { lbl: "Creado",           v: format(new Date(lead.createdAt), "d MMM yyyy", { locale: es }), mono: false, muted: false },
            { lbl: "Última actividad", v: lead.lastActionAt ? format(new Date(lead.lastActionAt), "d MMM yyyy", { locale: es }) : "Sin actividad", mono: false, muted: !lead.lastActionAt },
            { lbl: "Propietario",      v: "—", mono: false, muted: true },
          ].map((cell, i) => (
            <div key={cell.lbl} style={{ padding: "12px 22px", borderRight: i < 3 ? `1px solid ${C.line2}` : "none", display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink4, fontWeight: 500 }}>{cell.lbl}</span>
              <span style={{ fontSize: 12.5, fontWeight: cell.mono ? 500 : 550, color: cell.muted ? C.ink3 : C.ink, letterSpacing: "-0.003em", fontFamily: cell.mono ? "ui-monospace,monospace" : undefined } as React.CSSProperties}>{cell.v}</span>
            </div>
          ))}
        </div>

        {/* ── Pipeline stages ───────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", padding: "10px 22px", borderTop: `1px solid ${C.line2}`, background: C.bg, gap: 0 }}>
          <div style={{ display: "flex", alignItems: "center", flex: 1, flexWrap: "wrap", gap: 2 }}>
            {PIPELINE.map((s, i) => {
              const done = i < pipeIdx
              const on   = i === pipeIdx
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <div style={{ width: 16, height: 1, background: C.line, flexShrink: 0, margin: "0 1px" }} />}
                  <button
                    onClick={() => toast("Mover a: " + s.nm)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", fontFamily: "ui-monospace,monospace", fontSize: 10.5, color: on ? C.accentInk : done ? C.ink2 : C.ink4, fontWeight: on ? 600 : 450, background: on ? C.accentSoft : "transparent", borderRadius: 5, border: "none", cursor: "pointer" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, flexShrink: 0, background: on ? C.accent : done ? C.ink : C.bg3, border: `1.5px solid ${on ? C.accent : done ? C.ink : C.ink5}` }} />
                    {s.nm}
                  </button>
                </div>
              )
            })}
          </div>
          <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: C.ink3, flexShrink: 0 }}>Ciclo de venta · día 1</span>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────── */}
      {showInteraction && (
        <LeadInteractionModal
          leadId={lead.id}
          open={showInteraction}
          onClose={() => setShowInteraction(false)}
          onSuccess={() => onRefresh?.()}
        />
      )}

      <NewTaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        defaultEntityType="LEAD"
        defaultEntityId={lead.id}
      />

      <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
        <DialogContent className="bg-white !max-w-[420px] rounded-2xl border-0 shadow-xl p-0">
          <VisuallyHidden.Root><DialogTitle>Convertir lead</DialogTitle></VisuallyHidden.Root>
          <div style={{ padding: "22px 24px 20px", borderBottom: `1px solid ${C.line2}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Convertir en cliente</h2>
            <p style={{ fontSize: 13, color: C.ink3, margin: "6px 0 0" }}>Se creará un perfil de cliente vinculado a <strong style={{ color: C.ink }}>{lead.name || lead.email}</strong>.</p>
          </div>
          <div style={{ padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setConvertDialog(false)} style={dlgBtnBase}>Cancelar</button>
            <button onClick={doConvert} disabled={converting} style={dlgBtnPrimary(C.accent, converting)}>
              {converting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {converting ? "Convirtiendo…" : "Confirmar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={lostDialog} onOpenChange={setLostDialog}>
        <DialogContent className="bg-white !max-w-[420px] rounded-2xl border-0 shadow-xl p-0">
          <VisuallyHidden.Root><DialogTitle>Marcar como perdido</DialogTitle></VisuallyHidden.Root>
          <div style={{ padding: "22px 24px 16px", borderBottom: `1px solid ${C.line2}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Marcar como perdido</h2>
            <p style={{ fontSize: 13, color: C.ink3, margin: "6px 0 0" }}>Indica el motivo para mejorar el análisis de conversión.</p>
          </div>
          <div style={{ padding: "16px 24px" }}>
            <textarea value={lostReason} onChange={e => setLostReason(e.target.value)} placeholder="Ej: Precio fuera de presupuesto…" rows={3} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${C.line}`, borderRadius: 7, fontSize: 13, color: C.ink, background: C.bg2, outline: "none", resize: "none", lineHeight: 1.5, fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ padding: "0 24px 16px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setLostDialog(false)} style={dlgBtnBase}>Cancelar</button>
            <button onClick={doLost} disabled={markingLost} style={dlgBtnPrimary(C.red, markingLost)}>
              {markingLost && <Loader2 size={13} className="animate-spin" />}
              {markingLost ? "Guardando…" : "Confirmar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-white !max-w-[400px] rounded-2xl border-0 shadow-xl p-0">
          <VisuallyHidden.Root><DialogTitle>Eliminar lead</DialogTitle></VisuallyHidden.Root>
          <div style={{ padding: "22px 24px 20px", borderBottom: `1px solid ${C.line2}` }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: C.red }}>Eliminar lead</h2>
            <p style={{ fontSize: 13, color: C.ink3, margin: "6px 0 0" }}>Esta acción es permanente e irreversible.</p>
          </div>
          <div style={{ padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => setDeleteDialog(false)} style={dlgBtnBase}>Cancelar</button>
            <button onClick={doDelete} disabled={deleting} style={dlgBtnPrimary(C.red, deleting)}>
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {deleting ? "Eliminando…" : "Eliminar definitivamente"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
