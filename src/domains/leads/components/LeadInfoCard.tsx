"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatSource, STATUS_LABELS, TEMP_LABELS, getScoreColors } from "@domains/leads/utils/formatting"

export interface LeadInfoCardLead {
  email: string | null
  phone: string | null
  source: string
  leadStatus: string
  score: number
  temperature?: string | null
  createdAt: Date
}

interface LeadInfoCardProps {
  lead: LeadInfoCardLead
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const { barColor, numColor } = getScoreColors(score)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: barColor, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: numColor, minWidth: 36, textAlign: "right", whiteSpace: "nowrap" }}>
        {score} pts
      </span>
    </div>
  )
}

interface RowProps {
  label: string
  children: React.ReactNode
  last?: boolean
}

function Row({ label, children, last }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: last ? "none" : "0.5px solid var(--border-subtle)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--text-secondary)", flexShrink: 0 }}>{label}</span>
      <div style={{ minWidth: 0, textAlign: "right", flex: 1 }}>{children}</div>
    </div>
  )
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const statusLabel = STATUS_LABELS[lead.leadStatus] ?? lead.leadStatus
  const tempLabel = lead.temperature ? TEMP_LABELS[lead.temperature] ?? lead.temperature : "—"
  const createdFormatted = format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })

  return (
    <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", margin: "0 0 4px" }}>
        Información del lead
      </h3>
      <div>
        <Row label="Email">
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              style={{ fontSize: 13, fontWeight: 500, color: "#378ADD", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}
            >
              {lead.email}
            </a>
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>—</span>
          )}
        </Row>
        <Row label="Teléfono">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
            {lead.phone ?? "—"}
          </span>
        </Row>
        <Row label="Fuente">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            {formatSource(lead.source)}
          </span>
        </Row>
        <Row label="Temperatura">
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            {tempLabel}
          </span>
        </Row>
        <Row label="Score">
          <ScoreBar score={lead.score} />
        </Row>
        <Row label="Creado" last>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            {createdFormatted}
          </span>
        </Row>
      </div>
    </div>
  )
}
