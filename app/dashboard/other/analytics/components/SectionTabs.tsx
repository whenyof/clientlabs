"use client"

import { useState } from "react"
import { mockSectionAnalytics, formatCurrency, formatPercentage, getTrendColor } from "../mock"
import { LeadsAnalytics } from "./LeadsAnalytics"
import { SalesAnalytics } from "./SalesAnalytics"
import { FinanceAnalytics } from "./FinanceAnalytics"
import { AutomationAnalytics } from "./AutomationAnalytics"

interface SectionTabsProps {
  selectedRange: string
}

const tabs = [
  { id: 'ventas', label: 'Ventas', component: SalesAnalytics },
  { id: 'leads', label: 'Leads', component: LeadsAnalytics },
  { id: 'finanzas', label: 'Finanzas', component: FinanceAnalytics },
  { id: 'automatizaciones', label: 'Automatizaciones', component: AutomationAnalytics }
]

export function SectionTabs({ selectedRange }: SectionTabsProps) {
  const [activeTab, setActiveTab] = useState('ventas')
  const sectionData = mockSectionAnalytics[activeTab]
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        {tabs.map((tab) => {
          const tabData = mockSectionAnalytics[tab.id]
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-center transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 border-b-2 border-purple-500'
                  : 'hover:bg-gray-700/30'
              }`}
            >
              <div className={`text-sm font-medium ${
                activeTab === tab.id ? 'text-purple-400' : 'text-gray-400'
              }`}>
                {tab.label}
              </div>
              <div className={`text-lg font-bold mt-1 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-300'
              }`}>
                {tab.id === 'ventas' || tab.id === 'finanzas' || tab.id === 'clientes'
                  ? formatCurrency(tabData.kpis.primary)
                  : tabData.kpis.primary
                }
              </div>
              <div className={`text-xs ${getTrendColor(tabData.kpis.trend)}`}>
                {formatPercentage(tabData.kpis.trend)}
              </div>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {ActiveComponent && <ActiveComponent selectedRange={selectedRange} />}
      </div>
    </div>
  )
}