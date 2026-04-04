"use client"

import { useLeads } from "@/lib/hooks/useLeads"
import { useSearchParams } from "next/navigation"
import { useMemo, useRef, useCallback, useEffect } from "react"
import { LeadCard } from "./LeadCard"
import { Upload, Globe, Zap, Loader2 } from "lucide-react"

function EmptyState() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-12 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex justify-center gap-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-3">
            <Upload className="h-6 w-6 text-neutral-500" />
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-3">
            <Globe className="h-6 w-6 text-neutral-500" />
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-3">
            <Zap className="h-6 w-6 text-neutral-500" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Sin leads</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Los leads aparecerán aquí cuando captures contactos desde tu web o los importes.
          </p>
        </div>
      </div>
    </div>
  )
}

export function LeadsTable() {
  const searchParams = useSearchParams()

  // Read filters from URL search params (same UI as before)
  const filters = useMemo(
    () => ({
      status: searchParams.get("status") ?? "all",
      temperature: searchParams.get("temperature") ?? "all",
      source: searchParams.get("source") ?? "all",
      search: searchParams.get("search") ?? "",
      sortBy: searchParams.get("sortBy") ?? "createdAt",
      sortOrder: searchParams.get("sortOrder") ?? "desc",
      stale: searchParams.get("stale") ?? undefined,
      showConverted: searchParams.get("showConverted") ?? undefined,
      showLost: searchParams.get("showLost") ?? undefined,
    }),
    [searchParams]
  )

  // All filtering now happens server-side via query params
  const { leads, total, isLoading, isLoadingMore, hasNext, loadMore } =
    useLeads(filters)

  // ── Infinite scroll: observe last element ──
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastLeadRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNext) {
          loadMore()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [isLoadingMore, hasNext, loadMore]
  )

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 w-full max-w-md rounded-lg bg-neutral-100 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[56px] rounded-lg bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (leads.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-2">
      {leads.map((lead, index) => {
        const isLast = index === leads.length - 1
        return (
          <div key={`${lead.id}-${index}`} ref={isLast ? lastLeadRef : undefined}>
            <LeadCard lead={lead as any} />
          </div>
        )
      })}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
          <span className="ml-2 text-sm text-neutral-500">Cargando más leads...</span>
        </div>
      )}

      <p className="text-sm text-neutral-500 pt-2">
        {leads.length} de {total} {total === 1 ? "lead" : "leads"}
      </p>
    </div>
  )
}
