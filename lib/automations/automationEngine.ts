/**
 * Automation Engine — Core orchestrator
 *
 * Flow:
 * 1. Fetch active rules for tenant
 * 2. Match triggers (ON_EVENT or ON_SCORE_THRESHOLD)
 * 3. Evaluate AND conditions against lead snapshot
 * 4. Execute matched actions
 * 5. Record execution for audit trail
 *
 * Called AFTER the scoring transaction commits — never blocks scoring.
 * Each rule is processed independently — one failure doesn't stop others.
 */

import { prisma } from '@/lib/prisma'
import type {
    AutomationContext,
    AutomationRuleData,
    OnEventTrigger,
    OnScoreThresholdTrigger,
    Condition,
    AutomationAction,
    ExecutionResult,
} from './automation.types'
import { evaluateConditions } from './conditionEvaluator'
import { executeActions } from './actionExecutor'

/**
 * Process all active automation rules for a given event context.
 *
 * @param ctx - Event context (userId, lead snapshot, event type, score change)
 * @returns Array of execution results for each matched rule
 */
export async function processAutomations(
    ctx: AutomationContext
): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = []

    try {
        // ── 1. Fetch active rules for this tenant ────────
        const rawRules = await prisma.automationRule.findMany({
            where: {
                userId: ctx.userId,
                isActive: true,
            },
            orderBy: { createdAt: 'asc' },
        })

        if (rawRules.length === 0) return results

        // ── 2. Parse and process each rule ───────────────
        for (const raw of rawRules) {
            try {
                const rule = parseRule(raw)
                const matched = matchesTrigger(rule, ctx)

                if (!matched) continue

                // ── 3. Evaluate conditions ───────────────────
                const passes = evaluateConditions(rule.conditions, ctx.lead)

                if (!passes) continue

                // ── 4. Check deduplication ───────────────────
                // For ON_SCORE_THRESHOLD: prevent re-execution if already executed
                // for this lead at this threshold
                if (rule.triggerType === 'ON_SCORE_THRESHOLD') {
                    const alreadyExecuted = await prisma.automationExecution.findFirst({
                        where: {
                            automationId: rule.id,
                            leadId: ctx.lead.id,
                            status: 'SUCCESS',
                        },
                        select: { id: true },
                    })

                    if (alreadyExecuted) continue
                }

                // ── 5. Execute actions ───────────────────────
                const actionResults = await executeActions(
                    rule.actions,
                    ctx.lead,
                    ctx.userId
                )

                const hasFailed = actionResults.some((r) => r.status === 'FAILED')
                const failedMessages = actionResults
                    .filter((r) => r.status === 'FAILED')
                    .map((r) => `${r.type}: ${r.error}`)
                    .join('; ')

                // ── 6. Record execution ──────────────────────
                await prisma.automationExecution.create({
                    data: {
                        automationId: rule.id,
                        leadId: ctx.lead.id,
                        status: hasFailed ? 'FAILED' : 'SUCCESS',
                        errorMessage: hasFailed ? failedMessages : null,
                    },
                })

                results.push({
                    automationId: rule.id,
                    automationName: rule.name,
                    status: hasFailed ? 'FAILED' : 'SUCCESS',
                    errorMessage: hasFailed ? failedMessages : undefined,
                    actionsExecuted: actionResults.filter((r) => r.status === 'SUCCESS').length,
                })
            } catch (err) {
                // Single rule failure doesn't stop other rules
                const error = err as Error
                console.error(`[AutomationEngine] Rule ${raw.id} failed:`, error.message)

                try {
                    await prisma.automationExecution.create({
                        data: {
                            automationId: raw.id,
                            leadId: ctx.lead.id,
                            status: 'FAILED',
                            errorMessage: error.message,
                        },
                    })
                } catch {
                    // If even logging fails, just continue
                }

                results.push({
                    automationId: raw.id,
                    automationName: raw.name,
                    status: 'FAILED',
                    errorMessage: error.message,
                    actionsExecuted: 0,
                })
            }
        }
    } catch (err) {
        // Top-level fetch failure (DB down, etc.)
        const error = err as Error
        console.error('[AutomationEngine] Fatal error:', error.message)
    }

    return results
}

/* ── Trigger Matching ───────────────────────────────── */

function matchesTrigger(rule: AutomationRuleData, ctx: AutomationContext): boolean {
    switch (rule.triggerType) {
        case 'ON_EVENT': {
            const trigger = rule.triggerValue as OnEventTrigger
            return trigger.eventType === ctx.eventType
        }

        case 'ON_SCORE_THRESHOLD': {
            const trigger = rule.triggerValue as OnScoreThresholdTrigger
            // Only fires when score CROSSES the threshold upward:
            // previousScore < threshold AND newScore >= threshold
            return ctx.previousScore < trigger.score && ctx.newScore >= trigger.score
        }

        default:
            return false
    }
}

/* ── Rule Parser ────────────────────────────────────── */

interface RawRule {
    id: string
    userId: string
    name: string
    triggerType: string
    triggerValue: unknown
    conditions: unknown
    actions: unknown
    isActive: boolean
}

function parseRule(raw: RawRule): AutomationRuleData {
    return {
        id: raw.id,
        userId: raw.userId,
        name: raw.name,
        triggerType: raw.triggerType as AutomationRuleData['triggerType'],
        triggerValue: raw.triggerValue as AutomationRuleData['triggerValue'],
        conditions: (Array.isArray(raw.conditions) ? raw.conditions : []) as Condition[],
        actions: (Array.isArray(raw.actions) ? raw.actions : []) as AutomationAction[],
        isActive: raw.isActive,
    }
}
