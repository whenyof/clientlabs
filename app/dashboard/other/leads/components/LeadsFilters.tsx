"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, Search, ArrowUpDown } from "lucide-react"

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
    const [open, setOpen] = useState(false)
    const [localFilters, setLocalFilters] = useState(currentFilters)
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
            if (value && value !== "all" && value !== "" && value !== false) {
                params.set(key, String(value))
            } else {
                params.delete(key)
            }
        })

        router.push(`?${params.toString()}`)
    }

    const applyFilters = () => {
        updateFilters(localFilters)
        setOpen(false)
    }

    const resetFilters = () => {
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
        setLocalFilters(reset)
        setSearchTerm("")
        updateFilters(reset)
        setOpen(false)
    }

    const activeFilterCount = [
        currentFilters.status !== "all",
        currentFilters.temperature !== "all",
        currentFilters.source !== "all",
        currentFilters.showConverted,
        currentFilters.showLost,
    ].filter(Boolean).length

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
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
                <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="score-desc">Score (Mayor a Menor)</SelectItem>
                    <SelectItem value="score-asc">Score (Menor a Mayor)</SelectItem>
                    <SelectItem value="lastActionAt-desc">Último Contacto (Reciente)</SelectItem>
                    <SelectItem value="lastActionAt-asc">Último Contacto (Antiguo)</SelectItem>
                    <SelectItem value="createdAt-desc">Creación (Reciente)</SelectItem>
                    <SelectItem value="createdAt-asc">Creación (Antiguo)</SelectItem>
                    <SelectItem value="temperature-asc">Temperatura (HOT primero)</SelectItem>
                    <SelectItem value="temperature-desc">Temperatura (COLD primero)</SelectItem>
                </SelectContent>
            </Select>

            {/* Filters Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                        {activeFilterCount > 0 && (
                            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filtros</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Status */}
                        <div>
                            <Label>Estado</Label>
                            <Select
                                value={localFilters.status}
                                onValueChange={(value) =>
                                    setLocalFilters({ ...localFilters, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="NEW">Nuevo</SelectItem>
                                    <SelectItem value="CONTACTED">Contactado</SelectItem>
                                    <SelectItem value="INTERESTED">Interesado</SelectItem>
                                    <SelectItem value="QUALIFIED">Cualificado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Temperature */}
                        <div>
                            <Label>Temperatura</Label>
                            <Select
                                value={localFilters.temperature}
                                onValueChange={(value) =>
                                    setLocalFilters({ ...localFilters, temperature: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="HOT">🔥 HOT</SelectItem>
                                    <SelectItem value="WARM">🌤️ WARM</SelectItem>
                                    <SelectItem value="COLD">❄️ COLD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Source */}
                        <div>
                            <Label>Fuente</Label>
                            <Select
                                value={localFilters.source}
                                onValueChange={(value) =>
                                    setLocalFilters({ ...localFilters, source: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
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
                        </div>

                        {/* Show Converted/Lost */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showConverted"
                                    checked={localFilters.showConverted}
                                    onCheckedChange={(checked) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            showConverted: checked as boolean,
                                        })
                                    }
                                />
                                <Label htmlFor="showConverted" className="cursor-pointer">
                                    Mostrar convertidos
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showLost"
                                    checked={localFilters.showLost}
                                    onCheckedChange={(checked) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            showLost: checked as boolean,
                                        })
                                    }
                                />
                                <Label htmlFor="showLost" className="cursor-pointer">
                                    Mostrar perdidos
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={resetFilters} className="flex-1">
                            Resetear
                        </Button>
                        <Button onClick={applyFilters} className="flex-1">
                            Aplicar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
