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
  { id: "transactions", label: "Movimientos", icon: CreditCardIcon },
  { id: "budgets", label: "Presupuestos", icon: BanknotesIcon },
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

export { TABS as FINANCE_TABS }
