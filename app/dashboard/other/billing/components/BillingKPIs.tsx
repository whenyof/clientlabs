"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import {
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldExclamationIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type KPIPeriod = "month" | "quarter" | "year" | "custom"

interface KPIData {
  outstanding: number
  overdue: number
  collected: number
  collectionRate: number
  avgDaysToPay: number | null
  riskExposure: number
}

interface BillingKPIsProps {
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

function formatDays(value: number | null): string {
  if (value === null) return "—"
  return `${value.toFixed(0)}d`
}

const PERIOD_OPTIONS: { id: KPIPeriod; label: string }[] = [
  { id: "month", label: "Mes" },
  { id: "quarter", label: "Trimestre" },
  { id: "year", label: "Año" },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BillingKPIs({ className }: BillingKPIsProps) {
  const [data, setData] = useState<KPIData | null>(null)
  const [period, setPeriod] = useState<KPIPeriod>("month")
  const [isPending, startTransition] = useTransition()
  const [, setError] = useState<string | null>(null)

  const fetchKPIs = useCallback(async (p: KPIPeriod) => {
    try {
      setError(null)
      const res = await fetch(`/api/invoicing/kpis?period=${p}`, {
        credentials: "include",
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to fetch KPIs")
      const json = await res.json()
      if (json.success && json.kpis) {
        setData(json.kpis)
      }
    } catch (err) {
      console.error("KPI fetch error:", err)
      setError("Error loading KPIs")
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchKPIs(period)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Period change
  const handlePeriodChange = useCallback(
    (newPeriod: KPIPeriod) => {
      setPeriod(newPeriod)
      startTransition(() => {
        fetchKPIs(newPeriod)
      })
    },
    [fetchKPIs]
  )

  // Auto-refresh every 30s for "real-time feel"
  useEffect(() => {
    const interval = setInterval(() => {
      fetchKPIs(period)
    }, 30_000)
    return () => clearInterval(interval)
  }, [period, fetchKPIs])

  // KPI card definitions
  const cards = [
    {
      id: "outstanding",
      label: "Pendiente de cobro",
      value: data ? formatCurrency(data.outstanding) : "—",
      icon: BanknotesIcon,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/10",
      borderHover: "hover:border-amber-500/40",
      glowColor: "group-hover:shadow-amber-500/10",
    },
    {
      id: "overdue",
      label: "Vencido",
      value: data ? formatCurrency(data.overdue) : "—",
      icon: ExclamationTriangleIcon,
      gradient: "from-red-500 to-rose-600",
      bgGradient: "from-red-500/10 to-rose-600/10",
      borderHover: "hover:border-red-500/40",
      glowColor: "group-hover:shadow-red-500/10",
      alert: data && data.overdue > 0,
    },
    {
      id: "collected",
      label: "Cobrado en el periodo",
      value: data ? formatCurrency(data.collected) : "—",
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/10",
      borderHover: "hover:border-emerald-500/40",
      glowColor: "group-hover:shadow-emerald-500/10",
    },
    {
      id: "collectionRate",
      label: "% Cobro",
      value: data ? formatPercent(data.collectionRate) : "—",
      icon: ChartBarIcon,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/10 to-indigo-600/10",
      borderHover: "hover:border-blue-500/40",
      glowColor: "group-hover:shadow-blue-500/10",
    },
    {
      id: "avgDaysToPay",
      label: "Días medios de pago",
      value: data ? formatDays(data.avgDaysToPay) : "—",
      icon: ClockIcon,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/10",
      borderHover: "hover:border-violet-500/40",
      glowColor: "group-hover:shadow-violet-500/10",
    },
    {
      id: "riskExposure",
      label: "Riesgo en cartera",
      value: data ? formatCurrency(data.riskExposure) : "—",
      icon: ShieldExclamationIcon,
      gradient: "from-fuchsia-500 to-pink-600",
      bgGradient: "from-fuchsia-500/10 to-pink-600/10",
      borderHover: "hover:border-fuchsia-500/40",
      glowColor: "group-hover:shadow-fuchsia-500/10",
      alert: data && data.riskExposure > 0,
    },
  ]

  return (
    <div className={className}>
      {/* Period selector + refresh */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 p-1 bg-gray-800/60 rounded-xl backdrop-blur-sm border border-gray-700/40">
          <CalendarIcon className="w-4 h-4 text-gray-400 ml-2" />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handlePeriodChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${period === opt.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => fetchKPIs(period)}
          disabled={isPending}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50"
          title="Actualizar"
        >
          <ArrowPathIcon
            className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className={`group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 ${card.borderHover} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${card.glowColor}`}
            >
              {/* Background gradient fill */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-50`}
              />

              {/* Alert pulse for overdue/risk */}
              {card.alert && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-gradient-to-r ${card.gradient}`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r ${card.gradient}`}
                    />
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div
                  className={`text-2xl font-bold text-white mb-1 transition-opacity duration-300 ${isPending ? "opacity-50" : "opacity-100"
                    }`}
                >
                  {card.value}
                </div>

                <div className="text-xs text-gray-400 font-medium leading-tight">
                  {card.label}
                </div>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )
        })}
      </div>
    </div>
  )
}