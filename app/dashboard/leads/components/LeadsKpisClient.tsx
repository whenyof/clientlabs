"use client"

import { useState, useEffect, useMemo } from "react"
import { useLeads } from "@/hooks/useLeads"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
import { LeadsSearchProvider, useLeadsSearch } from "./LeadsSearchContext"
import type { Lead } from "@prisma/client"
import { X, List, LayoutGrid } from "lucide-react"
import { LeadsKanbanView } from "@/modules/leads/components/LeadsKanbanView"
import type { KpisData } from "@domains/leads/components/LeadsKPIs"

const TEMP_ORDER: Record<string, number> = { HOT: 2, WARM: 1, COLD: 0 }

interface LeadsKpisClientProps {
  initial?: KpisData
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

const viewBtnStyle = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "5px 10px", borderRadius: 6,
  fontSize: 12, fontWeight: 500,
  border: active ? "0.5px solid var(--border-subtle)" : "0.5px solid transparent",
  cursor: "pointer",
  background: active ? "var(--bg-card)" : "transparent",
  color: active ? "var(--text-primary)" : "var(--text-secondary)",
  transition: "all 150ms",
})

function LeadsKpisClientInner({ initialLeads, initialTotal, children }: LeadsKpisClientProps) {
  const {
    searchTerm,
    sortBy, sortOrder,
    filterStatus, filterSource, filterTemperature,
  } = useLeadsSearch()

  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [lostLeads, setLostLeads] = useState<Lead[] | null>(null)
  const [loadingLost, setLoadingLost] = useState(false)

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
    let result: Lead[]

    // Status filter (LOST leads fetched separately)
    if (filterStatus === "LOST") {
      result = [...(lostLeads ?? [])]
    } else if (filterStatus && filterStatus !== "all") {
      result = leads.filter(l => l.leadStatus === filterStatus)
    } else {
      result = [...leads]
    }

    // Source filter
    if (filterSource && filterSource !== "all") {
      result = result.filter(l => l.source === filterSource)
    }

    // Temperature filter
    if (filterTemperature && filterTemperature !== "all") {
      result = result.filter(l => l.temperature === filterTemperature)
    }

    // Text search
    const term = searchTerm.trim().toLowerCase()
    if (term) {
      result = result.filter(l =>
        l.name?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.phone?.toLowerCase().includes(term) ||
        l.source?.toLowerCase().includes(term)
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valA: number | string
      let valB: number | string

      if (sortBy === "score") {
        valA = a.score || 0; valB = b.score || 0
      } else if (sortBy === "lastActionAt") {
        valA = a.lastActionAt ? new Date(a.lastActionAt).getTime() : 0
        valB = b.lastActionAt ? new Date(b.lastActionAt).getTime() : 0
      } else if (sortBy === "name") {
        valA = a.name?.toLowerCase() || ""; valB = b.name?.toLowerCase() || ""
      } else if (sortBy === "temperature") {
        const ta = TEMP_ORDER[a.temperature || "COLD"] ?? 0
        const tb = TEMP_ORDER[b.temperature || "COLD"] ?? 0
        return sortOrder === "asc" ? tb - ta : ta - tb
      } else {
        valA = new Date(a.createdAt).getTime()
        valB = new Date(b.createdAt).getTime()
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1
      if (valA > valB) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [leads, lostLeads, searchTerm, filterStatus, filterSource, filterTemperature, sortBy, sortOrder])

  const hasActiveFilter = !!(
    (filterStatus && filterStatus !== "all") ||
    (filterSource && filterSource !== "all") ||
    (filterTemperature && filterTemperature !== "all") ||
    searchTerm.trim()
  )

  return (
    <>
      {/* Unified toolbar: filters + view toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid #eeeeee" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
        <div style={{ display: "flex", background: "#f5f5f5", border: "0.5px solid #e8e8e8", borderRadius: 8, padding: 3, gap: 2, flexShrink: 0 }}>
          <button type="button" onClick={() => setViewMode("list")} style={viewBtnStyle(viewMode === "list")}>
            <List size={13} />
            Lista
          </button>
          <button type="button" onClick={() => setViewMode("kanban")} style={viewBtnStyle(viewMode === "kanban")}>
            <LayoutGrid size={13} />
            Pipeline
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <LeadsKanbanView />
      ) : (
        <>

          {hasActiveFilter && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(15,118,110,0.07)", border: "0.5px solid rgba(15,118,110,0.25)",
              borderRadius: 10, padding: "9px 16px",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0F766E", flexShrink: 0 }} />
                {loadingLost ? "Cargando perdidos..." : (
                  <>
                    Mostrando{" "}
                    <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      {leadsProcesados.length} leads
                    </strong>
                    {searchTerm && ` · "${searchTerm}"`}
                  </>
                )}
              </span>
            </div>
          )}

          <LeadsTable leads={leadsProcesados} initialLeads={initialLeads} initialTotal={initialTotal} />
        </>
      )}
    </>
  )
}
