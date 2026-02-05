"use client"

import { useState } from "react"
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

/** No section analytics backend — tab values 0. */
const emptyTabData = { kpis: { primary: 0, trend: 0 } }

export function SectionTabs({ selectedRange }: SectionTabsProps) {
  const [activeTab, setActiveTab] = useState('ventas')
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      <div className="flex border-b border-gray-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-600/20 border-b-2 border-purple-500'
                : 'hover:bg-gray-700/30'
            }`}
          >
            <div className={`text-sm font-medium ${activeTab === tab.id ? 'text-purple-400' : 'text-gray-400'}`}>
              {tab.label}
            </div>
            <div className={`text-lg font-bold mt-1 ${activeTab === tab.id ? 'text-white' : 'text-gray-300'}`}>
              {tab.id === 'ventas' || tab.id === 'finanzas' ? `€${(emptyTabData.kpis.primary as number).toLocaleString('es-ES')}` : emptyTabData.kpis.primary}
            </div>
            <div className="text-xs text-gray-400">
              {emptyTabData.kpis.trend}%
            </div>
          </button>
        ))}
      </div>
      <div className="p-6">
        {ActiveComponent && <ActiveComponent selectedRange={selectedRange} />}
      </div>
    </div>
  )
}