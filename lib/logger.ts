/**
 * Structured Logger — Centralized, JSON-formatted logging.
 *
 * Rules:
 * - Never log emails
 * - Never log full orderId (truncate to first 8 chars)
 * - Never log full visitorId (truncate to first 8 chars)
 * - Never log full payloads
 * - Always include timestamp
 * - All output goes through console.log/warn/error (structured JSON)
 */

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogEntry {
    level: LogLevel
    source: string
    event: string
    userId?: string
    metadata?: Record<string, unknown>
}

function sanitize(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!meta) return undefined
    const clean: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(meta)) {
        // Strip sensitive fields
        if (key === 'email' || key === 'password') continue
        // Truncate IDs
        if ((key === 'orderId' || key === 'visitorId' || key === 'sessionId') && typeof val === 'string') {
            clean[key] = val.substring(0, 8) + '…'
            continue
        }
        clean[key] = val
    }
    return clean
}

function log(entry: LogEntry): void {
    const record = {
        ts: new Date().toISOString(),
        level: entry.level,
        src: entry.source,
        evt: entry.event,
        ...(entry.userId ? { uid: entry.userId.substring(0, 8) + '…' } : {}),
        ...(entry.metadata ? { meta: sanitize(entry.metadata) } : {}),
    }

    const json = JSON.stringify(record)

    switch (entry.level) {
        case 'error':
            console.error(json)
            break
        case 'warn':
            console.warn(json)
            break
        default:
            console.log(json)
    }
}

export const logger = {
    info(source: string, event: string, userId?: string, metadata?: Record<string, unknown>): void {
        log({ level: 'info', source, event, userId, metadata })
    },
    warn(source: string, event: string, userId?: string, metadata?: Record<string, unknown>): void {
        log({ level: 'warn', source, event, userId, metadata })
    },
    error(source: string, event: string, userId?: string, metadata?: Record<string, unknown>): void {
        log({ level: 'error', source, event, userId, metadata })
    },
}
