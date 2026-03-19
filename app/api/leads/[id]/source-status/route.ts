import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

/**
 * API Route: GET /api/leads/[id]/source-status
 * 
 * Provides real-time connection status for a specific lead.
 * Scoped to userId for multi-tenant safety.
 */
export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)
    const { id: leadId } = context.params

    try {
        // 🔐 Security: Auth check
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const userId = session.user.id

        // 🔍 Data Retrieval: using TrackingEvent (no VisitorSession in schema)
        const [lastTracking, sessionsGroup, eventsCount] = await Promise.all([
            prisma.trackingEvent.findFirst({
                where: { userId, leadId },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            }),
            prisma.trackingEvent.groupBy({
                by: ['sessionId'],
                where: { userId, leadId },
            }),
            prisma.leadEvent.count({
                where: { userId, leadId }
            })
        ])

        const lastActivityAt = lastTracking?.createdAt ? new Date(lastTracking.createdAt) : null
        const sessionsCount = sessionsGroup.length
        const now = new Date().getTime()
        const fiveMinutesAgo = now - 5 * 60 * 1000
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

        // 🧠 Status Derivation
        let status = "never_connected"
        if (lastActivityAt) {
            const time = lastActivityAt.getTime()
            if (time >= fiveMinutesAgo) {
                status = "connected"
            } else if (time >= twentyFourHoursAgo) {
                status = "active"
            } else {
                status = "inactive"
            }
        }

        return NextResponse.json({
            status,
            lastSeenAt: lastActivityAt,
            sessionsCount,
            eventsCount
        })

    } catch (error) {
        logger.error(
            'lead_source_status',
            'endpoint_error',
            session?.user?.id,
            { leadId, message: error instanceof Error ? error.message : 'unknown_error' }
        )
        return NextResponse.json(
            { error: "Internal server error while fetching lead status" },
            { status: 500 }
        )
    }
}
