"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

type ClientsFiltersProps = {
    currentFilters: {
        status: string
        search: string
        sortBy: string
        sortOrder: string
    }
    searchValue?: string
    onSearchChange?: (value: string) => void
}

export function ClientsFilters({ currentFilters, searchValue, onSearchChange }: ClientsFiltersProps) {
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
        <div className="flex flex-wrap items-center gap-3">
            {onSearchChange != null && searchValue !== undefined && (
                <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar clientes..."
                        className="h-10 border-neutral-200 bg-white pl-9 text-neutral-900 text-sm"
                    />
                </div>
            )}
            <Select
                value={currentFilters.status}
                onValueChange={(value) => updateFilter("status", value)}
            >
                <SelectTrigger className="w-[130px] h-10 border-neutral-200 bg-white text-neutral-900 text-sm hover:bg-neutral-50 transition-colors">
                    <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ACTIVE">Activos</SelectItem>
                    <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </SelectContent>
            </Select>
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
                <SelectTrigger className="w-[160px] h-10 border-neutral-200 bg-white text-neutral-900 text-sm hover:bg-neutral-50 transition-colors">
                    <ArrowUpDown className="mr-2 h-4 w-4 shrink-0" />
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
