import { CheckCircle2, CircleDashed, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ConnectStatus = "setup_required" | "waiting" | "connected"

interface StatusBadgeProps {
    status: ConnectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const configs = {
        setup_required: {
            label: "Configuración Pendiente",
            icon: AlertCircle,
            className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        },
        waiting: {
            label: "Esperando Conexión",
            icon: CircleDashed,
            className: "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse",
        },
        connected: {
            label: "Conectado",
            icon: CheckCircle2,
            className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        },
    }

    const { label, icon: Icon, className } = configs[status]

    return (
        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border", className)}>
            <Icon className={cn("w-3.5 h-3.5", status === "waiting" && "animate-spin")} />
            {label}
        </div>
    )
}

interface ConnectStatusCardProps {
    status: ConnectStatus
    domain?: string | null
}

export function ConnectStatusCard({ status, domain }: ConnectStatusCardProps) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Activación Web</h1>
                        <StatusBadge status={status} />
                    </div>
                    <p className="text-slate-400 text-sm max-w-md">
                        {status === "setup_required" && "Añade tu dominio y copia el script para empezar a capturar leads."}
                        {status === "waiting" && "Aún no hemos detectado eventos desde tu sitio. Verifica tu implementación."}
                        {status === "connected" && `Recibiendo eventos correctamente desde ${domain}.`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", domain ? "text-emerald-500" : "text-slate-600")} />
                        Dominio autorizado
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", status !== "setup_required" ? "text-emerald-500" : "text-slate-600")} />
                        Clave pública activa
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <CheckCircle2 className={cn("w-3.5 h-3.5", status === "connected" ? "text-emerald-500" : "text-slate-600")} />
                        Endpoint operativo
                    </div>
                </div>
            </div>
        </div>
    )
}
