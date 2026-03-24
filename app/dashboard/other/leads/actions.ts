"use server"

// ── Re-export from the single source of truth ──
// This ensures scoring logic, status synchronization, and revalidation are consistent.
export * from "@/modules/leads/actions/index"
