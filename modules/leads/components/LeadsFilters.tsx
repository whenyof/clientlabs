"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ArrowUpDown } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type Filters = {
  status: string
  temperature: string
  source: string
  search: string
  sortBy: string
  sortOrder: string
  showConverted: boolean
  showLost: boolean
}

const filterTriggerClass =
  "border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-neutral-50 min-w-0 h-10"

export function LeadsFilters({
  currentFilters,
  sources,
}: {
  currentFilters: Filters
  sources: string[]
}) {
  const { labels } = useSectorConfig()
  const ui = labels.leads.ui
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(currentFilters.search)

  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString())
      if (searchTerm.trim()) p.set("search", searchTerm.trim())
      else p.delete("search")
      router.push(`?${p.toString()}`)
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm, router, searchParams])

  const update = (updates: Partial<Filters>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value != null && value !== "" && value !== "all" && value !== "false")
        p.set(key, String(value))
      else p.delete(key)
    })
    router.push(`?${p.toString()}`)
  }

  const sortValue = `${currentFilters.sortBy}-${currentFilters.sortOrder}`

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search — left aligned */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>
      {/* Filters — right aligned */}
      <div className="ml-auto flex items-center gap-3 flex-wrap">
      <Select value={currentFilters.status} onValueChange={(v) => update({ status: v })}>
        <SelectTrigger className={filterTriggerClass + " w-[140px]"}>
          <SelectValue placeholder={ui.filterStatus} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-neutral-200 shadow-lg">
          <SelectItem value="all">{ui.filterAll}</SelectItem>
          <SelectItem value="NEW">{labels.leads.status.NEW}</SelectItem>
          <SelectItem value="CONTACTED">{labels.leads.status.CONTACTED}</SelectItem>
          <SelectItem value="INTERESTED">{labels.leads.status.INTERESTED}</SelectItem>
          <SelectItem value="QUALIFIED">{labels.leads.status.QUALIFIED}</SelectItem>
        </SelectContent>
      </Select>

      {/* Source */}
      <Select value={currentFilters.source} onValueChange={(v) => update({ source: v })}>
        <SelectTrigger className={filterTriggerClass + " w-[140px]"}>
          <SelectValue placeholder={ui.filterSource} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-neutral-200 shadow-lg">
          <SelectItem value="all">{ui.filterSourceAll ?? "Todas"}</SelectItem>
          {sources.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Temperature */}
      <Select value={currentFilters.temperature} onValueChange={(v) => update({ temperature: v })}>
        <SelectTrigger className={filterTriggerClass + " w-[140px]"}>
          <SelectValue placeholder={ui.filterTemperature} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-neutral-200 shadow-lg">
          <SelectItem value="all">{ui.filterAllTemps}</SelectItem>
          <SelectItem value="HOT">{labels.leads.temperatures.HOT}</SelectItem>
          <SelectItem value="WARM">{labels.leads.temperatures.WARM}</SelectItem>
          <SelectItem value="COLD">{labels.leads.temperatures.COLD}</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={sortValue}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split("-")
          update({ sortBy, sortOrder })
        }}
      >
        <SelectTrigger className={filterTriggerClass + " w-[180px]"}>
          <ArrowUpDown className="mr-2 h-4 w-4 text-neutral-500" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" sideOffset={6} className="bg-white border border-neutral-200 shadow-lg">
          <SelectItem value="score-desc">{ui.sortScoreDesc}</SelectItem>
          <SelectItem value="score-asc">{ui.sortScoreAsc}</SelectItem>
          <SelectItem value="lastActionAt-desc">{ui.sortLastActionDesc}</SelectItem>
          <SelectItem value="lastActionAt-asc">{ui.sortLastActionAsc}</SelectItem>
          <SelectItem value="createdAt-desc">{ui.sortCreatedDesc}</SelectItem>
          <SelectItem value="createdAt-asc">{ui.sortCreatedAsc}</SelectItem>
          <SelectItem value="temperature-asc">{ui.sortTempHotFirst}</SelectItem>
        </SelectContent>
      </Select>
      </div>
    </div>
  )
}
