"use client"

import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@prisma/client"
import { Sparkles, MessageSquare, Star, CheckCircle, Target, XCircle } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"

const statusIcons: Record<LeadStatus, typeof Sparkles> = {
    NEW: Sparkles,
    CONTACTED: MessageSquare,
    INTERESTED: Star,
    QUALIFIED: Target,
    CONVERTED: CheckCircle,
    LOST: XCircle,
}

const statusClassNames: Record<LeadStatus, string> = {
    NEW: "bg-blue-500/20 text-blue-400 border-blue-500/40 font-medium",
    CONTACTED: "bg-purple-500/20 text-purple-400 border-purple-500/40 font-medium",
    INTERESTED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 font-medium",
    QUALIFIED: "bg-green-500/20 text-green-400 border-green-500/40 font-medium",
    CONVERTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-medium",
    LOST: "bg-red-500/20 text-red-400 border-red-500/40 font-medium",
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
    const { labels } = useSectorConfig()
    const statusLabels = labels.leads.status as Record<string, string>
    const label = statusLabels[status] ?? status
    const Icon = statusIcons[status]
    return (
        <Badge className={`${statusClassNames[status]} gap-1.5 px-2.5 py-1`}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    )
}
