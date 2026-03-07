/**
 * Condition Evaluator — AND logic for automation conditions
 *
 * Evaluates an array of conditions against a lead snapshot.
 * All conditions must pass (AND logic — no OR in Phase 1).
 *
 * Supports: equals, not_equals, gt, gte, lt, lte, contains (for arrays/strings).
 */

import type { Condition, LeadSnapshot } from './automation.types'

/**
 * Evaluate all conditions against a lead. Returns true only if ALL pass.
 * Empty conditions array = always true (unconditional rule).
 */
export function evaluateConditions(
    conditions: Condition[],
    lead: LeadSnapshot
): boolean {
    if (conditions.length === 0) return true
    return conditions.every((c) => evaluateCondition(c, lead))
}

/**
 * Evaluate a single condition against a lead snapshot.
 */
function evaluateCondition(condition: Condition, lead: LeadSnapshot): boolean {
    const { field, operator, value } = condition
    const leadValue = lead[field]

    // Field doesn't exist on lead — condition fails
    if (leadValue === undefined) return false

    switch (operator) {
        case 'equals':
            return leadValue === value

        case 'not_equals':
            return leadValue !== value

        case 'gt':
            return typeof leadValue === 'number' && typeof value === 'number' && leadValue > value

        case 'gte':
            return typeof leadValue === 'number' && typeof value === 'number' && leadValue >= value

        case 'lt':
            return typeof leadValue === 'number' && typeof value === 'number' && leadValue < value

        case 'lte':
            return typeof leadValue === 'number' && typeof value === 'number' && leadValue <= value

        case 'contains': {
            // For arrays (e.g. tags): check if array contains value
            if (Array.isArray(leadValue)) {
                return leadValue.includes(value)
            }
            // For strings: check if string contains substring
            if (typeof leadValue === 'string' && typeof value === 'string') {
                return leadValue.toLowerCase().includes(value.toLowerCase())
            }
            return false
        }

        default:
            return false
    }
}
