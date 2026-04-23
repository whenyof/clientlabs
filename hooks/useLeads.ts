/**
 * Stub hook — the real implementation lives in modules/leads.
 * This file resolves "@/hooks/useLeads" imports in legacy components.
 */
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface Lead {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
  temperature?: string | null
  score?: number | null
  createdAt?: Date | string | null
  [key: string]: unknown
}

interface UseLeadsOptions {
  initialLeads?: Lead[]
  initialTotal?: number
}

export function useLeads(
  _filters: Record<string, unknown> = {},
  options: UseLeadsOptions = {}
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads] = useState<any[]>(options.initialLeads ?? [])
  const [total] = useState<number>(options.initialTotal ?? 0)

  return {
    leads,
    total,
    isLoading: false,
    error: null,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: () => Promise.resolve(),
  }
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadStatus: status, status }),
      })
      if (!res.ok) throw new Error("Error al actualizar estado")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] })
    },
  })
}
