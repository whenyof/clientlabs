"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ClientsHeader } from "@domains/clients/components/ClientsHeader"
import { ClientsKPIs } from "@domains/clients/components/ClientsKPIs"
import { ClientsTable } from "@domains/clients/components/ClientsTable"
import type { ClientWithLead as TableClientWithLead } from "@domains/clients/components/ClientsTable"
import { ClientsInsights } from "@domains/clients/components/ClientsInsights"
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
    }[] // Minimal data for KPIs
    currentFilters: {
        status: string
        search: string
        sortBy: string
        sortOrder: string
    }
}

export function ClientsView({ initialClients, allClientsBase, currentFilters, serverNow }: ClientsViewProps & { serverNow?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    // 1. Unified Reference Date for Hydration Consistency
    const [referenceDate] = useState(() => serverNow ? new Date(serverNow) : new Date());
    const [searchTerm, setSearchTerm] = useState(currentFilters.search)

    // State for the table
    const [clients, setClients] = useState<ClientWithLead[]>(initialClients)
    // State for KPIs (all clients set)
    const [kpiClients, setKpiClients] = useState(allClientsBase)

    // Sincronizar estado local con las props del servidor (Hydration Sync)
    // Cuando revalidatePath o router.refresh() cambian los datos en el servidor,
    // debemos actualizar el estado local para reflejar la "verdad" del servidor.
    useEffect(() => {
        setClients(initialClients)
    }, [initialClients])

    useEffect(() => {
        setKpiClients(allClientsBase)
    }, [allClientsBase])

    useEffect(() => {
        setSearchTerm(currentFilters.search)
    }, [currentFilters.search])

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (searchTerm) params.set("search", searchTerm)
            else params.delete("search")
            router.push(`?${params.toString()}`)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleClientUpdate = useCallback((clientId: string, data: Partial<ClientWithLead>) => {
        const updateFn = (c: any) => {
            if (c.id !== clientId) return c;
            return {
                ...c,
                ...data,
                // Ensure array fields are merged or replaced correctly
                Sale: data.Sale !== undefined ? data.Sale : c.Sale,
                Task: data.Task !== undefined ? data.Task : c.Task,
                updatedAt: data.updatedAt || new Date()
            };
        };

        setClients(prev => prev.map(updateFn));
        setKpiClients(prev => prev.map(updateFn));
    }, [])

    // Derived Logic using the stable reference date
    const derivedLogic = useCallback((c: any) => {
        const derivedStatus = deriveClientStatus(c, referenceDate)
        const forgotten = isClientForgotten(c, referenceDate)
        return { ...c, status: derivedStatus, isForgotten: forgotten, effectiveStatus: derivedStatus }
    }, [referenceDate])

    const clientsWithDerivedStatus = useMemo(() => {
        return clients.map(derivedLogic);
    }, [clients, derivedLogic]);

    // KPI Calculation
    const kpis = useMemo(() => {
        const derivedKPIClients = kpiClients.map(derivedLogic);

        return {
            active: derivedKPIClients.filter((c) => c.effectiveStatus === "ACTIVE" && !c.isForgotten).length,
            totalRevenue: derivedKPIClients.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
            inactive: derivedKPIClients.filter((c) => c.effectiveStatus === "INACTIVE" || c.isForgotten).length,
            vip: derivedKPIClients.filter((c) => c.effectiveStatus === "VIP").length,
            followup: derivedKPIClients.filter((c) => c.effectiveStatus === "FOLLOW_UP").length,
        }
    }, [kpiClients, derivedLogic])

    return (
        <div className="space-y-6">
            <ClientsHeader />

            <ClientsKPIs kpis={kpis} />

            <div className="rounded-xl border border-neutral-200 bg-white py-3 px-4 shadow-sm">
                <ClientsFilters
                    currentFilters={currentFilters}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
                <div className="min-w-0">
                    <ClientsTable
                        clients={clientsWithDerivedStatus}
                        onClientUpdate={handleClientUpdate}
                    />
                </div>
                <aside className="lg:min-w-0">
                    <ClientsInsights clients={clientsWithDerivedStatus} />
                </aside>
            </div>
        </div>
    )
}
