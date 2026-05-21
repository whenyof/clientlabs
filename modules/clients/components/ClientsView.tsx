"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { ClientsHeader } from "@domains/clients/components/ClientsHeader"
import { ClientsTable } from "@domains/clients/components/ClientsTable"
import type { ClientWithLead as TableClientWithLead } from "@domains/clients/components/ClientsTable"
import { ClientsFilters } from "./ClientsFilters"
import { ClientsKanbanView } from "./ClientsKanbanView"
import { deriveClientStatus, isClientForgotten } from "@/lib/logic/client-status"
import { List, LayoutGrid } from "lucide-react"

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

const viewBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "5px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 500,
    border: active ? "0.5px solid var(--border-subtle)" : "0.5px solid transparent",
    cursor: "pointer",
    background: active ? "var(--bg-card)" : "transparent",
    color: active ? "var(--text-primary)" : "var(--text-secondary)",
    transition: "all 150ms",
})

export function ClientsView({ initialClients, allClientsBase, currentFilters, serverNow }: ClientsViewProps & { serverNow?: string }) {
    // 1. Unified Reference Date for Hydration Consistency
    const [referenceDate] = useState(() => serverNow ? new Date(serverNow) : new Date())

    // Filter / sort state — all client-side
    const [searchTerm, setSearchTerm] = useState(currentFilters.search)
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
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

        // 2 — Text search
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
                    valA = (a as any).invoiceRevenue ?? a.totalSpent ?? 0
                    valB = (b as any).invoiceRevenue ?? b.totalSpent ?? 0
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
    }, [clientsWithDerivedStatus, statusFilter, searchTerm, sortBy, sortOrder])

    // KPI counts always from full dataset
    const kpis = useMemo(() => {
        const derived = kpiClients.map(derivedLogic)
        return {
            active: derived.filter(c => c.effectiveStatus === "ACTIVE" && !c.isForgotten).length,
            totalRevenue: derived.reduce((sum, c) => sum + ((c as any).invoiceRevenue ?? c.totalSpent ?? 0), 0),
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
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <ClientsHeader />
                </div>
                <div style={{ display: "flex", background: "var(--bg-surface)", border: "0.5px solid var(--border-subtle)", borderRadius: 8, padding: 3, gap: 2, flexShrink: 0, marginTop: 4 }}>
                    <button type="button" onClick={() => setViewMode("list")} style={viewBtnStyle(viewMode === "list")}>
                        <List size={13} />
                        Lista
                    </button>
                    <button type="button" onClick={() => setViewMode("kanban")} style={viewBtnStyle(viewMode === "kanban")}>
                        <LayoutGrid size={13} />
                        Tablero
                    </button>
                </div>
            </div>

            {viewMode === "kanban" ? (
                <ClientsKanbanView
                    clients={clientsWithDerivedStatus as any}
                    onClientUpdate={handleClientUpdate as any}
                />
            ) : (
                <>
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

                    <ClientsTable
                        clients={clientesProcesados}
                        onClientUpdate={handleClientUpdate}
                    />
                </>
            )}
        </div>
    )
}
