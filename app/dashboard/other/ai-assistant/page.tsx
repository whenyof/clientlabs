"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { AssistantHeader } from "./components/AssistantHeader"
import { AssistantKPIs } from "./components/AssistantKPIs"
import { InsightCards } from "./components/InsightCards"
import { HotLeadsTable } from "./components/HotLeadsTable"
import { PredictionsChart } from "./components/PredictionsChart"
import { RecommendationsFeed } from "./components/RecommendationsFeed"
import { AutomationsPanel } from "./components/AutomationsPanel"
import { AssistantSettings } from "./components/AssistantSettings"
import { AssistantTimeline } from "./components/AssistantTimeline"
import { ChatWindow } from "./components/ChatWindow"
import {
  LightBulbIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  CogIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"

export default function AiAssistantPage() {
  const { labels } = useSectorConfig()
  const t = labels.aiAssistant.tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'leads' | 'predictions' | 'recommendations' | 'automations' | 'settings' | 'timeline' | 'chat'>('overview')

  const tabs = [
    { id: 'overview' as const, label: t.overview, icon: LightBulbIcon },
    { id: 'insights' as const, label: t.insights, icon: SparklesIcon },
    { id: 'leads' as const, label: t.hotLeads, icon: UserGroupIcon },
    { id: 'predictions' as const, label: t.predictions, icon: ChartBarIcon },
    { id: 'recommendations' as const, label: t.recommendations, icon: SparklesIcon },
    { id: 'automations' as const, label: t.automations, icon: CogIcon },
    { id: 'chat' as const, label: t.chat, icon: ChatBubbleLeftRightIcon },
    { id: 'timeline' as const, label: t.timeline, icon: ClockIcon },
    { id: 'settings' as const, label: t.settings, icon: CogIcon }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <AssistantKPIs />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <InsightCards />
              <RecommendationsFeed />
            </div>
            <HotLeadsTable />
          </div>
        )
      case 'insights':
        return <InsightCards />
      case 'leads':
        return <HotLeadsTable />
      case 'predictions':
        return <PredictionsChart />
      case 'recommendations':
        return <RecommendationsFeed />
      case 'automations':
        return <AutomationsPanel />
      case 'chat':
        return <ChatWindow />
      case 'settings':
        return <AssistantSettings />
      case 'timeline':
        return <AssistantTimeline />
      default:
        return <AssistantKPIs />
    }
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">{labels.aiAssistant.title}</h1>
        <p className="text-sm text-white/60">
          {labels.aiAssistant.pageSubtitle}
        </p>
      </div>

      {/* Header */}
      <AssistantHeader />

      {/* Navigation Tabs */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden p-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300
                  ${isActive
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
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            )
          })}
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
    </DashboardContainer>
  )
}