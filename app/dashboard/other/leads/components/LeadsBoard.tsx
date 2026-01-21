"use client"

import { useMemo, useState } from "react"
import { LeadCard } from "./LeadCard"
import { LeadDetailModal } from "./LeadDetailModal"
import { LeadItem, LeadStatus, LEADS } from "./mock"
import { LeadActions } from "./LeadActions"

type ColumnKey = LeadStatus

const COLUMNS: { key: ColumnKey; title: string; emoji: string }[] = [
  { key: "hot", title: "Hot", emoji: "🔥" },
  { key: "warm", title: "Warm", emoji: "🌡️" },
  { key: "cold", title: "Cold", emoji: "❄" },
]

export function LeadsBoard() {
  const [leads, setLeads] = useState<LeadItem[]>(LEADS)
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const columns = useMemo(() => {
    return COLUMNS.map((column) => ({
      ...column,
      leads: leads.filter((lead) => lead.status === column.key),
    }))
  }, [leads])

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    )
  }

  const handleDragStart = (leadId: string) => {
    setDraggingId(leadId)
  }

  const handleDrop = (column: ColumnKey) => {
    if (!draggingId) return
    updateLeadStatus(draggingId, column)
    setDraggingId(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Pipeline de Leads</h2>
        <LeadActions onCreate={() => setActiveLead(LEADS[0])} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {columns.map((column) => (
          <div
            key={column.key}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-lg">{column.emoji}</span>
                <h3 className="text-lg font-semibold text-white">{column.title}</h3>
              </div>
              <span className="text-xs text-white/60">
                {column.leads.length} leads
              </span>
            </div>

            <div
              className="space-y-4 min-h-[320px]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.key)}
            >
              {column.leads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead.id)}
                >
                  <LeadCard
                    lead={lead}
                    onOpen={() => setActiveLead(lead)}
                    onMove={updateLeadStatus}
                  />
                </div>
              ))}

              {column.leads.length === 0 && (
                <div className="text-center text-white/40 text-sm py-8 border border-dashed border-white/10 rounded-xl">
                  Sin leads en esta columna
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <LeadDetailModal lead={activeLead} onClose={() => setActiveLead(null)} />
    </div>
  )
}
