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
                priorityLevel: true,
                status: true,
                leadStatus: true,
                source: true,
                tags: true,
                name: true,
                phone: true,
                category: true,
                temperature: true,
                converted: true,
                companyName: true,
                companyDomain: true,
                companySize: true,
                industry: true,
                jobTitle: true,
                enrichmentStatus: true,
            },
        })

        if (!lead) return null

        // Multi-tenant guard
        if (lead.userId !== userId) return null

        // No email = nothing to enrich
        if (!lead.email) return null

        // Already enriched = skip
        if (lead.enrichmentStatus === 'COMPLETED') return null

        // ── 2. Mark as PROCESSING ────────────────────────
        await prisma.lead.update({
            where: { id: leadId },
            data: { enrichmentStatus: 'PROCESSING' },
        })

        // ── 3. Run internal enrichment ───────────────────
        const enrichedData = await internalProvider.enrich(lead.email)

        // ── 4. Calculate score adjustments ────────────────
        const scoreAdjustments = calculateEnrichmentScore(lead.email, enrichedData)
        const totalScoreDelta = scoreAdjustments.reduce((sum, adj) => sum + adj.delta, 0)

        // ── 5. Build update payload (never overwrite existing values) ──
        const fieldsUpdated: string[] = []
        const updateData: Record<string, unknown> = {}

        if (enrichedData.companyName && !lead.companyName) {
            updateData.companyName = enrichedData.companyName
            fieldsUpdated.push('companyName')
        }
        if (enrichedData.companyDomain && !lead.companyDomain) {
            updateData.companyDomain = enrichedData.companyDomain
            fieldsUpdated.push('companyDomain')
        }
        if (enrichedData.companySize && !lead.companySize) {
            updateData.companySize = enrichedData.companySize
            fieldsUpdated.push('companySize')
        }
        if (enrichedData.industry && !lead.industry) {
            updateData.industry = enrichedData.industry
            fieldsUpdated.push('industry')
        }
        if (enrichedData.jobTitle && !lead.jobTitle) {
            updateData.jobTitle = enrichedData.jobTitle
            fieldsUpdated.push('jobTitle')
        }

        // ── 6. Apply score + enrichment fields atomically ─
        const previousScore = lead.score
        const newRawScore = previousScore + totalScoreDelta
        const newScore = clampScore(newRawScore)
        const newPriority = recalculatePriority(newScore)

        await prisma.lead.update({
            where: { id: leadId },
            data: {
                ...updateData,
                score: newScore,
                priorityLevel: newPriority,
                enrichmentStatus: 'COMPLETED',
                enrichmentSource: 'internal',
                enrichedAt: new Date(),
            },
        })

        // ── 7. Log enrichment result ─────────────────────
        await prisma.leadEnrichmentLog.create({
            data: {
                leadId,
                userId,
                source: 'INTERNAL',
                rawResponse: enrichedData as Prisma.InputJsonValue,
                status: 'SUCCESS',
                fieldsUpdated,
            },
        })

        // ── 8. Trigger automations if score changed ──────
        if (totalScoreDelta > 0) {
            const leadSnapshot: LeadSnapshot = {
                id: lead.id,
                userId: lead.userId,
                score: newScore,
                priorityLevel: newPriority,
                status: lead.status,
                leadStatus: lead.leadStatus ?? 'NEW',
                source: lead.source,
                tags: lead.tags,
                email: lead.email,
                name: lead.name,
                phone: lead.phone,
                category: lead.category,
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
                data: { enrichmentStatus: 'FAILED' },
            })

            await prisma.leadEnrichmentLog.create({
                data: {
                    leadId,
                    userId,
                    source: 'INTERNAL',
                    status: 'FAILED',
                    errorMessage: error.message,
                },
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
