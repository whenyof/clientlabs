"use client"

import { useState } from "react"
import Sidebar from "@/app/dashboard/other/components/Sidebar"

/**
 * DashboardShell — persistent sidebar + main content area.
 * Used by app/dashboard/layout.tsx so ALL dashboard routes inherit the sidebar.
 */
export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0e1424]">
      {/* Sidebar */}
      <div
        className="h-screen shrink-0 transition-all duration-300"
        style={{ width: isCollapsed ? 72 : 240 }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Main Content */}
      <main className="
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
      </main>
    </div>
  )
}
