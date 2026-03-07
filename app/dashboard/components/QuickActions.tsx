"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Plus, Users, Receipt, CheckSquare, Zap, BarChart3 } from "lucide-react"

export function QuickActions() {
  const { labels } = useSectorConfig()

  const w = labels.dashboard.widgets
  const ACTIONS = [
    {
      label: `${labels.common.create} ${labels.clients.singular}`,
      description: `Añadir ${labels.clients.singular.toLowerCase()} manualmente`,
      icon: Users,
      action: () => { },
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      label: w.newInvoice,
      description: w.newInvoiceDesc,
      icon: Receipt,
      action: () => { },
      color: "bg-green-500/10 text-green-400"
    },
    {
      label: `${labels.common.create} ${labels.tasks.singular}`,
      description: `Crear ${labels.tasks.singular.toLowerCase()} pendiente`,
      icon: CheckSquare,
      action: () => { },
      color: "bg-orange-500/10 text-orange-400"
    },
    {
      label: w.newAutomation,
      description: w.newAutomationDesc,
      icon: Zap,
      action: () => { },
      color: "bg-emerald-500/10 text-emerald-400"
    },
    {
      label: labels.analytics.title || "Ver Analytics",
      description: w.viewAnalyticsDesc,
      icon: BarChart3,
      action: () => { },
      color: "bg-cyan-500/10 text-cyan-400"
    },
    {
      label: w.createReport,
      description: w.createReportDesc,
      icon: Plus,
      action: () => { },
      color: "bg-pink-500/10 text-pink-400"
    }
  ]
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          {labels.common.actions} {w.quickActionsSuffix}
        </h3>
        <span className="text-xs text-neutral-500">
          {ACTIONS.length} {w.quickActionsAvailable}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            type="button"
            className="group flex items-center gap-4 rounded-lg border border-transparent p-4 text-left transition-colors hover:border-neutral-200 hover:bg-neutral-50"
          >
            <div className={`rounded-lg p-2 shadow-sm ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900 transition-colors group-hover:text-neutral-700">
                {action.label}
              </p>
              <p className="text-sm text-neutral-500">{action.description}</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-neutral-300 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
      <div className="mt-6 border-t border-neutral-200 pt-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <Plus className="h-4 w-4" />
          {labels.dashboard.widgets.quickActionsCustomize}
        </button>
      </div>
    </div>
  )
}