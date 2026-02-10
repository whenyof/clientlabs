"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Phone, Mail, MessageSquare, Bell,
    TrendingUp, ShoppingCart, UserPlus, Users, Clock, XCircle, Trash2
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type TimelineEvent = {
    id: string
    type: string
    title: string
    description: string
    date: Date
    amount?: number
    currency?: string
    notes?: string | null
    icon?: string
    severity?: 'info' | 'success' | 'warning' | 'error'
}

type EnhancedTimelineProps = {
    events: TimelineEvent[]
    onEventClick?: (event: TimelineEvent) => void
}

const ICON_MAP: Record<string, any> = {
    "user-plus": UserPlus,
    "trending-up": TrendingUp,
    "shopping-cart": ShoppingCart,
    "message-square": MessageSquare,
    "phone": Phone,
    "users": Users,
    "mail": Mail,
    "bell": Bell,
    "clock": Clock,
    "x-circle": XCircle,
    "trash-2": Trash2,
}

const SEVERITY_COLORS: Record<string, string> = {
    info: "bg-blue-500/20 border-blue-500/30",
    success: "bg-green-500/20 border-green-500/30",
    warning: "bg-amber-500/20 border-amber-500/30",
    error: "bg-red-500/20 border-red-500/30",
}

const TYPE_COLORS: Record<string, string> = {
    CREATED: "bg-blue-500/20 border-blue-500/30",
    CONVERTED: "bg-green-500/20 border-green-500/30",
    SALE: "bg-purple-500/20 border-purple-500/30",
    NOTE: "bg-gray-500/20 border-gray-500/30",
    CALL: "bg-green-500/20 border-green-500/30",
    MEETING: "bg-blue-500/20 border-blue-500/30",
    EMAIL: "bg-amber-500/20 border-amber-500/30",
    REMINDER_CREATED: "bg-orange-500/20 border-orange-500/30",
    REMINDER_COMPLETED: "bg-green-500/20 border-green-500/30",
    PAYMENT_PAID: "bg-emerald-500/20 border-emerald-500/30",
    PAYMENT_CANCELLED: "bg-red-500/20 border-red-500/30",
    SALE_DELETED: "bg-rose-500/20 border-rose-500/30",
}

export function EnhancedTimeline({ events, onEventClick }: EnhancedTimelineProps) {
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (events.length === 0) {
        return (
            <div className="text-center py-8 text-white/40">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay eventos en el timeline</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
                {events.map((event, index) => {
                    const Icon = event.icon ? ICON_MAP[event.icon] || Clock : Clock
                    const colorClass = (event.severity && SEVERITY_COLORS[event.severity]) || TYPE_COLORS[event.type] || "bg-gray-500/20 border-gray-500/30"
                    const isLast = index === events.length - 1

                    // Highlight logic
                    const isImportantSale = event.type === 'SALE' && (event.amount || 0) > 500
                    const isRiskChange = event.type === 'RISK_CHANGE'
                    const isStatusChange = event.type === 'STATUS_CHANGE'
                    const isHighlighted = isImportantSale || isRiskChange || isStatusChange
                    const isNew = event.id.startsWith("temp-")

                    const isClickable = !!onEventClick
                    return (
                        <motion.div
                            key={event.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            role={isClickable ? "button" : undefined}
                            onClick={isClickable ? () => onEventClick?.(event) : undefined}
                            className={`flex gap-3 rounded-xl p-3 -ml-3 transition-all duration-300 ${isHighlighted
                                ? "bg-white/5 border border-white/10 shadow-lg scale-[1.02] z-10 my-2"
                                : isNew ? "bg-white/5" : "hover:bg-white/5"} ${isClickable ? "cursor-pointer hover:border-white/15" : ""}`}
                        >
                            {/* Icon */}
                            <div className="flex flex-col items-center">
                                <div className={`relative z-10 h-10 w-10 rounded-full border flex items-center justify-center transition-all shadow-xl ${isHighlighted ? "scale-110" : ""} ${colorClass}`}>
                                    <Icon className={`${isHighlighted ? "h-5 w-5" : "h-4 w-4"} text-white`} />
                                </div>
                                {!isLast && <div className="w-px h-full bg-white/10 mt-2 absolute top-10" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`text-white font-bold leading-tight ${isHighlighted ? "text-base" : "text-sm"}`}>{event.title}</p>
                                            {isImportantSale && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">Importante</span>}
                                            {isRiskChange && <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest">Prioridad</span>}
                                        </div>
                                        <p className={`${isHighlighted ? "text-sm" : "text-xs"} text-white/70 leading-relaxed`}>{event.description}</p>

                                        {event.amount !== undefined && isMounted && (
                                            <p className={`font-black tracking-tight text-emerald-400 mt-2 ${isHighlighted ? "text-lg" : "text-sm"}`}>
                                                {new Intl.NumberFormat('es-ES', {
                                                    style: 'currency',
                                                    currency: event.currency || 'EUR'
                                                }).format(event.amount)}
                                            </p>
                                        )}

                                        {event.notes && (
                                            <p className="text-xs text-white/30 mt-2 italic border-l-2 border-white/10 pl-2 py-0.5 bg-white/[0.02] rounded-r-md">{event.notes}</p>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-white/40 whitespace-nowrap mt-1 font-medium bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                        {isMounted ? formatDistanceToNow(new Date(event.date), { addSuffix: true, locale: es }) : ""}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
