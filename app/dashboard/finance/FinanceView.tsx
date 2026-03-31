"use client"

import { useState, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Plus, Download } from "lucide-react"
import { FinanceDataProvider } from "./context/FinanceDataContext"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { MainChart } from "./components/MainChart"
import { CFOInsights } from "./components/CFOInsights"
import { CashflowBlock } from "./components/CashflowBlock"
import { BusinessHealth } from "./components/BusinessHealth"
import { Forecast } from "./components/Forecast"
import { FinanceMovementsView } from "./components/movements"
import { Alerts } from "./components/Alerts"
import { AutomationFinance } from "./components/AutomationFinance"
import { Budgets } from "./components/Budgets"
import { Goals } from "./components/Goals"
import { CreateTransactionModal } from "./components/CreateTransactionModal"
import { DocumentsView } from "./components/DocumentsView"
import type { FinancePageData } from "./lib/server-data"

type FinanceTab = "resumen" | "tesoreria" | "documentos" | "ventas" | "compras"

const TABS: { id: FinanceTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "tesoreria", label: "Tesorería" },
  { id: "documentos", label: "Documentos" },
  { id: "ventas", label: "Ventas" },
  { id: "compras", label: "Compras" },
]

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
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const VIEW_TO_TAB: Record<string, FinanceTab> = {
    resumen: "resumen",
    overview: "resumen",
    tesoreria: "tesoreria",
    transactions: "tesoreria",
    documentos: "documentos",
    documents: "documentos",
    presupuestos: "documentos",
    quotes: "documentos",
    albaranes: "documentos",
    facturas: "ventas",
    billing: "ventas",
    ventas: "ventas",
    sales: "ventas",
    compras: "compras",
    purchases: "compras",
  }

  const urlView = searchParams.get("view") ?? view ?? "resumen"
  const activeTab: FinanceTab = VIEW_TO_TAB[urlView] ?? "resumen"

  const handleTabChange = (next: FinanceTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", next)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSetPeriod = (nextPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", nextPeriod)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleRefetch = () => {
    router.refresh()
  }

  const handleTransactionCreated = () => {
    setIsCreateModalOpen(false)
    router.refresh()
  }

  const handleExportCSV = () => {
    const params = new URLSearchParams({ period })
    window.open(`/api/finance/export?${params.toString()}`, "_blank")
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
        {/* Header bar: tabs + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-0.5">
          <nav className="flex items-center gap-1 flex-wrap" aria-label="Navegación de finanzas">
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    h-8 px-3 rounded-lg text-sm font-medium shrink-0
                    transition-colors duration-150
                    ${active
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}
                  `}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === "tesoreria" && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1FA97A] hover:bg-[#178a64] px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo movimiento
            </button>
          </div>
        </div>

        {/* KPIs — always visible */}
        <div className="mb-5">
          <FinanceKPIs />
        </div>

        {/* Tab content */}
        <div key={activeTab} className="w-full">
          {activeTab === "resumen" && (
            <FinancialSummaryTab initialData={initialData} />
          )}

          {activeTab === "tesoreria" && (
            <div className="space-y-5">
              <FinanceMovementsView initialMovements={initialData.ledgerMovements} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Alerts />
                <AutomationFinance />
              </div>
            </div>
          )}

          {activeTab === "documentos" && (
            <DocumentsView
              billingNode={billingNode}
              onNavigateToInvoices={() => handleTabChange("ventas")}
            />
          )}

          {activeTab === "ventas" && (
            <Suspense fallback={<div className="h-48 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] animate-pulse" />}>
              {billingNode}
            </Suspense>
          )}

          {activeTab === "compras" && (
            <Suspense fallback={<div className="h-48 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] animate-pulse" />}>
              {purchasesNode}
            </Suspense>
          )}
        </div>

        <CreateTransactionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleTransactionCreated}
        />
      </FinanceDataProvider>
    </div>
  )
}
