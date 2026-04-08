"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useLeads } from "@/hooks/useLeads"
import { LeadsKPIs, type KpisData } from "@domains/leads/components/LeadsKPIs"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
import { LeadsSearchProvider, useLeadsSearch } from "./LeadsSearchContext"
import type { Lead } from "@prisma/client"
import { X } from "lucide-react"

const PAGE_SIZE = 20

const KPI_LABELS: Record<string, string> = {
  total:     "Total leads",
  hot:       "Potenciales",
  converted: "Convertidos",
  stalled:   "Estancados",
}

const TEMP_ORDER: Record<string, number> = { HOT: 2, WARM: 1, COLD: 0 }

function isStalled(lead: Lead): boolean {
  const staleMs = 7 * 24 * 60 * 60 * 1000
  const isOldOrNull = !lead.lastActionAt || (Date.now() - new Date(lead.lastActionAt).getTime() > staleMs)
  return isOldOrNull && lead.leadStatus !== "CONVERTED" && lead.leadStatus !== "LOST"
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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

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

  // Reset visible count when any filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [activeKpi, searchTerm, sortBy, sortOrder, filterStatus, filterSource, filterTemperature])

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

    // 2 — Status filter
    if (filterStatus && filterStatus !== "all") {
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
  }, [leads, activeKpi, convertedLeads, searchTerm, filterStatus, filterSource, filterTemperature, sortBy, sortOrder])

  const leadsVisibles = useMemo(
    () => leadsProcesados.slice(0, visibleCount),
    [leadsProcesados, visibleCount]
  )
  const hayMas = leadsProcesados.length > visibleCount

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

  return (
    <>
      <LeadsKPIs kpis={kpis} activeKpi={activeKpi} onKpiClick={handleKpiClick} />
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
            {loadingConverted
              ? "Cargando convertidos..."
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

      <LeadsTable leads={leadsVisibles} initialLeads={initialLeads} initialTotal={initialTotal} />

      {hayMas && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 16, paddingBottom: 8 }}>
          <button
            onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
            style={{
              padding: "8px 24px",
              fontSize: 12,
              fontWeight: 500,
              color: "#64748b",
              border: "0.5px solid #e2e8f0",
              borderRadius: 8,
              background: "#fff",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1FA97A"; (e.currentTarget as HTMLButtonElement).style.color = "#1FA97A" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b" }}
          >
            Ver {Math.min(PAGE_SIZE, leadsProcesados.length - visibleCount)} leads más
          </button>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>
            Mostrando {leadsVisibles.length} de {leadsProcesados.length} leads
          </span>
        </div>
      )}

      {!hayMas && leadsProcesados.length > PAGE_SIZE && (
        <div style={{ textAlign: "center", paddingTop: 12, paddingBottom: 8 }}>
          <span style={{ fontSize: 10, color: "#94a3b8" }}>
            Todos los leads cargados · {leadsProcesados.length} en total
          </span>
        </div>
      )}
    </>
  )
}
