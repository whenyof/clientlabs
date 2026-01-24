"use client"

import { DashboardContainer } from "@/components/layout/DashboardContainer"

export default function FinanzasPage() {
  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Finanzas</h1>
        <p className="text-sm text-white/60">
          Gestiona tus ingresos y gastos
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
        <p className="text-gray-400">Página de finanzas en desarrollo...</p>
      </div>
    </DashboardContainer>
  )
}
