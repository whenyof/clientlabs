"use client"

import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => res.json())

export function useLeads() {
  const { data, error, isLoading, mutate } = useSWR("/api/leads", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  })

  return {
    leads: data?.leads ?? [],
    isLoading,
    isError: error,
    mutate,
  }
}
