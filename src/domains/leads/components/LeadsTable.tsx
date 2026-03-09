"use client"

import { useLeads } from "@shared/hooks/useLeads"
import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import type { Lead } from "@prisma/client"
import { LeadCard } from "@/modules/leads/components/LeadCard"
import { Upload, Globe, Zap } from "lucide-react"

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

function filterLeads(
  leads: Lead[],
  status: string,
  temperature: string,
  source: string,
  search: string
): Lead[] {
  let out = leads
  if (status && status !== "all") {
    out = out.filter((l) => l.leadStatus === status)
  }
  if (temperature && temperature !== "all") {
    out = out.filter((l) => l.temperature === temperature)
  }
  if (source && source !== "all") {
    out = out.filter((l) => l.source === source)
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    out = out.filter(
      (l) =>
        (l.name?.toLowerCase().includes(q) ?? false) ||
        (l.email?.toLowerCase().includes(q) ?? false) ||
        (l.phone?.toLowerCase().includes(q) ?? false)
    )
  }
  return out
}

export function LeadsTable() {
  const searchParams = useSearchParams()
  const { leads, isLoading } = useLeads()

  const status = searchParams.get("status") ?? "all"
  const temperature = searchParams.get("temperature") ?? "all"
  const source = searchParams.get("source") ?? "all"
  const search = searchParams.get("search") ?? ""

  const filteredLeads = useMemo(
    () => filterLeads(leads, status, temperature, source, search),
    [leads, status, temperature, source, search]
  )

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

  if (filteredLeads.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-2">
      {filteredLeads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
      <p className="text-sm text-neutral-500 pt-2">
        {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
      </p>
    </div>
  )
}

