"use client"

import { useState } from "react"
import {
  PlusIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFinanceData } from "../context/FinanceDataContext"

interface FinanceHeaderProps {
  onCreateTransaction: () => void
}

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "7 días" },
  { value: "month", label: "30 días" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Año" },
] as const

export function FinanceHeader({ onCreateTransaction }: FinanceHeaderProps) {
  const { period, setPeriod } = useFinanceData()
  const [compareOn, setCompareOn] = useState(false)

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    // Hook for future export implementation; avoid debug logging in UI.
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 py-2 px-0 border-b border-white/[0.06]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-white/40" aria-hidden />
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value)}
          >
            <SelectTrigger
              size="sm"
              className="w-[130px] border-white/[0.08] bg-white/[0.06] text-white/90 text-xs font-medium"
            >
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent align="start" className="border-white/10 bg-[#1E1F2B]">
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-white/90 focus:bg-white/10"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          onClick={() => setCompareOn((v) => !v)}
          className={`
            flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 transition-colors
            ${compareOn ? "bg-white/10 text-white border border-white/20" : "text-white/50 hover:text-white/70 border border-transparent"}
          `}
          title="Comparar con período anterior"
        >
          <ArrowsRightLeftIcon className="w-4 h-4" />
          Comparar
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Exportar
          </button>
          <div className="absolute right-0 top-full mt-1 w-40 bg-[#1E1F2B] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-10 py-1">
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              PDF
            </button>
            <button
              type="button"
              onClick={() => handleExport("excel")}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5"
            >
              <TableCellsIcon className="w-4 h-4" />
              Excel
            </button>
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-white/80 hover:bg-white/5"
            >
              <TableCellsIcon className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 transition-colors"
          title="Filtros"
        >
          <FunnelIcon className="w-4 h-4" />
          Filtros
        </button>
        <button
          type="button"
          onClick={onCreateTransaction}
          className="flex items-center gap-2 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-4 py-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo movimiento
        </button>
      </div>
    </header>
  )
}
