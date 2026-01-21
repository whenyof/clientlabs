"use client"

import { LeadsOverview } from "./components/LeadsOverview"
import { LeadsBoard } from "./components/LeadsBoard"
import { LeadFilters } from "./components/LeadFilters"
import { LeadMetrics } from "./components/LeadMetrics"
import { AutomationPanel } from "./components/AutomationPanel"
import { ExportButton } from "./components/ExportButton"

export default function LeadsPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Leads</h1>
            <p className="text-sm text-white/60">
              Panel premium para priorizar oportunidades y cerrar más ventas.
            </p>
          </div>
          <ExportButton />
        </div>

        <LeadsOverview />
        <LeadFilters />
      </div>

      <LeadsBoard />
      <LeadMetrics />
      <AutomationPanel />
    </div>
  )
}