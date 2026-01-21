"use client"

import { ClientsOverview } from "./components/ClientsOverview"
import { ClientFilters } from "./components/ClientFilters"
import { ClientsTable } from "./components/ClientsTable"
import { ClientMetrics } from "./components/ClientMetrics"
import { ClientActions } from "./components/ClientActions"
import { ImportClients } from "./components/ImportClients"
import { ExportClients } from "./components/ExportClients"

export default function ClientsPage() {
  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clientes</h1>
          <p className="text-sm text-white/60">
            Panel CRM premium para gestionar cuentas, ingresos y fidelización.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ImportClients />
          <ExportClients />
        </div>
      </div>

      <ClientsOverview />
      <ClientFilters />
      <ClientActions />
      <ClientsTable />
      <ClientMetrics />
    </div>
  )
}