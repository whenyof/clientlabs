"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
import { AssistantHeader } from "./components/AssistantHeader"
import { AssistantKPIs } from "./components/AssistantKPIs"
import { InsightCards } from "./components/InsightCards"
import { LeadsTable } from "@/modules/leads/components/LeadsTable"
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
            <LeadsTable />
          </div>
        )
      case 'insights':
        return <InsightCards />
      case 'leads':
        return <LeadsTable />
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
      {/* ── INSTITUTIONAL HEADER ──────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, paddingBottom: 18, borderBottom: "1px solid #eeeeee", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: "#0a0a0a" }}>Asistente IA</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#737373", flexWrap: "wrap" }}>
            <span>Conectado al workspace</span>
            <span style={{ color: "#d4d4d4" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "#16986e", boxShadow: "0 0 0 3px #ecf6f1", display: "inline-block" }} />
              Modelo: Vega-1 · Pro
            </span>
            <span style={{ color: "#d4d4d4" }}>·</span>
            <span style={{ fontFamily: "ui-monospace,monospace" }}>238 / 2.000 mensajes este mes</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            Reentrenar contexto
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#ffffff", border: "1px solid #e8e8e8", color: "#404040", fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            Permisos
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: "#0a0a0a", color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            + Nueva conversación
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid #e8e8e8", borderRadius: 10, background: "#ffffff", marginBottom: 20, overflow: "hidden" }}>
        {[
          { l: "Consultas este mes",   v: "238",    sub: "+34% vs mes anterior" },
          { l: "Acciones ejecutadas",  v: "186",    sub: "facturas · tareas · emails" },
          { l: "Tiempo ahorrado",      v: "38h",    sub: "estim. esta semana" },
          { l: "Precisión · valid.",   v: "96,4%",  sub: "basado en feedback ↑↓" },
        ].map((k, i, arr) => (
          <div key={k.l} style={{ padding: "16px 20px", borderRight: i < arr.length - 1 ? "1px solid #eeeeee" : "none" }}>
            <div style={{ fontSize: 11.5, color: "#737373", fontWeight: 500, marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600, fontSize: 26, color: "#0a0a0a", letterSpacing: "-0.02em" }}>{k.v}</div>
            <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, color: "#737373", marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Header (existing AssistantHeader component) */}
      <AssistantHeader />

      {/* Navigation Tabs */}
      <motion.div
        className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] overflow-hidden p-2"
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