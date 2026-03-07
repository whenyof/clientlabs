"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

type ClientsFiltersProps = {
    currentFilters: {
        status: string
        search: string
        sortBy: string
        sortOrder: string
    }
}

export function ClientsFilters({ currentFilters }: ClientsFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-3">
            {/* Left: Filters */}
            <div className="flex items-center gap-2">
                {/* Status Filter */}
                <Select
                    value={currentFilters.status}
                    onValueChange={(value) => updateFilter("status", value)}
                >
                    <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="ACTIVE">Activos</SelectItem>
                        <SelectItem value="INACTIVE">Inactivos</SelectItem>
                    </SelectContent>
                </Select>

                {/* Tags Filter (Visual-only) */}
                <Select value="all" onValueChange={() => { }}>
                    <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                        <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="vip">⭐ VIP</SelectItem>
                        <SelectItem value="risk">⚠️ En riesgo</SelectItem>
                        <SelectItem value="dormant">💤 Dormidos</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Middle: Sort */}
            <Select
                value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
                onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split("-")
                    const params = new URLSearchParams(searchParams.toString())
                    params.set("sortBy", sortBy)
                    params.set("sortOrder", sortOrder)
                    router.push(`?${params.toString()}`)
                }}
            >
                <SelectTrigger className="w-[180px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="createdAt-desc">Más recientes</SelectItem>
                    <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
                    <SelectItem value="totalSpent-desc">Mayor valor</SelectItem>
                    <SelectItem value="totalSpent-asc">Menor valor</SelectItem>
                    <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                    <SelectItem value="name-desc">Nombre Z-A</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
