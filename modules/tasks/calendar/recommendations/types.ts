/** Client-side types for recommendations (mirror API response). */

export type RecommendationType =
  | "reschedule"
  | "reassign"
  | "extend_time"
  | "merge"
  | "priority_change"

export type SuggestedChange =
  | { taskId: string; dueDate?: string; startAt?: string; endAt?: string }
  | { taskId: string; assignedToId: string | null }
  | { taskId: string; estimatedMinutes: number }
  | { taskIds: string[]; suggestedSlot?: { startAt: string; endAt: string } }
  | { taskId: string; priority: "LOW" | "MEDIUM" | "HIGH" }

export type OperationalRecommendation = {
  id: string
  type: RecommendationType
  title: string
  explanation: string
  expectedBenefit: string
  confidence: number
  difficulty: "low" | "medium" | "high"
  suggestedChange: SuggestedChange
  affectedTaskTitles?: string[]
}
