"use client"

import { useState } from "react"
import { LeadHeader } from "@domains/leads/components/LeadHeader"
import { LeadTimeline } from "@domains/leads/components/LeadTimeline"
import { LeadInfoCard } from "@domains/leads/components/LeadInfoCard"
import { LeadAIRecommendations } from "@domains/leads/components/LeadAIRecommendations"
import { LeadNextActionCard } from "@domains/leads/components/LeadNextActionCard"
import { LeadNotesCard } from "@domains/leads/components/LeadNotesCard"
import { LeadEmailModule } from "@domains/leads/components/LeadEmailModule"
import { LeadQuickTaskCard } from "@/modules/leads/components/LeadQuickTaskCard"

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
  }
}

export function LeadPanel({ lead }: LeadPanelProps) {
  const [timelineKey, setTimelineKey] = useState(0)

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
          <LeadTimeline key={timelineKey} leadId={lead.id} createdAt={lead.createdAt} />
          <LeadNotesCard leadId={lead.id} />
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
          <LeadInfoCard lead={lead} />
          <LeadQuickTaskCard leadId={lead.id} onTaskCreated={() => setTimeout(() => setTimelineKey(k => k + 1), 400)} />
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
