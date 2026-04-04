export const maxDuration = 10
/**
 * Health Endpoint: GET /api/health
 *
 * System health check for monitoring and uptime verification.
 * Checks: database connectivity, environment configuration.
 * Never exposes sensitive data or stack traces.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

const SYSTEM_VERSION = '1.0.0'

export async function GET() {
    const timestamp = new Date().toISOString()
    let dbStatus: 'connected' | 'error' = 'error'
    let dbLatencyMs = -1
    let globalStatus: 'ok' | 'degraded' = 'ok'

    // Database check
    try {
        const start = Date.now()
        await prisma.$queryRaw`SELECT 1`
        dbLatencyMs = Date.now() - start
        dbStatus = 'connected'
    } catch {
        dbStatus = 'error'
        globalStatus = 'degraded'
        logger.error('health', 'db_check_failed')
    }

    // Environment checks
    const cronConfigured = Boolean(process.env.CRON_SECRET)
    const databaseUrlExists = Boolean(process.env.DATABASE_URL)

    if (!cronConfigured || !databaseUrlExists) {
        globalStatus = 'degraded'
    }

    return NextResponse.json({
        status: globalStatus,
        timestamp,
        version: SYSTEM_VERSION,
        checks: {
            database: {
                status: dbStatus,
                latencyMs: dbLatencyMs,
            },
            cron: {
                configured: cronConfigured,
            },
            env: {
                databaseUrl: databaseUrlExists,
            },
        },
    })
}
