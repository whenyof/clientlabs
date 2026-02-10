"use client"

import {
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyEuroIcon,
  FlagIcon,
  BellIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline"
import { useRouter, useSearchParams } from "next/navigation"

export type FinanceTabId =
  | "overview"
  | "transactions"
  | "budgets"
  | "forecast"
  | "goals"
  | "alerts"
  | "automation"

const TABS: { id: FinanceTabId; label: string; icon: typeof ChartBarIcon }[] = [
  { id: "overview", label: "Vista General", icon: ChartBarIcon },
  // Tesorería: caja y movimientos
  { id: "transactions", label: "Tesorería", icon: CreditCardIcon },
  // Compras: presupuestos y control de gasto
  { id: "budgets", label: "Compras", icon: BanknotesIcon },
  { id: "forecast", label: "Pronóstico", icon: CurrencyEuroIcon },
  { id: "goals", label: "Objetivos", icon: FlagIcon },
  { id: "alerts", label: "Alertas", icon: BellIcon },
  { id: "automation", label: "Automatización", icon: Cog6ToothIcon },
]

interface FinanceNavTabsProps {
  activeTab: FinanceTabId
  onTabChange: (tab: FinanceTabId) => void
}

export function FinanceNavTabs({ activeTab, onTabChange }: FinanceNavTabsProps) {
  // Original behavior for internal finance sections
  return (
    <nav
      className="flex justify-center w-full"
      aria-label="Navegación financiera"
    >
      <div className="w-full flex items-center justify-center gap-2 flex-wrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                h-9 px-4 rounded-xl text-sm font-medium
                flex items-center gap-2 shrink-0
                transition-all duration-150
                ${isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Hub-level tabs for /dashboard/finance — exact order and labels
// view= param pushed to URL; movements uses "transactions" (FinanceView section id)
const HUB_TABS = [
  { id: "overview", label: "Vista General", view: undefined },
  { id: "movements", label: "Movimientos", view: "transactions" },
  { id: "purchases", label: "Compras", view: "purchases" },
  { id: "income", label: "Ventas", view: "income" },
  { id: "billing", label: "Facturación", view: "billing" },
  { id: "alerts", label: "Alertas", view: "alerts" },
  { id: "automation", label: "Automatización", view: "automation" },
] as const

type HubTabId = (typeof HUB_TABS)[number]["id"]

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

  const handleClick = (tab: (typeof HUB_TABS)[number]) => {
    router.push(buildHref(tab))
  }

  return (
    <nav
      className="flex justify-center w-full"
      aria-label="Navegación principal de Finanzas"
    >
      <div className="w-full flex items-center justify-center gap-2 flex-wrap">
        {HUB_TABS.map((tab) => {
          const active = isActive(tab)
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleClick(tab)}
              className={`
                h-9 px-4 rounded-xl text-sm font-medium
                flex items-center gap-2 shrink-0
                transition-all duration-150
                ${
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }
              `}
              aria-current={active ? "page" : undefined}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { TABS as FINANCE_TABS }
