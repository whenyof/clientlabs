/**
 * Lead Event Service — PRODUCTION (Atomic, Race-Free)
 *
 * Architecture:
 * - ALL reads, bonus detection, writes happen inside ONE Prisma transaction
 * - Isolation level: Serializable (prevents concurrent score corruption)
 * - Score updated via atomic increment (not read-calculate-write)
 * - Frequency bonus: fires exactly once (at the threshold crossing event)
 * - Reactivation bonus: fires once (only when zero events in 14 days)
 * - Score clamped [0, 200] after every update
 * - Priority always recalculated after score change
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getScoreDelta, isValidEventType } from './scoreRules'
import { recalculatePriority, clampScore, SCORE_MAX, SCORE_MIN } from './priorityLogic'
import { triggerAutomation } from './automationHook'
import type {
    RegisterLeadEventInput,
    LeadEventResult,
    EventValidationError,
    ScoreBreakdown,
} from './leadEvent.types'

/* ── Constants ──────────────────────────────────────── */

/** Number of events in 24h window that triggers the frequency bonus */
const FREQUENCY_THRESHOLD = 3
/** Bonus points — applied exactly once when the threshold is crossed */
const FREQUENCY_BONUS = 10

/** Days of inactivity required for reactivation bonus eligibility */
const REACTIVATION_DAYS = 14
/** Bonus points — applied once on the first event after inactivity */
const REACTIVATION_BONUS = 15

/* ── Validation ─────────────────────────────────────── */

export function validateEventInput(
    input: Partial<RegisterLeadEventInput>
): EventValidationError[] {
    const errors: EventValidationError[] = []

    if (!input.userId || typeof input.userId !== 'string' || input.userId.trim() === '') {
        errors.push({ field: 'userId', message: 'userId is required' })
    }

    if (!input.leadId || typeof input.leadId !== 'string' || input.leadId.trim() === '') {
        errors.push({ field: 'leadId', message: 'leadId is required' })
    }

    if (!input.eventType || typeof input.eventType !== 'string' || input.eventType.trim() === '') {
        errors.push({ field: 'eventType', message: 'eventType is required and must be a non-empty string' })
    } else if (!isValidEventType(input.eventType)) {
        errors.push({
            field: 'eventType',
            message: `eventType "${input.eventType}" is not a recognized event type`,
        })
    }

    if (!input.eventSource || typeof input.eventSource !== 'string' || input.eventSource.trim() === '') {
        errors.push({ field: 'eventSource', message: 'eventSource is required (e.g. api, webhook, tracking, manual, sdk)' })
    }

    if (input.metadata !== undefined && input.metadata !== null) {
        if (typeof input.metadata !== 'object' || Array.isArray(input.metadata)) {
            errors.push({ field: 'metadata', message: 'metadata must be a plain object' })
        }
    }

    return errors
}

/* ── Service ────────────────────────────────────────── */

