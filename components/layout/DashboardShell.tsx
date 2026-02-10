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
    <div
      className="flex h-screen w-screen overflow-hidden bg-[#0e1424]"
      data-debug="shell"
    >
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

      {/* Main Content — flex column so child can get flex-1 and real height */}
      <main
        className="
          flex flex-col flex-1 min-w-0 min-h-0
          h-screen
          overflow-y-auto overflow-x-hidden
          bg-gradient-to-br from-[#1E1F2B] to-[#242538]
          text-gray-200
          px-6 py-6 lg:px-8 xl:px-10
        "
        data-debug="shell-main"
      >
        <div className="flex-1 min-h-0 w-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
