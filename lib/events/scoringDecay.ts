/**
 * Scoring Decay — Daily score reduction (PRODUCTION, Bulk SQL)
 *
 * Rule: -1 point per day without activity. Never below 0.
 * Priority always recalculated after decay.
 *
 * Implementation: single $executeRaw UPDATE per tenant.
 * No per-lead queries. Scales to 100k+ leads.
 *
 * Designed for Vercel Cron, external scheduler, or manual invocation.
 */

import { prisma } from '@/lib/prisma'
import { SCORE_MIN } from './priorityLogic'
import type { DecayResult } from './leadEvent.types'

/** Points to subtract per day of inactivity */
const DECAY_POINTS_PER_DAY = 1

/**
 * Apply daily decay to all leads for a specific tenant using bulk SQL.
 *
 * Single query that:
 * 1. Identifies leads with score > 0 and no events in last 24h
 * 2. Decrements score by 1 (clamped to 0 via GREATEST)
 * 3. Recalculates priorityLevel using CASE expression
 * 4. Updates all matching leads in one statement
 *
 * @param userId - Tenant ID
 * @returns Decay execution report
 */
export async function applyDailyDecay(userId: string): Promise<DecayResult> {
    const executedAt = new Date()
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Single bulk UPDATE: decrement score, recalculate priority
    // Excludes leads that have any event in the last 24h
    const affectedCount = await prisma.$executeRaw`
    UPDATE "Lead"
    SET
      "score" = GREATEST(0, "score" - ${DECAY_POINTS_PER_DAY}),
      "priorityLevel" = CASE
        WHEN GREATEST(0, "score" - ${DECAY_POINTS_PER_DAY}) >= 100 THEN 4
        WHEN GREATEST(0, "score" - ${DECAY_POINTS_PER_DAY}) >= 60  THEN 3
        WHEN GREATEST(0, "score" - ${DECAY_POINTS_PER_DAY}) >= 25  THEN 2
        ELSE 1
      END,
      "updatedAt" = NOW()
    WHERE "userId" = ${userId}
      AND "score" > ${SCORE_MIN}
      AND "id" NOT IN (
        SELECT DISTINCT "leadId"
        FROM "LeadEvent"
        WHERE "userId" = ${userId}
          AND "timestamp" >= ${oneDayAgo}
      )
  `

    return {
        leadsProcessed: affectedCount,
        leadsDecayed: affectedCount,
        executedAt,
    }
}

/**
 * Apply daily decay for ALL tenants.
 * Use this from a global cron job (e.g. Vercel Cron).
 *
 * Processes each tenant sequentially to avoid overwhelming the DB.
 */
export async function applyGlobalDailyDecay(): Promise<{
    tenants: number
    totalDecayed: number
    executedAt: Date
}> {
    const executedAt = new Date()

    // Get distinct tenant IDs that have leads with score > 0
    const tenants = await prisma.lead.groupBy({
        by: ['userId'],
        where: { score: { gt: SCORE_MIN } },
    })

    let totalDecayed = 0

    for (const tenant of tenants) {
        const result = await applyDailyDecay(tenant.userId)
        totalDecayed += result.leadsDecayed
    }

    // Mark STALLED all active leads inactive for > 14 days
    const stalledThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    await prisma.lead.updateMany({
        where: {
            leadStatus: { notIn: ["CONVERTED", "LOST", "STALLED"] },
            OR: [
                { lastActionAt: null },
                { lastActionAt: { lt: stalledThreshold } },
            ],
        },
        data: { leadStatus: "STALLED", status: "STALLED" },
    })

    return {
        tenants: tenants.length,
        totalDecayed,
        executedAt,
    }
}
