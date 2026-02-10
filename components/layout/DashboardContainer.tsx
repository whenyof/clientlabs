"use client"

import { ReactNode } from "react"

interface DashboardContainerProps {
  children: ReactNode
  /** Use "compact" for pages that need above-the-fold content (e.g. Finance Overview). */
  variant?: "default" | "compact"
}

export function DashboardContainer({ children, variant = "default" }: DashboardContainerProps) {
  const isCompact = variant === "compact"
  return (
    <div
      className={`
        flex-1 w-full min-h-0 overflow-y-auto
        bg-gradient-to-br from-[#1E1F2B] to-[#242538] text-gray-200
        px-12
        ${isCompact ? "pt-5 pb-10" : "py-10"}
      `}
    >
      <div
        className={
          isCompact
            ? "w-full max-w-none min-h-0 space-y-0"
            : "max-w-[1600px] mx-auto space-y-10"
        }
      >
        {children}
      </div>
    </div>
  )
}