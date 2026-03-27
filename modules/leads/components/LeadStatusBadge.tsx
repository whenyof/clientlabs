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
 NEW: "bg-[#E1F5EE] text-[#0F6E56] border-[#0F6E56]/30 font-medium",
 CONTACTED: "bg-[#E6F1FB] text-[#185FA5] border-[#185FA5]/30 font-medium",
 INTERESTED: "bg-[#FAEEDA] text-[#854F0B] border-[#854F0B]/30 font-medium",
 QUALIFIED: "bg-[#FAEEDA] text-[#854F0B] border-[#854F0B]/30 font-medium",
 CONVERTED: "bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6] font-medium",
 LOST: "bg-[#FCEBEB] text-[#A32D2D] border-[#A32D2D]/30 font-medium",
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
