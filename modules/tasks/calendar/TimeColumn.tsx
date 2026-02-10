"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 25 }, (_, i) => i)
const ROW_HEIGHT = 48
const TOTAL_ROWS = 24

type TimeColumnProps = {
  className?: string
  rowHeight?: number
}

export function TimeColumn({ className, rowHeight = ROW_HEIGHT }: TimeColumnProps) {
  const labels = useMemo(
    () =>
      HOURS.map((h) => ({
        key: h,
        label: format(new Date(2000, 0, 1, h, 0), "HH:mm"),
        top: h * rowHeight,
      })),
    [rowHeight]
  )

  return (
    <div
      className={cn("shrink-0 flex flex-col border-r border-border/60 bg-muted/20", className)}
      style={{ width: 56 }}
    >
      <div
        className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-2 py-2 text-xs font-medium text-muted-foreground"
        style={{ height: rowHeight }}
      >
        Hora
      </div>
      <div className="relative" style={{ height: TOTAL_ROWS * rowHeight }}>
        {labels.slice(1).map(({ key, label, top }) => (
          <div
            key={key}
            className="absolute left-0 right-0 px-2 text-xs text-muted-foreground"
            style={{ top: top - rowHeight, height: rowHeight, lineHeight: `${rowHeight}px` }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

export const CALENDAR_ROW_HEIGHT = ROW_HEIGHT
export const CALENDAR_TOTAL_ROWS = TOTAL_ROWS
