"use client"

import React, { useState, useEffect } from "react"
import { GlobeAltIcon, ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline"
import { ShieldCheckIcon } from "@heroicons/react/24/solid"
// Using simple SVG for Facebook/Meta to avoid adding extra libraries if missing
const MetaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
)

import { WebConnectDialog } from "@/modules/connect/components/WebConnectDialog"
import { cn } from "@/lib/utils"

interface IntegrationsStatus {
    web: { connected: boolean; lastSync: Date | null }
    whatsapp: { connected: boolean }
    facebook: { connected: boolean }
}

function IntegrationCard({
    type,
    title,
    description,
    icon: Icon,
    status,
    onConnect,
    onManage,
}: {
    type: string
    title: string
    description: string
    icon: React.ElementType
    status: "connected" | "disconnected" | "error"
    onConnect: () => void
    onManage: () => void
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-sm transition flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start gap-4">
                <div className="h-10 w-10 min-w-[40px] rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                    <h3 className="text-base font-semibold text-[#0B1F2A]">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                {status === "connected" && (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Conectado
                    </span>
                )}
                {status === "disconnected" && (
                    <span className="text-xs text-slate-400">Sin conectar</span>
                )}
                {status === "error" && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Requiere revisión
                    </span>
                )}

                {status === "connected" ? (
                    <button
                        onClick={onManage}
                        className="rounded-lg text-sm font-medium px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                        Gestionar
                    </button>
                ) : status === "error" ? (
                    <button
                        onClick={onManage}
                        className="rounded-lg text-sm font-medium px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                        Revisar
                    </button>
                ) : (
                    <button
                        onClick={onConnect}
                        className="rounded-lg text-sm font-medium px-4 py-2 bg-[#1FA97A] text-white hover:bg-[#178f68] transition"
                    >
                        Conectar
                    </button>
                )}
            </div>
        </div>
    )
}

export default function ConnectPage() {
    const [integrations, setIntegrations] = useState<IntegrationsStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [openWebModal, setOpenWebModal] = useState(false)

    // Fetch status on mount
    useEffect(() => {
        fetch("/api/integrations")
            .then((res) => res.json())
            .then((data) => {
                if (data.web || data.whatsapp || data.facebook) {
                    setIntegrations(data)
                }
            })
            .catch((err) => console.error("Failed to load integrations status", err))
            .finally(() => setLoading(false))
    }, [])

    const handleConnect = (type: string) => {
        if (type === "web") {
            setOpenWebModal(true)
        } else {
            console.log(`Open connect modal for ${type}`)
            // Placeholder for other modals (WhatsApp, FB)
            // En una release futura se agregarían sus respectivos dialogs
        }
    }

    const handleManage = (type: string) => {
        console.log(`Manage integration for ${type}`)
        // Placeholder for manage modals/settings
    }

    // Derived statuses safely avoiding null on initial render
    const webStatus = integrations?.web?.connected ? "connected" : "disconnected"
    const whatsappStatus = integrations?.whatsapp?.connected ? "connected" : "disconnected"
    const fbStatus = integrations?.facebook?.connected ? "connected" : "disconnected"

    return (
        <section className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header Institucional */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0B1F2A]">Centro de Conexiones</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestiona y monitoriza todos tus canales de entrada en tiempo real.
                    </p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 whitespace-nowrap">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    SSL Activo
                </span>
            </header>

            {/* Grid Modular Enterprise */}
            <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity", loading && "opacity-50 pointer-events-none")}>
                <IntegrationCard
                    type="web"
                    title="Web Ingestion"
                    description="Captura leads desde tu sitio web o landings."
                    icon={GlobeAltIcon}
                    status={webStatus}
                    onConnect={() => handleConnect("web")}
                    onManage={() => handleManage("web")}
                />

                <IntegrationCard
                    type="whatsapp"
                    title="WhatsApp Messenger"
                    description="Captura leads directamente desde tus chats oficiales."
                    icon={ChatBubbleOvalLeftEllipsisIcon}
                    status={whatsappStatus}
                    onConnect={() => handleConnect("whatsapp")}
                    onManage={() => handleManage("whatsapp")}
                />

                <IntegrationCard
                    type="facebook"
                    title="Meta Ads & Social"
                    description="Sincroniza tus campañas de Lead Gen en tiempo real."
                    icon={MetaIcon}
                    status={fbStatus}
                    onConnect={() => handleConnect("facebook")}
                    onManage={() => handleManage("facebook")}
                />
            </div>

            {/* Web Connect Dialog: Preserved from old component */}
            <WebConnectDialog open={openWebModal} onOpenChange={setOpenWebModal} />
        </section>
    )
}
