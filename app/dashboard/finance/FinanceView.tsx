"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FinanceDataProvider } from "./context/FinanceDataContext"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { OverdueAlert } from "./components/OverdueAlert"
import { TrimestralAlert } from "./components/TrimestralAlert"
import dynamic from "next/dynamic"
const MainChart = dynamic(() => import("./components/MainChart").then(m => ({ default: m.MainChart })), { ssr: false })
const ClientRevenueChart = dynamic(() => import("./components/ClientRevenueChart").then(m => ({ default: m.ClientRevenueChart })), { ssr: false })
import { CFOInsights } from "./components/CFOInsights"
import { CashflowBlock } from "./components/CashflowBlock"
import { BusinessHealth } from "./components/BusinessHealth"
import { Forecast } from "./components/Forecast"
import type { FinancePageData } from "./lib/server-data"

type Props = {
  initialData: FinancePageData
  period: string
  view?: string
  billingNode: React.ReactNode
  purchasesNode?: React.ReactNode
}

function FinancialSummaryTab({ initialData }: { initialData: FinancePageData }) {
  return (
    <div className="space-y-5">
      {/* Row 1: Main chart (65%) + Client revenue donut (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <MainChart />
        <ClientRevenueChart />
      </div>

      {/* Row 2: Three supporting metric panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CashflowBlock />
        <BusinessHealth />
        <Forecast />
      </div>

      {/* Row 3: CFO Insights — full width */}
      <CFOInsights />

      {/* Row 4: Fiscal summary */}
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
    { label: "IVA repercutido", value: ivaRepercutido, color: "text-[#1FA97A]",  dot: "bg-[#1FA97A]"   },
    { label: "IVA soportado",   value: ivaSoportado,   color: "text-red-500",     dot: "bg-red-400"     },
    { label: "IVA a declarar",  value: ivaDeclarar,    color: ivaDeclarar >= 0 ? "text-amber-600" : "text-[#1FA97A]", dot: ivaDeclarar >= 0 ? "bg-amber-400" : "bg-[#1FA97A]" },
    { label: "IRPF retenido",   value: irpfRetenido,   color: "text-violet-600",  dot: "bg-violet-400"  },
  ]

  const eurFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[13px] font-semibold text-slate-900">Resumen fiscal trimestral</h3>
        <span className="text-[10px] text-slate-400">estimaciones automáticas</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{item.label}</p>
            </div>
            <p className={`text-[18px] font-bold tabular-nums leading-none ${item.color}`}>
              {eurFmt.format(item.value)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">estimado</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceView({ initialData, period, view, billingNode, purchasesNode }: Props) {
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

  return (
    <div className="flex flex-col w-full min-h-0 pb-10">
      <FinanceDataProvider
        initialAnalytics={initialData.analytics}
        initialMovements={initialData.movements}
        period={period}
        onSetPeriod={handleSetPeriod}
        onRefetch={handleRefetch}
      >
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
      </FinanceDataProvider>
    </div>
  )
}
