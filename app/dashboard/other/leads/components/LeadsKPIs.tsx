"use client"

import { TrendingUp, Target, AlertCircle, Users, Sparkles, Clock, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function LeadsKPIs({ kpis }: {
  kpis: {
    total: number
    hot: number
    warm: number
    cold: number
    converted: number
    lost: number
  }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current active filters
  const currentTemp = searchParams.get("temperature") || "all"
  const currentStatus = searchParams.get("status") || "all"
  const showConverted = searchParams.get("showConverted") === "true"
  const showLost = searchParams.get("showLost") === "true"

  // Handle KPI card click to filter
  const handleFilter = (filterType: "temperature" | "status" | "all", value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterType === "all") {
      // Reset all filters
      params.delete("temperature")
      params.delete("status")
      params.delete("showConverted")
      params.delete("showLost")
    } else if (filterType === "temperature") {
      params.set("temperature", value)
      params.delete("status")
      params.delete("showConverted")
      params.delete("showLost")
    } else if (filterType === "status") {
      params.delete("temperature")
      if (value === "CONVERTED") {
        params.set("showConverted", "true")
        params.delete("showLost")
      } else if (value === "LOST") {
        params.set("showLost", "true")
        params.delete("showConverted")
      }
    }

    router.push(`?${params.toString()}`)
  }

  // Calculate derived metrics
  const activeLeads = kpis.total - kpis.converted - kpis.lost
  const conversionRate = kpis.total > 0 ? Math.round((kpis.converted / kpis.total) * 100) : 0

  const stats = [
    {
      label: "Total Leads",
      value: kpis.total,
      icon: Users,
      color: "text-slate-300",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
      subtitle: `${activeLeads} activos`,
      ringColor: "hover:ring-slate-500/30",
      activeRing: "ring-2 ring-slate-400/50",
      onClick: () => handleFilter("all", ""),
      isActive: currentTemp === "all" && currentStatus === "all" && !showConverted && !showLost
    },
    {
      label: "🔥 HOT",
      value: kpis.hot,
      icon: TrendingUp,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      subtitle: "Atención inmediata",
      highlight: true,
      ringColor: "hover:ring-red-500/40",
      activeRing: "ring-2 ring-red-400/60 shadow-lg shadow-red-500/20",
      onClick: () => handleFilter("temperature", "HOT"),
      isActive: currentTemp === "HOT"
    },
    {
      label: "🌤️ WARM",
      value: kpis.warm,
      icon: AlertCircle,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      subtitle: "Seguimiento activo",
      ringColor: "hover:ring-amber-500/30",
      activeRing: "ring-2 ring-amber-400/60",
      onClick: () => handleFilter("temperature", "WARM"),
      isActive: currentTemp === "WARM"
    },
    {
      label: "❄️ COLD",
      value: kpis.cold,
      icon: Clock,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      subtitle: "Nurturing",
      ringColor: "hover:ring-cyan-500/30",
      activeRing: "ring-2 ring-cyan-400/60",
      onClick: () => handleFilter("temperature", "COLD"),
      isActive: currentTemp === "COLD"
    },
    {
      label: "Convertidos",
      value: kpis.converted,
      icon: Target,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      subtitle: `${conversionRate}% tasa`,
      ringColor: "hover:ring-emerald-500/30",
      activeRing: "ring-2 ring-emerald-400/60",
      onClick: () => handleFilter("status", "CONVERTED"),
      isActive: showConverted
    },
    {
      label: "Perdidos",
      value: kpis.lost,
      icon: XCircle,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/30",
      subtitle: "Analizar causas",
      ringColor: "hover:ring-rose-500/30",
      activeRing: "ring-2 ring-rose-400/60",
      onClick: () => handleFilter("status", "LOST"),
      isActive: showLost
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className={`group rounded-xl border backdrop-blur-sm p-4 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl text-left ${stat.isActive
                ? `${stat.activeRing} ${stat.bgColor} ${stat.borderColor} scale-[1.02]`
                : `${stat.borderColor} ${stat.bgColor} opacity-80 hover:opacity-100 ${stat.ringColor}`
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              {stat.highlight && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color} mb-1 tracking-tight`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-xs text-white/40">{stat.subtitle}</p>
          </button>
        )
      })}
    </div>
  )
}

