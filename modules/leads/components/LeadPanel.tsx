"use client"

import { LeadHeader } from "@domains/leads/components/LeadHeader"
import { LeadTimeline } from "@domains/leads/components/LeadTimeline"
import { LeadInfoCard } from "@domains/leads/components/LeadInfoCard"
import { LeadInsightsCard } from "@domains/leads/components/LeadInsightsCard"
import { LeadNextActionCard } from "@domains/leads/components/LeadNextActionCard"
import { LeadNotesCard } from "@domains/leads/components/LeadNotesCard"

interface LeadPanelProps {
  lead: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    createdAt: Date
    leadStatus: string
    score: number
    source: string
    temperature?: string | null
  }
}

export function LeadPanel({ lead }: LeadPanelProps) {
  return (
    <div className="mx-auto max-w-6xl flex flex-col gap-6 px-6 pb-20 pt-6">
      <LeadHeader lead={lead} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0">
          <LeadTimeline leadId={lead.id} createdAt={lead.createdAt} />
        </div>
        <aside className="flex flex-col gap-6">
          <LeadInfoCard lead={lead} />
          <LeadInsightsCard leadId={lead.id} score={lead.score} />
          <LeadNextActionCard leadId={lead.id} leadStatus={lead.leadStatus} />
        </aside>
      </div>

      <LeadNotesCard leadId={lead.id} />
    </div>
  )
}
