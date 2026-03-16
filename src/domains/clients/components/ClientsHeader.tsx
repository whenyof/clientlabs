"use client"

import { CreateClientButton } from "@/modules/clients/components/CreateClientButton"

export function ClientsHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 truncate">
          Clientes
        </h1>
        <p className="mt-0.5 text-sm text-neutral-600 truncate max-w-xl">
          Gestión de relaciones e ingresos de clientes
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="[&>button]:bg-emerald-600 [&>button]:hover:bg-emerald-700 [&>button]:text-white">
          <CreateClientButton />
        </div>
      </div>
    </div>
  )
}
