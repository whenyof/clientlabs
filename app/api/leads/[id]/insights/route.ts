/**
 * Lead Insights Endpoint: GET /api/leads/[id]/insights
 * 
 * Provides commercial intelligence for a specific lead.
 * Combines Prisma queries and raw SQL for aggregation and timeline grouping.
 * 
 * Multi-tenant safe: filters by userId and leadId ownership.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface StageExistsRaw {
    has_payment: boolean
    has_cart: boolean
    has_demo: boolean
    has_form: boolean
}

interface HeatScoreRaw {
    heat_score: number | null
}

interface FirstTouchRaw {
    utmSource: string | null
    utmMedium: string | null
    utmCampaign: string | null
}

interface TimelineRaw {
    sessionId: string
    events: Array<{
        type: string
        createdAt: string
    }>
}

interface LastActivityRaw {
    last_activity: Date | null
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // ── 1. Auth & Ownership ──────────────────────────
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const userId = session.user.id
        const { id: leadId } = await context.params

        // Parse query params for pagination
        const { searchParams } = request.nextUrl
        const page = Math.max(1, Number(searchParams.get('page') || 1) || 1)
        const rawSize = Number(searchParams.get('pageSize') || 5) || 5
        const pageSize = Math.min(10, Math.max(1, rawSize))

        // Validate lead exists and belongs to user
        const lead = await prisma.lead.findFirst({
            where: {
                id: leadId,
                userId
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                leadStatus: true,
                score: true,
            }
        })

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        // ── 2. Intelligence Queries (Round 1: Metrics & Paging) ──
        // Using current schema: TrackingEvent (sessions), LeadEvent (events); no VisitorSession/RevenueTransaction
        const [
            totalSessionsResult,
            lastActivityRaw,
            heatScoreRaw,
            stageChecksRaw,
            sessionsFromTracking,
            sessionsPageFromTracking
        ] = await Promise.all([
            // Total sessions: distinct sessionIds from TrackingEvent for this lead
            prisma.trackingEvent.groupBy({
                by: ['sessionId'],
                where: { leadId },
            }),
            // Last Activity from LeadEvent
            prisma.$queryRaw<LastActivityRaw[]>`
                SELECT MAX("timestamp") as last_activity
                FROM "LeadEvent"
                WHERE "leadId" = ${leadId}
            `,
            // Heat Score from LeadEvent
            prisma.$queryRaw<HeatScoreRaw[]>`
                SELECT 
                    COALESCE(SUM(
                        CASE 
                            WHEN "type" = 'page_view' THEN 1
                            WHEN "type" = 'cta_click' THEN 5
                            WHEN "type" = 'demo_request' THEN 10
                            WHEN "type" = 'add_to_cart' THEN 15
                            WHEN "type" = 'payment_intent_created' THEN 25
                            WHEN "type" = 'payment_completed' THEN 50
                            ELSE 0
                        END
                    ), 0)::int as heat_score
                FROM "LeadEvent"
                WHERE "leadId" = ${leadId}
            `,
            // Stage checks from LeadEvent
            prisma.$queryRaw<StageExistsRaw[]>`
                SELECT 
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" = 'payment_completed') as has_payment,
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" = 'add_to_cart') as has_cart,
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" = 'demo_request') as has_demo,
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" IN ('form_submit', 'contact_form_submit')) as has_form
            `,
            // Sessions list: aggregate TrackingEvent by sessionId (id = sessionId, startedAt = min createdAt)
            prisma.trackingEvent.groupBy({
                by: ['sessionId'],
                where: { leadId },
                _min: { createdAt: true },
            }),
            // Paged sessions (same, with skip/take via raw or findMany then group in app - use findMany + group in memory for simplicity)
            prisma.trackingEvent.findMany({
                where: { leadId },
                select: { sessionId: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
            }),
        ])

        const totalSessions = totalSessionsResult.length
        // Dedupe by sessionId for paged sessions and take pageSize
        const sessionIdsSeen = new Set<string>()
        const sessionsPageRaw: { sessionId: string; createdAt: Date }[] = []
        for (const row of sessionsPageFromTracking) {
            if (sessionIdsSeen.has(row.sessionId)) continue
            sessionIdsSeen.add(row.sessionId)
            sessionsPageRaw.push({ sessionId: row.sessionId, createdAt: row.createdAt })
        }
        const pagedSlice = sessionsPageRaw.slice((page - 1) * pageSize, page * pageSize)

        // Build sessions list compatible with previous shape (id, startedAt; no utmSource/duration in TrackingEvent)
        const sessions = sessionsFromTracking.map((g) => ({
            id: g.sessionId,
            startedAt: g._min.createdAt,
            durationSeconds: null as number | null,
            pageViews: null as number | null,
            isBounce: null as boolean | null,
            utmSource: null as string | null,
        }))
        const revenue: Array<{ orderId: string; amount: number; createdAt: Date }> = []
        const totalRevenueAgg = { _sum: { amount: null as number | null } }
        const firstTouchRaw: FirstTouchRaw[] = [{ utmSource: 'direct', utmMedium: null, utmCampaign: null }]

        // ── 3. Timeline: LeadEvent has no sessionId; return one segment of events for the lead (paged)
        let timeline: TimelineRaw[] = []
        if (pagedSlice.length > 0) {
            const leadEvents = await prisma.leadEvent.findMany({
                where: { leadId },
                orderBy: { timestamp: 'asc' },
                select: { type: true, timestamp: true },
                take: 100,
            })
            timeline = [{
                sessionId: pagedSlice[0]?.sessionId ?? 'lead',
                events: leadEvents.map((e) => ({ type: e.type, createdAt: e.timestamp.toISOString() })),
            }]
        }

        // ── 4. Data Processing ────────────────────────────

        // Calculate auto stage
        let stageAuto = 'Visitor'
        const checks = stageChecksRaw[0]
        if (checks.has_payment) stageAuto = 'Customer'
        else if (checks.has_cart) stageAuto = 'High Intent'
        else if (checks.has_demo) stageAuto = 'SQL'
        else if (checks.has_form) stageAuto = 'MQL'

        const totalPages = Math.max(1, Math.ceil(totalSessions / pageSize))

        // Format result
        return NextResponse.json({
            identity: {
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                createdAt: lead.createdAt,
                status: lead.leadStatus,
                score: lead.score,
            },
            source: firstTouchRaw[0] || {
                utmSource: 'direct',
                utmMedium: null,
                utmCampaign: null
            },
            metrics: {
                heatScore: heatScoreRaw[0]?.heat_score || 0,
                sessionsCount: totalSessions,
                totalRevenue: totalRevenueAgg._sum.amount ?? 0,
                lastActivity: lastActivityRaw[0]?.last_activity || null,
                stageAuto
            },
            sessions,
            revenue: revenue.map((r: { orderId: string; amount: number; createdAt: Date }) => ({
                ...r,
                amount: Number(r.amount) // Ensure Number
            })),
            timeline,
            pagination: {
                page,
                pageSize,
                totalSessions,
                totalPages,
                hasNext: page < totalPages
            },
            metadata: {
                generatedAt: new Date().toISOString()
            }
        })

    } catch (error) {
        logger.error('lead_insights', 'fetch_failed', undefined, {
            error: (error as Error).message
        })
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
