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

        // ── 3. Summary (Prisma) — using current schema (Sale, Lead, TrackingEvent) ──
        const [sessionsResult, leads, customersGroup, revenueAgg] = await Promise.all([
            // Sessions: distinct sessionIds from TrackingEvent
            prisma.trackingEvent.groupBy({
                by: ['sessionId'],
                where: {
                    userId,
                    createdAt: { gte: fromDate, lte: toDate },
                },
            }),
            // Leads count
            prisma.lead.count({
                where: {
                    userId,
                    createdAt: { gte: fromDate, lte: toDate },
                },
            }),
            // Unique customers (distinct clientId from Sale)
            prisma.sale.groupBy({
                by: ['clientId'],
                where: {
                    userId,
                    saleDate: { gte: fromDate, lte: toDate },
                    clientId: { not: null },
                },
            }),
            // Total revenue from Sale
            prisma.sale.aggregate({
                _sum: { total: true },
                where: {
                    userId,
                    saleDate: { gte: fromDate, lte: toDate },
                },
            }),
        ])

        const sessions = sessionsResult.length
        const customersCount = customersGroup.length
        const totalRevenue = revenueAgg._sum.total ?? 0

        // ── 4. Revenue by Source — no UTM in current schema; return single "direct" bucket from Sale ──
        const revenueBySourceRaw = await prisma.$queryRaw<RevenueBySourceRow[]>`
            SELECT
                'direct' as source,
                COUNT(*)::bigint as orders,
                COALESCE(SUM(s."total")::float, 0) as revenue,
                COALESCE(AVG(s."total")::float, 0) as "avgOrderValue"
            FROM "Sale" s
            WHERE s."userId" = ${userId}
            AND s."saleDate" BETWEEN ${fromDate} AND ${toDate}
        `
        const revenueBySource = revenueBySourceRaw
            .filter(r => Number(r.orders) > 0)
            .map(r => ({
                source: r.source,
                orders: Number(r.orders),
                revenue: r.revenue,
                avgOrderValue: r.avgOrderValue,
            }))

        // ── 5. Conversion by Source — no VisitorSession; return leads-only shape ──
        const conversionBySource: Array<{ source: string; sessions: number; leads: number; conversionRate: number }> = [
            {
                source: 'direct',
                sessions,
                leads,
                conversionRate: sessions > 0 ? Math.round((leads / sessions) * 10000) / 100 : 0,
            },
        ]

        // ── 6. Intent Heat by Source — no VisitorSession; return empty/neutral ──
        const heatBySource: HeatBySourceRow[] = []

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
