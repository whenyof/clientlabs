"use client"

import { UserPlus, Receipt, CheckSquare } from "lucide-react"

interface ActivityLead {
  id: string
  name: string | null
  createdAt: string
}

interface ActivityInvoice {
  id: string
  number: string
  total: string | number
  updatedAt: string
}

interface ActivityTask {
  id: string
  title: string
  updatedAt: string
}

interface Props {
  leads: ActivityLead[]
  invoices: ActivityInvoice[]
  tasks: ActivityTask[]
}

interface FeedItem {
  id: string
  icon: React.ElementType
  label: string
  time: string
  ts: number
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "ahora mismo"
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export function DashboardActivity({ leads, invoices, tasks }: Props) {
  const items: FeedItem[] = [
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      icon: UserPlus,
      label: `Nuevo lead: ${l.name ?? "Sin nombre"}`,
      time: relativeTime(l.createdAt),
      ts: new Date(l.createdAt).getTime(),
    })),
    ...invoices.map((inv) => ({
      id: `inv-${inv.id}`,
      icon: Receipt,
      label: `Factura pagada #${inv.number}`,
      time: relativeTime(inv.updatedAt),
      ts: new Date(inv.updatedAt).getTime(),
    })),
    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      icon: CheckSquare,
      label: `Tarea completada: ${t.title}`,
      time: relativeTime(t.updatedAt),
      ts: new Date(t.updatedAt).getTime(),
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 8)

  if (items.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-[12px] text-slate-400">Sin actividad reciente</p>
      </div>
    )
  }

  return (
    <div>
      {items.map((item, i) => {
        const Icon = item.icon
        const isLast = i === items.length - 1
        return (
          <div key={item.id} className="flex gap-3 pb-4">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                <Icon className="h-3 w-3 text-slate-400" />
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-slate-100" />}
            </div>
            <div className="pb-1">
              <p className="text-[12px] font-medium text-slate-700">{item.label}</p>
              <p className="text-[10px] text-slate-400">{item.time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
