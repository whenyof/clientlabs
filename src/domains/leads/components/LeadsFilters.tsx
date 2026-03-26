"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select"
import { Search, ArrowUpDown } from "lucide-react"
import { useSectorConfig } from "@shared/hooks/useSectorConfig"

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

const triggerStyle =
  "rounded-lg px-3 py-2 text-sm h-10 min-w-0"

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
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {/* Search */}
      <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-secondary)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "7px 12px 7px 36px",
            borderRadius: 8,
            border: "0.5px solid var(--border-subtle)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
        <Select value={currentFilters.status} onValueChange={(v) => update({ status: v })}>
          <SelectTrigger className={triggerStyle} style={{ width: 140, border: "0.5px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
            <SelectValue placeholder={ui.filterStatus} />
          </SelectTrigger>
          <SelectContent style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)" }}>
            <SelectItem value="all">{ui.filterAll}</SelectItem>
            <SelectItem value="NEW">{labels.leads.status.NEW}</SelectItem>
            <SelectItem value="CONTACTED">{labels.leads.status.CONTACTED}</SelectItem>
            <SelectItem value="INTERESTED">{labels.leads.status.INTERESTED}</SelectItem>
            <SelectItem value="QUALIFIED">{labels.leads.status.QUALIFIED}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currentFilters.source} onValueChange={(v) => update({ source: v })}>
          <SelectTrigger className={triggerStyle} style={{ width: 140, border: "0.5px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
            <SelectValue placeholder={ui.filterSource} />
          </SelectTrigger>
          <SelectContent style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)" }}>
            <SelectItem value="all">{ui.filterSourceAll ?? "Todas"}</SelectItem>
            {sources.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.temperature} onValueChange={(v) => update({ temperature: v })}>
          <SelectTrigger className={triggerStyle} style={{ width: 140, border: "0.5px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
            <SelectValue placeholder={ui.filterTemperature} />
          </SelectTrigger>
          <SelectContent style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)" }}>
            <SelectItem value="all">{ui.filterAllTemps}</SelectItem>
            <SelectItem value="HOT">{labels.leads.temperatures.HOT}</SelectItem>
            <SelectItem value="WARM">{labels.leads.temperatures.WARM}</SelectItem>
            <SelectItem value="COLD">{labels.leads.temperatures.COLD}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortValue}
          onValueChange={(v) => {
            const [sortBy, sortOrder] = v.split("-")
            update({ sortBy, sortOrder })
          }}
        >
          <SelectTrigger className={triggerStyle} style={{ width: 180, border: "0.5px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)" }}>
            <ArrowUpDown size={14} style={{ marginRight: 8, color: "var(--text-secondary)" }} />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent
            side="bottom"
            align="end"
            sideOffset={4}
            position="popper"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", zIndex: 50 }}
          >
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
