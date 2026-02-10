"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, FileDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import {
  getDateRange,
  getPreviousDateRange,
  filterSalesByRange,
  aggregateSalesChartData,
} from "../utils"
import {
  computeRangeComparison,
  percentageChange,
} from "../lib/salesComparisons"
import { getSalesInsights } from "../lib/sales-insights"
import { getSalesActions } from "../lib/salesActions"
import { calculateMonthlyForecast } from "../lib/monthly-forecast"
import { detectSalesRisks } from "../lib/risk-detection"
import { detectGrowthOpportunities } from "../lib/growth-opportunities"
import { SalesDateRangePicker } from "./SalesDateRangePicker"
import { SalesKPIs } from "./SalesKPIs"
import { SalesMegaChart } from "./SalesMegaChart"
import { SalesGoalCard } from "./SalesGoalCard"
import { SalesRiskPanel } from "./SalesRiskPanel"
import { SalesOpportunitiesPanel } from "./SalesOpportunitiesPanel"
import { SalesExportPDFModal } from "./SalesExportPDFModal"
import { buildSalesNarrative } from "../services/salesNarrative"
import { SalesInsights } from "./SalesInsights"
import { SalesNarrative } from "./SalesNarrative"
import { ClientPredictions } from "./ClientPredictions"
import { SalesAnomalyPanel } from "./SalesAnomalyPanel"
import { SalesActions } from "./SalesActions"
import { SalesLedger } from "./SalesLedger"
import { SaleSidePanel } from "./SaleSidePanel"
import { CreateSaleDialog } from "./CreateSaleDialog"
import { createTask } from "@/app/dashboard/tasks/actions"
import type { MonthlyGoalAnalytics } from "../services/monthlyGoalAnalytics"
import type { SalesComparisonsResult } from "../services/salesAnalytics"
import type { ClientPredictionsResult } from "../services/clientPredictions"
import type { SalesAnomaly } from "../services/anomalyDetection"
import type { ExecutivePDFInput } from "../lib/executivePdf"
import type { Sale } from "../types"
import type { DateRangePreset } from "../types"

type Props = {
  initialSales: Sale[]
}

