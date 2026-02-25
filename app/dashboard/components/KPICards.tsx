"use client"

import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Target } from "lucide-react"

const KPIS = [
  {
    label: "Ingresos Totales",
    value: "€24,580",
    change: { value: 12.5, isPositive: true },
    icon: DollarSign,
    description: "Mes actual"
  },
  {
    label: "Clientes Activos",
    value: "1,284",
    change: { value: 8.2, isPositive: true },
    icon: Users,
    description: "Registrados este mes"
  },
  {
    label: "Ventas",
    value: "347",
    change: { value: -3.1, isPositive: false },
    icon: ShoppingCart,
    description: "Este mes"
  },
  {
    label: "Objetivo Mensual",
    value: "68%",
    change: { value: 5.7, isPositive: true },
    icon: Target,
    description: "Completado"
  }
]

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {KPIS.map((kpi, index) => (
        <div
          key={kpi.label}
          className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl p-6 hover:bg-[var(--bg-main)] transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <kpi.icon className="w-6 h-6 text-purple-400" />
            </div>
            {kpi.change && (
              <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                kpi.change.isPositive
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}>
                {kpi.change.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="font-medium">
                  {kpi.change.isPositive ? '+' : ''}{kpi.change.value}%
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{kpi.value}</p>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{kpi.label}</p>
            <p className="text-xs text-[var(--text-secondary)]">{kpi.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}