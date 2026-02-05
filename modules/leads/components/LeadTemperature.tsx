"use client"

import { Badge } from "@/components/ui/badge"
import type { LeadTemp } from "@prisma/client"
import { useSectorConfig } from "@/hooks/useSectorConfig"

const tempEmojis: Record<LeadTemp, string> = {
    HOT: "🔥",
    WARM: "🌤️",
    COLD: "❄️",
}

const tempClassNames: Record<LeadTemp, string> = {
    HOT: "bg-red-500/20 text-red-400 border-red-500/40 font-bold shadow-lg shadow-red-500/20",
    WARM: "bg-orange-500/20 text-orange-400 border-orange-500/40 font-medium",
    COLD: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-medium",
}

export function LeadTemperature({ temp }: { temp: LeadTemp }) {
    const { labels } = useSectorConfig()
    const label = labels.leads.temperatures[temp]
    return (
        <Badge className={`${tempClassNames[temp]} gap-1 px-2.5 py-1`}>
            <span>{tempEmojis[temp]}</span>
            <span className="text-xs">{label}</span>
        </Badge>
    )
}
