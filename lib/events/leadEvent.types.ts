/**
 * Lead Event System — TypeScript Types (PRODUCTION)
 *
 * Core types for event registration, score computation,
 * bonuses (frequency/reactivation), decay, and lead priority.
 */

import type { PriorityLevel } from './priorityLogic'

/* ── Input for registering a new lead event ─────────── */
export interface RegisterLeadEventInput {
    /** Tenant identifier (User.id) */
    userId: string
    /** Lead receiving the event */
    leadId: string
    /** Type of event — must match a known event type from scoreRules.ts */
    eventType: string
    /** Origin of the event: api, webhook, tracking, manual, automation, sdk */
    eventSource: string
    /** Arbitrary metadata attached to the event */
    metadata: Record<string, unknown>
    /** Associated session identifier (nullable column in DB) */
    sessionId?: string
}

/* ── Score breakdown for transparency ───────────────── */
export interface ScoreBreakdown {
    /** Base delta from the event type rule */
    baseDelta: number
    /** +10 if this event is the exact 3rd in 24h window */
    frequencyBonus: number
    /** +15 if lead had zero events in last 14 days */
    reactivationBonus: number
    /** Sum of baseDelta + frequencyBonus + reactivationBonus (before clamp) */
    totalDelta: number
    /** Actual delta applied after clamping [0, 200] */
    effectiveDelta: number
    /** Score after applying delta and clamp [0–200] */
    finalScore: number
    /** Score before this event */
    previousScore: number
}

/* ── Result returned after registering an event ─────── */
export interface LeadEventResult {
    /** Created event record */
    event: {
        id: string
        leadId: string
        userId: string
        type: string
        eventSource: string
        data: unknown
        scoreDelta: number
        timestamp: Date
    }
    /** Full breakdown of how the score was computed */
    scoreBreakdown: ScoreBreakdown
    /** Lead's recalculated priority level (1–4) */
    newPriorityLevel: PriorityLevel
}

/* ── Validation error shape ─────────────────────────── */
export interface EventValidationError {
    field: string
    message: string
}

/* ── Automation hook payload ────────────────────────── */
export interface AutomationEventPayload {
    eventId: string
    leadId: string
    userId: string
    eventType: string
    eventSource: string
    scoreBreakdown: ScoreBreakdown
    newPriorityLevel: PriorityLevel
    metadata: Record<string, unknown>
    timestamp: Date
}

/* ── Decay report ───────────────────────────────────── */
export interface DecayResult {
    /** Number of leads whose score was updated */
    leadsProcessed: number
    /** Number of leads whose score was reduced (same as leadsProcessed for bulk) */
    leadsDecayed: number
    /** Timestamp of the decay run */
    executedAt: Date
}
