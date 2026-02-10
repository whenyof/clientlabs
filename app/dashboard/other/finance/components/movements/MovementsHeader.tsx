"use client"

import { MagnifyingGlassIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline"
import { FilterDropdown } from "@/components/ui/FilterDropdown"
import type { MovementSortField, MovementSortDir } from "@/modules/finance/movements"

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
] as const

const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Gastos" },
]

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "paid", label: "Pagado" },
  { value: "pending", label: "Pendiente" },
]

const SORT_OPTIONS = [
  { value: "date-desc", label: "Fecha (reciente)" },
  { value: "date-asc", label: "Fecha (antiguo)" },
  { value: "amount-desc", label: "Importe (mayor)" },
  { value: "amount-asc", label: "Importe (menor)" },
  { value: "concept-asc", label: "Concepto (A-Z)" },
  { value: "contact-asc", label: "Contacto (A-Z)" },
]

type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"]

export interface MovementsHeaderProps {
  search: string
  onSearchChange: (v: string) => void
  period: PeriodValue
  onPeriodChange: (v: PeriodValue) => void
  typeFilter: "income" | "expense" | ""
  onTypeFilterChange: (v: "income" | "expense" | "") => void
  statusFilter: "paid" | "pending" | ""
  onStatusFilterChange: (v: "paid" | "pending" | "") => void
  sortBy: MovementSortField
  sortDir: MovementSortDir
  onSortChange: (by: MovementSortField, dir: MovementSortDir) => void
}

export function MovementsHeader({
  search,
  onSearchChange,
  period,
  onPeriodChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  sortDir,
  onSortChange,
}: MovementsHeaderProps) {
  const sortValue = `${sortBy}-${sortDir}`

  const handleSortChange = (value: string) => {
    const [by, dir] = (value || "date-desc").split("-") as [MovementSortField, MovementSortDir]
    onSortChange(by, dir)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por contacto o concepto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
          aria-label="Buscar movimientos"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Período"
          value={period}
          options={PERIOD_OPTIONS.map((p) => ({ value: p.value, label: p.label }))}
          onChange={(v) => onPeriodChange(v as PeriodValue)}
        />
        <FilterDropdown
          label="Tipo"
          value={typeFilter}
          options={TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => onTypeFilterChange((v || "") as "income" | "expense" | "")}
          placeholder="Todos"
        />
        <FilterDropdown
          label="Estado"
          value={statusFilter}
          options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v) => onStatusFilterChange((v || "") as "paid" | "pending" | "")}
          placeholder="Todos"
        />
        <FilterDropdown
          label="Ordenar por"
          value={sortValue}
          options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={handleSortChange}
          className="min-w-[10rem]"
        />
      </div>
    </div>
  )
}
