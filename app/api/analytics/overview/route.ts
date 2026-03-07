/**
 * Analytics Overview Endpoint: GET /api/analytics/overview
 *
 * Multi-tenant analytics combining Prisma queries and raw SQL.
 * Returns: summary, revenueBySource, conversionBySource, intentHeatBySource.
 *
 * Query params:
 *   from?: ISO date string (default: 30 days ago)
 *   to?:   ISO date string (default: now)
 *   source?: filter by UTM source
 *
 * Security:
 *   - Session-authenticated (getServerSession)
 *   - All queries filtered by userId — no cross-tenant leakage
 *   - No emails, IDs, or sensitive data exposed
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Raw SQL result types
interface RevenueBySourceRow {
    source: string
    orders: bigint
    revenue: number
    avgOrderValue: number
}

interface LeadsBySourceRow {
    source: string
    leads: number
}

interface HeatBySourceRow {
    source: string
    avgHeatScore: number
}

export async function GET(request: NextRequest) {
    try {
        // ── 1. Auth ────────────────────────────────────────
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = session.user.id

        // ── 2. Parse date range ────────────────────────────
        const { searchParams } = new URL(request.url)
        const now = new Date()
        const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const fromDate = searchParams.get('from')
            ? new Date(searchParams.get('from')!)
            : defaultFrom
        const toDate = searchParams.get('to')
            ? new Date(searchParams.get('to')!)
            : now

        // Validate dates
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
        }
        if (fromDate > toDate) {
            return NextResponse.json({ error: 'from must be before to' }, { status: 400 })
        }

        // ── 3. Summary (Prisma) ────────────────────────────
        const [sessions, leads, customersGroup, revenueAgg] = await Promise.all([
            // Sessions count
            prisma.visitorSession.count({
                where: {
                    userId,
                    startedAt: { gte: fromDate, lte: toDate },
                },
            }),
            // Leads count
            prisma.lead.count({
                where: {
                    userId,
                    createdAt: { gte: fromDate, lte: toDate },
                },
            }),
            // Unique customers (distinct leadId with revenue)
            prisma.revenueTransaction.groupBy({
                by: ['leadId'],
                where: {
                    userId,
                    createdAt: { gte: fromDate, lte: toDate },
                    leadId: { not: null },
                },
            }),
            // Total revenue
            prisma.revenueTransaction.aggregate({
                _sum: { amount: true },
                where: {
                    userId,
                    createdAt: { gte: fromDate, lte: toDate },
                },
            }),
        ])

        const customersCount = customersGroup.length
        const totalRevenue = revenueAgg._sum.amount ?? 0

        // ── 4. Revenue by Source (SQL — first-touch attribution) ──
        const revenueBySourceRaw = await prisma.$queryRaw<RevenueBySourceRow[]>`
            SELECT
                COALESCE(vs."utmSource", 'direct') as source,
                COUNT(DISTINCT rt."orderId") as orders,
                SUM(rt.amount)::float as revenue,
                AVG(rt.amount)::float as "avgOrderValue"
            FROM "RevenueTransaction" rt
            JOIN "Lead" l ON l.id = rt."leadId"
            JOIN LATERAL (
                SELECT vs2."utmSource"
                FROM "VisitorSession" vs2
                WHERE vs2."leadId" = l.id
                ORDER BY vs2."startedAt" ASC
                LIMIT 1
            ) vs ON true
            WHERE rt."userId" = ${userId}
            AND rt."createdAt" BETWEEN ${fromDate} AND ${toDate}
            GROUP BY vs."utmSource"
            ORDER BY revenue DESC
        `

        // Normalize BigInt → number for JSON serialization
        const revenueBySource = revenueBySourceRaw.map(r => ({
            source: r.source,
            orders: Number(r.orders),
            revenue: r.revenue,
            avgOrderValue: r.avgOrderValue,
        }))

        // ── 5. Conversion by Source (Prisma + SQL merge) ──
        const [sessionsBySource, leadsBySourceRaw] = await Promise.all([
            // Sessions per source (Prisma)
            prisma.visitorSession.groupBy({
                by: ['utmSource'],
                _count: true,
                where: {
                    userId,
                    startedAt: { gte: fromDate, lte: toDate },
                },
            }),
            // Leads per source (SQL — first-touch via earliest session)
            prisma.$queryRaw<LeadsBySourceRow[]>`
                SELECT
                    COALESCE(vs."utmSource", 'direct') as source,
                    COUNT(DISTINCT l.id)::int as leads
                FROM "Lead" l
                JOIN "VisitorSession" vs ON vs."leadId" = l.id
                WHERE l."userId" = ${userId}
                AND l."createdAt" BETWEEN ${fromDate} AND ${toDate}
                GROUP BY vs."utmSource"
            `,
        ])

        // Build sessions map: utmSource → count
        const sessionsMap = new Map<string, number>()
        for (const s of sessionsBySource) {
            sessionsMap.set(s.utmSource ?? 'direct', s._count)
        }

        // Merge leads + sessions → conversion rate
        const conversionBySource = leadsBySourceRaw.map(l => {
            const sourceSessions = sessionsMap.get(l.source) ?? 0
            return {
                source: l.source,
                sessions: sourceSessions,
                leads: l.leads,
                conversionRate: sourceSessions > 0
                    ? Math.round((l.leads / sourceSessions) * 10000) / 100
                    : 0,
            }
        })

        // ── 6. Intent Heat Score by Source (SQL) ──────────
        const heatBySource = await prisma.$queryRaw<HeatBySourceRow[]>`
            SELECT
                COALESCE(sub."utmSource", 'direct') as source,
                AVG(sub.session_heat)::float as "avgHeatScore"
            FROM (
                SELECT
                    vs.id,
                    vs."utmSource",
                    SUM(
                        CASE
                            WHEN le."eventType" = 'page_view' THEN 1
                            WHEN le."eventType" = 'cta_click' THEN 5
                            WHEN le."eventType" = 'demo_request' THEN 10
                            WHEN le."eventType" = 'add_to_cart' THEN 15
                            WHEN le."eventType" = 'payment_intent_created' THEN 25
                            WHEN le."eventType" = 'payment_completed' THEN 50
                            ELSE 0
                        END
                    ) as session_heat
                FROM "VisitorSession" vs
                LEFT JOIN "LeadEvent" le ON le."leadId" = vs."leadId"
                WHERE vs."userId" = ${userId}
                AND vs."startedAt" BETWEEN ${fromDate} AND ${toDate}
                AND vs."leadId" IS NOT NULL
                GROUP BY vs.id, vs."utmSource"
            ) sub
            GROUP BY sub."utmSource"
            ORDER BY "avgHeatScore" DESC
        `

        // ── 7. Response ──────────────────────────────────
        return NextResponse.json({
            summary: {
                sessions,
                leads,
                customers: customersCount,
                revenue: totalRevenue,
            },
            revenueBySource,
            conversionBySource,
            intentHeatBySource: heatBySource,
            metadata: {
                from: fromDate.toISOString(),
                to: toDate.toISOString(),
                generatedAt: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('analytics_overview', 'query_failed', undefined, {
            error: (error as Error).message,
        })
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
