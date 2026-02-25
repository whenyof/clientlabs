"use client"

import { Bell, Sun, Moon, Search } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
    const { theme, toggleTheme } = useTheme()
    const router = useRouter()

    return (
        <header
            className="flex items-center justify-between px-6 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] sticky top-0 z-30 shrink-0 transition-colors"
            style={{ height: 'var(--topbar-height)' }}
        >
            {/* Izquierda: Buscador */}
            <div className="flex items-center gap-8 flex-1">
                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-[14px] w-[14px]" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Derecha: Acciones globales */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Cambiar tema operativo"
                >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                <button
                    onClick={() => router.push("/dashboard/other/notifications")}
                    className="p-1.5 rounded-md hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative group"
                    aria-label="Centro de notificaciones"
                >
                    <Bell size={15} className="group-hover:text-[var(--accent)] transition-colors" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_2px_var(--bg-surface)]"></span>
                </button>
            </div>
        </header>
    )
}