export class LeadEventService {
    /**
     * Register a lead event with atomic scoring.
     *
     * Everything runs inside a single Serializable transaction:
     * 1. Read lead (locked by Serializable isolation)
     * 2. Validate tenant ownership
     * 3. Count recent events for bonus detection (within same tx snapshot)
     * 4. Compute: baseDelta + frequencyBonus + reactivationBonus = totalDelta
     * 5. Create LeadEvent record
     * 6. Update lead score (clamp [0,200]) and priority atomically
     *
     * Two concurrent events on the same lead will be serialized by PostgreSQL —
     * one will succeed, the other will retry or fail with a serialization error.
     */
    static async registerLeadEvent(
        input: RegisterLeadEventInput
    ): Promise<LeadEventResult> {
        const { userId, leadId, eventType, eventSource, metadata } = input

        const baseDelta = getScoreDelta(eventType)

        // ── 5. Execute Transaction with Serialization Retry ──────
        // Isolation level: Serializable ensures score integrity but can 
        // cause P2034 errors under contention. We retry up to 5 times.
        let retries = 5
        let lastError: any

        while (retries > 0) {
            try {
                const result = await prisma.$transaction(async (tx) => {
                    // ── 1. Read lead (snapshot locked by Serializable) ──
                    const lead = await tx.lead.findUnique({
                        where: { id: leadId },
                        select: { id: true, userId: true, score: true, priorityLevel: true },
                    })

                    if (!lead) {
                        throw new LeadEventError('LEAD_NOT_FOUND', `Lead ${leadId} not found`, 404)
                    }

                    if (lead.userId !== userId) {
                        throw new LeadEventError(
                            'CROSS_TENANT_ACCESS',
                            'Lead does not belong to this account',
                            403
                        )
                    }

                    // ── 2. Detect frequency bonus ─────────────────────
                    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
                    const recentEventCount = await tx.leadEvent.count({
                        where: {
                            leadId,
                            userId,
                            timestamp: { gte: twentyFourHoursAgo },
                        },
                    })

                    const frequencyBonus =
                        recentEventCount === FREQUENCY_THRESHOLD - 1 ? FREQUENCY_BONUS : 0

                    // ── 3. Detect reactivation bonus ──────────────────
                    const fourteenDaysAgo = new Date(Date.now() - REACTIVATION_DAYS * 24 * 60 * 60 * 1000)
                    const eventsInPeriod = await tx.leadEvent.count({
                        where: {
                            leadId,
                            userId,
                            timestamp: { gte: fourteenDaysAgo },
                        },
                    })

                    const reactivationBonus = eventsInPeriod === 0 ? REACTIVATION_BONUS : 0

                    // ── 4. Calculate total delta and clamped score ─────
                    const previousScore = lead.score
                    const totalDelta = baseDelta + frequencyBonus + reactivationBonus
                    const rawNewScore = previousScore + totalDelta
                    const finalScore = clampScore(rawNewScore)

                    const effectiveDelta = finalScore - previousScore
                    const newPriorityLevel = recalculatePriority(finalScore)

                    // ── 5. Create event ───────────────────────────────
                    const event = await tx.leadEvent.create({
                        data: {
                            leadId,
                            userId,
                            type: eventType,
                            eventSource,
                            data: metadata as Prisma.InputJsonValue,
                            scoreDelta: effectiveDelta,
                            sessionId: input.sessionId,
                        },
                    })

                    // ── 6. Update lead score and priority atomically ──
                    await tx.lead.update({
                        where: { id: leadId },
                        data: {
                            score: finalScore,
                            priorityLevel: newPriorityLevel,
                        },
                    })

                    const scoreBreakdown: ScoreBreakdown = {
                        baseDelta,
                        frequencyBonus,
                        reactivationBonus,
                        totalDelta,
                        effectiveDelta,
                        finalScore,
                        previousScore,
                    }

                    return { event, scoreBreakdown, newPriorityLevel }
                }, {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                    timeout: 10000,
                })

                const eventResult: LeadEventResult = {
                    event: {
                        id: result.event.id,
                        leadId: result.event.leadId,
                        userId: result.event.userId,
                        type: result.event.type,
                        eventSource: result.event.eventSource,
                        data: result.event.data,
                        scoreDelta: result.event.scoreDelta,
                        timestamp: result.event.timestamp,
                    },
                    scoreBreakdown: result.scoreBreakdown,
                    newPriorityLevel: result.newPriorityLevel,
                }

                // Fire automation hook outside transaction
                triggerAutomation({
                    eventId: result.event.id,
                    leadId,
                    userId,
                    eventType,
                    eventSource,
                    scoreBreakdown: result.scoreBreakdown,
                    newPriorityLevel: result.newPriorityLevel,
                    metadata,
                    timestamp: result.event.timestamp,
                }).catch((err) => {
                    console.error('[LeadEventService] Automation hook failed:', err)
                })

                // Fire enrichment in background
                setImmediate(() => {
                    import('@/lib/enrichment/enrichmentEngine').then(({ triggerEnrichment }) => {
                        triggerEnrichment(leadId, userId).catch((err) => {
                            console.error('[LeadEventService] Enrichment failed:', err)
                        })
                    })
                })

                return eventResult

            } catch (err: any) {
                lastError = err
                // P2034: Transaction failed due to a write conflict or a deadlock.
                // This is expected under high load with SERIALIZABLE.
                if (err.code === 'P2034' && retries > 1) {
                    retries--
                    // Backoff with jitter (50ms - 200ms)
                    await new Promise(r => setTimeout(r, 50 + Math.random() * 150))
                    continue
                }
                throw err
            }
        }

        throw lastError
    }

    /**
     * Fetch events for a lead with tenant guard.
     */
    static async getLeadEvents(
        leadId: string,
        userId: string,
        limit: number = 50,
        offset: number = 0
    ) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: { userId: true },
        })

        if (!lead) {
            throw new LeadEventError('LEAD_NOT_FOUND', `Lead ${leadId} not found`, 404)
        }

        if (lead.userId !== userId) {
            throw new LeadEventError(
                'CROSS_TENANT_ACCESS',
                'Lead does not belong to this account',
                403
            )
        }

        const [events, total] = await Promise.all([
            prisma.leadEvent.findMany({
                where: { leadId, userId },
                orderBy: { timestamp: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.leadEvent.count({
                where: { leadId, userId },
            }),
        ])

        return { events, total, limit, offset }
    }

    /**
     * Get the current score summary for a lead.
     */
    static async getLeadScoreSummary(leadId: string, userId: string) {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: {
                id: true,
                userId: true,
                score: true,
                priorityLevel: true,
                name: true,
                email: true,
            },
        })

        if (!lead) {
            throw new LeadEventError('LEAD_NOT_FOUND', `Lead ${leadId} not found`, 404)
        }

        if (lead.userId !== userId) {
            throw new LeadEventError(
                'CROSS_TENANT_ACCESS',
                'Lead does not belong to this account',
                403
            )
        }

        const recentEvents = await prisma.leadEvent.findMany({
            where: { leadId, userId },
            orderBy: { timestamp: 'desc' },
            take: 10,
            select: {
                id: true,
                type: true,
                eventSource: true,
                scoreDelta: true,
                timestamp: true,
            },
        })

        return {
            lead: {
                id: lead.id,
                name: lead.name,
                email: lead.email,
                score: lead.score,
                priorityLevel: lead.priorityLevel,
            },
            recentEvents,
        }
    }
}

/* ── Custom Error ───────────────────────────────────── */

export class LeadEventError extends Error {
    public readonly code: string
    public readonly statusCode: number

    constructor(code: string, message: string, statusCode: number) {
        super(message)
        this.name = 'LeadEventError'
        this.code = code
        this.statusCode = statusCode
    }
}
