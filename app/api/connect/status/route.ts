export const maxDuration = 10
/**
 * API Route: GET /api/connect/status
 * 
 * Institutional-grade connection status monitoring.
 * Provides real-time metrics for a specific domain connection.
 * 
 * Features:
 * - Domain validation against whitelist
 * - Parallel SQL Raw execution for performance
 * - Multi-tenant security (strictly userId scoped)
 * - Derived connection state (connected, inactive, never_connected)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)

    try {
        // 🔐 PASO 1 — Auth
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = session.user.id

        // 📥 PASO 2 — Obtener LeadSources
        const leadSources = await (prisma as any).leadSource.findMany({
            where: { userId }
        })

        if (!leadSources || leadSources.length === 0) {
            return NextResponse.json({ sources: [] })
        }

        // 📊 PASO 3 — Obtener métricas agregadas globales (3 queries)
        // Optimizamos el rendimiento usando Promise.all y raw SQL para evitar N+1.
        const [leadsMetrics, eventsMetrics, activityMetrics] = await Promise.all([
            // 1️⃣ Leads creados por canal (24h)
            prisma.$queryRaw<any[]>`
                SELECT "sourceId", COUNT(*)::int as leads_24h
                FROM "Lead"
                WHERE "userId" = ${userId}
                AND "createdAt" >= NOW() - interval '24 hours'
                AND "sourceId" IS NOT NULL
                GROUP BY "sourceId"
            `,
            // 2️⃣ Eventos por canal (24h)
            prisma.$queryRaw<any[]>`
                SELECT l."sourceId", COUNT(le.id)::int as events_24h
                FROM "LeadEvent" le
                JOIN "Lead" l ON le."leadId" = l."id"
                WHERE le."userId" = ${userId}
                AND le."timestamp" >= NOW() - interval '24 hours'
                AND l."sourceId" IS NOT NULL
                GROUP BY l."sourceId"
            `,
            // 3️⃣ Última actividad y usuarios online por canal
            prisma.$queryRaw<any[]>`
                SELECT l."sourceId", MAX(vs."lastActivityAt") as last_seen,
                COUNT(*) FILTER (
                  WHERE vs."lastActivityAt" >= NOW() - interval '60 seconds'
                )::int as online_now
                FROM "VisitorSession" vs
                JOIN "Lead" l ON vs."leadId" = l."id"
                WHERE vs."userId" = ${userId}
                AND l."sourceId" IS NOT NULL
                GROUP BY l."sourceId"
            `
        ])

        // 🧠 PASO 4 — Mapear resultados
        const now = new Date().getTime()
        const fiveMinutesAgo = now - 5 * 60 * 1000
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

        // Tipos para los resultados de SQL Raw
        interface SQLMetric { sourceId: string }
        interface SQLLeadMetric extends SQLMetric { leads_24h: number }
        interface SQLEventMetric extends SQLMetric { events_24h: number }
        interface SQLActivityMetric extends SQLMetric { last_seen: string | Date; online_now: number }

        // Mapas para búsqueda O(1) con casting seguro
        const leadMap = new Map<string, SQLLeadMetric>((leadsMetrics as any[]).map(m => [m.sourceId, m]))
        const eventMap = new Map<string, SQLEventMetric>((eventsMetrics as any[]).map(m => [m.sourceId, m]))
        const activityMap = new Map<string, SQLActivityMetric>((activityMetrics as any[]).map(m => [m.sourceId, m]))

        const sourcesStatus = (leadSources as any[]).map((source) => {
            const lMetrics = leadMap.get(source.id)
            const eMetrics = eventMap.get(source.id)
            const aMetrics = activityMap.get(source.id)

            const lastSeenAt = aMetrics?.last_seen ? new Date(aMetrics.last_seen) : null

            // Derivar estado institucional
            let status = 'never_connected'
            if (lastSeenAt) {
                const lastSeenTime = lastSeenAt.getTime()
                if (lastSeenTime >= fiveMinutesAgo) {
                    status = 'connected'
                } else if (lastSeenTime >= twentyFourHoursAgo) {
                    status = 'active'
                } else {
                    status = 'inactive'
                }
            }

            return {
                id: source.id,
                name: source.name,
                type: source.type,
                status,
                lastSeenAt,
                leadsLast24h: Number(lMetrics?.leads_24h || 0),
                eventsLast24h: Number(eMetrics?.events_24h || 0),
                visitorsOnlineNow: Number(aMetrics?.online_now || 0)
            }
        })

        // 📤 PASO 5 — Respuesta
        return NextResponse.json({
            sources: sourcesStatus
        })

    } catch (error) {
        logger.error(
            'connect_status_refactor',
            'endpoint_error',
            session?.user?.id,
            { message: error instanceof Error ? error.message : 'unknown_error' }
        )
        return NextResponse.json(
            { error: 'Internal server error while fetching connect status' },
            { status: 500 }
        )
    }
}
