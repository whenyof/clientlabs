"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { FinanceDataProvider } from "./context/FinanceDataContext"
import { FinanceNavTabs, type FinanceTabId } from "./components/FinanceNavTabs"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { MainChart } from "./components/MainChart"
import { CFOInsights } from "./components/CFOInsights"
import { CashflowBlock } from "./components/CashflowBlock"
import { BusinessHealth } from "./components/BusinessHealth"
import { FinanceMovementsView } from "./components/movements"
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
  view?: string
}

export function FinanceView({ initialData, period, view }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [kpiFilter, setKpiFilter] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL is the source of truth for the active section inside Finance
  const urlView = searchParams.get("view") ?? view
  const allowedTabs: FinanceTabId[] = [
    "overview",
    "transactions",
    "budgets",
    "forecast",
    "goals",
    "alerts",
    "automation",
  ]
  const activeTab: FinanceTabId = allowedTabs.includes(urlView as FinanceTabId)
    ? (urlView as FinanceTabId)
    : "overview"

  const renderSectionContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="w-full space-y-8">
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
            <FinanceMovementsView initialMovements={initialData.ledgerMovements} />
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

  const handleSetPeriod = (nextPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", nextPeriod)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSectionTabChange = (next: FinanceTabId) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", next)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleRefetch = () => {
    router.refresh()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full min-h-screen max-w-none bg-gradient-to-br from-[#1E1F2B] to-[#242538] px-4 pt-2 pb-10">
      <FinanceDataProvider
        initialAnalytics={initialData.analytics}
        initialMovements={initialData.movements}
        period={period}
        onSetPeriod={handleSetPeriod}
        onRefetch={handleRefetch}
      >
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-none">
          <div className="flex-1 min-h-0 min-w-0 pb-10 overflow-y-auto">
            {activeTab === "overview" && (
              <section
                aria-label="Resumen financiero principal"
                className="h-[calc(100vh-260px)] flex flex-col gap-6 overflow-hidden"
              >
                <div className="shrink-0">
                  <FinanceKPIs onKpiClick={(id) => setKpiFilter(id)} />
                </div>
                <section aria-label="Hero chart" className="w-full">
                  <MainChart />
                </section>
              </section>
            )}

            {activeTab === "overview" && <div className="h-24 shrink-0" />}

            {activeTab !== "overview" && (
              <div className="shrink-0 mb-5">
                <FinanceKPIs onKpiClick={(id) => setKpiFilter(id)} />
              </div>
            )}

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
