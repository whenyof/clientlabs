"use client"

import { useState, useMemo } from "react"
import { useLeads } from "@/hooks/useLeads"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
import type { Lead } from "@prisma/client"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type KpiStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "STALLED" | "LOST"

const KPI_DEFS: { status: KpiStatus; label: string }[] = [
  { status: "NEW",       label: "Nuevos" },
  { status: "CONTACTED", label: "Contactados" },
  { status: "QUALIFIED", label: "Cualificados" },
  { status: "CONVERTED", label: "Convertidos" },
  { status: "STALLED",   label: "Estancados" },
  { status: "LOST",      label: "Perdidos" },
]

function isStalled(lead: Lead): boolean {
  const days = Math.floor((Date.now() - new Date(lead.updatedAt).getTime()) / 86400000)
  return days > 7 && lead.leadStatus !== "CONVERTED" && lead.leadStatus !== "LOST"
}

interface LeadsKPIContainerProps {
  initialLeads: Lead[]
  initialTotal: number
}

export function LeadsKPIContainer({ initialLeads, initialTotal }: LeadsKPIContainerProps) {
  const [activeKpi, setActiveKpi] = useState<KpiStatus | null>(null)

  const { leads } = useLeads({}, { initialLeads, initialTotal })

  const kpiCounts = useMemo(() => ({
    NEW:       leads.filter(l => l.leadStatus === "NEW").length,
    CONTACTED: leads.filter(l => l.leadStatus === "CONTACTED").length,
    QUALIFIED: leads.filter(l => l.leadStatus === "QUALIFIED").length,
    CONVERTED: leads.filter(l => l.leadStatus === "CONVERTED").length,
    STALLED:   leads.filter(isStalled).length,
    LOST:      leads.filter(l => l.leadStatus === "LOST").length,
  }), [leads])

  const filteredLeads = useMemo(() => {
    if (!activeKpi) return undefined
    if (activeKpi === "STALLED") return leads.filter(isStalled)
    return leads.filter(l => l.leadStatus === activeKpi)
  }, [leads, activeKpi])

  const handleKpiClick = (status: KpiStatus) => {
    setActiveKpi(prev => prev === status ? null : status)
  }

  const activeLabel = activeKpi ? KPI_DEFS.find(k => k.status === activeKpi)?.label : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_DEFS.map(({ status, label }) => {
          const active = activeKpi === status
          const count = kpiCounts[status]
          return (
            <button
              key={status}
              type="button"
              onClick={() => handleKpiClick(status)}
              className={cn(
                "rounded-xl p-4 text-left cursor-pointer transition-all",
                active
                  ? "border border-[#1FA97A] bg-[#E1F5EE]/30 ring-1 ring-[#1FA97A]/20"
                  : "border border-slate-200 bg-white hover:border-[#1FA97A]/40"
              )}
              style={{ position: "relative" }}
            >
              <p style={{
                fontSize: 10,
                fontWeight: 600,
                color: active ? "#1FA97A" : "var(--text-secondary)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}>
                {label}
              </p>
              <p style={{
                fontSize: 28,
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1,
              }}>
                {count.toLocaleString()}
              </p>
              {active && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 8,
                  fontSize: 10,
                  color: "#1FA97A",
                  fontWeight: 500,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1FA97A", flexShrink: 0 }} />
                  Filtrando · click para quitar
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Filter banner */}
      {activeKpi && activeLabel && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(31,169,122,0.07)",
          border: "0.5px solid rgba(31,169,122,0.25)",
          borderRadius: 10,
          padding: "9px 16px",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1FA97A", flexShrink: 0 }} />
            Mostrando <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>{filteredLeads?.length ?? 0} leads</strong>
            &nbsp;&middot; {activeLabel}
          </span>
          <button
            type="button"
            onClick={() => setActiveKpi(null)}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#1FA97A", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
          >
            <X size={12} />
            Ver todos
          </button>
        </div>
      )}

      {/* Table */}
      <LeadsTable
        leads={filteredLeads}
        initialLeads={initialLeads}
        initialTotal={initialTotal}
      />
    </div>
  )
}
