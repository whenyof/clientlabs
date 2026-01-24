"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { IntegrationHero } from "./components/IntegrationHero"
import { IntegrationCategories } from "./components/IntegrationCategories"
import { IntegrationGrid } from "./components/IntegrationGrid"
import { IntegrationLogs } from "./components/IntegrationLogs"
import { WorkflowPanel } from "./components/WorkflowPanel"
import { AIRecommendations } from "./components/AIRecommendations"
import { IntegrationModal } from "./components/IntegrationModal"

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'workflows' | 'ai'>('overview')
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const tabs = [
    { id: 'overview' as const, label: 'Vista General', icon: '🔗' },
    { id: 'logs' as const, label: 'Logs', icon: '📋' },
    { id: 'workflows' as const, label: 'Automatizaciones', icon: '⚡' },
    { id: 'ai' as const, label: 'IA', icon: '🤖' }
  ]

  const handleIntegrationAction = (integration: any, action: string) => {
    setSelectedIntegration({ ...integration, action })
    setShowModal(true)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <IntegrationCategories
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            <IntegrationGrid
              selectedCategory={selectedCategory}
              onIntegrationAction={handleIntegrationAction}
            />
          </div>
        )
      case 'logs':
        return <IntegrationLogs />
      case 'workflows':
        return <WorkflowPanel />
      case 'ai':
        return <AIRecommendations />
      default:
        return null
    }
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Integraciones</h1>
        <p className="text-sm text-white/60">
          Conecta tus herramientas favoritas y automatiza procesos
        </p>
      </div>

      {/* Hero Section */}
      <IntegrationHero onAddIntegration={() => handleIntegrationAction(null, 'add')} />

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
              <span className="text-lg">{tab.icon}</span>
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

      {/* Integration Modal */}
      <IntegrationModal
        integration={selectedIntegration}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </DashboardContainer>
  )
}