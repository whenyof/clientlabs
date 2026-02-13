/**
 * Client 360 — Base data loader (server-side only)
 *
 * Loads the essential client record by id + userId.
 * Returns null when client is not found or does not belong to the user.
 */

import { prisma } from "@/lib/prisma"
import type { Client360Base } from "../types"

export async function getClient360Base(
    clientId: string,
    userId: string
): Promise<Client360Base | null> {
    const client = await prisma.client.findFirst({
        where: {
            id: clientId,
            userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            taxId: true,
            companyName: true,
            legalName: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            status: true,
            riskLevel: true,
            createdAt: true,
        },
    })

    if (!client) return null

    return {
        ...client,
        createdAt: client.createdAt.toISOString(),
    }
}
