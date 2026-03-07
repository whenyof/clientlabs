/**
 * Automation Engine — TypeScript Types
 *
 * Types for the WHEN → AND → THEN automation system.
 * Phase 1: AND-only conditions, 4 action types, 2 trigger types.
 */

/* ── Trigger ────────────────────────────────────────── */

export type TriggerType = 'ON_EVENT' | 'ON_SCORE_THRESHOLD'

export interface OnEventTrigger {
    eventType: string
}

export interface OnScoreThresholdTrigger {
    score: number
}

export type TriggerValue = OnEventTrigger | OnScoreThresholdTrigger

/* ── Conditions ─────────────────────────────────────── */

export type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'gt'    // >
    | 'gte'   // >=
    | 'lt'    // <
    | 'lte'   // <=
    | 'contains'

export interface Condition {
    field: string
    operator: ConditionOperator
    value: string | number | boolean
}

/* ── Actions ────────────────────────────────────────── */

export type ActionType =
    | 'CHANGE_STATUS'
    | 'ASSIGN_USER'
    | 'ADD_TAG'
    | 'SEND_WEBHOOK'

export interface AutomationAction {
    type: ActionType
    value: string
}

/* ── Rule (in-memory representation) ────────────────── */

export interface AutomationRuleData {
    id: string
    userId: string
    name: string
    triggerType: TriggerType
    triggerValue: TriggerValue
    conditions: Condition[]
    actions: AutomationAction[]
    isActive: boolean
}

/* ── Engine input ───────────────────────────────────── */

export interface AutomationContext {
    userId: string
    lead: LeadSnapshot
    eventType: string
    previousScore: number
    newScore: number
}

/** Snapshot of lead state at the time of automation evaluation */
export interface LeadSnapshot {
    id: string
    userId: string
    score: number
    priorityLevel: number
    status: string
    leadStatus: string
    source: string
    tags: string[]
    email: string | null
    name: string | null
    phone: string | null
    category: string | null
    temperature: string | null
    converted: boolean
    [key: string]: unknown
}

/* ── Execution result ───────────────────────────────── */

export interface ExecutionResult {
    automationId: string
    automationName: string
    status: 'SUCCESS' | 'FAILED'
    errorMessage?: string
    actionsExecuted: number
}
