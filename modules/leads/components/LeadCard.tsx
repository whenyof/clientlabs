"use client"

import { useState, useRef, useEffect } from "react"
import type { Lead } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LeadRowActions } from "./LeadRowActions"
import { useUpdateLeadStatus } from "@/hooks/useLeads"
import { toast } from "sonner"

/* ── Status badges ── */

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  NEW: { label: "Nuevo", bg: "#E1F5EE", color: "#0F6E56", border: "#9FE1CB", dot: "#1FA97A" },
  CONTACTED: { label: "Contactado", bg: "#E6F1FB", color: "#185FA5", border: "#B5D4F4", dot: "#378ADD" },
  QUALIFIED: { label: "Cualificado", bg: "#FAEEDA", color: "#854F0B", border: "#FAC775", dot: "#EF9F27" },
  INTERESTED: { label: "Interesado", bg: "#FAEEDA", color: "#854F0B", border: "#FAC775", dot: "#EF9F27" },
  LOST: { label: "Perdido", bg: "#FCEBEB", color: "#A32D2D", border: "#F7C1C1", dot: "#E24B4A" },
  CONVERTED: { label: "Convertido", bg: "#EEEDFE", color: "#3C3489", border: "#CECBF6", dot: "#6C63FF" },
}

const STATUS_ORDER = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]

function StatusBadge({ status, onClick }: { status?: string | null; onClick?: () => void }) {
  const cfg = STATUS_CONFIG[status ?? ""] ?? { label: status ?? "—", bg: "var(--bg-surface)", color: "var(--text-secondary)", border: "var(--border-subtle)", dot: "var(--text-secondary)" }
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 6,
        background: cfg.bg,
        color: cfg.color,
        border: `0.5px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        transition: "opacity 0.15s",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </button>
  )
}

/* ── Source label ── */

function formatSource(source?: string | null): string {
  if (!source) return "—"
  const key = source.toLowerCase()
  const map: Record<string, string> = {
    sdk: "SDK directo",
    web: "Formulario web",
    api: "API",
    manual: "Manual",
  }
  return map[key] ?? source
}

/* ── Score bar ── */

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  let barColor: string
  let numColor: string
  if (score >= 60) {
    barColor = "#1FA97A"; numColor = "#0F6E56"
  } else if (score >= 30) {
    barColor = "#EF9F27"; numColor = "#854F0B"
  } else {
    barColor = "#B4B2A9"; numColor = "var(--text-secondary)"
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: barColor, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: numColor, minWidth: 42, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{score} pts</span>
    </div>
  )
}

/* ── Time formatting ── */

function formatTime(date?: Date | null): string {
  if (!date) return ""
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  if (days === 0) return `Hoy, ${time}`
  if (days === 1) return `Ayer, ${time}`
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

/* ── Initials ── */

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return "??"
}

/* ── Main component ── */

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  const router = useRouter()
  const score = lead.score ?? 0
  const initials = getInitials(lead.name, lead.email)
  const timeStr = formatTime(lead.createdAt)

  const [currentStatus, setCurrentStatus] = useState(lead.leadStatus)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [position, setPosition] = useState<"top" | "bottom">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const statusMutation = useUpdateLeadStatus()

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [dropdownOpen])

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        setPosition("top")
      } else {
        setPosition("bottom")
      }
    }
    setDropdownOpen(!dropdownOpen)
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as any)
    setDropdownOpen(false)
    statusMutation.mutate(
      { leadId: lead.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Estado cambiado a ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`)
        },
        onError: () => {
          setCurrentStatus(currentStatus)
        },
      }
    )
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "16px 20px",
        borderBottom: "0.5px solid var(--border-subtle)",
        transition: "background 0.12s",
        cursor: "pointer",
        position: "relative",
        zIndex: dropdownOpen ? 30 : 1,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Lead info */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, width: 280, flexShrink: 0 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "var(--bg-surface)",
          border: "0.5px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-secondary)",
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/dashboard/leads/${lead.id}`}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
              textDecoration: "none",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {lead.name || "Sin nombre"}
          </Link>
          <p style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {lead.email ?? ""}{lead.email && timeStr ? " · " : ""}{timeStr}
          </p>
        </div>
      </div>

      {/* Estado — clickable dropdown */}
      <div ref={dropdownRef} style={{ width: 120, flexShrink: 0, position: "relative" }}>
        <div ref={triggerRef}>
          <StatusBadge status={currentStatus} onClick={handleOpen} />
        </div>
        {dropdownOpen && (
          <div style={{
            position: "absolute",
            ...(position === "top" ? { bottom: "calc(100% + 6px)", top: "auto" } : { top: "calc(100% + 6px)", bottom: "auto" }),
            left: 0,
            zIndex: 50,
            minWidth: 170,
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}>
            {STATUS_ORDER.map((key) => {
              const cfg = STATUS_CONFIG[key]
              if (!cfg) return null
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(key) }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    color: key === currentStatus ? cfg.color : "#334155",
                    background: key === currentStatus ? cfg.bg : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: key === currentStatus ? 600 : 400,
                    transition: "background 0.1s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFB")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = key === currentStatus ? cfg.bg : "transparent")}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                  {cfg.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Fuente */}
      <div className="hidden md:block" style={{ width: 120, flexShrink: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
        <span>{formatSource(lead.source)}</span>
        {lead.allowedDomain && (
          <span style={{ display: "block", fontSize: 11, opacity: 0.7 }}>{lead.allowedDomain}</span>
        )}
      </div>

      {/* Score */}
      <div className="hidden md:block" style={{ width: 160, flexShrink: 0 }}>
        <ScoreBar score={score} />
      </div>

      {/* Actions */}
      <div
        style={{ marginLeft: "auto", flexShrink: 0 }}
        onClick={(e) => e.preventDefault()}
      >
        <LeadRowActions lead={lead} />
      </div>
    </div>
  )
}
