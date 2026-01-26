"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, ArrowUpDown } from "lucide-react"

type Filters = {
    status: string
    temperature: string
    source: string
    search: string
    sortBy: string
    sortOrder: string
    showConverted: boolean
    showLost: boolean
}

export function LeadsFilters({
    currentFilters,
    sources,
}: {
    currentFilters: Filters
    sources: string[]
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(currentFilters.search)

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search: searchTerm })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const updateFilters = (updates: Partial<Filters>) => {
        const params = new URLSearchParams(searchParams.toString())

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "all" && value !== "" && value !== "false") {
                params.set(key, String(value))
            } else {
                params.delete(key)
            }
        })

        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-3">
            {/* Left: Filters */}
            <div className="flex items-center gap-2">
                {/* Status Filter */}
                <Select
                    value={currentFilters.status}
                    onValueChange={(value) => updateFilters({ status: value })}
                >
                    <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="NEW">Nuevo</SelectItem>
                        <SelectItem value="CONTACTED">Contactado</SelectItem>
                        <SelectItem value="INTERESTED">Interesado</SelectItem>
                        <SelectItem value="QUALIFIED">Cualificado</SelectItem>
                    </SelectContent>
                </Select>

                {/* Temperature Filter */}
                <Select
                    value={currentFilters.temperature}
                    onValueChange={(value) => updateFilters({ temperature: value })}
                >
                    <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                        <SelectValue placeholder="Temperatura" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="HOT">🔥 HOT</SelectItem>
                        <SelectItem value="WARM">🌤️ WARM</SelectItem>
                        <SelectItem value="COLD">❄️ COLD</SelectItem>
                    </SelectContent>
                </Select>

                {/* Source Filter */}
                {sources.length > 0 && (
                    <Select
                        value={currentFilters.source}
                        onValueChange={(value) => updateFilters({ source: value })}
                    >
                        <SelectTrigger className="w-[140px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                            <SelectValue placeholder="Fuente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {sources.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Middle: Sort */}
            <Select
                value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
                onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split("-")
                    updateFilters({ sortBy, sortOrder })
                }}
            >
                <SelectTrigger className="w-[180px] h-10 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="score-desc">Score ↓</SelectItem>
                    <SelectItem value="score-asc">Score ↑</SelectItem>
                    <SelectItem value="lastActionAt-desc">Contacto reciente</SelectItem>
                    <SelectItem value="lastActionAt-asc">Contacto antiguo</SelectItem>
                    <SelectItem value="createdAt-desc">Más nuevos</SelectItem>
                    <SelectItem value="createdAt-asc">Más antiguos</SelectItem>
                    <SelectItem value="temperature-asc">HOT primero</SelectItem>
                </SelectContent>
            </Select>

            {/* Right: Search (full width) */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
            </div>
        </div>
    )
}
