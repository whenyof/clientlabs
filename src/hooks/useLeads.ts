"use client"

import { useQuery } from "@tanstack/react-query"
import { getLeads } from "@/api/leads"

export function useLeads() {
  const query = useQuery({
    queryKey: ["leads"],
    queryFn: getLeads,
  })

  return {
    leads: query.data?.leads ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

