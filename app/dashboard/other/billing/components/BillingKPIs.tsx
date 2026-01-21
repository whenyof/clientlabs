"use client"

import { CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { mockKPIs } from "../mock"

interface BillingKPIsProps {
  className?: string
}

export function BillingKPIs({ className }: BillingKPIsProps) {
  const kpis = [
    {
      title: "Facturación Mes",
      value: `€${mockKPIs.monthlyRevenue.toLocaleString('es-ES')}`,
      icon: CurrencyDollarIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      title: "IVA Pendiente",
      value: `€${mockKPIs.monthlyTax.toLocaleString('es-ES')}`,
      icon: CurrencyDollarIcon,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10"
    },
    {
      title: "Facturas Pendientes",
      value: mockKPIs.pendingInvoices.toString(),
      icon: ClockIcon,
      color: "from-yellow-500 to-orange-600",
      bgColor: "from-yellow-500/10 to-orange-600/10"
    },
    {
      title: "Pagadas",
      value: mockKPIs.paidInvoices.toString(),
      icon: CheckCircleIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      title: "Vencidas",
      value: mockKPIs.overdueInvoices.toString(),
      icon: ExclamationTriangleIcon,
      color: "from-red-500 to-rose-600",
      bgColor: "from-red-500/10 to-rose-600/10"
    }
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${className}`}>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgColor} opacity-50`} />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {kpi.value}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400 font-medium">
                {kpi.title}
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )
      })}
    </div>
  )
}