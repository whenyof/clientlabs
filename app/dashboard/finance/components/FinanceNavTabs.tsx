"use client"

import {
  BarChart3,
  CreditCard,
  Banknote,
  Euro,
  Flag,
  Bell,
  Settings,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export type FinanceTabId =
  | "overview"
  | "transactions"
  | "budgets"
  | "forecast"
  | "goals"
  | "alerts"
  | "automation"

const TABS: { id: FinanceTabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Vista General", icon: BarChart3 },
  { id: "transactions", label: "Tesorería", icon: CreditCard },
  { id: "budgets", label: "Compras", icon: Banknote },
  { id: "forecast", label: "Pronóstico", icon: Euro },
  { id: "goals", label: "Objetivos", icon: Flag },
  { id: "alerts", label: "Alertas", icon: Bell },
  { id: "automation", label: "Automatización", icon: Settings },
]

interface FinanceNavTabsProps {
  activeTab: FinanceTabId
  onTabChange: (tab: FinanceTabId) => void
}

export function FinanceNavTabs({ activeTab, onTabChange }: FinanceNavTabsProps) {
  return (
    <nav className="flex items-center gap-1 flex-wrap" aria-label="Navegación financiera">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              h-8 px-3 rounded-lg text-sm font-medium
              flex items-center gap-1.5 shrink-0
              transition-colors duration-150
              ${isActive
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"}
            `}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

// Hub-level tabs
const HUB_TABS = [
  { id: "overview", label: "Vista General", view: undefined },
  { id: "movements", label: "Movimientos", view: "transactions" },
  { id: "purchases", label: "Compras", view: "purchases" },
  { id: "income", label: "Ventas", view: "income" },
  { id: "billing", label: "Facturación", view: "billing" },
  { id: "alerts", label: "Alertas", view: "alerts" },
  { id: "automation", label: "Automatización", view: "automation" },
] as const

export function FinanceHubTabs({ period }: { period?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentView = searchParams.get("view") || "overview"

  const isActive = (tab: (typeof HUB_TABS)[number]) => {
    if (!tab.view && (currentView === "overview" || !currentView)) return true
    return tab.view === currentView
  }

  const buildHref = (tab: (typeof HUB_TABS)[number]) => {
    const params = new URLSearchParams()
    if (tab.view) params.set("view", tab.view)
    if (period && period !== "month") params.set("period", period)
    const qs = params.toString()
    return qs ? `/dashboard/finance?${qs}` : "/dashboard/finance"
  }

  return (
    <nav className="flex items-center gap-1 flex-wrap" aria-label="Navegación principal de Finanzas">
      {HUB_TABS.map((tab) => {
        const active = isActive(tab)
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => router.push(buildHref(tab))}
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
  )
}

export { TABS as FINANCE_TABS }
