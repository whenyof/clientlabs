"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { ClientsHeader } from "@domains/clients/components/ClientsHeader"
import { ClientsKPIs } from "@domains/clients/components/ClientsKPIs"
import { ClientsTable } from "@domains/clients/components/ClientsTable"
import type { ClientWithLead as TableClientWithLead } from "@domains/clients/components/ClientsTable"
import { ClientsCharts } from "@domains/clients/components/ClientsCharts"
import { ClientsFilters } from "./ClientsFilters"
import { deriveClientStatus, isClientForgotten } from "@/lib/logic/client-status"

type ClientWithLead = TableClientWithLead & {
    Task?: { id: string, status?: string }[]
    notes?: string | null
    Sale?: { id: string }[]
}

type ClientsViewProps = {
    initialClients: ClientWithLead[]
    allClientsBase: {
        id: string;
        totalSpent: number | null;
        updatedAt: Date;
        createdAt: Date;
        status: string;
        notes: string | null;
        Task: { id: string }[];
        Sale?: { id: string }[];
    }[]
    currentFilters: {
        status: string
        search: string
        sortBy: string
        sortOrder: string
    }
}

const KPI_LABEL: Record<string, string> = {
    active: "Activos",
    inactive: "En riesgo",
    vip: "VIP",
}

export function ClientsView({ initialClients, allClientsBase, currentFilters, serverNow }: ClientsViewProps & { serverNow?: string }) {
    // 1. Unified Reference Date for Hydration Consistency
    const [referenceDate] = useState(() => serverNow ? new Date(serverNow) : new Date())

    // Filter / sort state — all client-side
    const [searchTerm, setSearchTerm] = useState(currentFilters.search)
    const [activeKpi, setActiveKpi] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState(currentFilters.sortBy || "createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">((currentFilters.sortOrder as "asc" | "desc") || "desc")
    const [statusFilter, setStatusFilter] = useState(currentFilters.status || "all")

    // Raw data state — synced from server on revalidation
    const [clients, setClients] = useState<ClientWithLead[]>(initialClients)
    const [kpiClients, setKpiClients] = useState(allClientsBase)

    useEffect(() => { setClients(initialClients) }, [initialClients])
    useEffect(() => { setKpiClients(allClientsBase) }, [allClientsBase])
    useEffect(() => { setSearchTerm(currentFilters.search) }, [currentFilters.search])

    const handleClientUpdate = useCallback((clientId: string, data: Partial<ClientWithLead>) => {
        const updateFn = (c: any) => {
            if (c.id !== clientId) return c
            return {
                ...c,
                ...data,
                Sale: data.Sale !== undefined ? data.Sale : c.Sale,
                Task: data.Task !== undefined ? data.Task : c.Task,
                updatedAt: data.updatedAt || new Date(),
            }
        }
        setClients(prev => prev.map(updateFn))
        setKpiClients(prev => prev.map(updateFn))
    }, [])

    const derivedLogic = useCallback((c: any) => {
        const derivedStatus = deriveClientStatus(c, referenceDate)
        const forgotten = isClientForgotten(c, referenceDate)
        return { ...c, status: derivedStatus, isForgotten: forgotten, effectiveStatus: derivedStatus }
    }, [referenceDate])

    const clientsWithDerivedStatus = useMemo(() => clients.map(derivedLogic), [clients, derivedLogic])

    // All filtering + sorting in one memo — zero API calls
    const clientesProcesados = useMemo(() => {
        let result = [...clientsWithDerivedStatus]

        // 1 — Status filter (select)
        if (statusFilter && statusFilter !== "all") {
            result = result.filter(c => c.effectiveStatus === statusFilter)
        }

        // 2 — KPI filter
        if (activeKpi === "active") {
            result = result.filter(c => c.effectiveStatus === "ACTIVE" && !c.isForgotten)
        } else if (activeKpi === "inactive") {
            result = result.filter(c =>
                c.effectiveStatus === "INACTIVE" ||
                c.effectiveStatus === "FOLLOW_UP" ||
                c.isForgotten
            )
        } else if (activeKpi === "vip") {
            result = result.filter(c => c.effectiveStatus === "VIP")
        }

        // 3 — Text search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim()
            result = result.filter(c =>
                c.name?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term) ||
                c.phone?.toLowerCase().includes(term) ||
                c.companyName?.toLowerCase().includes(term)
            )
        }

        // 4 — Sort
        result.sort((a, b) => {
            let valA: any
            let valB: any
            switch (sortBy) {
                case "name":
                    valA = a.name?.toLowerCase() || ""
                    valB = b.name?.toLowerCase() || ""
                    break
                case "totalSpent":
                    valA = a.totalSpent || 0
                    valB = b.totalSpent || 0
                    break
                case "createdAt":
                default:
                    valA = new Date(a.createdAt).getTime()
                    valB = new Date(b.createdAt).getTime()
            }
            if (valA < valB) return sortOrder === "asc" ? -1 : 1
            if (valA > valB) return sortOrder === "asc" ? 1 : -1
            return 0
        })

        return result
    }, [clientsWithDerivedStatus, statusFilter, activeKpi, searchTerm, sortBy, sortOrder])

    // KPI counts always from full dataset
    const kpis = useMemo(() => {
        const derived = kpiClients.map(derivedLogic)
        return {
            active: derived.filter(c => c.effectiveStatus === "ACTIVE" && !c.isForgotten).length,
            totalRevenue: derived.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
            inactive: derived.filter(c => c.effectiveStatus === "INACTIVE" || c.isForgotten).length,
            vip: derived.filter(c => c.effectiveStatus === "VIP").length,
            followup: derived.filter(c => c.effectiveStatus === "FOLLOW_UP").length,
        }
    }, [kpiClients, derivedLogic])

    const handleSortChange = useCallback((value: string) => {
        const [field, order] = value.split("-")
        setSortBy(field)
        setSortOrder(order as "asc" | "desc")
    }, [])

    return (
        <div className="space-y-6">
            <ClientsHeader />

            <ClientsKPIs
                kpis={kpis}
                activeKpi={activeKpi}
                onKpiClick={(id) => setActiveKpi(activeKpi === id ? null : id)}
            />

            <ClientsCharts clients={kpiClients as any} />

            <div className="rounded-xl border border-slate-200 bg-white py-3 px-4 shadow-sm">
                <ClientsFilters
                    currentFilters={currentFilters}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusValue={statusFilter}
                    onStatusChange={setStatusFilter}
                    sortValue={`${sortBy}-${sortOrder}`}
                    onSortChange={handleSortChange}
                />
            </div>

            {activeKpi && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#E1F5EE] border border-[#1FA97A]/20 rounded-xl">
                    <span className="text-[12px] font-medium text-[#0F6E56] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#1FA97A]" />
                        {clientesProcesados.length} clientes · {KPI_LABEL[activeKpi] ?? activeKpi}
                    </span>
                    <button
                        type="button"
                        onClick={() => setActiveKpi(null)}
                        className="text-[11px] text-[#1FA97A] font-medium hover:underline"
                    >
                        Ver todos
                    </button>
                </div>
            )}

            <ClientsTable
                clients={clientesProcesados}
                onClientUpdate={handleClientUpdate}
            />
        </div>
    )
}
