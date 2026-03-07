"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from "lucide-react"


function InsightCard({ insight }: {
  insight: {
    type: string
    title: string
    message: string
    icon: any
    color: string
    priority: string
  }
}) {
  const { labels } = useSectorConfig()
  const Icon = insight.icon

  return (
    <div className="p-4 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${insight.color} bg-[var(--bg-card)] shadow-sm`}>
          <Icon className="w-5 h-5 flex-shrink-0" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-[var(--text-primary)] text-sm">{insight.title}</h4>
            {insight.priority === "high" && (
              <span className="px-2 py-0.5 bg-[var(--critical)]/10 text-[var(--critical)] text-xs rounded-full">
                {labels.tasks.priorities.HIGH || "Alta"}
              </span>
            )}
          </div>

          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">{insight.message}</p>

          <div className="flex items-center gap-3">
            <button className="text-xs text-[var(--accent)] hover:text-[var(--accent-bg-emerald-600)] font-medium">
              {labels.aiAssistant.apply}
            </button>
            <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {labels.aiAssistant.ignore}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AIInsights() {
  const { labels } = useSectorConfig()

  const w = labels.dashboard.widgets
  const INSIGHTS = [
    {
      type: "opportunity",
      title: w.insightOpportunityTitle,
      message: w.insightOpportunityMessage,
      icon: TrendingUp,
      color: "text-[var(--accent)]",
      priority: "high"
    },
    {
      type: "alert",
      title: `${labels.clients.singular} en riesgo`,
      message: w.insightClientRiskMessage,
      icon: AlertTriangle,
      color: "text-[var(--critical)]",
      priority: "medium"
    },
    {
      type: "insight",
      title: w.insightPatternTitle,
      message: w.insightPatternMessage,
      icon: Lightbulb,
      color: "text-[var(--warning)]",
      priority: "medium"
    },
    {
      type: "action",
      title: w.insightActionTitle,
      message: w.insightActionMessage,
      icon: Zap,
      color: "text-[var(--accent-bg-emerald-600)]",
      priority: "high"
    }
  ]

  return (
    <div className="flex-1 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs rounded-full font-medium uppercase tracking-wider">
          4 {labels.aiAssistant.newInsights}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-start grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {INSIGHTS.map((insight) => (
          <InsightCard key={insight.title} insight={insight} />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] mt-auto">
        <div className="flex items-center gap-4 text-sm hidden sm:flex">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-[var(--text-secondary)]">{labels.aiAssistant.precision}: 94%</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="w-4 h-4 text-[var(--accent-bg-emerald-600)]" />
            <span className="text-[var(--text-secondary)]">{labels.aiAssistant.lastUpdate}: 5 min</span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg transition-colors text-sm w-full sm:w-auto justify-center">
          <Brain className="w-4 h-4" />
          {labels.aiAssistant.viewFullAnalysis}
        </button>
      </div>
    </div>
  )
}