export function SalesView({ initialSales }: Props) {
  const { labels, name: sectorName } = useSectorConfig()
  const router = useRouter()
  const sl = labels.sales

  const [sales, setSales] = useState<Sale[]>(initialSales)
  const [datePreset, setDatePreset] = useState<DateRangePreset>("30d")
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [openCreateTaskTitle, setOpenCreateTaskTitle] = useState<string | null>(null)
  const [exportPDFOpen, setExportPDFOpen] = useState(false)
  const [monthlyGoalTarget, setMonthlyGoalTarget] = useState<number | null>(null)
  const [monthlyGoalAnalytics, setMonthlyGoalAnalytics] = useState<MonthlyGoalAnalytics | null>(null)
  const [comparisons, setComparisons] = useState<SalesComparisonsResult | null>(null)
  const [loadingComparisons, setLoadingComparisons] = useState(false)
  const [clientPredictions, setClientPredictions] = useState<ClientPredictionsResult | null>(null)
  const [anomalies, setAnomalies] = useState<SalesAnomaly[]>([])
  const chartSectionRef = useRef<HTMLDivElement>(null)

  /** Comparativas del motor central; mismo objeto para narrativa, export e insights IA. */
  const historical = comparisons

  const refetchMonthlyGoal = useCallback(() => {
    fetch("/api/sales/monthly-goal")
      .then((res) => (res.ok ? res.json() : { goal: null, analytics: null }))
      .then((data) => {
        setMonthlyGoalTarget(data?.goal?.targetRevenue ?? 0)
        setMonthlyGoalAnalytics(data?.analytics ?? null)
      })
      .catch(() => {
        setMonthlyGoalTarget(0)
        setMonthlyGoalAnalytics(null)
      })
  }, [])

  useEffect(() => {
    setSales(initialSales)
  }, [initialSales])

  useEffect(() => {
    refetchMonthlyGoal()
  }, [refetchMonthlyGoal])

  useEffect(() => {
    fetch("/api/sales/client-predictions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setClientPredictions(data ?? null))
      .catch(() => setClientPredictions(null))
  }, [])

  const { from, to } = useMemo(
    () => getDateRange(datePreset, datePreset === "custom" ? customRange ?? undefined : undefined),
    [datePreset, customRange]
  )
  const { from: prevFrom, to: prevTo } = useMemo(
    () => getPreviousDateRange(datePreset, datePreset === "custom" ? customRange ?? undefined : undefined),
    [datePreset, customRange]
  )

  const filteredSales = useMemo(() => filterSalesByRange(sales, from, to), [sales, from, to])
  const salesPrevious = useMemo(() => filterSalesByRange(sales, prevFrom, prevTo), [sales, prevFrom, prevTo])

  const rangeComparison = useMemo(
    () => computeRangeComparison(sales, from, to),
    [sales, from, to]
  )

  useEffect(() => {
    setLoadingComparisons(true)
    const fromIso = from.toISOString()
    const toIso = to.toISOString()
    fetch(`/api/sales/comparisons?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setComparisons(data ?? null))
      .catch(() => setComparisons(null))
      .finally(() => setLoadingComparisons(false))
  }, [from, to])

  useEffect(() => {
    const fromIso = from.toISOString()
    const toIso = to.toISOString()
    fetch(`/api/sales/anomalies?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAnomalies(Array.isArray(data) ? data : []))
      .catch(() => setAnomalies([]))
  }, [from, to])

  const kpis = useMemo(() => {
    if (comparisons) {
      return {
        revenue: comparisons.revenue.current,
        count: comparisons.salesCount.current,
        avg: comparisons.avgTicket.current,
      }
    }
    const { current } = rangeComparison
    return {
      revenue: current.revenue,
      count: current.count,
      avg: current.ticket,
    }
  }, [comparisons, rangeComparison])

  const growth = useMemo((): number | null => {
    if (comparisons) return comparisons.revenue.growthVsPrevious
    const currentRevenue = rangeComparison.current.revenue
    const previousRevenue = rangeComparison.previous.revenue
    if (previousRevenue === 0) return currentRevenue > 0 ? 100 : 0
    return Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
  }, [comparisons, rangeComparison])

  const kpiComparisons = useMemo(() => {
    if (comparisons) {
      return {
        revenue: {
          vsPrevious: comparisons.revenue.growthVsPrevious,
          vsAverage: null,
          vsYearAgo: comparisons.revenue.growthYoY,
        },
        count: {
          vsPrevious: comparisons.salesCount.growthVsPrevious,
          vsAverage: null,
          vsYearAgo: comparisons.salesCount.growthYoY,
        },
        ticket: {
          vsPrevious: comparisons.avgTicket.growthVsPrevious,
          vsAverage: null,
          vsYearAgo: comparisons.avgTicket.growthYoY,
        },
        growth: {
          vsPrevious: comparisons.revenue.growthVsPrevious,
          vsAverage: null,
          vsYearAgo: comparisons.revenue.growthYoY,
        },
      }
    }
    const c = rangeComparison.current
    const p = rangeComparison.previous
    const a = rangeComparison.average
    const y = rangeComparison.yearAgo
    const hasAverage = a.revenue > 0 || a.count > 0
    return {
      revenue: {
        vsPrevious: percentageChange(c.revenue, p.revenue),
        vsAverage: hasAverage ? percentageChange(c.revenue, a.revenue) : null,
        vsYearAgo: y ? percentageChange(c.revenue, y.revenue) : null,
      },
      count: {
        vsPrevious: percentageChange(c.count, p.count),
        vsAverage: hasAverage ? percentageChange(c.count, a.count) : null,
        vsYearAgo: y ? percentageChange(c.count, y.count) : null,
      },
      ticket: {
        vsPrevious: percentageChange(c.ticket, p.ticket),
        vsAverage: hasAverage ? percentageChange(c.ticket, a.ticket) : null,
        vsYearAgo: y ? percentageChange(c.ticket, y.ticket) : null,
      },
      growth: {
        vsPrevious: percentageChange(c.revenue, p.revenue),
        vsAverage: hasAverage ? percentageChange(c.revenue, a.revenue) : null,
        vsYearAgo: y ? percentageChange(c.revenue, y.revenue) : null,
      },
    }
  }, [comparisons, rangeComparison])

  const narrative = useMemo(() => buildSalesNarrative(comparisons), [comparisons])

  const { currentMonthRevenue, daysRemaining } = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    const monthSales = filterSalesByRange(sales, startOfMonth, endOfMonth)
    const revenue = monthSales.reduce((a, s) => a + Number(s.amount ?? s.total ?? 0), 0)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endDay = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate(), 0, 0, 0, 0)
    const daysRemaining = Math.max(0, Math.ceil((endDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)))
    return { currentMonthRevenue: revenue, daysRemaining }
  }, [sales])

  const monthlyTargetValue = monthlyGoalTarget ?? 0
  const monthlyForecast = useMemo(() => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0, 0, 0, 0, 0)
    return calculateMonthlyForecast({
      revenueSoFar: currentMonthRevenue,
      todayDate: now,
      firstDayOfMonth: first,
      lastDayOfMonth: last,
      monthlyTarget: monthlyTargetValue,
    })
  }, [currentMonthRevenue, monthlyTargetValue])

  const riskAlerts = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const last7Start = new Date(todayStart)
    last7Start.setDate(last7Start.getDate() - 6)
    const prev7End = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 23, 59, 59, 999)
    const prev7Start = new Date(todayStart)
    prev7Start.setDate(prev7Start.getDate() - 13)
    const last7Sales = filterSalesByRange(sales, last7Start, todayEnd)
    const prev7Sales = filterSalesByRange(sales, prev7Start, prev7End)
    const revenueLast7 = last7Sales.reduce((a, s) => a + Number(s.amount ?? s.total ?? 0), 0)
    const revenuePrev7 = prev7Sales.reduce((a, s) => a + Number(s.amount ?? s.total ?? 0), 0)
    const salesLast7Days = last7Sales.length
    const salesPrevious7Days = prev7Sales.length
    const avgTicketCurrent = salesLast7Days > 0 ? revenueLast7 / salesLast7Days : 0
    const avgTicketPrevious = salesPrevious7Days > 0 ? revenuePrev7 / salesPrevious7Days : 0
    return detectSalesRisks({
      revenueSoFar: currentMonthRevenue,
      forecastBase: monthlyForecast.forecastBase,
      monthlyTarget: monthlyTargetValue,
      salesLast7Days,
      salesPrevious7Days,
      avgTicketCurrent,
      avgTicketPrevious,
    })
  }, [sales, currentMonthRevenue, monthlyForecast.forecastBase, monthlyTargetValue])

  const growthOpportunities = useMemo(() => {
    const currentClients = new Set(filteredSales.map((s) => (s.clientName || "").trim()).filter(Boolean))
    const previousClients = new Set(salesPrevious.map((s) => (s.clientName || "").trim()).filter(Boolean))
    let repeatCount = 0
    currentClients.forEach((name) => {
      if (previousClients.has(name)) repeatCount++
    })
    const repeatCustomerRate = currentClients.size > 0 ? repeatCount / currentClients.size : 0

    const categoryRevenue = new Map<string, number>()
    let totalRevenue = 0
    filteredSales.forEach((s) => {
      const amt = Number(s.amount ?? s.total ?? 0)
      totalRevenue += amt
      const cat = s.category?.trim() || "Sin categoría"
      categoryRevenue.set(cat, (categoryRevenue.get(cat) ?? 0) + amt)
    })
    const topCategoryRevenue = categoryRevenue.size > 0
      ? Math.max(...categoryRevenue.values())
      : 0
    const topCategoryShare = totalRevenue > 0 ? topCategoryRevenue / totalRevenue : 0

    const inactiveCustomersCount = [...previousClients].filter((name) => !currentClients.has(name)).length

    const prevRevenue = salesPrevious.reduce((a, s) => a + Number(s.amount ?? s.total ?? 0), 0)
    const revenueGrowthRate = prevRevenue > 0 ? (kpis.revenue - prevRevenue) / prevRevenue : 0

    const avgTicketHistorical =
      salesPrevious.length > 0 ? prevRevenue / salesPrevious.length : 0

    return detectGrowthOpportunities({
      repeatCustomerRate,
      avgTicket: kpis.avg,
      topCategoryShare,
      inactiveCustomersCount,
      revenueGrowthRate,
      avgTicketHistorical,
      inactiveCustomersThreshold: 5,
    })
  }, [filteredSales, salesPrevious, kpis.avg, kpis.revenue])

  const businessInsights = useMemo((): { type: "positive" | "warning" | "opportunity"; title: string; description: string }[] => {
    const list: { type: "positive" | "warning" | "opportunity"; title: string; description: string }[] = []
    if (filteredSales.length === 0 && salesPrevious.length === 0) return list

    if (salesPrevious.length > 0 && growth != null && growth > 20) {
      list.push({
        type: "positive",
        title: "Strong growth",
        description: "Sales are accelerating vs previous period.",
      })
    }

    const prevRevenue = salesPrevious.reduce((a, s) => a + Number(s.amount ?? s.total ?? 0), 0)
    const prevAvgTicket = salesPrevious.length > 0 ? prevRevenue / salesPrevious.length : 0
    if (prevAvgTicket > 0 && kpis.avg < prevAvgTicket * 0.9) {
      list.push({
        type: "warning",
        title: "Average ticket down",
        description: "Ticket average dropped vs previous period.",
      })
    }

    const currentClients = new Set(filteredSales.map((s) => (s.clientName || "").trim()).filter(Boolean))
    const previousClients = new Set(salesPrevious.map((s) => (s.clientName || "").trim()).filter(Boolean))
    let repeatCount = 0
    currentClients.forEach((name) => {
      if (previousClients.has(name)) repeatCount++
    })
    const repeatRate = currentClients.size > 0 ? repeatCount / currentClients.size : 0
    if (repeatRate > 0.25) {
      list.push({
        type: "opportunity",
        title: "Repeat clients growing",
        description: "More customers are coming back. Leverage for upsell.",
      })
    }

    return list
  }, [filteredSales, salesPrevious, kpis.avg, kpis.revenue, growth])

  const insights = useMemo(
    () =>
      getSalesInsights({
        currentPeriodSales: filteredSales,
        previousPeriodSales: salesPrevious,
      }),
    [filteredSales, salesPrevious]
  )

  const suggestedActions = useMemo(() => getSalesActions(insights), [insights])

  const actionItems = useMemo(() => {
    return suggestedActions.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      ctaLabel: a.ctaLabel,
      onCta:
        a.type === "NAVIGATION" && a.payload.href
          ? () => router.push(a.payload.href!)
          : a.type === "TASK" && a.payload.taskTitle
            ? () => setOpenCreateTaskTitle(a.payload.taskTitle!)
            : a.payload.scrollTarget === "chart"
              ? () => chartSectionRef.current?.scrollIntoView({ behavior: "smooth" })
              : a.payload.href
                ? () => router.push(a.payload.href!)
                : () => {},
    }))
  }, [suggestedActions, router])

  const filteredForLedger = useMemo(
    () =>
      filteredSales.filter(
        (s) =>
          s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.clientEmail && s.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [filteredSales, searchTerm]
  )

  const executivePdfPayload = useMemo((): ExecutivePDFInput => {
    const periodLabel =
      datePreset === "custom" && customRange
        ? `${customRange.from.toLocaleDateString("es-ES")} – ${customRange.to.toLocaleDateString("es-ES")}`
        : datePreset === "month"
          ? from.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
          : datePreset === "year"
            ? String(from.getFullYear())
            : `${from.toLocaleDateString("es-ES")} – ${to.toLocaleDateString("es-ES")}`
    const totalRevenue = kpis.revenue
    const byClient = new Map<string, number>()
    filteredSales.forEach((s) => {
      const name = (s.clientName || "").trim() || "Sin nombre"
      const amt = Number(s.amount ?? s.total ?? 0)
      byClient.set(name, (byClient.get(name) ?? 0) + amt)
    })
    const topClientsSorted = Array.from(byClient.entries())
      .map(([clientName, revenue]) => ({ clientName, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
    const top3 = topClientsSorted.slice(0, 3).map((c) => ({
      clientName: c.clientName,
      revenue: c.revenue,
      pctOfTotal: totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0,
    }))
    const currentClientNames = new Set(
      filteredSales.map((s) => (s.clientName || "").trim()).filter(Boolean)
    )
    const previousClientNames = new Set(
      salesPrevious.map((s) => (s.clientName || "").trim()).filter(Boolean)
    )
    let newCount = 0
    let recurrentCount = 0
    currentClientNames.forEach((name) => {
      if (previousClientNames.has(name)) recurrentCount++
      else newCount++
    })
    const chartData = aggregateSalesChartData(filteredSales, from, to, datePreset).map((p) => ({
      label: p.label,
      revenue: p.revenue,
      count: p.count,
    }))
    const goalCompletionPct =
      monthlyGoalTarget != null &&
      monthlyGoalTarget > 0 &&
      monthlyGoalAnalytics != null
        ? monthlyGoalAnalytics.progress * 100
        : null
    return {
      companyName: undefined,
      sector: sectorName,
      period: { label: periodLabel, from, to },
      kpis: {
        revenue: kpis.revenue,
        salesCount: kpis.count,
        avgTicket: kpis.avg,
        growthPercent: growth ?? 0,
        goalCompletionPct,
      },
      monthlyGoal: monthlyGoalTarget ?? undefined,
      chartData,
      clientAnalysis: {
        topClients: top3,
        newClientsCount: newCount,
        recurrentClientsCount: recurrentCount,
        totalClients: currentClientNames.size,
      },
      alerts: riskAlerts.map((a) => ({
        title: a.title,
        description: a.description,
        suggestion: a.suggestion,
      })),
      opportunities: growthOpportunities.map((o) => ({
        title: o.title,
        description: o.description,
        suggestion: o.suggestion,
      })),
    }
  }, [
    datePreset,
    customRange,
    from,
    to,
    filteredSales,
    salesPrevious,
    kpis,
    growth,
    riskAlerts,
    growthOpportunities,
    monthlyGoalTarget,
    monthlyGoalAnalytics,
    sectorName,
  ])

  const handleRangeChange = useCallback((preset: DateRangePreset, range?: { from: Date; to: Date }) => {
    setDatePreset(preset)
    setCustomRange(range ?? null)
  }, [])

  const handleSaleUpdate = useCallback(
    (saleId: string, data: Partial<Sale>) => {
      setSales((prev) =>
        prev.map((s) => (s.id === saleId ? { ...s, ...data } : s))
      )
      setSelectedSale((prev) =>
        prev && prev.id === saleId ? { ...prev, ...data } : prev
      )
      refetchMonthlyGoal()
    },
    [refetchMonthlyGoal]
  )

  const handleSaleCreated = useCallback(() => {
    router.refresh()
    refetchMonthlyGoal()
  }, [router, refetchMonthlyGoal])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SalesDateRangePicker value={datePreset} customRange={customRange} onChange={handleRangeChange} />
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar ${sl.plural.toLowerCase()}...`}
              className="bg-white/5 border-white/10 text-white pl-9 h-9 text-sm"
            />
          </div>
          <Button
            type="button"
            onClick={() => setExportPDFOpen(true)}
            title="Descargar informe ejecutivo"
            className="h-9 px-4 shrink-0 bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm shadow-[0_0_16px_rgba(139,92,246,0.2)]"
          >
            <FileDown className="h-4 w-4 mr-1.5" />
            Exportar PDF
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-4 shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm border border-purple-600"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {sl.newButton}
          </Button>
        </div>
      </div>

      <SalesExportPDFModal
        open={exportPDFOpen}
        onOpenChange={setExportPDFOpen}
        payload={executivePdfPayload}
      />

      <SalesKPIs
        data={kpis}
        growth={growth}
        comparisons={kpiComparisons}
        hasHistory={
          comparisons
            ? comparisons.revenue.previous > 0 || comparisons.salesCount.previous > 0
            : rangeComparison.previous.revenue > 0 ||
              rangeComparison.previous.count > 0 ||
              rangeComparison.average.revenue > 0 ||
              rangeComparison.average.count > 0
        }
      />

      <SalesInsights insights={businessInsights} />

      <SalesNarrative data={narrative} />

      <SalesActions actions={actionItems} />

      <div ref={chartSectionRef}>
        <SalesMegaChart sales={filteredSales} />
      </div>

      <SalesGoalCard
        target={monthlyGoalTarget ?? 0}
        analytics={monthlyGoalAnalytics}
        daysRemaining={daysRemaining}
        onGoalSaved={(targetRevenue) => setMonthlyGoalTarget(targetRevenue)}
        onRefetch={refetchMonthlyGoal}
      />

      <SalesRiskPanel alerts={riskAlerts} />

      <SalesAnomalyPanel anomalies={anomalies} />

      <SalesOpportunitiesPanel opportunities={growthOpportunities} />

      <ClientPredictions data={clientPredictions} />

      <SalesLedger sales={filteredForLedger} onSelectSale={setSelectedSale} />

      {selectedSale && (
        <SaleSidePanel
          sale={selectedSale}
          open={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          onSaleUpdate={handleSaleUpdate}
        />
      )}

      <CreateSaleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleSaleCreated}
      />

      {openCreateTaskTitle !== null && (
        <CreateTaskFromInsightDialog
          title={openCreateTaskTitle}
          onClose={() => setOpenCreateTaskTitle(null)}
          onSuccess={() => {
            setOpenCreateTaskTitle(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function CreateTaskFromInsightDialog({
  title,
  onClose,
  onSuccess,
}: {
  title: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState("09:00")
  const [durationMinutes, setDurationMinutes] = useState(30)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const [hh, mm] = startTime.split(":").map(Number)
      const startAt = new Date(date)
      startAt.setHours(isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm, 0, 0)
      const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000)
      const dueDate = new Date(date)
      dueDate.setHours(12, 0, 0, 0)
      const res = await createTask({
        title,
        dueDate,
        startAt,
        endAt,
        estimatedMinutes: durationMinutes,
      })
      if (res.success) onSuccess()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0B0D1A]/95 p-5 shadow-xl text-white">
        <h3 className="text-sm font-semibold text-white/90">Crear tarea</h3>
        <p className="text-sm text-white/60 mt-1">{title}</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div>
            <label className="text-xs text-white/60 block mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Hora</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value || "09:00")}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/60 block mb-1">Duración</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white"
            >
              {[15, 30, 45, 60].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-white/70">
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCreate}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {loading ? "Creando…" : "Crear tarea"}
          </Button>
        </div>
      </div>
    </div>
  )
}
