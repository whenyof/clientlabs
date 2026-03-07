"use client"

import { Bell, Sun, Moon, Search } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
    const { theme, toggleTheme } = useTheme()
    const router = useRouter()

    return (
        <header
            className="flex items-center justify-between px-6 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] sticky top-0 z-30 shrink-0 h-16 w-full"
        >
            {/* Izquierda: Buscador */}
            <div className="flex items-center gap-8 flex-1">
                <div className="relative w-full max-w-md hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] h-[14px] w-[14px]" />
                    <input
                        type="text"
                        placeholder="Buscar o ejecutar un comando..."
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:block">
                        <kbd className="inline-flex items-center rounded border border-[var(--border-subtle)] px-2 font-mono text-[10px] font-medium text-[var(--text-secondary)]">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Derecha: Acciones globales */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Cambiar tema operativo"
                >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                <div className="w-px h-4 bg-[var(--border-subtle)]"></div>

                <button
                    onClick={() => router.push("/dashboard/notifications")}
                    className="p-2 rounded-md hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative group"
                    aria-label="Centro de notificaciones"
                >
                    <Bell size={15} className="group-hover:text-[var(--accent)] transition-colors" />
                    <span className="absolute top-[6px] right-[6px] w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                </button>
            </div>
        </header>
    )
}
