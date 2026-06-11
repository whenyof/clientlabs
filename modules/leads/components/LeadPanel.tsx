"use client"

import { useState } from "react"
import Link from "next/link"
import { LeadHeader } from "@domains/leads/components/LeadHeader"
import { LeadTimeline } from "@domains/leads/components/LeadTimeline"
import { LeadInfoCard } from "@domains/leads/components/LeadInfoCard"
import { LeadNextActionCard } from "@domains/leads/components/LeadNextActionCard"
import { LeadNotesCard } from "@domains/leads/components/LeadNotesCard"
import { LeadQuickTaskCard } from "@/modules/leads/components/LeadQuickTaskCard"
import { LeadContactsCard } from "@domains/leads/components/LeadContactsCard"

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
    tags?: string[]
    estimatedValue?: number | null
  }
}

export function LeadPanel({ lead }: LeadPanelProps) {
  const [timelineKey, setTimelineKey] = useState(0)
  const refresh = () => setTimelineKey(k => k + 1)

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)", color: "#0a0a0a" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "22px 28px 80px" }}>

        {/* Back link */}
        <Link
          href="/dashboard/leads"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#737373", fontFamily: "ui-monospace,monospace",
            padding: "4px 8px", margin: "0 0 16px -8px", borderRadius: 5,
            textDecoration: "none", transition: "color .12s ease, background .12s ease",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Volver a leads
        </Link>

        {/* Hero card */}
        <LeadHeader lead={lead} onRefresh={refresh} />

        {/* Two-column grid */}
        <div className="ld-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 18, alignItems: "start", marginTop: 14 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <LeadNextActionCard leadId={lead.id} leadStatus={lead.leadStatus} />
            <LeadContactsCard leadId={lead.id} />
            <LeadNotesCard leadId={lead.id} onActivityCreated={refresh} />
            <LeadTimeline refreshTrigger={timelineKey} leadId={lead.id} createdAt={lead.createdAt} />
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <LeadInfoCard lead={lead} onUpdate={refresh} />
            <LeadQuickTaskCard leadId={lead.id} onTaskCreated={refresh} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) { .ld-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
