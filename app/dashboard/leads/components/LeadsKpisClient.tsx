"use client"

import { useState, useEffect, useMemo } from "react"
import { useLeads } from "@/hooks/useLeads"
import { LeadsKPIs, type KpisData } from "@domains/leads/components/LeadsKPIs"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
import type { Lead } from "@prisma/client"
import { X } from "lucide-react"

const KPI_LABELS: Record<string, string> = {
  total:     "Total leads",
  hot:       "Potenciales",
  converted: "Convertidos",
  stalled:   "Estancados",
}

function isStalled(lead: Lead): boolean {
  const ref = lead.lastActionAt ?? lead.updatedAt
  const days = Math.floor((Date.now() - new Date(ref).getTime()) / 86400000)
  return days > 7 && lead.leadStatus !== "CONVERTED" && lead.leadStatus !== "LOST"
}

interface LeadsKpisClientProps {
  initial: KpisData
  initialLeads: Lead[]
  initialTotal: number
  children?: React.ReactNode
}

export function LeadsKpisClient({ initial, initialLeads, initialTotal, children }: LeadsKpisClientProps) {
  const [kpis, setKpis] = useState(initial)
  const [activeKpi, setActiveKpi] = useState<string | null>(null)

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await fetch("/api/leads/kpis", { cache: "no-store" })
        if (!res.ok) return
        const data: KpisData = await res.json()
        setKpis(data)
      } catch {
        return
      }
    }

    fetchKpis()
    const interval = setInterval(fetchKpis, 300_000)
    return () => clearInterval(interval)
  }, [])

  const { leads } = useLeads({}, { initialLeads, initialTotal })

  const filteredLeads = useMemo(() => {
    if (!activeKpi || activeKpi === "total") return undefined
    if (activeKpi === "hot") return leads.filter((l: Lead) => l.temperature === "HOT")
    if (activeKpi === "converted") return leads.filter((l: Lead) => l.leadStatus === "CONVERTED")
    if (activeKpi === "stalled") return leads.filter(isStalled)
    return undefined
  }, [leads, activeKpi])

  const handleKpiClick = (key: string) => {
    setActiveKpi(prev => prev === key ? null : key)
  }

  const activeLabel = activeKpi ? KPI_LABELS[activeKpi] : null

  return (
    <>
      <LeadsKPIs kpis={kpis} activeKpi={activeKpi} onKpiClick={handleKpiClick} />
      {children}
      {activeKpi && activeKpi !== "total" && activeLabel && (
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
      <LeadsTable
        leads={filteredLeads}
        initialLeads={filteredLeads ? undefined : initialLeads}
        initialTotal={filteredLeads ? undefined : initialTotal}
      />
    </>
  )
}
