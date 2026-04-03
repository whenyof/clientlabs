export const maxDuration = 30
/**
 * API Route: POST /api/leads/[id]/retry-enrichment
 * Retriggers enrichment for a lead in background.
 * Multi-tenant enforcement.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { triggerEnrichment } from '@/lib/enrichment/enrichmentEngine'

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Multi-tenant: verify lead belongs to user
        const lead = await prisma.lead.findFirst({
            where: { id, userId: session.user.id },
            select: { id: true, email: true, validationStatus: true },
        })

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        if (!lead.email) {
            return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 })
        }

        // Reset status so enrichment can re-run
        await prisma.lead.update({
            where: { id },
            data: { validationStatus: 'PENDING' },
        })

        // Fire in background, non-blocking
        triggerEnrichment(id, session.user.id).catch((err) => {
            console.error('[retry-enrichment] Error:', err)
        })

        return NextResponse.json({ success: true, message: 'Enrichment retriggered' })
    } catch (error) {
        console.error('[POST /api/leads/:id/retry-enrichment]', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
