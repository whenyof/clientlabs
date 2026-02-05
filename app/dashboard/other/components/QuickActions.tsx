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
      action: () => console.log("Nuevo cliente"),
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      label: w.newInvoice,
      description: w.newInvoiceDesc,
      icon: Receipt,
      action: () => console.log("Nueva factura"),
      color: "bg-green-500/10 text-green-400"
    },
    {
      label: `${labels.common.create} ${labels.tasks.singular}`,
      description: `Crear ${labels.tasks.singular.toLowerCase()} pendiente`,
      icon: CheckSquare,
      action: () => console.log("Nueva tarea"),
      color: "bg-orange-500/10 text-orange-400"
    },
    {
      label: w.newAutomation,
      description: w.newAutomationDesc,
      icon: Zap,
      action: () => console.log("Nueva automatización"),
      color: "bg-purple-500/10 text-purple-400"
    },
    {
      label: labels.analytics.title || "Ver Analytics",
      description: w.viewAnalyticsDesc,
      icon: BarChart3,
      action: () => console.log("Ver analytics"),
      color: "bg-cyan-500/10 text-cyan-400"
    },
    {
      label: w.createReport,
      description: w.createReportDesc,
      icon: Plus,
      action: () => console.log("Crear reporte"),
      color: "bg-pink-500/10 text-pink-400"
    }
  ]
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{labels.common.actions} {w.quickActionsSuffix}</h3>
        <span className="text-xs text-gray-400">{ACTIONS.length} {w.quickActionsAvailable}</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {ACTIONS.map((action, index) => (
          <button
            key={action.label}
            onClick={action.action}
            className="flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-left group"
          >
            <div className={`p-2 rounded-lg transition-colors ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-white group-hover:text-purple-300 transition-colors">
                {action.label}
              </p>
              <p className="text-sm text-gray-400">{action.description}</p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          {labels.dashboard.widgets.quickActionsCustomize}
        </button>
      </div>
    </div>
  )
}