/**
 * Action Executor — Executes automation actions on a lead
 *
 * Supports:
 * - CHANGE_STATUS → update lead.leadStatus (enum, single source of truth)
 * - ASSIGN_USER → update lead.userId (reassign)
 * - ADD_TAG → push to lead.tags (deduped)
 * - SEND_WEBHOOK → fire-and-forget POST with lead data
 *
 * Each action is independent — one failure doesn't block others.
 * Results are collected for logging.
 */

import { prisma } from '@/lib/prisma'
import type { AutomationAction, LeadSnapshot } from './automation.types'

interface ActionResult {
    type: string
    status: 'SUCCESS' | 'FAILED'
    error?: string
}

/**
 * Execute all actions for an automation rule.
 * Returns individual results for each action.
 */
export async function executeActions(
    actions: AutomationAction[],
    lead: LeadSnapshot,
    userId: string
): Promise<ActionResult[]> {
    const results: ActionResult[] = []

    for (const action of actions) {
        try {
            await executeSingleAction(action, lead, userId)
            results.push({ type: action.type, status: 'SUCCESS' })
        } catch (err) {
            const error = err as Error
            results.push({
                type: action.type,
                status: 'FAILED',
                error: error.message,
            })
        }
    }

    return results
}

/**
 * Execute a single action.
 */
async function executeSingleAction(
    action: AutomationAction,
    lead: LeadSnapshot,
    userId: string
): Promise<void> {
    switch (action.type) {
        case 'CHANGE_STATUS':
            await changeStatus(lead.id, action.value)
            return

        case 'ASSIGN_USER':
            await assignUser(lead.id, action.value)
            return

        case 'ADD_TAG':
            await addTag(lead.id, action.value)
            return

        case 'SEND_WEBHOOK':
            await sendWebhook(action.value, lead, userId)
            return

        default:
            throw new Error(`Unknown action type: ${action.type}`)
    }
}

/* ── CHANGE_STATUS ──────────────────────────────────── */

async function changeStatus(leadId: string, newStatus: string): Promise<void> {
    await prisma.lead.update({
        where: { id: leadId },
        data: {
            leadStatus: newStatus as any, // LeadStatus enum: NEW | CONTACTED | INTERESTED | QUALIFIED | LOST | CONVERTED
            status: newStatus,            // @deprecated — kept in sync for backward compatibility
        },
    })
}

/* ── ASSIGN_USER ────────────────────────────────────── */

async function assignUser(leadId: string, assignToUserId: string): Promise<void> {
    // Verify the target user exists
    const user = await prisma.user.findUnique({
        where: { id: assignToUserId },
        select: { id: true },
    })

    if (!user) {
        throw new Error(`Target user ${assignToUserId} not found`)
    }

    await prisma.lead.update({
        where: { id: leadId },
        data: { userId: assignToUserId },
    })
}

/* ── ADD_TAG ────────────────────────────────────────── */

async function addTag(leadId: string, tag: string): Promise<void> {
    const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { tags: true },
    })

    if (!lead) throw new Error(`Lead ${leadId} not found`)

    // Deduplicate: only add if not already present
    if (lead.tags.includes(tag)) return

    await prisma.lead.update({
        where: { id: leadId },
        data: {
            tags: { push: tag },
        },
    })
}

/* ── SEND_WEBHOOK ───────────────────────────────────── */

const WEBHOOK_TIMEOUT_MS = 10_000

async function sendWebhook(
    url: string,
    lead: LeadSnapshot,
    userId: string
): Promise<void> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ClientLabs-Source': 'automation',
            },
            body: JSON.stringify({
                type: 'automation_webhook',
                timestamp: new Date().toISOString(),
                accountId: userId,
                lead: {
                    id: lead.id,
                    email: lead.email,
                    name: lead.name,
                    phone: lead.phone,
                    score: lead.score,
                    status: lead.leadStatus, // Uses leadStatus (single source of truth)
                    tags: lead.tags,
                    source: lead.source,
                },
            }),
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`Webhook responded with status ${response.status}`)
        }
    } finally {
        clearTimeout(timeout)
    }
}
