"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

const LazyComposedChart = dynamic(
  () => import("recharts").then((m) => m.ComposedChart),
  { ssr: false }
)

type DataPoint = { month: string; revenue: number }
type Props = { data?: DataPoint[] }

const STROKE = "#0F766E"

const eurFmt = (v: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)

function computeYAxis(maxVal: number) {
  let step: number
  if (maxVal <= 20_000) step = 5_000
  else if (maxVal <= 100_000) step = 10_000
  else if (maxVal <= 500_000) step = 50_000
  else step = 100_000
  const upper = maxVal > 0 ? Math.ceil(maxVal / step) * step : step * 2
  const ticks: number[] = []
  for (let i = 0; i <= upper; i += step) ticks.push(i)
  return { upper, ticks }
}

type TPayload = { dataKey: string; value: number | null }
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: TPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null
  const entry = payload.find((p) => p.value !== null && (p.dataKey === "revenueS" || p.dataKey === "revenueD"))
  if (!entry || entry.value === null) return null
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
      <p style={{ fontSize: 12, color: "#5B7280", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1F2A", margin: 0 }}>{eurFmt(entry.value)}</p>
    </div>
  )
}

export function RevenueChart({ data }: Props) {
  const [chartWidth, setChartWidth] = useState(600)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => { if (containerRef.current) setChartWidth(containerRef.current.offsetWidth) }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const baseData = useMemo(
    () => data && data.length > 0
      ? data
      : ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((m) => ({ month: m, revenue: 0 })),
    [data],
  )

  // Exclude the current (incomplete) month — chart ends at last complete month
  const chartData = useMemo(
    () => baseData.slice(0, baseData.length - 1).map((d) => ({ ...d, revenueS: d.revenue })),
    [baseData],
  )

  const yAxis = useMemo(() => {
    const max = Math.max(...baseData.map((d) => d.revenue), 0)
    return computeYAxis(max)
  }, [baseData])

  const lastIdx = chartData.length - 1

  return (
    <div style={{ padding: "18px 18px 14px" }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "#0a0a0a", margin: 0, letterSpacing: "-0.012em" }}>
          Facturación
        </h3>
        <div style={{ fontSize: 11.5, color: "#737373", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>
          Últimos 12 meses · Mensual
        </div>
      </div>
      <div ref={containerRef} style={{ width: "100%" }}>
        <LazyComposedChart
          width={chartWidth}
          height={280}
          data={chartData}
          margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
        >
          <defs>
            <linearGradient id="rev-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={STROKE} stopOpacity={0.12} />
              <stop offset="100%" stopColor={STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#5B7280"
            tick={{ fontSize: 11, fill: "#5B7280" }}
            tickLine={false}
            axisLine={false}
            dy={8}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            domain={[0, yAxis.upper]}
            ticks={yAxis.ticks}
            stroke="#5B7280"
            tick={{ fontSize: 11, fill: "#5B7280" }}
            width={68}
            tickFormatter={eurFmt}
            tickLine={false}
            axisLine={false}
            dx={-4}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#E2E8F0", strokeWidth: 1 }} />
          {/* Solid area — all complete months; dot on last (most recent complete month) */}
          <Area
            type="monotone"
            dataKey="revenueS"
            stroke={STROKE}
            strokeWidth={2.5}
            fill="url(#rev-area-grad)"
            fillOpacity={1}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dot={(dotProps: any) => {
              const { cx, cy, index } = dotProps as { cx: number; cy: number; index: number }
              if (index === lastIdx) {
                return <circle key={`dot-${index}`} cx={cx} cy={cy} r={4} fill="#ffffff" stroke={STROKE} strokeWidth={2} />
              }
              return <g key={`dot-${index}`} />
            }}
            activeDot={{ r: 4, stroke: STROKE, strokeWidth: 2, fill: "#FFFFFF" }}
            isAnimationActive
            animationDuration={600}
            animationEasing="ease-out"
            connectNulls={false}
          />
        </LazyComposedChart>
      </div>
    </div>
  )
}

export default RevenueChart
