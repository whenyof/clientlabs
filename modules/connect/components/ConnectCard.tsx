"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Power, Activity, Users, Zap, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ConnectCardProps {
    id: string
    name: string
    type: string
    status: "connected" | "active" | "inactive" | "never_connected"
    lastSeenAt: string | Date | null
    leadsLast24h: number
    eventsLast24h: number
    visitorsOnlineNow: number
}

export function ConnectCard({
    id,
    name,
    type,
    status,
    lastSeenAt,
    leadsLast24h,
    eventsLast24h,
    visitorsOnlineNow
}: ConnectCardProps) {

    const getStatusConfig = () => {
        switch (status) {
            case "connected":
                return {
                    label: "Conectado",
                    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                    icon: CheckCircle2
                }
            case "active":
                return {
                    label: "Activo",
                    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
                    icon: Activity
                }
            case "inactive":
                return {
                    label: "Inactivo (+24h)",
                    color: "text-slate-400 bg-slate-400/10 border-slate-400/20",
                    dot: "bg-slate-400",
                    icon: Clock
                }
            case "never_connected":
            default:
                return {
                    label: "Sin Conexión",
                    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                    dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                    icon: AlertCircle
                }
        }
    }

    const config = getStatusConfig()
    const StatusIcon = config.icon

    return (
        <Card className="group border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--brand-primary)]/30 transition-all duration-300 overflow-hidden relative">
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

            <CardHeader className="pb-3 border-b border-[var(--border-subtle)]/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110 duration-500", config.color)}>
                            <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
                                {name}
                            </CardTitle>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)] opacity-60">
                                {type}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("px-2 py-0.5 rounded-full border flex items-center gap-1.5 font-medium transition-colors", config.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="py-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] opacity-70">
                            <Zap className="w-3 h-3 text-[var(--brand-primary)]" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Leads (24h)</span>
                        </div>
                        <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
                            {leadsLast24h}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] opacity-70">
                            <Activity className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Eventos (24h)</span>
                        </div>
                        <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
                            {eventsLast24h}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] opacity-70">
                            <Users className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Online</span>
                        </div>
                        <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">
                            {visitorsOnlineNow}
                        </p>
                    </div>
                </div>

                {lastSeenAt && (
                    <div className="mt-6 flex items-center justify-between text-[11px] text-[var(--text-secondary)] opacity-60 border-t border-[var(--border-subtle)]/50 pt-4">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Última actividad
                        </span>
                        <span className="font-medium">
                            {new Date(lastSeenAt).toLocaleString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short'
                            })}
                        </span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="bg-[var(--bg-secondary)]/30 px-6 py-4 flex gap-2 border-t border-[var(--border-subtle)]/50">
                <Button variant="outline" size="sm" className="flex-1 h-9 bg-white dark:bg-[var(--bg-card)] border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95">
                    <Settings className="w-3.5 h-3.5 mr-2 opacity-70" />
                    Configurar
                </Button>
                {status !== "never_connected" && (
                    <Button variant="outline" size="sm" className="h-9 px-3 border-transparent hover:bg-rose-500/10 hover:text-rose-500 text-xs font-semibold rounded-lg transition-all active:scale-95 group/off">
                        <Power className="w-3.5 h-3.5 group-hover/off:scale-110 transition-transform" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
