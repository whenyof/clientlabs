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
import { Search, ArrowUpDown, X, Filter as FilterIcon, Upload, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

    const clearFilter = (key: keyof Filters) => {
        if (key === "status" || key === "temperature" || key === "source") {
            updateFilters({ [key]: "all" })
        } else if (key === "showConverted" || key === "showLost") {
            updateFilters({ [key]: false })
        }
    }

    const resetAllFilters = () => {
        const reset: Filters = {
            status: "all",
            temperature: "all",
            source: "all",
            search: "",
            sortBy: "score",
            sortOrder: "desc",
            showConverted: false,
            showLost: false,
        }
        setSearchTerm("")
        updateFilters(reset)
    }

    const activeFilterCount = [
        currentFilters.status !== "all",
        currentFilters.temperature !== "all",
        currentFilters.source !== "all",
        currentFilters.showConverted,
        currentFilters.showLost,
    ].filter(Boolean).length

    const statusLabels: Record<string, string> = {
        NEW: "Nuevo",
        CONTACTED: "Contactado",
        INTERESTED: "Interesado",
        QUALIFIED: "Cualificado",
    }

    const tempLabels: Record<string, string> = {
        HOT: "🔥 HOT",
        WARM: "🌤️ WARM",
        COLD: "❄️ COLD",
    }

    return (
        <div className="space-y-4">
            {/* Top Row: Search + Sort + Actions */}
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-11 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>

                {/* Sort */}
                <Select
                    value={`${currentFilters.sortBy}-${currentFilters.sortOrder}`}
                    onValueChange={(value) => {
                        const [sortBy, sortOrder] = value.split("-")
                        updateFilters({ sortBy, sortOrder })
                    }}
                >
                    <SelectTrigger className="w-full lg:w-[240px] bg-white/5 border-white/10 text-white h-11 hover:bg-white/10 transition-all">
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
            </div>

            {/* Filter Chips Row */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-white/60 font-medium">
                    <FilterIcon className="h-4 w-4" />
                    <span>Filtros:</span>
                </div>

                {/* Status Filter */}
                <Select
                    value={currentFilters.status}
                    onValueChange={(value) => updateFilters({ status: value })}
                >
                    <SelectTrigger className="w-auto h-9 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
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
                    <SelectTrigger className="w-auto h-9 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
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
                        <SelectTrigger className="w-auto h-9 bg-white/5 border-white/10 text-white text-sm hover:bg-white/10 transition-all">
                            <SelectValue placeholder="Fuente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las fuentes</SelectItem>
                            {sources.map((source) => (
                                <SelectItem key={source} value={source}>
                                    {source}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Active Filter Badges */}
                {currentFilters.status !== "all" && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 bg-blue-500/20 border-blue-500/30 text-blue-400">
                        {statusLabels[currentFilters.status]}
                        <button
                            onClick={() => clearFilter("status")}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-all"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )}

                {currentFilters.temperature !== "all" && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 bg-orange-500/20 border-orange-500/30 text-orange-400">
                        {tempLabels[currentFilters.temperature]}
                        <button
                            onClick={() => clearFilter("temperature")}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-all"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )}

                {currentFilters.source !== "all" && (
                    <Badge variant="secondary" className="gap-1 pl-2 pr-1 bg-purple-500/20 border-purple-500/30 text-purple-400">
                        {currentFilters.source}
                        <button
                            onClick={() => clearFilter("source")}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-all"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                )}

                {/* Reset All */}
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetAllFilters}
                        className="h-9 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="mr-1 h-3 w-3" />
                        Limpiar todo
                    </Button>
                )}
            </div>
        </div>
    )
}
