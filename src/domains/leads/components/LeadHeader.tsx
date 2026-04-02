"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Mail, StickyNote } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getBaseUrl } from "@/lib/api/baseUrl"
import {
  formatSource,
  getInitials,
  STATUS_LABELS,
  TEMP_LABELS,
} from "@domains/leads/utils/formatting"

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

async function logActivity(leadId: string, type: string, content: string) {
  try {
    await fetch(`/api/leads/${leadId}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title: content, description: content }),
    })
  } catch {
    // non-blocking
  }
}

export function LeadHeader({ lead }: LeadHeaderProps) {
  const router = useRouter()
  const [converting, setConverting] = useState(false)
  const [markingLost, setMarkingLost] = useState(false)

  const initials = getInitials(lead.name, lead.email)
  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature ? TEMP_LABELS[lead.temperature] ?? lead.temperature : null

  const handleEmail = () => {
    if (!lead.email) return
    window.location.href = `mailto:${lead.email}?subject=Contacto`
  }

  const handleConvert = async () => {
    if (!confirm("¿Convertir este lead en cliente?")) return
    setConverting(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStatus: "CONVERTED", converted: true }),
      })
      if (res.ok) {
        await logActivity(lead.id, "STATUS_CHANGE", "Lead convertido a cliente")
        toast.success("Lead convertido a cliente")
        router.refresh()
      } else {
        toast.error("Error al convertir")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setConverting(false)
    }
  }

  const handleLost = async () => {
    if (!confirm("¿Marcar este lead como perdido?")) return
    setMarkingLost(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStatus: "LOST" }),
      })
      if (res.ok) {
        await logActivity(lead.id, "STATUS_CHANGE", "Lead marcado como perdido")
        toast.success("Lead marcado como perdido")
        router.refresh()
      } else {
        toast.error("Error al cambiar estado")
      }
    } catch {
      toast.error("Error de conexión")
    } finally {
      setMarkingLost(false)
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
                <Badge>{lead.score} pts</Badge>
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEmail}
              disabled={!lead.email}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Mail style={{ width: 14, height: 14 }} />
              Email
            </Button>
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
          </div>
        </div>

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
