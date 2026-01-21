"use client"

import { Server, Database, Zap, Wifi, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const STATUS_ITEMS: Array<{
  label: string
  status: "online" | "warning" | "offline"
  icon: any
  description: string
  uptime: string
}> = [
  {
    label: "API Server",
    status: "online",
    icon: Server,
    description: "Respuesta en 45ms",
    uptime: "99.9%"
  },
  {
    label: "Base de Datos",
    status: "online",
    icon: Database,
    description: "PostgreSQL activo",
    uptime: "99.95%"
  },
  {
    label: "Automatizaciones",
    status: "online",
    icon: Zap,
    description: "12 bots activos",
    uptime: "98.7%"
  },
  {
    label: "Integraciones",
    status: "warning",
    icon: Wifi,
    description: "2 servicios con problemas",
    uptime: "95.2%"
  }
]

function StatusIcon({ status }: { status: "online" | "warning" | "offline" }) {
  switch (status) {
    case "online":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    case "offline":
      return <XCircle className="w-4 h-4 text-red-400" />
  }
}

function StatusBadge({ status }: { status: "online" | "warning" | "offline" }) {
  const styles = {
    online: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    offline: "bg-red-500/10 text-red-400 border-red-500/20"
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status === "online" ? "En línea" : status === "warning" ? "Advertencia" : "Fuera de línea"}
    </span>
  )
}

export function SystemStatus() {
  const onlineCount = STATUS_ITEMS.filter(item => item.status === "online").length
  const totalCount = STATUS_ITEMS.length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Estado del Sistema</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{onlineCount}/{totalCount}</div>
          <div className="text-sm text-gray-400">servicios activos</div>
        </div>
      </div>

      <div className="space-y-3">
        {STATUS_ITEMS.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-700/50 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{item.label}</p>
                  <p className="text-gray-400 text-xs">{item.description}</p>
                </div>
              </div>

              <div className="text-right">
                <StatusBadge status={item.status} />
                <p className="text-gray-400 text-xs mt-1">{item.uptime} uptime</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}