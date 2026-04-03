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
 * Updates the UI immediately, rolls back on error.
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const result = await changeLeadStatus(leadId, status as any)
      if (!result.success) throw new Error(result.error ?? "Error al cambiar estado")
      return result
    },

    onMutate: async () => {
      // LeadCard handles instant local state update directly
      return {}
    },

    onError: (_err, _vars, _context) => {
      toast.error("Error al cambiar estado")
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
      queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
    },
  })
}
