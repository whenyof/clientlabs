"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { LeadHeader } from "@domains/leads/components/LeadHeader"
import { LeadTimeline } from "@domains/leads/components/LeadTimeline"
import { LeadInfoCard } from "@domains/leads/components/LeadInfoCard"
import { LeadAIRecommendations } from "@domains/leads/components/LeadAIRecommendations"
import { LeadNextActionCard } from "@domains/leads/components/LeadNextActionCard"
import { LeadNotesCard } from "@domains/leads/components/LeadNotesCard"
import { LeadEmailModule } from "@domains/leads/components/LeadEmailModule"
import { LeadQuickTaskCard } from "@/modules/leads/components/LeadQuickTaskCard"
import { LeadInteractionModal } from "@domains/leads/components/LeadInteractionModal"

interface LeadPanelProps {
  lead: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    createdAt: Date
    lastActionAt: Date | null
    leadStatus: string
    score: number
    source: string
    temperature?: string | null
    additionalInfo?: string | null
  }
}

export function LeadPanel({ lead }: LeadPanelProps) {
  const [timelineKey, setTimelineKey] = useState(0)
  const [interactionOpen, setInteractionOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        padding: 24,
      }}
    >
      {/* Hero */}
      <LeadHeader lead={lead} />

      {/* Actions bar */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setInteractionOpen(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500,
            border: "0.5px solid var(--border-subtle)", background: "var(--bg-card)",
            color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.12s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#1FA97A"
            ;(e.currentTarget as HTMLButtonElement).style.color = "#1FA97A"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"
          }}
        >
          <MessageCircle style={{ width: 14, height: 14 }} />
          Registrar interacción
        </button>
      </div>

      <LeadInteractionModal
        open={interactionOpen}
        onClose={() => setInteractionOpen(false)}
        leadId={lead.id}
        onSuccess={() => setTimelineKey(k => k + 1)}
      />

      {/* Two-column layout */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 16,
          alignItems: "flex-start",
        }}
        className="lead-panel-columns"
      >
        {/* Left column */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <LeadEmailModule leadId={lead.id} leadEmail={lead.email} leadName={lead.name} />
          <LeadTimeline refreshTrigger={timelineKey} leadId={lead.id} createdAt={lead.createdAt} />
          <LeadNotesCard leadId={lead.id} onActivityCreated={() => setTimelineKey(k => k + 1)} />
        </div>

        {/* Right column */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
          className="lead-panel-sidebar"
        >
          <LeadInfoCard lead={lead} onUpdate={() => setTimelineKey(k => k + 1)} />
          <LeadQuickTaskCard leadId={lead.id} onTaskCreated={() => setTimelineKey(k => k + 1)} />
          <LeadAIRecommendations score={lead.score} phone={lead.phone} leadStatus={lead.leadStatus} />
          <LeadNextActionCard leadId={lead.id} leadStatus={lead.leadStatus} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lead-panel-columns {
            flex-direction: column !important;
          }
          .lead-panel-sidebar {
            width: auto !important;
          }
        }
      `}</style>
    </div>
  )
}
