"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency } from "../utils"
import type { SalesForecastResult } from "../types"

export type ApiForecast = {
  next30: { base: number; conservative: number; optimistic: number }
  confidence: "HIGH" | "MEDIUM" | "LOW"
}

type ForecastChartPoint = {
  label: string
  date: string
  revenue: number
  forecastBase: number | null
  forecastOptimistic: number | null
  forecastConservative: number | null
}

type Props = {
  forecast: SalesForecastResult
  apiForecast?: ApiForecast | null
}

function ConfidenceBadge({ confidence }: { confidence: ApiForecast["confidence"] }) {
  const config = {
    HIGH: { label: "HIGH", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    MEDIUM: { label: "MEDIUM", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    LOW: { label: "LOW", className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
  }
  const c = config[confidence]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        c.className
      )}
    >
      {c.label}
    </span>
  )
}

function ForecastChartRealAndScenarios({ chartData }: { chartData: ForecastChartPoint[] }) {
  const { labels } = useSectorConfig()
  const sl = labels.sales?.forecast
  const realLabel = sl?.historical ?? "Real"
  const baseLabel = sl?.scenarios?.base ?? "Base"
  const optLabel = sl?.scenarios?.optimista ?? "Optimista"
  const consLabel = sl?.scenarios?.conservador ?? "Conservador"

  return (
    <div className="h-[280px] min-h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(24 24 27)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.8)" }}
            formatter={(value: number, name: string) => [
              typeof value === "number" && (name === "revenue" || name.startsWith("forecast"))
                ? formatSaleCurrency(value)
                : value,
              name === "revenue"
                ? realLabel
                : name === "forecastBase"
                  ? baseLabel
                  : name === "forecastOptimistic"
                    ? optLabel
                    : name === "forecastConservative"
                      ? consLabel
                      : name,
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name={realLabel}
            stroke="rgba(59, 130, 246, 0.9)"
            strokeWidth={2}
            dot={{ fill: "rgba(59, 130, 246, 0.8)", r: 2 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecastBase"
            name={baseLabel}
            stroke="rgba(147, 197, 253, 0.9)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecastOptimistic"
            name={optLabel}
            stroke="rgba(34, 197, 94, 0.7)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecastConservative"
            name={consLabel}
            stroke="rgba(148, 163, 184, 0.8)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ForecastChartRevenue({ chartData }: { chartData: SalesForecastResult["chartData"] }) {
  const { labels } = useSectorConfig()
  const sl = labels.sales?.forecast
  const historicalLabel = sl?.historical ?? "Histórico"
  const projectedLabel = sl?.projected ?? "Proyección"

  return (
    <div className="h-[280px] min-h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(24 24 27)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.8)" }}
            formatter={(value: number, name: string) => [
              name === "revenue" ? formatSaleCurrency(value) : value,
              name === "revenue" ? historicalLabel : name === "forecastRevenue" ? projectedLabel : name,
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name={historicalLabel}
            stroke="rgba(59, 130, 246, 0.9)"
            strokeWidth={2}
            dot={{ fill: "rgba(59, 130, 246, 0.8)", r: 2 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecastRevenue"
            name={projectedLabel}
            stroke="rgba(147, 197, 253, 0.9)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ForecastChartCount({ chartData }: { chartData: SalesForecastResult["chartData"] }) {
  const { labels } = useSectorConfig()
  const sl = labels.sales?.forecast
  const historicalLabel = sl?.historical ?? "Histórico"
  const projectedLabel = sl?.projected ?? "Proyección"

  return (
    <div className="h-[280px] min-h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(24 24 27)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.8)" }}
            formatter={(value: number, name: string) => [
              Math.round(Number(value)),
              name === "count" ? historicalLabel : name === "forecastCount" ? projectedLabel : name,
            ]}
            labelFormatter={(label) => label}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="count"
            name={historicalLabel}
            stroke="rgba(59, 130, 246, 0.9)"
            strokeWidth={2}
            dot={{ fill: "rgba(59, 130, 246, 0.8)", r: 2 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecastCount"
            name={projectedLabel}
            stroke="rgba(147, 197, 253, 0.9)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SalesForecastSection({ forecast, apiForecast }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales?.forecast
  const sc = sl?.scenarios

  const chartDataWithScenarios = useMemo((): ForecastChartPoint[] | null => {
    if (!apiForecast) return null
    const historical = forecast.chartData.filter((p) => p.forecastRevenue === null)
    const baseDaily = apiForecast.next30.base / 30
    const optDaily = apiForecast.next30.optimistic / 30
    const consDaily = apiForecast.next30.conservative / 30
    const future: ForecastChartPoint[] = []
    for (let i = 1; i <= 30; i++) {
      future.push({
        label: `D+${i}`,
        date: `forecast-${i}`,
        revenue: 0,
        forecastBase: baseDaily,
        forecastOptimistic: optDaily,
        forecastConservative: consDaily,
      })
    }
    return [
      ...historical.map((p) => ({
        label: p.label,
        date: p.date,
        revenue: p.revenue,
        forecastBase: null as number | null,
        forecastOptimistic: null as number | null,
        forecastConservative: null as number | null,
      })),
      ...future,
    ]
  }, [forecast.chartData, apiForecast])

  if (!forecast.canCompute && !apiForecast) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h3 className="text-sm font-medium text-white/80 mb-2">{sl?.title ?? "Forecast"}</h3>
        <p className="text-sm text-white/50">{sl?.noDataMessage ?? "No hay suficientes datos para generar un forecast fiable"}</p>
      </div>
    )
  }

  const { projections, chartData } = forecast
  const useApiNext30 = !!apiForecast

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-white/80">{sl?.title ?? "Forecast de ventas"}</h3>
        {apiForecast && <ConfidenceBadge confidence={apiForecast.confidence} />}
      </div>

      {chartDataWithScenarios && chartDataWithScenarios.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h4 className="text-xs font-medium text-white/60 mb-4">{sl?.chartRevenueTitle ?? "Forecast de ingresos"}</h4>
          <ForecastChartRealAndScenarios chartData={chartDataWithScenarios} />
        </div>
      )}

      {(!chartDataWithScenarios || chartDataWithScenarios.length === 0) && forecast.canCompute && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h4 className="text-xs font-medium text-white/60 mb-4">{sl?.chartRevenueTitle ?? "Forecast de ingresos"}</h4>
            <ForecastChartRevenue chartData={chartData} />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h4 className="text-xs font-medium text-white/60 mb-4">{sl?.chartSalesTitle ?? "Forecast de ventas"}</h4>
            <ForecastChartCount chartData={chartData} />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h4 className="text-xs font-medium text-white/60 mb-4">Resumen numérico</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-white/70 mb-3">{sl?.summaryNext30 ?? "Próximos 30 días"}</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.base ?? "Base"}</span>
                <span className="font-medium text-white tabular-nums">
                  {formatSaleCurrency(useApiNext30 ? apiForecast!.next30.base : projections.next30.base.revenue)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.conservador ?? "Conservador"}</span>
                <span className="text-white/80 tabular-nums">
                  {formatSaleCurrency(useApiNext30 ? apiForecast!.next30.conservative : projections.next30.conservador.revenue)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.optimista ?? "Optimista"}</span>
                <span className="text-white/80 tabular-nums">
                  {formatSaleCurrency(useApiNext30 ? apiForecast!.next30.optimistic : projections.next30.optimista.revenue)}
                </span>
              </div>
            </dl>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-3">{sl?.summaryNext90 ?? "Próximos 90 días"}</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.base ?? "Base"}</span>
                <span className="font-medium text-white tabular-nums">{formatSaleCurrency(projections.next90.base.revenue)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.conservador ?? "Conservador"}</span>
                <span className="text-white/80 tabular-nums">{formatSaleCurrency(projections.next90.conservador.revenue)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.optimista ?? "Optimista"}</span>
                <span className="text-white/80 tabular-nums">{formatSaleCurrency(projections.next90.optimista.revenue)}</span>
              </div>
            </dl>
          </div>
          <div>
            <p className="text-sm text-white/70 mb-3">{sl?.summaryEndOfMonth ?? "Fin de mes"}</p>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.base ?? "Base"}</span>
                <span className="font-medium text-white tabular-nums">{formatSaleCurrency(projections.endOfMonth.base.revenue)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.conservador ?? "Conservador"}</span>
                <span className="text-white/80 tabular-nums">{formatSaleCurrency(projections.endOfMonth.conservador.revenue)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-white/50">{sc?.optimista ?? "Optimista"}</span>
                <span className="text-white/80 tabular-nums">{formatSaleCurrency(projections.endOfMonth.optimista.revenue)}</span>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
