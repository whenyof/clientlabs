"use client"

import { ReactNode } from "react"

interface DashboardContainerProps {
  children: ReactNode
}

export function DashboardContainer({ children }: DashboardContainerProps) {
  return (
    <div className="
      flex-1
      h-screen
      overflow-y-auto
      bg-gradient-to-br from-[#1E1F2B] to-[#242538]
      text-gray-200
      px-12 py-10
    ">
      <div className="max-w-[1600px] mx-auto space-y-10">
        {children}
      </div>
    </div>
  )
}