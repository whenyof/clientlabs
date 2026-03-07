import { prisma } from '@/lib/prisma'

/**
 * Normalizes a lead source. LeadSource model removed from schema;
 * returns a deterministic string for the given inputs so callers keep working.
 */
export async function resolveLeadSource(
    userId: string,
    sourceType: string,
    name: string,
    _config?: unknown
): Promise<string> {
    // Stub: no LeadSource table; return deterministic id for compatibility
    const key = `${userId}:${sourceType.toLowerCase()}:${name.trim()}`
    return `source_${Buffer.from(key).toString('base64url').slice(0, 16)}`
}
