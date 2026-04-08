"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useLeads } from "@/hooks/useLeads"
import { LeadsKPIs, type KpisData } from "@domains/leads/components/LeadsKPIs"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
import { LeadsSearchProvider, useLeadsSearch } from "./LeadsSearchContext"
import type { Lead } from "@prisma/client"
import { X } from "lucide-react"

const KPI_LABELS: Record<string, string> = {
  total:     "Total leads",
  hot:       "Potenciales",
  converted: "Convertidos",
  stalled:   "Estancados",
}

const TEMP_ORDER: Record<string, number> = { HOT: 2, WARM: 1, COLD: 0 }

function isStalled(lead: Lead): boolean {
  return lead.leadStatus === "STALLED"
}

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

export function LeadsKpisClient(props: LeadsKpisClientProps) {
  return (
    <LeadsSearchProvider>
      <LeadsKpisClientInner {...props} />
    </LeadsSearchProvider>
  )
}

function LeadsKpisClientInner({ initial, initialLeads, initialTotal, children }: LeadsKpisClientProps) {
  const {
    searchTerm,
    sortBy, sortOrder,
    filterStatus, filterSource, filterTemperature,
  } = useLeadsSearch()

  const [kpis, setKpis] = useState(initial)
  const [activeKpi, setActiveKpi] = useState<string | null>(null)
  const [convertedLeads, setConvertedLeads] = useState<Lead[] | null>(null)
  const [loadingConverted, setLoadingConverted] = useState(false)
  const [lostLeads, setLostLeads] = useState<Lead[] | null>(null)
  const [loadingLost, setLoadingLost] = useState(false)

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

  useEffect(() => {
    if (activeKpi !== "converted") return
    if (convertedLeads !== null) return
    setLoadingConverted(true)
    fetch("/api/leads?showConverted=true&status=CONVERTED&limit=100", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setConvertedLeads(data.leads ?? []))
      .catch(() => setConvertedLeads([]))
      .finally(() => setLoadingConverted(false))
  }, [activeKpi, convertedLeads])

  useEffect(() => {
    if (filterStatus !== "LOST") return
    if (lostLeads !== null) return
    setLoadingLost(true)
    fetch("/api/leads?showLost=true&status=LOST&limit=200", { cache: "no-store" })
      .then(r => r.json())
      .then(data => setLostLeads(data.leads ?? []))
      .catch(() => setLostLeads([]))
      .finally(() => setLoadingLost(false))
  }, [filterStatus, lostLeads])

  const { leads } = useLeads({}, { initialLeads, initialTotal })

  const leadsProcesados = useMemo(() => {
    // 1 — Base: KPI filter
    let result: Lead[]
    if (!activeKpi || activeKpi === "total") {
      result = [...leads]
    } else if (activeKpi === "hot") {
      result = leads.filter(isPotencial)
    } else if (activeKpi === "converted") {
      result = [...(convertedLeads ?? [])]
    } else if (activeKpi === "stalled") {
      result = leads.filter(isStalled)
    } else {
      result = [...leads]
    }

    // 2 — Status filter (LOST leads are fetched separately)
    if (filterStatus === "LOST") {
      result = [...(lostLeads ?? [])]
    } else if (filterStatus && filterStatus !== "all") {
      result = result.filter(l => l.leadStatus === filterStatus)
    }

    // 3 — Source filter
    if (filterSource && filterSource !== "all") {
      result = result.filter(l => l.source === filterSource)
    }

    // 4 — Temperature filter
    if (filterTemperature && filterTemperature !== "all") {
      result = result.filter(l => l.temperature === filterTemperature)
    }

    // 5 — Text search
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      result = result.filter(l =>
        l.name?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.phone?.toLowerCase().includes(term) ||
        l.source?.toLowerCase().includes(term)
      )
    }

    // 6 — Sort
    result = [...result].sort((a, b) => {
      let valA: number | string
      let valB: number | string

      if (sortBy === "score") {
        valA = a.score || 0
        valB = b.score || 0
      } else if (sortBy === "lastActionAt") {
        valA = a.lastActionAt ? new Date(a.lastActionAt).getTime() : 0
        valB = b.lastActionAt ? new Date(b.lastActionAt).getTime() : 0
      } else if (sortBy === "name") {
        valA = a.name?.toLowerCase() || ""
        valB = b.name?.toLowerCase() || ""
      } else if (sortBy === "temperature") {
        // "temperature-asc" = hot first → higher TEMP_ORDER value first = desc numeric
        const ta = TEMP_ORDER[a.temperature || "COLD"] ?? 0
        const tb = TEMP_ORDER[b.temperature || "COLD"] ?? 0
        return sortOrder === "asc" ? tb - ta : ta - tb
      } else {
        // createdAt (default)
        valA = new Date(a.createdAt).getTime()
        valB = new Date(b.createdAt).getTime()
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [leads, activeKpi, convertedLeads, lostLeads, searchTerm, filterStatus, filterSource, filterTemperature, sortBy, sortOrder])

  const handleKpiClick = useCallback((key: string) => {
    setActiveKpi(prev => prev === key ? null : key)
  }, [])

  const activeLabel = activeKpi ? KPI_LABELS[activeKpi] : null
  const hasActiveFilter = !!(
    activeKpi ||
    (filterStatus && filterStatus !== "all") ||
    (filterSource && filterSource !== "all") ||
    (filterTemperature && filterTemperature !== "all") ||
    searchTerm.trim()
  )

  // Compute live KPIs from in-memory leads (zero API calls, instant update)
  const liveKpis = useMemo(() => ({
    ...kpis,
    stalled: leads.filter(l => l.leadStatus === "STALLED").length,
    hot: leads.filter(isPotencial).length,
  }), [kpis, leads])

  return (
    <>
      <LeadsKPIs kpis={liveKpis} activeKpi={activeKpi} onKpiClick={handleKpiClick} />
      {children}

      {/* Filter status bar */}
      {hasActiveFilter && (
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
            {(loadingConverted || loadingLost)
              ? `Cargando ${loadingLost ? "perdidos" : "convertidos"}...`
              : (
                <>
                  Mostrando{" "}
                  <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {leadsProcesados.length} leads
                  </strong>
                  {activeLabel && <> &middot; {activeLabel}</>}
                  {searchTerm && ` · "${searchTerm}"`}
                </>
              )
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

      <LeadsTable leads={leadsProcesados} initialLeads={initialLeads} initialTotal={initialTotal} />
    </>
  )
}
