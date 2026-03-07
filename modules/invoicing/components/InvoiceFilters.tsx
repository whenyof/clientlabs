"use client"

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { FilterDropdown } from "@/components/ui/FilterDropdown"
import { invoiceStatusLabel } from "@/modules/invoicing/utils/invoiceStatusLabel"
import type { ClientOption } from "./types"

const PERIOD_OPTIONS = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
]

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "DRAFT", label: invoiceStatusLabel("DRAFT") },
  { value: "SENT", label: invoiceStatusLabel("SENT") },
  { value: "VIEWED", label: invoiceStatusLabel("VIEWED") },
  { value: "PARTIAL", label: invoiceStatusLabel("PARTIAL") },
  { value: "PAID", label: invoiceStatusLabel("PAID") },
  { value: "OVERDUE", label: invoiceStatusLabel("OVERDUE") },
  { value: "CANCELED", label: invoiceStatusLabel("CANCELED") },
]

export type InvoiceFiltersState = {
  search: string
  period: string
  status: string
  clientId: string
  minAmount: string
  maxAmount: string
}

interface InvoiceFiltersProps {
  filters: InvoiceFiltersState
  onFiltersChange: (f: InvoiceFiltersState) => void
  clients: ClientOption[]
}

export function InvoiceFilters({ filters, onFiltersChange, clients }: InvoiceFiltersProps) {
  const clientOptions = [
    { value: "", label: "Todos los clientes" },
    ...clients.map((c) => ({ value: c.id, label: c.name || c.email || c.id })),
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="search"
          placeholder="Buscar por número o cliente"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
          aria-label="Buscar facturas"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Período"
          value={filters.period}
          options={PERIOD_OPTIONS}
          onChange={(v) => onFiltersChange({ ...filters, period: v })}
        />
        <FilterDropdown
          label="Estado"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => onFiltersChange({ ...filters, status: v })}
          placeholder="Todos"
        />
        <FilterDropdown
          label="Cliente"
          value={filters.clientId}
          options={clientOptions}
          onChange={(v) => onFiltersChange({ ...filters, clientId: v })}
          placeholder="Todos los clientes"
          className="min-w-[10rem]"
        />
        <input
          type="number"
          placeholder="Importe mínimo"
          value={filters.minAmount}
          onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value })}
          className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
          aria-label="Importe mínimo"
        />
        <input
          type="number"
          placeholder="Importe máximo"
          value={filters.maxAmount}
          onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value })}
          className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
          aria-label="Importe máximo"
        />
      </div>
    </div>
  )
}
