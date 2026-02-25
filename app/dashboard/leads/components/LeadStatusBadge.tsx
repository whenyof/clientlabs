import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@prisma/client"
import { Sparkles, MessageSquare, Star, CheckCircle, Target, XCircle } from "lucide-react"

const statusConfig = {
    NEW: {
        label: "Nuevo",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/40 font-medium",
        icon: Sparkles
    },
    CONTACTED: {
        label: "Contactado",
        className: "bg-purple-500/20 text-purple-400 border-purple-500/40 font-medium",
        icon: MessageSquare
    },
    INTERESTED: {
        label: "Interesado",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 font-medium",
        icon: Star
    },
    QUALIFIED: {
        label: "Cualificado",
        className: "bg-green-500/20 text-green-400 border-green-500/40 font-medium",
        icon: Target
    },
    CONVERTED: {
        label: "Convertido",
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-medium",
        icon: CheckCircle
    },
    LOST: {
        label: "Perdido",
        className: "bg-red-500/20 text-red-400 border-red-500/40 font-medium",
        icon: XCircle
    },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
        <Badge className={`${config.className} gap-1.5 px-2.5 py-1`}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    )
}
