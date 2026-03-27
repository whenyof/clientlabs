"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLeads, type GetLeadsParams } from "@/api/leads"
import { useMemo, useCallback } from "react"
import type { Lead, LeadStatus } from "@prisma/client"
import { changeLeadStatus } from "@/modules/leads/actions"
import { toast } from "sonner"

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
    refetchInterval: 30_000,
    staleTime: 10_000,
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

/**
 * Optimistic mutation for changing lead status.
 * Updates the UI immediately, rolls back on error.
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      changeLeadStatus(leadId, status as any),

    onMutate: async ({ leadId, status }) => {
      // Cancel in-flight queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["leads"] })

      // Snapshot all current leads queries for rollback
      const previousQueries = queryClient.getQueriesData<{
        pages: { leads: Lead[]; pagination: any }[]
        pageParams: any[]
      }>({ queryKey: ["leads"] })

      // Optimistically update every matching query
      queryClient.setQueriesData<{
        pages: { leads: Lead[]; pagination: any }[]
        pageParams: any[]
      }>({ queryKey: ["leads"] }, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            leads: page.leads.map((lead) =>
              lead.id === leadId
                ? { ...lead, leadStatus: status as LeadStatus, status, metadata: lead.metadata ?? {} }
                : lead
            ),
          })),
        }
      })

      return { previousQueries }
    },

    onError: (_err, _vars, context) => {
      // Roll back to snapshot
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error("Error al cambiar estado")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}
