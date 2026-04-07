"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
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

// Mirrors the server query: lastActionAt IS NULL OR lastActionAt < (now - 7d), NOT CONVERTED/LOST
function isStalled(lead: Lead): boolean {
  const staleMs = 7 * 24 * 60 * 60 * 1000
  const isOldOrNull = !lead.lastActionAt || (Date.now() - new Date(lead.lastActionAt).getTime() > staleMs)
  return isOldOrNull && lead.leadStatus !== "CONVERTED" && lead.leadStatus !== "LOST"
}

// Mirrors the server query: score >= 40 OR QUALIFIED OR CONTACTED, NOT CONVERTED/LOST
function isPotencial(lead: Lead): boolean {
  return (
    lead.leadStatus !== "CONVERTED" &&
    lead.leadStatus !== "LOST" &&
    (lead.score >= 40 || lead.leadStatus === "QUALIFIED" || lead.leadStatus === "CONTACTED")
  )
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
  const [convertedLeads, setConvertedLeads] = useState<Lead[] | null>(null)
  const [loadingConverted, setLoadingConverted] = useState(false)

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

  // Fetch converted leads on demand (excluded from initialLeads by the server query)
  useEffect(() => {
    if (activeKpi !== "converted") return
    if (convertedLeads !== null) return // already fetched
    setLoadingConverted(true)
    fetch("/api/leads?showConverted=true&status=CONVERTED&limit=100", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setConvertedLeads(data.leads ?? []))
      .catch(() => setConvertedLeads([]))
      .finally(() => setLoadingConverted(false))
  }, [activeKpi, convertedLeads])

  const searchParams = useSearchParams()
  const searchTerm = searchParams.get("search")?.trim().toLowerCase() ?? ""

  const { leads } = useLeads({}, { initialLeads, initialTotal })

  const filteredLeads = useMemo(() => {
    let result: Lead[] | undefined

    if (!activeKpi || activeKpi === "total") result = undefined
    else if (activeKpi === "hot") result = leads.filter(isPotencial)
    else if (activeKpi === "converted") result = convertedLeads ?? []
    else if (activeKpi === "stalled") result = leads.filter(isStalled)

    // Apply search on top of any KPI filter — runs on whichever list is active
    if (searchTerm) {
      const base = result ?? leads
      result = base.filter(l =>
        l.name?.toLowerCase().includes(searchTerm) ||
        l.email?.toLowerCase().includes(searchTerm) ||
        l.phone?.toLowerCase().includes(searchTerm) ||
        l.source?.toLowerCase().includes(searchTerm)
      )
    }

    return result
  }, [leads, activeKpi, convertedLeads, searchTerm])

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
            {loadingConverted
              ? "Cargando convertidos..."
              : <>Mostrando <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>{filteredLeads?.length ?? 0} leads</strong> &middot; {activeLabel}{searchTerm && ` · "${searchTerm}"`}</>
            }
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
