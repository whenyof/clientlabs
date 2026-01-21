"use client"

import { Plus, Users, Receipt, CheckSquare, Zap, BarChart3 } from "lucide-react"

const ACTIONS = [
  {
    label: "Nuevo Cliente",
    description: "Añadir cliente manualmente",
    icon: Users,
    action: () => console.log("Nuevo cliente"),
    color: "bg-blue-500/10 text-blue-400"
  },
  {
    label: "Nueva Factura",
    description: "Crear factura profesional",
    icon: Receipt,
    action: () => console.log("Nueva factura"),
    color: "bg-green-500/10 text-green-400"
  },
  {
    label: "Nueva Tarea",
    description: "Crear tarea pendiente",
    icon: CheckSquare,
    action: () => console.log("Nueva tarea"),
    color: "bg-orange-500/10 text-orange-400"
  },
  {
    label: "Nueva Automatización",
    description: "Crear flujo automático",
    icon: Zap,
    action: () => console.log("Nueva automatización"),
    color: "bg-purple-500/10 text-purple-400"
  },
  {
    label: "Ver Analytics",
    description: "Consultar métricas detalladas",
    icon: BarChart3,
    action: () => console.log("Ver analytics"),
    color: "bg-cyan-500/10 text-cyan-400"
  },
  {
    label: "Crear Reporte",
    description: "Generar reporte personalizado",
    icon: Plus,
    action: () => console.log("Crear reporte"),
    color: "bg-pink-500/10 text-pink-400"
  }
]

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Acciones Rápidas</h3>
        <span className="text-xs text-gray-400">6 disponibles</span>
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
          Personalizar acciones
        </button>
      </div>
    </div>
  )
}