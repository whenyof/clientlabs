"use client"

import { useState } from "react"
import Sidebar from "./components/Sidebar"

export default function OtherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // ✅ MIDDLEWARE ENSURES SESSION EXISTS
  // No need for loading states or auth checks here

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