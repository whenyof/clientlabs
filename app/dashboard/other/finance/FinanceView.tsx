"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { FinanceDataProvider } from "./context/FinanceDataContext"
import { FinanceHeader } from "./components/FinanceHeader"
import { FinanceNavTabs, type FinanceTabId } from "./components/FinanceNavTabs"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { MainChart } from "./components/MainChart"
import { CFOInsights } from "./components/CFOInsights"
import { CashflowBlock } from "./components/CashflowBlock"
import { BusinessHealth } from "./components/BusinessHealth"
import { MovementsList } from "./components/MovementsList"
import { FixedExpenses } from "./components/FixedExpenses"
import { Budgets } from "./components/Budgets"
import { Forecast } from "./components/Forecast"
import { Goals } from "./components/Goals"
import { Alerts } from "./components/Alerts"
import { AutomationFinance } from "./components/AutomationFinance"
import { CreateTransactionModal } from "./components/CreateTransactionModal"
import type { FinancePageData } from "./lib/server-data"

type Props = {
  initialData: FinancePageData
  period: string
}

export function FinanceView({ initialData, period }: Props) {
  const [activeTab, setActiveTab] = useState<FinanceTabId>("overview")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [kpiFilter, setKpiFilter] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const renderSectionContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="w-full space-y-8">
            <section aria-label="Hero chart" className="w-full">
              <MainChart />
            </section>
            <section aria-label="CFO insights" className="w-full">
              <CFOInsights />
            </section>
            <section aria-label="Business health and cash flow" className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <BusinessHealth />
              <CashflowBlock />
            </section>
            <section aria-label="Fixed costs" className="w-full">
              <FixedExpenses />
            </section>
          </div>
        )
      case "transactions":
        return (
          <section aria-label="Explorador de movimientos">
            <MovementsList />
          </section>
        )
      case "budgets":
        return (
          <section aria-label="Progreso vs plan">
            <Budgets />
          </section>
        )
      case "forecast":
        return (
          <section aria-label="Proyección y runway">
            <Forecast />
          </section>
        )
      case "goals":
        return (
          <section aria-label="Objetivos y probabilidad de logro">
            <Goals />
          </section>
        )
      case "alerts":
        return (
          <section aria-label="Detección de riesgos">
            <Alerts />
          </section>
        )
      case "automation":
        return (
          <section aria-label="Reglas y eficiencia">
            <AutomationFinance />
          </section>
        )
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <MainChart />
            <CashflowBlock />
          </div>
        )
    }
  }

  const { labels } = useSectorConfig()

  const handleSetPeriod = (nextPeriod: string) => {
    const params = new URLSearchParams({ period: nextPeriod })
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleRefetch = () => {
    router.refresh()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full min-h-screen max-w-none overflow-y-auto bg-gradient-to-br from-[#1E1F2B] to-[#242538] px-4 pt-5 pb-10">
      <FinanceDataProvider
        initialAnalytics={initialData.analytics}
        initialMovements={initialData.movements}
        period={period}
        onSetPeriod={handleSetPeriod}
        onRefetch={handleRefetch}
      >
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-none">
          <header className="shrink-0 space-y-2">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-base font-semibold text-white tracking-tight">
                {labels.finance.title}
              </h1>
              <p className="text-xs text-white/40">{labels.finance.pageSubtitle}</p>
            </div>
            <FinanceHeader onCreateTransaction={() => setIsCreateModalOpen(true)} />
          </header>

          <div className="shrink-0 mt-2">
            <FinanceNavTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="shrink-0 mt-3 mb-5">
            <FinanceKPIs onKpiClick={(id) => setKpiFilter(id)} />
          </div>

          <div className="flex-1 min-h-0 min-w-0 pb-10 overflow-visible">
            {kpiFilter && (
              <p className="text-xs text-white/40 mb-4">
                Filtro activo: <span className="text-white/60 capitalize">{kpiFilter}</span>
              </p>
            )}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="min-h-0 w-full"
            >
              {renderSectionContent()}
            </motion.div>
          </div>
        </div>

        <CreateTransactionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </FinanceDataProvider>
    </div>
  )
}
