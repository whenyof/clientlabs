"use client"

import { UserPlus, ShoppingCart, CheckCircle, AlertTriangle, Zap, MessageSquare, Clock } from "lucide-react"

const ACTIVITIES = [
  {
    id: 1,
    type: "client",
    title: "Nuevo cliente registrado",
    description: "María González se registró automáticamente",
    time: "Hace 5 minutos",
    icon: UserPlus,
    color: "text-blue-400"
  },
  {
    id: 2,
    type: "sale",
    title: "Venta completada",
    description: "Venta de €299 procesada exitosamente",
    time: "Hace 15 minutos",
    icon: ShoppingCart,
    color: "text-green-400"
  },
  {
    id: 3,
    type: "automation",
    title: "Automatización ejecutada",
    description: "Email de seguimiento enviado a 5 clientes",
    time: "Hace 32 minutos",
    icon: Zap,
    color: "text-purple-400"
  },
  {
    id: 4,
    type: "task",
    title: "Tarea completada",
    description: "Llamada de seguimiento realizada",
    time: "Hace 1 hora",
    icon: CheckCircle,
    color: "text-emerald-400"
  },
  {
    id: 5,
    type: "message",
    title: "Mensaje enviado",
    description: "Notificación automática enviada",
    time: "Hace 2 horas",
    icon: MessageSquare,
    color: "text-orange-400"
  },
  {
    id: 6,
    type: "alert",
    title: "Alerta de sistema",
    description: "Stock bajo detectado automáticamente",
    time: "Hace 3 horas",
    icon: AlertTriangle,
    color: "text-red-400"
  }
]

export function ActivityFeed() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
        <button className="text-sm text-purple-400 hover:text-purple-300">
          Ver todo
        </button>
      </div>

      <div className="space-y-4">
        {ACTIVITIES.map((activity) => {
          const Icon = activity.icon

          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                <p className="text-gray-400 text-sm">{activity.description}</p>

                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500 text-xs">{activity.time}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors">
          <Clock className="w-4 h-4" />
          Cargar más actividad
        </button>
      </div>
    </div>
  )
}