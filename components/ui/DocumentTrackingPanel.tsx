"use client"

import { useEffect, useState } from "react"
import { Send, Eye, CheckCircle, XCircle, Clock, Copy, Bell } from "lucide-react"

interface TrackingView {
  id: string
  token: string
  type: string
  status: string
  sentAt: string
  emailOpenedAt: string | null
  docOpenedAt: string | null
  viewCount: number
  decidedAt: string | null
  signatureName: string | null
  rejectionReason: string | null
  reminderCount: number
  lastReminderAt: string | null
  expiresAt: string | null
  recipientEmail: string
  recipientName: string
}

interface Props {
  documentId: string
  type: "INVOICE" | "QUOTE" | "DELIVERY_NOTE" | "PURCHASE_ORDER"
}

export function DocumentTrackingPanel({ documentId, type }: Props) {
  const [view, setView] = useState<TrackingView | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [reminding, setReminding] = useState(false)
  const [reminderResult, setReminderResult] = useState<"sent" | "error" | "max" | null>(null)

  useEffect(() => {
    fetch(`/api/doc/tracking?documentId=${documentId}&type=${type}`)
      .then(r => r.json())
      .then(d => { setView(d.view); setLoading(false) })
      .catch(() => setLoading(false))
  }, [documentId, type])

  if (loading) return null
  if (!view) return null

  const appUrl = typeof window !== "undefined" ? window.location.origin : ""
  const docUrl = `${appUrl}/doc/${view.token}`

  function fmtDateTime(d: string | null | undefined) {
    if (!d) return null
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d))
  }

  function copyLink() {
    navigator.clipboard.writeText(docUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function sendReminder() {
    if (!view || reminding) return
    setReminding(true)
    setReminderResult(null)
    try {
      const res = await fetch("/api/doc/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewId: view.id })
      })
      if (res.status === 429) {
        setReminderResult("max")
      } else if (res.ok) {
        setReminderResult("sent")
        setView(prev => prev ? { ...prev, reminderCount: prev.reminderCount + 1 } : prev)
      } else {
        setReminderResult("error")
      }
    } catch {
      setReminderResult("error")
    } finally {
      setReminding(false)
    }
  }

  const steps = [
    {
      done: true,
      icon: <Send size={14} />,
      label: "Enviado",
      time: fmtDateTime(view.sentAt),
      color: "#0F766E"
    },
    {
      done: !!view.docOpenedAt,
      icon: <Eye size={14} />,
      label: view.docOpenedAt
        ? `Documento visto · ${view.viewCount} ${view.viewCount === 1 ? "vez" : "veces"}`
        : "Documento no visto aún",
      time: fmtDateTime(view.docOpenedAt),
      color: "#0F766E"
    },
    ...(type === "QUOTE" ? [{
      done: view.status === "ACCEPTED" || view.status === "REJECTED",
      icon: view.status === "ACCEPTED"
        ? <CheckCircle size={14} />
        : view.status === "REJECTED"
          ? <XCircle size={14} />
          : <Clock size={14} />,
      label: view.status === "ACCEPTED"
        ? `Aceptado — firmado por ${view.signatureName}`
        : view.status === "REJECTED"
          ? `Rechazado${view.rejectionReason ? `: "${view.rejectionReason}"` : ""}`
          : "Pendiente de decisión",
      time: fmtDateTime(view.decidedAt),
      color: view.status === "ACCEPTED" ? "#059669" : view.status === "REJECTED" ? "#DC2626" : "#7C8B96"
    }] : [])
  ]

  return (
    <div style={{ border: "1px solid #E5E9ED", borderRadius: 12, padding: "20px 24px", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0B1F2A", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
          Seguimiento
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          {view.status !== "ACCEPTED" && view.status !== "REJECTED" && view.status !== "EXPIRED" && view.reminderCount < 3 && (
            <button
              onClick={sendReminder}
              disabled={reminding}
              title="Enviar recordatorio al cliente"
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#F6F8FA", border: "1px solid #E5E9ED", borderRadius: 6, fontSize: 12, color: "#3F4D58", cursor: reminding ? "not-allowed" : "pointer", opacity: reminding ? 0.6 : 1 }}
            >
              <Bell size={12} />
              {reminding ? "Enviando…" : reminderResult === "sent" ? "Enviado" : "Recordatorio"}
            </button>
          )}
          <button
            onClick={copyLink}
            title="Copiar enlace"
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", background: "#F6F8FA", border: "1px solid #E5E9ED", borderRadius: 6, fontSize: 12, color: "#3F4D58", cursor: "pointer" }}
          >
            <Copy size={12} />
            {copied ? "Copiado" : "Copiar enlace"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: step.done ? step.color : "#F6F8FA",
              border: `1px solid ${step.done ? step.color : "#E5E9ED"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: step.done ? "#fff" : "#C0C8D0"
            }}>
              {step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: step.done ? "#0B1F2A" : "#7C8B96", fontWeight: step.done ? 500 : 400, margin: "2px 0 0" }}>
                {step.label}
              </p>
              {step.time && (
                <p style={{ fontSize: 12, color: "#7C8B96", margin: "2px 0 0" }}>{step.time}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!view.docOpenedAt && (
        <p style={{ fontSize: 12, color: "#7C8B96", marginTop: 14, paddingTop: 14, borderTop: "1px solid #F0F2F4" }}>
          Sin actividad tras {Math.floor((Date.now() - new Date(view.sentAt).getTime()) / 86400000)} días del envío
        </p>
      )}
      {reminderResult === "max" && (
        <p style={{ fontSize: 12, color: "#DC2626", marginTop: 10 }}>Límite de 3 recordatorios alcanzado.</p>
      )}
      {reminderResult === "error" && (
        <p style={{ fontSize: 12, color: "#DC2626", marginTop: 10 }}>Error al enviar el recordatorio.</p>
      )}
      {view.reminderCount > 0 && (
        <p style={{ fontSize: 11, color: "#7C8B96", marginTop: 10 }}>
          {view.reminderCount} recordatorio{view.reminderCount !== 1 ? "s" : ""} enviado{view.reminderCount !== 1 ? "s" : ""}
          {view.lastReminderAt ? ` · último: ${fmtDateTime(view.lastReminderAt)}` : ""}
        </p>
      )}
    </div>
  )
}
