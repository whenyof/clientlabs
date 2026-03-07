import { prisma } from '@/lib/prisma'

/**
 * Normalizes a lead source by finding or creating a record in LeadSource.
 * 
 * @param userId - Owner of the source
 * @param sourceType - web, whatsapp, facebook, import, webhook, manual
 * @param name - Friendly name (e.g. "Main Website", "Marketing campaign")
 * @param config - Optional JSON config for the source
 * @returns The cuid of the resolved LeadSource
 */
export async function resolveLeadSource(
    userId: string,
    sourceType: string,
    name: string,
    config?: any
): Promise<string> {
    // 1. Try to find existing
    const existing = await prisma.leadSource.findFirst({
        where: {
            userId,
            type: sourceType.toLowerCase(),
            name: name.trim()
        },
        select: { id: true }
    })

    if (existing) {
        return existing.id
    }

    // 2. Create if not found
    const source = await prisma.leadSource.create({
        data: {
            userId,
            type: sourceType.toLowerCase(),
            name: name.trim(),
            status: 'active',
            config: config || {}
        },
        select: { id: true }
    })

    return source.id
}
