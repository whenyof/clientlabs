"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, Clock, Calendar } from "lucide-react"

type WorkView = "all" | "today" | "week"

export function WorkViews({ counts }: {
    counts: {
        all: number
        today: number
        week: number
    }
}) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const getCurrentView = (): WorkView => {
        if (searchParams.get("dateFilter") === "today") return "today"
        if (searchParams.get("dateFilter") === "week") return "week"
        return "all"
    }

    const currentView = getCurrentView()

    const views = [
        {
            id: "all" as const,
            label: "Todos",
            icon: LayoutGrid,
            count: counts.all,
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.delete("dateFilter")
                params.delete("stale")
                router.push(`?${params.toString()}`)
            }
        },
        {
            id: "today" as const,
            label: "Hoy",
            icon: Clock,
            count: counts.today,
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("dateFilter", "today")
                router.push(`?${params.toString()}`)
            }
        },
        {
            id: "week" as const,
            label: "Esta semana",
            icon: Calendar,
            count: counts.week,
            onClick: () => {
                const params = new URLSearchParams(searchParams.toString())
                params.set("dateFilter", "week")
                router.push(`?${params.toString()}`)
            }
        },
    ]

    return (
        <div className="flex items-center gap-2">
            {views.map((view) => {
                const Icon = view.icon
                const isActive = currentView === view.id

                return (
                    <button
                        key={view.id}
                        onClick={view.onClick}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap text-sm ${isActive
                                ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                                : "bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]"
                            }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-medium">{view.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${isActive
                                ? "bg-blue-500/30 text-blue-300"
                                : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                            }`}>
                            {view.count}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
