"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { MovementsHeader } from "./MovementsHeader"
import { MovementsTable } from "./MovementsTable"
import { MovementDetailsDrawer } from "./MovementDetailsDrawer"
import type { Movement, MovementSortField, MovementSortDir } from "@/modules/finance/movements"

type PeriodValue = "week" | "month" | "quarter" | "year"

function buildLedgerUrl(period: PeriodValue, search: string, typeFilter: string, statusFilter: string, sortBy: MovementSortField, sortDir: MovementSortDir): string {
  const params = new URLSearchParams()
  params.set("period", period)
  if (search.trim()) params.set("search", search.trim())
  if (typeFilter) params.set("type", typeFilter)
  if (statusFilter) params.set("status", statusFilter)
  params.set("sortBy", sortBy)
  params.set("sortDir", sortDir)
  return `/api/finance/movements/ledger?${params.toString()}`
}

interface FinanceMovementsViewProps {
  /** Server-loaded ledger (same source as KPIs); avoids empty first paint */
  initialMovements?: Movement[]
}

export function FinanceMovementsView({ initialMovements = [] }: FinanceMovementsViewProps) {
  const [movements, setMovements] = useState<Movement[]>(initialMovements)
  const [loading, setLoading] = useState(initialMovements.length === 0)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState<PeriodValue>("month")
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | "">("")
  const [statusFilter, setStatusFilter] = useState<"paid" | "pending" | "">("")
  const [sortBy, setSortBy] = useState<MovementSortField>("date")
  const [sortDir, setSortDir] = useState<MovementSortDir>("desc")
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null)
  const skipInitialFetch = useRef(initialMovements.length > 0)

  const selectedMovement = movements.find((m) => m.id === selectedMovementId) ?? null

  const fetchMovements = useCallback(async () => {
    setLoading(true)
    try {
      const url = buildLedgerUrl(period, search, typeFilter, statusFilter, sortBy, sortDir)
      const res = await fetch(url, { credentials: "include" })
      if (!res.ok) {
        console.warn("Movements fetch failed", res.status)
        setLoading(false)
        return
      }
      const data = await res.json()
      if (data.success && Array.isArray(data.movements)) {
        setMovements(data.movements)
      } else {
        console.warn("Movements fetch: invalid response", data)
      }
    } catch (err) {
      console.warn("Movements fetch failed", err)
    } finally {
      setLoading(false)
    }
  }, [period, search, typeFilter, statusFilter, sortBy, sortDir])

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false
      return
    }
    fetchMovements()
  }, [fetchMovements])

  useEffect(() => {
    // Keep effect in place for potential future side-effects tied to movement count,
    // but avoid debug logging in the client UI.
  }, [movements.length])

  const handleSortChange = useCallback((by: MovementSortField, dir: MovementSortDir) => {
    setSortBy(by)
    setSortDir(dir)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setSelectedMovementId(null)
  }, [])

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Movimientos</h2>
        <p className="text-sm text-white/50 mt-0.5">
          Historial unificado de ventas, compras y transacciones manuales.
        </p>
      </div>
      <MovementsHeader
        search={search}
        onSearchChange={setSearch}
        period={period}
        onPeriodChange={setPeriod}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
      />
      <MovementsTable
        movements={movements}
        selectedId={selectedMovementId}
        onSelectMovement={setSelectedMovementId}
        loading={loading}
      />
      <MovementDetailsDrawer
        movement={selectedMovement}
        open={!!selectedMovementId}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
