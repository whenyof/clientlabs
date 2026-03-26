"use client"

import { useSectorConfig } from "@shared/hooks/useSectorConfig"
import { CreateLeadButton } from "@/modules/leads/components/CreateLeadButton"
import { ConnectWebButton } from "@/modules/leads/components/ConnectWebButton"
import { AutomationsButton } from "@/modules/leads/components/AutomationsButton"

export function LeadsHeader() {
  const { labels } = useSectorConfig()
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {labels.leads?.pageTitle ?? "Mis Leads"}
        </h1>
        <p className="mt-0.5 text-sm text-neutral-500 truncate max-w-xl">
          {labels.leads?.pageSubtitle ?? "Gestiona tus contactos y conviértelos en clientes"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <ConnectWebButton />
        <AutomationsButton />
        <CreateLeadButton />
      </div>
    </div>
  )
}

