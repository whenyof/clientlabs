/**
 * Enrichment Engine — Background lead enrichment orchestrator
 *
 * Called AFTER scoring transaction commits via setImmediate.
 * Never blocks the main event registration flow.
 *
 * Flow:
 * 1. Verify lead has email and needs enrichment
 * 2. Mark status = PROCESSING
 * 3. Run internal enrichment (heuristic)
 * 4. Apply score adjustments (atomic increment + priority recalc)
 * 5. Save enriched fields (never overwrite existing manual data)
 * 6. Log enrichment result
 * 7. Mark status = COMPLETED or FAILED
 * 8. Trigger automations if score changed
 *
 * Prepared for future migration to Redis/BullMQ queue.
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { recalculatePriority, clampScore, SCORE_MAX } from '@/lib/events/priorityLogic'
import { processAutomations } from '@/lib/automations/automationEngine'
import { InternalEnrichmentProvider, calculateEnrichmentScore } from './providers/internalProvider'
import type { EnrichmentResult } from './enrichment.types'
import type { LeadSnapshot } from '@/lib/automations/automation.types'

const internalProvider = new InternalEnrichmentProvider()

/**
 * Trigger enrichment for a lead. Designed to run in background.
 *
 * @param leadId - Lead to enrich
 * @param userId - Tenant ID (multi-tenant guard)
 */
export async function triggerEnrichment(
    leadId: string,
    userId: string
): Promise<EnrichmentResult | null> {
    try {
        // ── 1. Fetch lead and verify eligibility ─────────
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: {
                id: true,
                userId: true,
                email: true,
                score: true,
                priority: true,
                status: true,
                leadStatus: true,
                source: true,
                tags: true,
                name: true,
                phone: true,
                category: true,
                temperature: true,
                converted: true,
                validationStatus: true,
                metadata: true,
            },
        })

        if (!lead) return null

        // Multi-tenant guard
        if (lead.userId !== userId) return null

        // No email = nothing to enrich
        if (!lead.email) return null

        // Already enriched = skip
        if (lead.validationStatus === 'COMPLETED') return null

        // ── 2. Mark as PROCESSING ────────────────────────
        await prisma.lead.update({
            where: { id: leadId },
            data: { validationStatus: 'PROCESSING' },
        })

        // ── 3. Run internal enrichment ───────────────────
        const enrichedData = await internalProvider.enrich(lead.email)

        // ── 4. Calculate score adjustments ────────────────
        const scoreAdjustments = calculateEnrichmentScore(lead.email, enrichedData)
        const totalScoreDelta = scoreAdjustments.reduce((sum, adj) => sum + adj.delta, 0)

        // ── 5. Build update payload (Lead has no company* fields; store in metadata if needed) ──
        const fieldsUpdated: string[] = []
        const updateData: Record<string, unknown> = {}
        const metadata = (lead.metadata as Record<string, unknown>) ?? {}
        if (enrichedData.companyName) {
            updateData.metadata = { ...metadata, companyName: enrichedData.companyName } as Prisma.InputJsonValue
            fieldsUpdated.push('companyName')
        }
        if (enrichedData.companyDomain) {
            const m = (updateData.metadata as Record<string, unknown>) ?? metadata
            updateData.metadata = { ...m, companyDomain: enrichedData.companyDomain } as Prisma.InputJsonValue
            fieldsUpdated.push('companyDomain')
        }

        // ── 6. Apply score + priority atomically ─
        const previousScore = lead.score
        const newRawScore = previousScore + totalScoreDelta
        const newScore = clampScore(newRawScore)
        const newPriority = recalculatePriority(newScore)

        await prisma.lead.update({
            where: { id: leadId },
            data: {
                ...updateData,
                score: newScore,
                priority: String(newPriority),
                validationStatus: 'COMPLETED',
            },
        })

        // ── 7. Log enrichment result (LeadEnrichmentLog model removed; skip) ──

        // ── 8. Trigger automations if score changed ──────
        if (totalScoreDelta > 0) {
            const leadSnapshot: LeadSnapshot = {
                id: lead.id,
                userId: lead.userId,
                score: newScore,
                priorityLevel: newPriority,
                status: lead.leadStatus ?? 'NEW', // @deprecated — synced from leadStatus
                leadStatus: lead.leadStatus ?? 'NEW',
                source: lead.source,
                tags: lead.tags,
                email: lead.email ?? null,
                name: lead.name ?? null,
                phone: lead.phone ?? null,
                category: lead.category ?? null,
                temperature: lead.temperature ?? null,
                converted: lead.converted,
            }

            await processAutomations({
                userId,
                lead: leadSnapshot,
                eventType: 'enrichment_completed',
                previousScore,
                newScore,
            })
        }

        return {
            leadId,
            source: 'INTERNAL',
            status: 'SUCCESS',
            data: enrichedData,
            scoreAdjustments,
            totalScoreDelta,
            fieldsUpdated,
        }
    } catch (err) {
        const error = err as Error
        console.error(`[EnrichmentEngine] Failed for lead ${leadId}:`, error.message)

        // Mark as FAILED
        try {
            await prisma.lead.update({
                where: { id: leadId },
                data: { validationStatus: 'FAILED' },
            })
        } catch {
            // If even logging fails, just return
        }

        return {
            leadId,
            source: 'INTERNAL',
            status: 'FAILED',
            data: {},
            scoreAdjustments: [],
            totalScoreDelta: 0,
            fieldsUpdated: [],
            errorMessage: error.message,
        }
    }
}
