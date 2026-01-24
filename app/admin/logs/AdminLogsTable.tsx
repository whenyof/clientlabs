"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import type { AdminAction } from "@prisma/client"
import { ClientDate } from "@/components/ClientNumber"

type AdminLog = {
    id: string
    adminEmail: string
    action: AdminAction
    targetType: string | null
    targetId: string | null
    targetEmail: string | null
    metadata: Record<string, any>
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
    admin: {
        name: string | null
        email: string
    }
}

const actionColors: Record<AdminAction, string> = {
    ROLE_CHANGED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PLAN_CHANGED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    USER_IMPERSONATED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    USER_FORCE_LOGOUT: "bg-red-500/20 text-red-400 border-red-500/30",
    USER_BLOCKED: "bg-red-500/20 text-red-400 border-red-500/30",
    USER_UNBLOCKED: "bg-green-500/20 text-green-400 border-green-500/30",
    USER_DEACTIVATED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    USER_ACTIVATED: "bg-green-500/20 text-green-400 border-green-500/30",
    ONBOARDING_RESET: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    BACKUP_TRIGGERED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    BACKUP_RESTORED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    TELEGRAM_COMMAND_SENT: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
}

function ActionBadge({ action }: { action: AdminAction }) {
    return (
        <Badge className={actionColors[action]}>
            {action.replace(/_/g, " ")}
        </Badge>
    )
}

function LogRow({ log }: { log: AdminLog }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="border-b border-white/10 last:border-0">
            <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        <ActionBadge action={log.action} />
                        <span className="text-white/60 text-sm">by</span>
                        <span className="text-white font-medium">{log.adminEmail}</span>
                    </div>
                    {log.targetEmail && (
                        <p className="text-white/60 text-sm">
                            Target: <span className="text-white/80">{log.targetEmail}</span>
                        </p>
                    )}
                    <p className="text-white/40 text-xs">
                        <ClientDate date={log.createdAt} /> • {log.ipAddress}
                    </p>
                </div>
                {Object.keys(log.metadata || {}).length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-white/60 hover:text-white"
                    >
                        {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>
            {expanded && (
                <div className="px-4 pb-4">
                    <div className="bg-black/30 rounded p-3 text-xs font-mono text-white/60">
                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    )
}

export function AdminLogsTable({
    logs,
    totalPages,
    currentPage,
}: {
    logs: AdminLog[]
    totalPages: number
    currentPage: number
}) {
    const router = useRouter()

    const goToPage = (page: number) => {
        router.push(`/admin/logs?page=${page}`)
    }

    if (logs.length === 0) {
        return (
            <p className="text-white/60 text-center py-8">
                No admin actions logged yet
            </p>
        )
    }

    return (
        <div className="space-y-4">
            <div className="bg-white/5 rounded-lg overflow-hidden">
                {logs.map((log) => (
                    <LogRow key={log.id} log={log} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-white/60 text-sm">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
