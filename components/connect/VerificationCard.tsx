"use client"

import { useEffect, useState } from "react"
import { Activity, Radio, CheckCircle2, Loader2, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface VerificationCardProps {
    status: "setup_required" | "waiting" | "connected"
    lastUsed?: Date | null
    domain?: string | null
}

export function VerificationCard({ status, lastUsed, domain }: VerificationCardProps) {
    const router = useRouter()
    const [pulse, setPulse] = useState(true)

    useEffect(() => {
        if (status === "waiting") {
            const interval = setInterval(() => {
                router.refresh()
                setPulse(prev => !prev)
            }, 8000)
            return () => clearInterval(interval)
        }
    }, [status, router])

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden h-full">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                        <Activity className="w-5 h-5 text-teal-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Estado de Recepción</h2>
                </div>
                <p className="text-slate-400 text-xs">
                    Detección en tiempo real de eventos entrantes.
                </p>
            </div>

            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                {status === "setup_required" ? (
                    <div className="space-y-4 py-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700">
                            <Radio className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-300">Esperando Configuración</p>
                            <p className="text-xs text-slate-500">Configura un dominio para iniciar la escucha.</p>
                        </div>
                    </div>
                ) : status === "waiting" ? (
                    <div className="space-y-6 py-4">
                        <div className="relative">
                            <div className={cn(
                                "w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto border border-teal-500/20 transition-all duration-1000",
                                pulse ? "scale-110 shadow-[0_0_30px_rgba(99,102,241,0.2)]" : "scale-100"
                            )}>
                                <Loader2 className="w-10 h-10 text-teal-400 animate-spin-slow" />
                            </div>
                            <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-bold text-white tracking-tight">Escuchando Eventos...</p>
                            <p className="text-[11px] text-slate-500 max-w-[200px] leading-normal">
                                Esperando el primer evento desde <span className="text-teal-400 font-mono">{domain}</span>. Esto puede tardar unos segundos tras la instalación.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-bold text-white tracking-tight">Conectado Correctamente</p>
                            <div className="flex flex-col gap-1">
                                <p className="text-[11px] text-slate-500">
                                    Última actividad detectada:
                                </p>
                                <p className="text-xs font-semibold text-emerald-400">
                                    Hace {lastUsed ? formatDistanceToNow(new Date(lastUsed), { locale: es }) : "un momento"}
                                </p>
                            </div>
                        </div>

                        <button
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors flex items-center gap-2 mx-auto"
                            onClick={() => router.push("/dashboard/leads")}
                        >
                            Ver Leads Recibidos
                            <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
