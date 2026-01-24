import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@prisma/client"

const statusConfig = {
    NEW: { label: "Nuevo", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    CONTACTED: { label: "Contactado", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    INTERESTED: { label: "Interesado", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    QUALIFIED: { label: "Cualificado", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    CONVERTED: { label: "Convertido", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    LOST: { label: "Perdido", className: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
    const config = statusConfig[status]
    return (
        <Badge className={config.className}>
            {config.label}
        </Badge>
    )
}
