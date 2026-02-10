"use client"

import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

function CalendarSkeleton() {
  return (
    <div
      className={cn(
        "h-full w-full min-h-[300px] animate-pulse rounded-xl",
        "bg-white/5 border border-white/10"
      )}
      aria-hidden
    >
      <div className="h-full flex flex-col p-4 gap-3">
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="flex-1 grid grid-cols-7 gap-px rounded-lg bg-white/5 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03]" />
          ))}
        </div>
      </div>
    </div>
  )
}

const CalendarView = dynamic(
  () => import("./CalendarView").then((mod) => ({ default: mod.CalendarView })),
  {
    ssr: false,
    loading: () => <CalendarSkeleton />,
  }
)

export default CalendarView
