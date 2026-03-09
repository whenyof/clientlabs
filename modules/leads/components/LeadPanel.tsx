"use client"

import { LeadHeader } from "./LeadHeader"
import { LeadQuickActions } from "./LeadQuickActions"
import { LeadActivityComposer } from "./LeadActivityComposer"
import { LeadTimeline } from "./LeadTimeline"
import { LeadSidebar } from "./LeadSidebar"

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
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-20 flex flex-col gap-6">
      <LeadHeader lead={lead} />

      <LeadQuickActions lead={lead} />

      <LeadActivityComposer leadId={lead.id} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="min-w-0">
          <LeadTimeline leadId={lead.id} />
        </div>
        <aside className="lg:min-w-[320px]">
          <LeadSidebar leadId={lead.id} lead={lead} />
        </aside>
      </div>
    </div>
  )
}
