"use client"

import { Play, Pause, AlertTriangle, CheckCircle } from "lucide-react"

const AUTOMATIONS = [
  {
    id: 1,
    name: "Email de bienvenida",
    status: "active",
    executions: 247,
    lastRun: "Hace 5 minutos"
  },
  {
    id: 2,
    name: "Recordatorio de pago",
    status: "active",
    executions: 89,
    lastRun: "Hace 1 hora"
  },
  {
    id: 3,
    name: "Campaña de re-engagement",
    status: "paused",
    executions: 156,
    lastRun: "Hace 2 días"
  },
  {
    id: 4,
    name: "Notificación de stock bajo",
    status: "error",
    executions: 23,
    lastRun: "Hace 30 minutos"
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "paused":
      return <Pause className="w-4 h-4 text-yellow-400" />
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-400" />
    default:
      return <Play className="w-4 h-4 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "text-green-400 bg-green-500/10"
    case "paused":
      return "text-yellow-400 bg-yellow-500/10"
    case "error":
      return "text-red-400 bg-red-500/10"
    default:
      return "text-gray-400 bg-gray-500/10"
  }
}

export function AutomationStatus() {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Automatizaciones</h3>
        <button className="text-sm text-purple-400 hover:text-purple-300">
          Gestionar
        </button>
      </div>

      <div className="space-y-3">
        {AUTOMATIONS.map((automation) => (
          <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(automation.status)}
              <div>
                <p className="font-medium text-white text-sm">{automation.name}</p>
                <p className="text-gray-400 text-xs">{automation.lastRun}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(automation.status)}`}>
                {automation.status === "active" && "Activa"}
                {automation.status === "paused" && "Pausada"}
                {automation.status === "error" && "Error"}
              </div>
              <p className="text-gray-400 text-xs mt-1">{automation.executions} ejecuciones</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}