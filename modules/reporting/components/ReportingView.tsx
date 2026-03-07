"use client"

import { useState, useEffect, useMemo } from "react"
import { getReportingData } from "../actions"
import {
  getReportingDateRange,
  getReportingPreviousDateRange,
  filterSalesByDateRange,
  aggregateChartData,
  computeTopClients,
  computeRevenueByType,
  computeReportingKPIs,
  monthlyRevenueFromSales,
  computeRevenueForecast,
} from "../utils"
import { ReportingKPIs } from "./ReportingKPIs"
import { ReportingPeriodPicker } from "./ReportingPeriodPicker"
import { ReportingChart } from "./ReportingChart"
import { ReportingBreakdown } from "./ReportingBreakdown"
import { ReportingInsight } from "./ReportingInsight"
import { ReportingForecast } from "./ReportingForecast"
import { ReportingYoY } from "./ReportingYoY"
import type { ReportingSale, ReportingPeriodPreset } from "../types"

export function ReportingView() {
  const [sales, setSales] = useState<ReportingSale[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<ReportingPeriodPreset>("30d")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getReportingData()
      .then((data) => {
        if (!cancelled) setSales(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { from, to } = useMemo(() => getReportingDateRange(period), [period])
  const { from: prevFrom, to: prevTo } = useMemo(
    () => getReportingPreviousDateRange(period),
    [period]
  )

  const salesInRange = useMemo(
    () => filterSalesByDateRange(sales, from, to),
    [sales, from, to]
  )
  const salesPrevious = useMemo(
    () => filterSalesByDateRange(sales, prevFrom, prevTo),
    [sales, prevFrom, prevTo]
  )

  const kpis = useMemo(
    () => computeReportingKPIs(salesInRange, salesPrevious),
    [salesInRange, salesPrevious]
  )

  const chartData = useMemo(
    () => aggregateChartData(salesInRange, from, to, period),
    [salesInRange, from, to, period]
  )

  const topClients = useMemo(() => computeTopClients(salesInRange, 5), [salesInRange])
  const revenueByType = useMemo(() => computeRevenueByType(salesInRange), [salesInRange])

  const monthlyHistory = useMemo(() => monthlyRevenueFromSales(sales, 12), [sales])
  const forecast = useMemo(() => computeRevenueForecast(monthlyHistory), [monthlyHistory])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
        <div className="h-[320px] rounded-xl border border-white/10 bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-[260px] rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          <div className="h-[260px] rounded-xl border border-white/10 bg-white/5 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ReportingPeriodPicker value={period} onChange={setPeriod} />
      </div>

      <ReportingKPIs kpis={kpis} />

      <ReportingChart data={chartData} />

      <ReportingBreakdown topClients={topClients} revenueByType={revenueByType} />

      <ReportingForecast forecast={forecast} />

      <ReportingYoY sales={sales} />

      <ReportingInsight
        salesInRange={salesInRange}
        kpis={kpis}
        topClients={topClients}
      />
    </div>
  )
}
