"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import Sidebar from "@/app/dashboard/components/Sidebar"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { TourProvider } from "@/components/tour/TourContext"
import { TourOverlay } from "@/components/tour/TourOverlay"
import { TrialBanner } from "@/components/layout/TrialBanner"

/**
 * DashboardShell — persistent sidebar + main content area.
 * Used by app/dashboard/layout.tsx so ALL dashboard routes inherit the sidebar.
 * Mobile: sidebar as a fixed drawer with hamburger toggle.
 */
export default function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileSidebarOpen(false)
    }, [pathname])

    return (
        <TourProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]" data-debug="shell">

                {/* ── Desktop Sidebar Column (hidden on mobile) ───────────── */}
                <div
                    className="hidden lg:flex flex-shrink-0 transition-all duration-300 z-20 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] h-full overflow-hidden pointer-events-auto"
                    style={{ width: isCollapsed ? 72 : 240 }}
                >
                    <Sidebar
                        isCollapsed={isCollapsed}
                        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
                    />
                </div>

                {/* ── Mobile Sidebar Drawer ───────────────────────────────── */}
                {mobileSidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                            aria-hidden="true"
                        />
                        {/* Drawer */}
                        <div className="fixed top-0 left-0 h-full w-64 z-50 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] overflow-hidden lg:hidden shadow-xl">
                            <Sidebar
                                isCollapsed={false}
                                onToggleCollapsed={() => setMobileSidebarOpen(false)}
                                onNavItemClick={() => setMobileSidebarOpen(false)}
                            />
                        </div>
                    </>
                )}

                {/* Main Content Column */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    {/* Mobile top bar with hamburger */}
                    <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)] shrink-0">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                            aria-label="Abrir menú"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="font-bold text-[var(--text-primary)]">
                            Client<span className="text-[var(--accent)]">Labs</span>
                        </span>
                    </div>

                    {/* Trial / free plan banner */}
                    <TrialBanner />

                    <div className="hidden lg:block">
                        <DashboardHeader />
                    </div>

                    <main
                        className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] text-[var(--text-primary)] relative"
                        data-debug="shell-main"
                    >
                        <div className="mx-auto w-full max-w-[1400px] flex-1 flex flex-col px-4 sm:px-6 py-4 sm:py-8">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Tour overlay — renders on top of everything */}
                <TourOverlay />
            </div>
        </TourProvider>
    )
}
