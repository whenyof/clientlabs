"use client"

import { useState, useRef, useEffect } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import type { DateRangePreset } from "../types"

const PRESETS: DateRangePreset[] = ["today", "7d", "30d", "month", "6m", "year", "custom"]

type Props = {
  value: DateRangePreset
  customRange: { from: Date; to: Date } | null
  onChange: (preset: DateRangePreset, customRange?: { from: Date; to: Date }) => void
  className?: string
}

export function SalesDateRangePicker({ value, customRange, onChange, className }: Props) {
  const { labels } = useSectorConfig()
  const tr = labels.sales.timeRanges
  const [openCustom, setOpenCustom] = useState(false)
  const [fromStr, setFromStr] = useState("")
  const [toStr, setToStr] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (customRange) {
      setFromStr(customRange.from.toISOString().slice(0, 10))
      setToStr(customRange.to.toISOString().slice(0, 10))
    }
  }, [customRange])

  useEffect(() => {
    if (openCustom && !fromStr && !toStr) {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      setFromStr(start.toISOString().slice(0, 10))
      setToStr(end.toISOString().slice(0, 10))
    }
  }, [openCustom, fromStr, toStr])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenCustom(false)
    }
    if (openCustom) document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [openCustom])

  const label = (p: DateRangePreset) => {
    switch (p) {
      case "today":
        return tr.today
      case "7d":
        return tr.last7
      case "30d":
        return tr.last30
      case "month":
        return tr.month
      case "6m":
        return tr.last6months
      case "year":
        return tr.year
      case "custom":
        return tr.custom
      default:
        return String(p)
    }
  }

  const applyCustom = () => {
    const from = new Date(fromStr)
    const to = new Date(toStr)
    if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
      onChange("custom", { from, to })
      setOpenCustom(false)
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)} ref={ref}>
      {PRESETS.map((preset) => (
        <div key={preset} className="relative">
          <button
            type="button"
            onClick={() =>
              preset === "custom" ? setOpenCustom(true) : onChange(preset)
            }
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              value === preset
                ? "bg-white/15 text-white border border-white/20"
                : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
            )}
          >
            {label(preset)}
          </button>
          {preset === "custom" && openCustom && (
            <div className="absolute left-0 top-full mt-1 z-50 rounded-lg border border-white/10 bg-zinc-900 p-3 shadow-xl min-w-[240px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-white/50 uppercase block mb-1">Desde</label>
                  <input
                    type="date"
                    value={fromStr}
                    onChange={(e) => setFromStr(e.target.value)}
                    className="w-full rounded bg-white/10 border border-white/10 text-white text-sm px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 uppercase block mb-1">Hasta</label>
                  <input
                    type="date"
                    value={toStr}
                    onChange={(e) => setToStr(e.target.value)}
                    className="w-full rounded bg-white/10 border border-white/10 text-white text-sm px-2 py-1.5"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={applyCustom}
                className="mt-2 w-full py-1.5 rounded bg-white/15 text-white text-sm font-medium hover:bg-white/20"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
