"use client"

import { DashboardContainer } from "@/components/layout/DashboardContainer"

export default function FinanzasPage() {
  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Finanzas</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Gestiona tus ingresos y gastos
        </p>
      </div>

      <div className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-8">
        <p className="text-[var(--text-secondary)]">Página de finanzas en desarrollo...</p>
      </div>
    </DashboardContainer>
  )
}
