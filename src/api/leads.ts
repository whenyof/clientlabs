import type { Lead } from "@prisma/client"
import { apiFetch } from "./client"

export interface GetLeadsParams {
  status?: string
  temperature?: string
  source?: string
  search?: string
  sortBy?: string
  sortOrder?: string
  stale?: string
  showConverted?: string
  showLost?: string
  cursor?: string
  limit?: number
}

export async function getLeads(params: GetLeadsParams = {}): Promise<{ 
  leads: Lead[], 
  pagination: { nextCursor: string | null, hasNext: boolean, total: number } 
}> {
  const query = new URLSearchParams()
  if (params.status && params.status !== 'all') query.set('status', params.status)
  if (params.temperature && params.temperature !== 'all') query.set('temperature', params.temperature)
  if (params.source && params.source !== 'all') query.set('source', params.source)
  if (params.search) query.set('search', params.search)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortOrder) query.set('sortOrder', params.sortOrder)
  if (params.stale === 'true') query.set('stale', 'true')
  if (params.showConverted === 'true') query.set('showConverted', 'true')
  if (params.showLost === 'true') query.set('showLost', 'true')
  if (params.cursor) query.set('cursor', params.cursor)
  if (params.limit) query.set('limit', params.limit.toString())

  const queryString = query.toString()
  const url = `/api/leads${queryString ? `?${queryString}` : ''}`
  
  return apiFetch<{ 
    leads: Lead[], 
    pagination: { nextCursor: string | null, hasNext: boolean, total: number } 
  }>(url)
}
