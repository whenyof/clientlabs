"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { getLeads, type GetLeadsParams } from "@/api/leads"
import { useMemo } from "react"

/** 
 * Optimized React-Query hook for leads list.
 * Supports cursor-based infinite scroll and server-side filtering.
 */
export function useLeads(filters: GetLeadsParams = {}) {
  const query = useInfiniteQuery({
    queryKey: ["leads", filters],
    queryFn: ({ pageParam }) => getLeads({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor,
    refetchInterval: 5000,
    staleTime: 0,
  })

  // Flatten leads from all loaded pages
  const leads = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.leads) ?? []
  }, [query.data])

  return {
    leads,
    total: query.data?.pages[0]?.pagination?.total ?? 0,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  }
}
