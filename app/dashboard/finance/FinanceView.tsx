"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Plus } from "lucide-react"
import { FinanceDataProvider } from "./context/FinanceDataContext"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { OverdueAlert } from "./components/OverdueAlert"
import { TrimestralAlert } from "./components/TrimestralAlert"
import dynamic from "next/dynamic"
const MainChart = dynamic(() => import("./components/MainChart").then(m => ({ default: m.MainChart })), { ssr: false })
import { CFOInsights } from "./components/CFOInsights"
import { CashflowBlock } from "./components/CashflowBlock"
import { BusinessHealth } from "./components/BusinessHealth"
import { Forecast } from "./components/Forecast"
import { CreateTransactionModal } from "./components/CreateTransactionModal"
import { BankConnectionBanner } from "./components/BankConnectionBanner"
import type { FinancePageData } from "./lib/server-data"

type Props = {
  initialData: FinancePageData
  period: string
  view?: string
  billingNode: React.ReactNode
  purchasesNode: React.ReactNode
}

function FinancialSummaryTab({ initialData }: { initialData: FinancePageData }) {
  return (
    <div className="space-y-5">
      {/* 65/35 two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Left: chart + cashflow */}
        <div className="space-y-5 min-w-0">
          <MainChart />
          <CashflowBlock />
        </div>
        {/* Right: insights + health + forecast */}
        <div className="space-y-5">
          <CFOInsights />
          <BusinessHealth />
          <Forecast />
        </div>
      </div>

      {/* Quarterly fiscal summary */}
      <FiscalSummary initialData={initialData} />
    </div>
  )
}

function FiscalSummary({ initialData }: { initialData: FinancePageData }) {
  const kpis = initialData.analytics.kpis
  const ivaSoportado = Math.abs(kpis.totalExpenses) * 0.21
  const ivaRepercutido = kpis.totalIncome * 0.21
  const ivaDeclarar = ivaRepercutido - ivaSoportado
  const irpfRetenido = kpis.totalIncome * 0.15

  const items = [
    { label: "IVA repercutido", value: ivaRepercutido, color: "text-emerald-400" },
    { label: "IVA soportado", value: ivaSoportado, color: "text-red-400" },
    { label: "IVA a declarar", value: ivaDeclarar, color: ivaDeclarar >= 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "IRPF retenido", value: irpfRetenido, color: "text-violet-400" },
  ]

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Resumen fiscal trimestral</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">{item.label}</p>
            <p className={`text-base font-bold tabular-nums ${item.color}`}>
              {new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(item.value)}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">estimado</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceView({ initialData, period, view, billingNode, purchasesNode }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSetPeriod = (nextPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", nextPeriod)
    router.push(`/dashboard/finance?${params.toString()}`)
  }

  const handleRefetch = () => {
    router.refresh()
  }

  const handleTransactionCreated = () => {
    setIsCreateModalOpen(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col w-full min-h-0 pb-10">
      <FinanceDataProvider
        initialAnalytics={initialData.analytics}
        initialMovements={initialData.movements}
        period={period}
        onSetPeriod={handleSetPeriod}
        onRefetch={handleRefetch}
      >
        {/* Action bar */}
        <div className="flex items-center justify-end mb-5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1FA97A] hover:bg-[#178a64] px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo movimiento
          </button>
        </div>

        {/* Bank connection banner */}
        <BankConnectionBanner />

        {/* Trimestral alert */}
        <div className="mb-5">
          <TrimestralAlert />
        </div>

        {/* KPIs */}
        <div className="mb-5">
          <FinanceKPIs />
        </div>

        {/* Overdue alert */}
        <div className="mb-5">
          <OverdueAlert />
        </div>

        {/* Main content */}
        <FinancialSummaryTab initialData={initialData} />

        <CreateTransactionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleTransactionCreated}
        />
      </FinanceDataProvider>
    </div>
  )
}
