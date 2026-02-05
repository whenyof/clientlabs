"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Server, Database, Zap, Wifi, CheckCircle, AlertTriangle, XCircle } from "lucide-react"


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

function StatusBadge({
  status,
  labels: { statusOnline, statusWarning, statusOffline },
}: {
  status: "online" | "warning" | "offline"
  labels: { statusOnline: string; statusWarning: string; statusOffline: string }
}) {
  const styles = {
    online: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    offline: "bg-red-500/10 text-red-400 border-red-500/20"
  }
  const text = status === "online" ? statusOnline : status === "warning" ? statusWarning : statusOffline
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {text}
    </span>
  )
}

export function SystemStatus() {
  const { labels } = useSectorConfig()
  const w = labels.dashboard.widgets

  const STATUS_ITEMS: Array<{
    label: string
    status: "online" | "warning" | "offline"
    icon: any
    description: string
    uptime: string
  }> = [
      {
        label: w.apiServer,
        status: "online",
        icon: Server,
        description: w.apiServerDesc,
        uptime: "99.9%"
      },
      {
        label: w.database,
        status: "online",
        icon: Database,
        description: w.databaseDesc,
        uptime: "99.95%"
      },
      {
        label: labels.automations.title,
        status: "online",
        icon: Zap,
        description: w.automationsStatusDesc,
        uptime: "98.7%"
      },
      {
        label: labels.integrations.title,
        status: "warning",
        icon: Wifi,
        description: w.integrationsStatusDesc,
        uptime: "95.2%"
      }
    ]

  const onlineCount = STATUS_ITEMS.filter(item => item.status === "online").length
  const totalCount = STATUS_ITEMS.length
  const statusLabels = { statusOnline: w.statusOnline, statusWarning: w.statusWarning, statusOffline: w.statusOffline }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">{w.systemStatusTitle}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{onlineCount}/{totalCount}</div>
          <div className="text-sm text-gray-400">{w.systemStatusActiveServices}</div>
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
                <StatusBadge status={item.status} labels={statusLabels} />
                <p className="text-gray-400 text-xs mt-1">{item.uptime} {w.uptime}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}