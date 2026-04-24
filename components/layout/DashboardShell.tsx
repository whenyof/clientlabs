"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/app/dashboard/components/Sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { FinanceNavbar } from "@/components/finance/FinanceNavbar"
import { TourProvider } from "@/components/tour/TourContext"
import { TourOverlay } from "@/components/tour/TourOverlay"

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
    const pathname = usePathname()
    const isFinance = pathname.startsWith("/dashboard/finance")

    return (
        <TourProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]" data-debug="shell">
                {/* Sidebar Column */}
                <div
                    className="flex-shrink-0 transition-all duration-300 z-20 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] h-full overflow-hidden pointer-events-auto"
                    style={{ width: isCollapsed ? 72 : 240 }}
                >
                    <Sidebar
                        isCollapsed={isCollapsed}
                        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
                    />
                </div>

                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    {/* Header: normal en resto del panel, reemplazado por FinanceNavbar en finanzas */}
                    {isFinance ? <FinanceNavbar /> : <DashboardHeader />}

                    <main
                        className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-primary)] relative"
                        data-debug="shell-main"
                    >
                        {isFinance ? (
                            children
                        ) : (
                            <div className="mx-auto w-full max-w-[1400px] flex-1 flex flex-col px-6 py-8">
                                {children}
                            </div>
                        )}
                    </main>
                </div>

                {/* Tour overlay — renders on top of everything */}
                <TourOverlay />
            </div>
        </TourProvider>
    )
}
