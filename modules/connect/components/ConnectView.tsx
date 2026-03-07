"use client"

import React, { useState } from "react"
import { ConnectGrid } from "./ConnectGrid"
import { WebConnectDialog } from "./WebConnectDialog"
import { Info, ShieldCheck, Zap } from "lucide-react"

interface ConnectViewProps {
    initialSources: any[]
}

export function ConnectView({ initialSources }: ConnectViewProps) {
    const [openWebModal, setOpenWebModal] = useState(false)

    return (
        <div className="space-y-10 pb-12 animate-in fade-in duration-1000">
            {/* Header: Institutional & Modern */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-subtle)]/50 pb-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border border-[var(--brand-primary)]/20 text-[10px] font-bold uppercase tracking-widest mb-2">
                        <Zap className="w-3 h-3" />
                        Omnichannel Connect v2.0
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                        Centro de Conexiones
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] opacity-70 max-w-2xl">
                        Gestiona y monitorea todos tus canales de entrada en tiempo real.
                        Asegura una captación activa e íntegra de leads en todos tus puntos de contacto.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)]/30 border border-[var(--border-subtle)]/50">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-[var(--text-secondary)]">Encriptación SSL Activa</span>
                    </div>
                </div>
            </div>

            {/* Main Content: The Connect Grid */}
            <ConnectGrid
                sources={initialSources}
                onConnectWeb={() => setOpenWebModal(true)}
            />

            {/* Integration Dialog */}
            <WebConnectDialog
                open={openWebModal}
                onOpenChange={setOpenWebModal}
            />

            {/* Footer / Knowledge Base Link */}
            <div className="bg-gradient-to-br from-blue-500/[0.03] to-teal-500/[0.03] border border-blue-500/10 rounded-2xl p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/10">
                        <Info className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)]">¿Necesitas ayuda con la integración?</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed max-w-xl">
                            Consulta nuestra documentación oficial para aprender a conectar CRMs externos,
                            configurar eventos de conversión avanzados o manejar múltiples píxeles de seguimiento.
                        </p>
                    </div>
                </div>
                <button className="whitespace-nowrap px-6 py-3 bg-white dark:bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-bold rounded-xl hover:bg-[var(--bg-secondary)] transition-all shadow-sm active:scale-95">
                    Ver Documentación
                </button>
            </div>
        </div>
    )
}
