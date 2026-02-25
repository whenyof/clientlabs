"use client"

import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

function CalendarSkeleton() {
 return (
 <div
 className={cn(
 "h-full w-full min-h-[300px] animate-pulse rounded-xl",
 "bg-[var(--bg-card)] border border-[var(--border-subtle)]"
 )}
 aria-hidden
 >
 <div className="h-full flex flex-col p-4 gap-3">
 <div className="h-6 w-48 rounded bg-[var(--bg-card)]" />
 <div className="flex-1 grid grid-cols-7 gap-px rounded-lg bg-[var(--bg-card)] overflow-hidden">
 {Array.from({ length: 14 }).map((_, i) => (
 <div key={i} className="bg-[var(--bg-card)]/[0.03]" />
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
