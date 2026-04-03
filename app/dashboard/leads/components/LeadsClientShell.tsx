"use client"

import { LeadsOptimisticProvider } from "@/modules/leads/context/LeadsOptimisticContext"

export function LeadsClientShell({ children }: { children: React.ReactNode }) {
  return <LeadsOptimisticProvider>{children}</LeadsOptimisticProvider>
}
