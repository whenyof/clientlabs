/**
 * Unified Movement type for the finance ledger.
 * All money events (sales, purchases, manual, future invoices) map to this shape.
 */

export type Movement = {
  id: string
  date: string
  type: "income" | "expense"
  amount: number
  contactName: string | null
  contactType: "client" | "supplier" | null
  concept: string
  category?: string
  status: "paid" | "pending"
  originModule: "sale" | "purchase" | "invoice" | "manual" | "provider_order"
  originId?: string
}

export type MovementFilters = {
  type?: "income" | "expense"
  status?: "paid" | "pending"
  originModule?: "sale" | "purchase" | "invoice" | "manual" | "provider_order"
}

export type MovementSortField = "date" | "amount" | "concept" | "contact"
export type MovementSortDir = "asc" | "desc"

export type GetMovementsParams = {
  userId: string
  from: Date
  to: Date
  search?: string
  filters?: MovementFilters
  sortBy?: MovementSortField
  sortDir?: MovementSortDir
}
