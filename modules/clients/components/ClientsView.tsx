"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ClientsKPIs } from "./ClientsKPIs"
import { ClientsTable } from "./ClientsTable"
import { ClientsFilters } from "./ClientsFilters"
import { ClientSidePanel } from "./ClientSidePanel"
import { CreateClientButton } from "./CreateClientButton"
import { Client } from "@prisma/client"
import { deriveClientStatus, isClientForgotten } from "@/lib/logic/client-status"
import { useSectorConfig } from "@/hooks/useSectorConfig"

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
    const { labels } = useSectorConfig()
    const router = useRouter()
    const searchParams = useSearchParams()
    // 1. Unified Reference Date for Hydration Consistency
    const [referenceDate] = useState(() => serverNow ? new Date(serverNow) : new Date());
    const [searchTerm, setSearchTerm] = useState(currentFilters.search)

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

    // Sync selected client when server data changes (e.g. after task/note/reminder + router.refresh)
    useEffect(() => {
        if (!selectedClient) return
        const updated = initialClients.find((c) => c.id === selectedClient.id)
        if (updated) setSelectedClient(updated)
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
        <div className="space-y-8">
            {/* Barra de búsqueda + botón Nuevo cliente (igual que Providers) */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Buscar ${labels.clients.plural.toLowerCase()}...`}
                        className="bg-white/5 border-white/10 text-white pl-10 h-11"
                    />
                </div>
                <CreateClientButton />
            </div>

            {/* KPIs */}
            <ClientsKPIs kpis={kpis} />

            {/* Filters */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
                <ClientsFilters currentFilters={currentFilters} />
            </div>

            {/* 3. Table */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
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
