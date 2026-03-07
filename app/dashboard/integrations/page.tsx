"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { useIntegrations } from "./hooks/useIntegrations"
import { IntegrationHero } from "./components/IntegrationHero"
import { IntegrationCategories } from "./components/IntegrationCategories"
import { IntegrationGrid } from "./components/IntegrationGrid"
import { IntegrationLogs } from "./components/IntegrationLogs"
import { WorkflowPanel } from "./components/WorkflowPanel"
import { AIRecommendations } from "./components/AIRecommendations"
import { IntegrationModal } from "./components/IntegrationModal"

export default function IntegrationsPage() {
  const { labels } = useSectorConfig()
  const t = labels.integrations.tabs
  const { integrations } = useIntegrations()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'workflows' | 'ai'>('overview')
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const tabs = [
    { id: 'overview' as const, label: t.overview, icon: '🔗' },
    { id: 'logs' as const, label: t.logs, icon: '📋' },
    { id: 'workflows' as const, label: t.workflows, icon: '⚡' },
    { id: 'ai' as const, label: t.ai, icon: '🤖' }
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
              integrations={integrations}
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
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{labels.integrations.title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {labels.integrations.pageSubtitle}
        </p>
      </div>

      {/* Hero Section */}
      <IntegrationHero onAddIntegration={() => handleIntegrationAction(null, 'add')} />

      {/* Navigation Tabs */}
      <motion.div
        className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] overflow-hidden p-2"
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
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-[var(--shadow-card)] shadow-emerald-500/10'
                  : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
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