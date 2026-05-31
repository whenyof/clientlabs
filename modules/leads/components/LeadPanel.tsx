"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { LeadHeader } from "@domains/leads/components/LeadHeader"
import { LeadTimeline } from "@domains/leads/components/LeadTimeline"
import { LeadInfoCard } from "@domains/leads/components/LeadInfoCard"
import { LeadAIRecommendations } from "@domains/leads/components/LeadAIRecommendations"
import { LeadNextActionCard } from "@domains/leads/components/LeadNextActionCard"
import { LeadNotesCard } from "@domains/leads/components/LeadNotesCard"
import { LeadEmailModule } from "@domains/leads/components/LeadEmailModule"
import { LeadQuickTaskCard } from "@/modules/leads/components/LeadQuickTaskCard"
import { LeadContactsCard } from "@domains/leads/components/LeadContactsCard"
import { LeadCustomFieldsCard } from "@domains/leads/components/LeadCustomFieldsCard"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1",
}

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
  }
}

export function LeadPanel({ lead }: LeadPanelProps) {
  const [timelineKey, setTimelineKey] = useState(0)

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>
      {/* ── Back button ─────────────────────────────────── */}
      <div style={{ padding: "14px 24px 0", borderBottom: `1px solid ${C.line2}`, paddingBottom: 14 }}>
        <Link
          href="/dashboard/leads"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12.5, color: C.ink3, fontWeight: 500, textDecoration: "none",
            transition: "color .12s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.ink }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.ink3 }}
        >
          <ChevronLeft size={13} strokeWidth={2.2} />
          Volver a leads
        </Link>
      </div>

      <div style={{ padding: "20px 24px 60px" }}>
        {/* ── Hero ─────────────────────────────────────── */}
        <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
          <LeadHeader lead={lead} />
        </div>

        {/* ── Two-column layout ─────────────────────────── */}
        <div
          style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
          className="lead-panel-columns"
        >
          {/* Left column — main content */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <LeadContactsCard leadId={lead.id} />
            <LeadEmailModule leadId={lead.id} leadEmail={lead.email} leadName={lead.name} />
            <LeadTimeline refreshTrigger={timelineKey} leadId={lead.id} createdAt={lead.createdAt} />
            <LeadNotesCard leadId={lead.id} onActivityCreated={() => setTimelineKey(k => k + 1)} />
          </div>

          {/* Right column — sidebar */}
          <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }} className="lead-panel-sidebar">
            <LeadInfoCard lead={lead} onUpdate={() => setTimelineKey(k => k + 1)} />
            <LeadCustomFieldsCard leadId={lead.id} />
            <LeadQuickTaskCard leadId={lead.id} onTaskCreated={() => setTimelineKey(k => k + 1)} />
            <LeadAIRecommendations score={lead.score} phone={lead.phone} leadStatus={lead.leadStatus} />
            <LeadNextActionCard leadId={lead.id} leadStatus={lead.leadStatus} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lead-panel-columns { flex-direction: column !important; }
          .lead-panel-sidebar { width: auto !important; }
        }
      `}</style>
    </div>
  )
}
