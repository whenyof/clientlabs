"use client"

import useSWR from "swr"
import useSWRInfinite from "swr/infinite"
import { useCallback, useMemo } from "react"

/* ── Types ─────────────────────────────────────────────── */

interface LeadRow {
  id: string
  userId: string
  email: string | null
  name: string | null
  phone: string | null
  source: string
  leadStatus: string
  temperature: string | null
  score: number
  priority: string
  tags: string[]
  notes: string | null
  converted: boolean
  clientId: string | null
  lastActionAt: string | null
  createdAt: string
  updatedAt: string
  conversionProbability: number | null
  aiSegment: string | null
  metadata: unknown
}

interface LeadsApiResponse {
  leads: LeadRow[]
  pagination: {
    nextCursor: string | null
    hasNext: boolean
    page?: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    status: string
    temperature: string
    source: string
    search: string
    sortBy: string
    sortOrder: string
  }
}

interface UseLeadsFilters {
  status?: string
  temperature?: string
  source?: string
  search?: string
  sortBy?: string
  sortOrder?: string
  stale?: string
  showConverted?: string
  showLost?: string
}

/* ── Fetcher ──────────────────────────────────────────── */

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json())

/* ── Build query string ──────────────────────────────── */

function buildQueryString(filters: UseLeadsFilters, cursor?: string): string {
  const params = new URLSearchParams()

  if (filters.status && filters.status !== "all") params.set("status", filters.status)
  if (filters.temperature && filters.temperature !== "all") params.set("temperature", filters.temperature)
  if (filters.source && filters.source !== "all") params.set("source", filters.source)
  if (filters.search?.trim()) params.set("search", filters.search.trim())
  if (filters.sortBy) params.set("sortBy", filters.sortBy)
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder)
  if (filters.stale === "true") params.set("stale", "true")
  if (filters.showConverted === "true") params.set("showConverted", "true")
  if (filters.showLost === "true") params.set("showLost", "true")
  if (cursor) params.set("cursor", cursor)

  params.set("limit", "20")

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

/* ── Hook: paginated leads (cursor-based) ─────────── */

export function useLeads(filters: UseLeadsFilters = {}) {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: LeadsApiResponse | null) => {
      // First page: no cursor
      if (pageIndex === 0) return `/api/leads${buildQueryString(filters)}`

      // If previous page has no next cursor, stop
      if (!previousPageData?.pagination?.hasNext) return null

      // Use cursor from previous page
      return `/api/leads${buildQueryString(filters, previousPageData.pagination.nextCursor!)}`
    },
    [filters.status, filters.temperature, filters.source, filters.search, filters.sortBy, filters.sortOrder]
  )

  const {
    data,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<LeadsApiResponse>(getKey, fetcher, {
    refreshInterval: 5000,
    revalidateFirstPage: true,
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  })

  // Flatten all pages into a single leads array
  const leads = useMemo(() => {
    if (!data) return []
    return data.flatMap((page) => page.leads)
  }, [data])

  const total = data?.[0]?.pagination?.total ?? 0
  const hasNext = data?.[data.length - 1]?.pagination?.hasNext ?? false

  const loadMore = useCallback(() => {
    if (hasNext && !isValidating) {
      setSize(size + 1)
    }
  }, [hasNext, isValidating, setSize, size])

  return {
    leads,
    total,
    isLoading,
    isLoadingMore: isValidating && size > 1,
    hasNext,
    loadMore,
    isError: error,
    mutate,
  }
}

/* ── Hook: simple single-page fetch (legacy compat) ── */

export function useLeadsSimple(filters: UseLeadsFilters = {}) {
  const url = `/api/leads${buildQueryString(filters)}`

  const { data, error, isLoading, mutate } = useSWR<LeadsApiResponse>(
    url,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  )

  return {
    leads: data?.leads ?? [],
    total: data?.pagination?.total ?? 0,
    isLoading,
    isError: error,
    mutate,
  }
}
