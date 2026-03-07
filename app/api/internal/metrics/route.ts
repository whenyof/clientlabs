/**
 * Internal Metrics Endpoint: GET /api/internal/metrics
 *
 * Returns in-memory operational counters.
 * Protected by CRON_SECRET bearer token — not publicly accessible.
 * Never exposes sensitive data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getMetrics } from '@/lib/metrics'

export async function GET(request: NextRequest) {
    const secret = request.headers.get('authorization')?.replace('Bearer ', '')
    const expected = process.env.CRON_SECRET

    if (!expected || secret !== expected) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(getMetrics())
}

// Block POST
export async function POST() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
