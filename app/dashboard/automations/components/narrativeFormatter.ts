/**
 * Automation Narrative Formatter
 *
 * Converts raw automation rule data into human-readable statements.
 * No JSON, no IDs — just clear English sentences.
 */

/* ── Trigger ────────────────────────────────────────── */

export function formatTrigger(
    triggerType: string,
    triggerValue: Record<string, unknown>
): string {
    if (triggerType === 'ON_EVENT') {
        const event = (triggerValue.eventType as string) || 'unknown'
        return `When a lead performs ${formatEventName(event)}`
    }
    if (triggerType === 'ON_SCORE_THRESHOLD') {
        const score = triggerValue.score as number
        return `When a lead's score reaches ${score}`
    }
    return 'Unknown trigger'
}

export function formatTriggerShort(triggerType: string): string {
    return triggerType === 'ON_EVENT' ? 'Event' : 'Score Threshold'
}

/* ── Conditions ─────────────────────────────────────── */

export function formatCondition(condition: {
    field: string
    operator: string
    value: unknown
}): string {
    const field = formatFieldName(condition.field)
    const op = formatOperator(condition.operator)
    const val = String(condition.value)
    return `${field} ${op} ${val}`
}

export function formatConditions(
    conditions: Array<{ field: string; operator: string; value: unknown }>
): string[] {
    if (!conditions || conditions.length === 0) return []
    return conditions.map(formatCondition)
}

/* ── Actions ────────────────────────────────────────── */

export function formatAction(action: {
    type: string
    value: string
}): string {
    switch (action.type) {
        case 'CHANGE_STATUS':
            return `Change lead status to "${action.value}"`
        case 'ASSIGN_USER':
            return `Assign lead to user`
        case 'ADD_TAG':
            return `Add tag "${action.value}"`
        case 'SEND_WEBHOOK':
            return `Send webhook to ${truncateUrl(action.value)}`
        default:
            return `${action.type}: ${action.value}`
    }
}

export function formatActions(
    actions: Array<{ type: string; value: string }>
): string[] {
    if (!actions || actions.length === 0) return []
    return actions.map(formatAction)
}

/* ── Helpers ────────────────────────────────────────── */

function formatEventName(event: string): string {
    return event.replace(/_/g, ' ')
}

function formatFieldName(field: string): string {
    const names: Record<string, string> = {
        score: 'Score',
        status: 'Status',
        industry: 'Industry',
        source: 'Source',
        tags: 'Tags',
        leadStatus: 'Lead status',
        category: 'Category',
        temperature: 'Temperature',
        converted: 'Converted',
    }
    return names[field] || field
}

function formatOperator(op: string): string {
    const ops: Record<string, string> = {
        equals: 'is',
        not_equals: 'is not',
        gt: 'is greater than',
        gte: 'is greater or equal to',
        lt: 'is less than',
        lte: 'is less or equal to',
        contains: 'contains',
    }
    return ops[op] || op
}

function truncateUrl(url: string): string {
    try {
        const u = new URL(url)
        return u.hostname + (u.pathname !== '/' ? u.pathname : '')
    } catch {
        return url.length > 40 ? url.slice(0, 37) + '…' : url
    }
}
