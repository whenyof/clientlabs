"use client"

import { createContext, useContext, useState } from "react"
import type { Lead } from "@prisma/client"

type Ctx = {
  extraLeads: Lead[]
  deletedIds: Set<string>
  statusOverrides: Map<string, string>
  addLead: (lead: Lead) => void
  removeLead: (id: string) => void
  overrideStatus: (id: string, status: string) => void
}

const LeadsOptimisticCtx = createContext<Ctx | null>(null)

export function LeadsOptimisticProvider({ children }: { children: React.ReactNode }) {
  const [extraLeads, setExtraLeads] = useState<Lead[]>([])
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [statusOverrides, setStatusOverrides] = useState<Map<string, string>>(new Map())

  const addLead = (lead: Lead) =>
    setExtraLeads(prev => prev.some(l => l.id === lead.id) ? prev : [lead, ...prev])

  const removeLead = (id: string) => {
    setDeletedIds(prev => new Set([...prev, id]))
    setExtraLeads(prev => prev.filter(l => l.id !== id))
  }

  const overrideStatus = (id: string, status: string) =>
    setStatusOverrides(prev => new Map(prev).set(id, status))

  return (
    <LeadsOptimisticCtx.Provider value={{ extraLeads, deletedIds, statusOverrides, addLead, removeLead, overrideStatus }}>
      {children}
    </LeadsOptimisticCtx.Provider>
  )
}

export function useLeadsOptimistic() {
  const ctx = useContext(LeadsOptimisticCtx)
  if (!ctx) throw new Error("useLeadsOptimistic must be inside LeadsOptimisticProvider")
  return ctx
}
