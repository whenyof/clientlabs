import { Badge } from "@/components/ui/badge"
import type { LeadTemp } from "@prisma/client"

const tempConfig = {
    HOT: {
        emoji: "🔥",
        label: "HOT",
        className: "bg-red-500/20 text-red-400 border-red-500/40 font-bold shadow-lg shadow-red-500/20"
    },
    WARM: {
        emoji: "🌤️",
        label: "WARM",
        className: "bg-orange-500/20 text-orange-400 border-orange-500/40 font-medium"
    },
    COLD: {
        emoji: "❄️",
        label: "COLD",
        className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-medium"
    },
}

export function LeadTemperature({ temp }: { temp: LeadTemp }) {
    const config = tempConfig[temp]
    return (
        <Badge className={`${config.className} gap-1 px-2.5 py-1`}>
            <span>{config.emoji}</span>
            <span className="text-xs">{config.label}</span>
        </Badge>
    )
}
