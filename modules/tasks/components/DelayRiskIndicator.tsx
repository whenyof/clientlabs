"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type DelayRiskDay = {
  day: string
  probability: number
  reason: string
}

type DelayRiskIndicatorProps = {
  /** Optional date range (yyyy-MM-dd). If not set, API uses default lookahead. */
  from?: string
  to?: string
  className?: string
}

function formatDay(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEE, MMM d", { locale: enUS })
  } catch {
    return dateStr
  }
}

export function DelayRiskIndicator({
  from,
  to,
  className,
}: DelayRiskIndicatorProps) {
  const [open, setOpen] = useState(false)
  const [risks, setRisks] = useState<DelayRiskDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    fetch(`/api/tasks/delay-risk?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRisks(Array.isArray(data) ? data : []))
      .catch(() => setRisks([]))
      .finally(() => setLoading(false))
  }, [from, to])

  if (loading || risks.length === 0) return null

  const hasHighRisk = risks.some((r) => r.probability >= 0.8)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(className)}
          aria-label="Delay risk warning"
        >
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              hasHighRisk
                ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
            )}
          >
            <AlertCircle className="h-4 w-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 text-sm" sideOffset={8}>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Delay risk</p>
          <p className="text-muted-foreground">
            Days where expected work exceeds capacity. For planning only; no automatic changes.
          </p>
          <ul className="space-y-2">
            {risks.map((r) => (
              <li
                key={r.day}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  r.probability >= 0.8
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-amber-500/30 bg-amber-500/5"
                )}
              >
                <p className="font-medium text-foreground">
                  {formatDay(r.day)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {r.reason}
                </p>
                <p className="text-xs mt-1">
                  Risk: {(r.probability * 100).toFixed(0)}%
                </p>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}
