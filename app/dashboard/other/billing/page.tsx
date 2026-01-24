"use client"

import { useState } from "react"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { BillingKPIs } from "./components/BillingKPIs"
import { BillingTabs } from "./components/BillingTabs"
import { InvoicesTable } from "./components/InvoicesTable"
import { InvoiceModal } from "./components/InvoiceModal"
import { PlusIcon } from "@heroicons/react/24/outline"

export default function BillingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Facturación</h1>
        <p className="text-sm text-white/60">
          Gestiona tus facturas, pagos e integraciones con Hacienda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Facturación
          </h1>
          <p className="text-gray-400 text-lg">
            Gestiona tus facturas, pagos e integraciones con Hacienda
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Nueva Factura
          </div>
        </button>
      </div>

      {/* KPIs */}
      <BillingKPIs />

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar facturas por cliente, número o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Tabs */}
      <BillingTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {/* Table */}
      <InvoicesTable
        searchTerm={searchTerm}
        statusFilter={selectedTab === "all" ? undefined : selectedTab}
      />

      {/* Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardContainer>
  )
}