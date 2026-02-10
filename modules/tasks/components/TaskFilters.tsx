"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export function TaskFilters() {
    const { labels } = useSectorConfig()
    const viewsConfig = labels.tasks.views
    const ui = labels.tasks.ui
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const view = searchParams.get("view") || "today"
    const search = searchParams.get("search") || ""

    const handleViewChange = (newView: string) => {
        const params = new URLSearchParams(searchParams)
        params.set("view", newView)
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const params = new URLSearchParams(searchParams)
        if (e.target.value) {
            params.set("search", e.target.value)
        } else {
            params.delete("search")
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    const views = [
        { id: "dashboard", label: viewsConfig.dashboard },
        { id: "today", label: viewsConfig.today },
        { id: "week", label: viewsConfig.week },
        { id: "day-plan", label: viewsConfig.dayPlan },
        { id: "calendar", label: viewsConfig.calendar },
        { id: "overdue", label: viewsConfig.overdue },
        { id: "all", label: viewsConfig.all }
    ]

    return (
        <div className="space-y-4">
            {/* View Pills */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {views.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => handleViewChange(v.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                            view === v.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="flex gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                        placeholder={ui.searchPlaceholder}
                        value={search}
                        onChange={handleSearchChange}
                        className="pl-9 bg-zinc-900 border-white/10 text-white placeholder:text-white/40"
                    />
                </div>

                {/* Additional Filters Button (Placeholder for now) */}
                <Button variant="outline" className="bg-zinc-900 border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                    <Filter className="h-4 w-4 mr-2" />
                    {ui.filterButton}
                </Button>
            </div>
        </div>
    )
}
