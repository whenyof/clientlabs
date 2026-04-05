"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getLeads, type GetLeadsParams } from "@/api/leads"
import { useMemo } from "react"
import type { Lead } from "@prisma/client"
import { changeLeadStatus } from "@/modules/leads/actions"
import { toast } from "sonner"

interface UseLeadsOptions {
  initialLeads?: Lead[]
  initialTotal?: number
}

/**
 * Optimized React-Query hook for leads list.
 * Supports cursor-based infinite scroll and server-side filtering.
 * Accepts server-fetched initialLeads to show data immediately without an API call.
 */
export function useLeads(filters: GetLeadsParams = {}, options?: UseLeadsOptions) {
  const initialData = options?.initialLeads?.length
    ? {
        pages: [
          {
            leads: options.initialLeads,
            pagination: {
              nextCursor: null as string | null,
              hasNext: false,
              total: options.initialTotal ?? options.initialLeads.length,
            },
          },
        ],
        pageParams: [undefined as string | undefined],
      }
    : undefined

  const query = useInfiniteQuery({
    queryKey: ["leads", filters],
    queryFn: ({ pageParam }) => getLeads({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor,
    initialData,
    // Tell React Query the SSR data is fresh — prevents immediate background
    // refetch on mount that would race against and overwrite optimistic updates
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    refetchInterval: 300_000,
    staleTime: 60_000,
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
 * Updates the UI immediately without re-sorting the list.
 * Only refetches KPIs — leads list refreshes on next stale interval.
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const result = await changeLeadStatus(leadId, status as any)
      if (!result.success) throw new Error(result.error ?? "Error al cambiar estado")
      return result
    },

    onMutate: async ({ leadId, status }) => {
      // Cancel any in-flight refetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: ["leads"] })

      // Snapshot all current lead query data for rollback
      const snapshot = queryClient.getQueriesData<{
        pages: Array<{ leads: Lead[]; pagination: unknown }>
        pageParams: unknown[]
      }>({ queryKey: ["leads"] })

      // Surgically update the specific lead's status across all cached pages
      queryClient.setQueriesData(
        { queryKey: ["leads"] },
        (old: { pages: Array<{ leads: Lead[]; pagination: unknown }>; pageParams: unknown[] } | undefined) => {
          if (!old?.pages) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              leads: page.leads.map((l) =>
                l.id === leadId ? { ...l, leadStatus: status as Lead["leadStatus"] } : l
              ),
            })),
          }
        }
      )

      return { snapshot }
    },

    onError: (_err, _vars, context) => {
      // Rollback all affected queries to their pre-mutation state
      if (context?.snapshot) {
        context.snapshot.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error("Error al cambiar estado")
    },

    onSettled: () => {
      // Only refresh KPIs immediately — leads order stays stable until next interval
      queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
    },
  })
}
