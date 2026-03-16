import type { Lead } from "@prisma/client"
import { apiFetch } from "./client"

export async function getLeads(): Promise<{ leads: Lead[] }> {
  return apiFetch<{ leads: Lead[] }>("/api/leads")
}

