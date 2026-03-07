/**
 * Automation Hook — Bridge between event system and automation engine
 *
 * Called AFTER the scoring transaction commits.
 * Runs asynchronously — never blocks the event registration flow.
 *
 * Responsibilities:
 * 1. Build lead snapshot for condition evaluation
 * 2. Call processAutomations with full context
 * 3. Log results (errors are caught, never thrown)
 */

import { prisma } from '@/lib/prisma'
import { processAutomations } from '@/lib/automations/automationEngine'
import type { AutomationEventPayload } from './leadEvent.types'
import type { LeadSnapshot } from '@/lib/automations/automation.types'

/**
 * Trigger automation processing for a lead event.
 *
 * @param payload - Full event context from LeadEventService
 */
export async function triggerAutomation(
    payload: AutomationEventPayload
): Promise<void> {
    try {
        // Fetch fresh lead data for condition evaluation
        const lead = await prisma.lead.findUnique({
            where: { id: payload.leadId },
            select: {
                id: true,
                userId: true,
                score: true,
                priorityLevel: true,
                status: true,
                leadStatus: true,
                source: true,
                tags: true,
                email: true,
                name: true,
                phone: true,
                category: true,
                temperature: true,
                converted: true,
            },
        })

        if (!lead) return

        const leadSnapshot: LeadSnapshot = {
            ...lead,
            leadStatus: lead.leadStatus ?? 'NEW',
            temperature: lead.temperature ?? null,
        }

        await processAutomations({
            userId: payload.userId,
            lead: leadSnapshot,
            eventType: payload.eventType,
            previousScore: payload.scoreBreakdown.previousScore,
            newScore: payload.scoreBreakdown.finalScore,
        })
    } catch (err) {
        // Automation failures must NEVER propagate
        console.error('[AutomationHook] Error:', err)
    }
}
