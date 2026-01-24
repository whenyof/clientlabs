import { Badge } from "@/components/ui/badge"
import type { LeadTemp } from "@prisma/client"

const tempConfig = {
    HOT: { emoji: "🔥", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    WARM: { emoji: "🌤️", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    COLD: { emoji: "❄️", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
}

export function LeadTemperature({ temp }: { temp: LeadTemp }) {
    const config = tempConfig[temp]
    return (
        <Badge className={config.className}>
            {config.emoji}
        </Badge>
    )
}
