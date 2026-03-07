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
        const [
            firstTouchRaw,
            totalSessions,
            totalRevenueAgg,
            lastActivityRaw,
            heatScoreRaw,
            stageChecksRaw,
            sessions,
            revenue,
            sessionsPage
        ] = await Promise.all([
            // Paso 3: First Touch (SQL)
            prisma.$queryRaw<FirstTouchRaw[]>`
                SELECT "utmSource", "utmMedium", "utmCampaign"
                FROM "VisitorSession"
                WHERE "leadId" = ${leadId}
                ORDER BY "startedAt" ASC
                LIMIT 1
            `,
            // Paso A: Total Sessions Count
            prisma.visitorSession.count({ where: { leadId } }),
            // Paso 4b: Total Revenue
            prisma.revenueTransaction.aggregate({
                where: { leadId },
                _sum: { amount: true }
            }),
            // Paso 4c: Last Activity (SQL)
            prisma.$queryRaw<LastActivityRaw[]>`
                SELECT MAX("timestamp") as last_activity
                FROM "LeadEvent"
                WHERE "leadId" = ${leadId}
            `,
            // Paso 4d: Heat Score (SQL)
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
            // Paso 5: Stage Automatic (EXISTS check)
            prisma.$queryRaw<StageExistsRaw[]>`
                SELECT 
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" = 'payment_completed') as has_payment,
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" = 'add_to_cart') as has_cart,
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" = 'demo_request') as has_demo,
                    EXISTS (SELECT 1 FROM "LeadEvent" WHERE "leadId" = ${leadId} AND "type" IN ('form_submit', 'contact_form_submit')) as has_form
            `,
            // Paso 6: Sessions List (Backward compatibility)
            prisma.visitorSession.findMany({
                where: { leadId },
                orderBy: { startedAt: 'asc' },
                select: {
                    id: true,
                    startedAt: true,
                    durationSeconds: true,
                    pageViews: true,
                    isBounce: true,
                    utmSource: true
                }
            }),
            // Paso 7: Revenue Detail
            prisma.revenueTransaction.findMany({
                where: { leadId },
                orderBy: { createdAt: 'desc' },
                select: {
                    orderId: true,
                    amount: true,
                    createdAt: true
                }
            }),
            // Paso B: Paged Sessions
            prisma.visitorSession.findMany({
                where: { leadId },
                orderBy: { startedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    startedAt: true,
                    endedAt: true,
                    lastActivityAt: true
                }
            })
        ])

        // ── 3. Timeline Query (Round 2: Events for Paged Sessions) ──
        let timeline: TimelineRaw[] = []
        if (sessionsPage.length > 0) {
            const sessionIds = sessionsPage.map((s: { id: string }) => s.id)

            /** 
             * Paso C: Targeted Timeline (SQL JSON_AGG)
             * Only fetches events for the specific session page IDs.
             * Hardened with direct sessionId JOIN for 100% precision.
             */
            timeline = await prisma.$queryRaw<TimelineRaw[]>`
                SELECT 
                    vs."id" as "sessionId",
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'type', le."type",
                                'createdAt', le."timestamp"
                            ) ORDER BY le."timestamp" ASC
                        ),
                        '[]'::json
                    ) as events
                FROM "VisitorSession" vs
                LEFT JOIN "LeadEvent" le ON le."sessionId" = vs."id"
                WHERE vs.id = ANY(${sessionIds})
                GROUP BY vs.id
                ORDER BY vs."startedAt" DESC
            `
        }

        // ── 4. Data Processing ────────────────────────────

        // Calculate auto stage
        let stageAuto = 'Visitor'
        const checks = stageChecksRaw[0]
        if (checks.has_payment) stageAuto = 'Customer'
        else if (checks.has_cart) stageAuto = 'High Intent'
        else if (checks.has_demo) stageAuto = 'SQL'
        else if (checks.has_form) stageAuto = 'MQL'

        const totalPages = Math.ceil(totalSessions / pageSize)

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
