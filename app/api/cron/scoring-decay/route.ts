export const maxDuration = 10
/**
 * Cron Endpoint: POST /api/cron/scoring-decay
 *
 * Applies daily scoring decay to all leads across all users.
 * Protected by CRON_SECRET header — cannot be called from browser.
 *
 * Expected caller: Vercel Cron, external cron service, or internal scheduler.
 */

import { NextRequest, NextResponse } from 'next/server'
import { applyGlobalDailyDecay } from '@/lib/events/scoringDecay'
import { logger } from '@/lib/logger'
import { increment } from '@/lib/metrics'

export async function POST(request: NextRequest) {
    // Verify CRON_SECRET
    const secret = request.headers.get('authorization')?.replace('Bearer ', '')
    const expected = process.env.CRON_SECRET

    if (!expected || secret !== expected) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await applyGlobalDailyDecay()
        increment('totalCronRuns')
        logger.info('cron', 'scoring_decay_complete', undefined, {
            tenants: result.tenants,
            totalDecayed: result.totalDecayed,
        })
        return NextResponse.json({
            ok: true,
            tenants: result.tenants,
            totalDecayed: result.totalDecayed,
        })
    } catch (err) {
        logger.error('cron', 'scoring_decay_failed', undefined, { error: (err as Error).message })
        return NextResponse.json({ error: 'Decay failed' }, { status: 500 })
    }
}

// Block GET requests
export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
