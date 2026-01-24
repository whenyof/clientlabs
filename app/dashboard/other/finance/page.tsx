"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { FinanceHeader } from "./components/FinanceHeader"
import { FinanceKPIs } from "./components/FinanceKPIs"
import { MainChart } from "./components/MainChart"
import { CashflowBlock } from "./components/CashflowBlock"
import { TransactionsTable } from "./components/TransactionsTable"
import { FixedExpenses } from "./components/FixedExpenses"
import { Budgets } from "./components/Budgets"
import { Forecast } from "./components/Forecast"
import { Goals } from "./components/Goals"
import { Alerts } from "./components/Alerts"
import { AutomationFinance } from "./components/AutomationFinance"
import { CreateTransactionModal } from "./components/CreateTransactionModal"
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  CreditCardIcon,
  CalculatorIcon,
  BellIcon,
  CogIcon
} from "@heroicons/react/24/outline"

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'forecast' | 'goals' | 'alerts' | 'automation'>('overview')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const tabs = [
    { id: 'overview' as const, label: 'Vista General', icon: ChartBarIcon },
    { id: 'transactions' as const, label: 'Movimientos', icon: CreditCardIcon },
    { id: 'budgets' as const, label: 'Presupuestos', icon: BanknotesIcon },
    { id: 'forecast' as const, label: 'Pronóstico', icon: CurrencyEuroIcon },
    { id: 'goals' as const, label: 'Objetivos', icon: BellIcon },
    { id: 'alerts' as const, label: 'Alertas', icon: BellIcon },
    { id: 'automation' as const, label: 'Automatización', icon: CogIcon }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <FinanceKPIs />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <MainChart />
              <CashflowBlock />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <FixedExpenses />
              <Budgets />
            </div>
            <Forecast />
            <Goals />
            <Alerts />
          </div>
        )
      case 'transactions':
        return <TransactionsTable />
      case 'budgets':
        return <Budgets />
      case 'forecast':
        return <Forecast />
      case 'goals':
        return <Goals />
      case 'alerts':
        return <Alerts />
      case 'automation':
        return <AutomationFinance />
      default:
        return <FinanceKPIs />
    }
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Finanzas</h1>
        <p className="text-sm text-white/60">
          Gestiona tus ingresos y gastos
        </p>
      </div>

      <FinanceHeader onCreateTransaction={() => setIsCreateModalOpen(true)} />

      {/* Navigation Tabs */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300
                ${activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>

      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </DashboardContainer>
  )
}