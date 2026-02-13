/**
 * Reminder rules configuration. Each rule defines when to send and which template.
 * ruleKey is used for idempotency (unique per invoice + ruleKey).
 */

export type ReminderRuleType = "before" | "after" | "same_day"
export type ReminderTemplate = "friendly" | "firm" | "legal"

export type ReminderRule = {
  type: ReminderRuleType
  days: number
  template: ReminderTemplate
  /** Unique key for this rule (e.g. "before_3"). Used in InvoiceReminderLog. */
  ruleKey: string
}

export const REMINDER_RULES: ReminderRule[] = [
  { type: "before", days: 3, template: "friendly", ruleKey: "before_3" },
  { type: "same_day", days: 0, template: "friendly", ruleKey: "same_day" },
  { type: "after", days: 3, template: "firm", ruleKey: "after_3" },
  { type: "after", days: 7, template: "legal", ruleKey: "after_7" },
]
