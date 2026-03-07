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
    online: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    offline: "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/20"
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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">{w.systemStatusTitle}</h3>
        <div className="text-right">
          <div className="text-2xl font-semibold tracking-tight text-neutral-900">
            {onlineCount}/{totalCount}
          </div>
          <p className="text-sm text-neutral-500">{w.systemStatusActiveServices}</p>
        </div>
      </div>
      <div className="space-y-4">
        {STATUS_ITEMS.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Icon className="h-5 w-5 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                  <p className="text-xs text-neutral-500">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={item.status} labels={statusLabels} />
                <p className="mt-1 text-xs text-neutral-500">
                  {item.uptime} {w.uptime}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}