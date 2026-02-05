"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { ClientsKPIs } from "./ClientsKPIs"
import { ClientsTable } from "./ClientsTable"
import { ClientsFilters } from "./ClientsFilters"
import { ClientSidePanel } from "./ClientSidePanel"
import { Client } from "@prisma/client"
import { deriveClientStatus, isClientForgotten } from "@/lib/logic/client-status"

type ClientWithLead = Client & {
    convertedFromLead: {
        id: string
        name: string | null
        convertedAt: Date | null
    } | null
    Task?: { id: string, status?: string }[]
    notes?: string | null
    Sale?: { id: string }[]
    clientTraits?: string[]
    riskLevel?: string | null
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
    // 1. Unified Reference Date for Hydration Consistency
    const [referenceDate] = useState(() => serverNow ? new Date(serverNow) : new Date());

    // State for the table
    const [clients, setClients] = useState<ClientWithLead[]>(initialClients)
    // State for the Side Panel
    const [selectedClient, setSelectedClient] = useState<ClientWithLead | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
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
        setSelectedClient(prev => prev && prev.id === clientId ? updateFn(prev) : prev);
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
        <div className="flex flex-col gap-8">
            {/* 1. KPIs */}
            <ClientsKPIs kpis={kpis} />

            {/* 2. Filters & Actions */}
            <div className="bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 shadow-2xl">
                <ClientsFilters currentFilters={currentFilters} />
            </div>

            {/* 3. Table */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                <ClientsTable
                    clients={clientsWithDerivedStatus}
                    onClientUpdate={handleClientUpdate}
                    onClientClick={(client: ClientWithLead) => {
                        setSelectedClient(client)
                        setIsPanelOpen(true)
                    }}
                />
            </div>

            {/* Side Panel Overlay & Sidebar */}
            <ClientSidePanel
                client={selectedClient ? derivedLogic(selectedClient) : null}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onClientUpdate={handleClientUpdate}
            />
        </div>
    )
}
