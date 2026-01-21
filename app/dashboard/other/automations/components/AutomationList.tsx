"use client"

import { useState } from "react"
import { Play, Pause, Edit, Trash2, MoreHorizontal, Clock, Zap } from "lucide-react"

const AUTOMATIONS = [
  {
    id: 1,
    name: "Email de bienvenida",
    description: "Envía email automático cuando un cliente se registra",
    status: "active",
    trigger: "Nuevo cliente registrado",
    actions: ["Enviar email"],
    executions: 247,
    lastRun: "Hace 5 minutos",
    successRate: 98.5
  },
  {
    id: 2,
    name: "Recordatorio de pago pendiente",
    description: "Notifica automáticamente sobre facturas pendientes",
    status: "active",
    trigger: "Factura vence en 3 días",
    actions: ["Enviar email", "Crear tarea"],
    executions: 89,
    lastRun: "Hace 1 hora",
    successRate: 95.2
  },
  {
    id: 3,
    name: "Campaña de re-engagement",
    description: "Reactiva clientes inactivos con ofertas especiales",
    status: "paused",
    trigger: "Cliente inactivo 30 días",
    actions: ["Enviar email", "Aplicar descuento"],
    executions: 156,
    lastRun: "Hace 2 días",
    successRate: 87.3
  },
  {
    id: 4,
    name: "Notificación de stock bajo",
    description: "Alerta cuando productos están por agotarse",
    status: "error",
    trigger: "Stock < 10 unidades",
    actions: ["Enviar notificación", "Crear pedido"],
    executions: 23,
    lastRun: "Hace 30 minutos",
    successRate: 0
  }
]

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "text-green-400 bg-green-500/10", text: "Activa" }
      case "paused":
        return { color: "text-yellow-400 bg-yellow-500/10", text: "Pausada" }
      case "error":
        return { color: "text-red-400 bg-red-500/10", text: "Error" }
      default:
        return { color: "text-gray-400 bg-gray-500/10", text: "Desconocido" }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {status === "active" && <Play className="w-3 h-3 mr-1" />}
      {status === "paused" && <Pause className="w-3 h-3 mr-1" />}
      {status === "error" && <Clock className="w-3 h-3 mr-1" />}
      {config.text}
    </span>
  )
}

export function AutomationList() {
  const [selectedAutomation, setSelectedAutomation] = useState<number | null>(null)

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Automatizaciones Activas</h3>

      <div className="space-y-4">
        {AUTOMATIONS.map((automation) => (
          <div
            key={automation.id}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{automation.name}</h4>
                  <p className="text-sm text-gray-400">{automation.description}</p>
                </div>
              </div>
              <StatusBadge status={automation.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">Trigger</p>
                <p className="text-sm text-white">{automation.trigger}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Acciones</p>
                <p className="text-sm text-white">{automation.actions.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ejecuciones</p>
                <p className="text-sm text-white">{automation.executions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Éxito</p>
                <p className="text-sm text-green-400">{automation.successRate}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Última ejecución: {automation.lastRun}</p>
              <div className="flex items-center gap-2">
                <button className="p-1 text-gray-400 hover:text-purple-400">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-300">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}