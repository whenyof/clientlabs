"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    MousePointer2,
    Eye,
    ShoppingCart,
    CreditCard,
    Download,
    Mail,
    Calendar,
    ChevronDown,
    Loader2,
    History,
    Zap,
    AlertCircle,
    RefreshCcw
} from "lucide-react"

interface Event {
    type: string
    createdAt: string
}

interface TimelineSession {
    sessionId: string
    events: Event[]
}

interface Pagination {
    page: number
    pageSize: number
    totalSessions: number
    totalPages: number
    hasNext: boolean
}

/**
 * Ensures a minimum duration for a promise to prevent visual flickering
 * when the back-end response is extremely fast.
 */
async function withMinimumDelay<T>(promise: Promise<T>, minMs = 120): Promise<T> {
    const start = Date.now()
    const result = await promise
    const elapsed = Date.now() - start
    if (elapsed < minMs) {
        await new Promise(r => setTimeout(r, minMs - elapsed))
    }
    return result
}

const EventIcon = memo(({ type }: { type: string }) => {
    switch (type) {
        case 'page_view': return <Eye className="h-4 w-4 text-blue-500" />
        case 'cta_click': return <MousePointer2 className="h-4 w-4 text-emerald-500" />
        case 'add_to_cart': return <ShoppingCart className="h-4 w-4 text-orange-500" />
        case 'payment_completed': return <CreditCard className="h-4 w-4 text-emerald-500" />
        case 'demo_request': return <Zap className="h-4 w-4 text-emerald-500" />
        case 'form_submit': return <Mail className="h-4 w-4 text-blue-500" />
        default: return <MousePointer2 className="h-4 w-4 text-[var(--text-secondary)]" />
    }
})
EventIcon.displayName = 'EventIcon'

const SessionCard = memo(({ session, index, totalSessions }: { session: TimelineSession, index: number, totalSessions: number }) => {
    const hasPurchase = session.events.some(e => e.type === "payment_completed")
    const hasCart = session.events.some(e => e.type === "add_to_cart")
    const hasDemo = session.events.some(e => e.type === "demo_request")

    return (
        <div className="relative pl-12 sm:pl-16 group animate-in slide-in-from-bottom-2 fade-in duration-300 fill-mode-both">
            {/* Timeline Connector Dot */}
            <div className={cn(
                "absolute left-0 mt-3 h-10 w-10 flex items-center justify-center rounded-full bg-[var(--bg-card)] border-2 shadow-sm z-10 transition-transform group-hover:scale-110 duration-300",
                hasPurchase ? "border-emerald-500 shadow-emerald-500/20" :
                    hasDemo ? "border-emerald-500 shadow-emerald-500/20" :
                        hasCart ? "border-blue-500 shadow-blue-500/20" :
                            "border-blue-500/40"
            )}>
                <Zap className={cn(
                    "h-4 w-4",
                    hasPurchase ? "text-emerald-500" :
                        hasDemo ? "text-emerald-500" :
                            hasCart ? "text-blue-500" :
                                "text-blue-500"
                )} />
            </div>

            <div className={cn(
                "bg-[var(--bg-card)] rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm",
                "border-[var(--border-subtle)]",
                hasPurchase && "border-l-4 border-l-emerald-500",
                hasCart && "border-l-4 border-l-blue-500",
                hasDemo && "border-l-4 border-l-purple-500"
            )}>
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                                Sesión #{totalSessions - index}
                            </h3>
                            {hasCart && !hasPurchase && (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] py-0 px-2 animate-pulse">
                                    Abandoned cart opportunity
                                </Badge>
                            )}
                            {hasDemo && (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] py-0 px-2">
                                    Requested demo
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {session.events.length > 0 && format(new Date(session.events[0].createdAt), "PPP 'a las' HH:mm", { locale: es })}
                        </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest">
                        {session.events.length} Eventos
                    </div>
                </div>

                <div className="space-y-4">
                    {session.events.map((event, eventIdx) => (
                        <div key={eventIdx} className="flex items-start gap-4 p-3 rounded-xl bg-muted/40 border border-transparent hover:border-[var(--border-subtle)] hover:bg-muted/60 transition-all duration-200 group/item">
                            <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] group-hover/item:border-[var(--accent)]-soft transition-colors">
                                <EventIcon type={event.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight mb-0.5">
                                    {event.type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {format(new Date(event.createdAt), "HH:mm:ss")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
})
SessionCard.displayName = 'SessionCard'

export const LeadTimeline = memo(({ leadId }: { leadId: string }) => {
    const [sessions, setSessions] = useState<TimelineSession[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(false)

    const fetchInsights = useCallback(async (page: number, signal?: AbortSignal) => {
        try {
            if (page === 1) setLoading(true)
            else setLoadingMore(true)
            setError(false)

            const url = `/api/leads/${leadId}/insights?page=${page}&pageSize=5`
            // Apply minimum delay to the fetch promise to avoid flickers
            const res = await withMinimumDelay(fetch(url, { signal }))

            if (!res.ok) throw new Error('Failed to fetch insights')

            const data = await res.json()

            setSessions(prev =>
                page === 1 ? data.timeline : [...prev, ...data.timeline]
            )
            setPagination(data.pagination)
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Error fetching timeline:", err)
                setError(true)
            }
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [leadId])

    useEffect(() => {
        const controller = new AbortController()

        // IMMEDIATE RESET of state on leadId change (Bloque 2)
        setSessions([])
        setPagination(null)
        setLoading(true)
        setError(false)

        fetchInsights(1, controller.signal)

        return () => controller.abort()
    }, [leadId, fetchInsights])

    const handleLoadMore = useCallback(() => {
        if (loading || loadingMore || !pagination?.hasNext) return
        fetchInsights(pagination.page + 1)
    }, [loading, loadingMore, pagination, fetchInsights])

    const handleRetry = useCallback(() => {
        const page = pagination ? pagination.page : 1
        fetchInsights(page)
    }, [pagination, fetchInsights])

    const renderedSessions = useMemo(() => {
        return sessions.map((session, idx) => (
            <SessionCard
                key={session.sessionId}
                session={session}
                index={idx}
                totalSessions={sessions.length}
            />
        ))
    }, [sessions])

    if (loading && !error) return <TimelineSkeleton />

    if (error && sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50/50 border border-red-100 rounded-2xl text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-red-900 mb-2">Error al cargar el timeline</h3>
                <p className="text-sm text-red-700 mb-6 max-w-xs mx-auto">
                    No pudimos recuperar la actividad del lead en este momento. Por favor, intenta de nuevo.
                </p>
                <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 rounded-xl text-sm font-bold text-red-700 hover:bg-red-50 transition-colors shadow-sm"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-500" />
                    Timeline de Actividad
                </h2>
                {pagination && (
                    <span className="text-xs text-[var(--text-secondary)] font-medium bg-muted px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
                        {pagination.totalSessions} Sesiones
                    </span>
                )}
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-[var(--border-subtle)] before:to-transparent">
                {renderedSessions}
            </div>

            {pagination?.hasNext && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore || loading}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 text-sm font-bold text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
                    >
                        {loadingMore ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                Cargando...
                            </span>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 text-blue-500 transition-transform group-hover:translate-y-0.5" />
                                Cargar sesiones anteriores
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
})
LeadTimeline.displayName = 'LeadTimeline'

function TimelineSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-64 bg-muted rounded-lg" />
            <div className="space-y-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className="pl-16">
                        <div className="h-48 bg-muted/40 rounded-2xl border border-[var(--border-subtle)]" />
                    </div>
                ))}
            </div>
        </div>
    )
}
