"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import type { TeamRole } from "@prisma/client"
import { ClockIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

interface ActivityLogEntry {
  id: string
  userId: string
  action: string
  entity: string
  entityId?: string | null
  entityLabel?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  userRole: TeamRole
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface ActivityResponse {
  logs: ActivityLogEntry[]
  total: number
  hasMore: boolean
  page: number
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then

  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "ahora mismo"
  if (mins < 60) return `hace ${mins} min`
  if (hours < 24) return `hace ${hours} h`
  if (days === 1) return "ayer"
  return `hace ${days} días`
}

function getAvatarColor(role: TeamRole) {
  if (role === "OWNER") return "bg-emerald-500"
  if (role === "ADMIN") return "bg-blue-500"
  return "bg-slate-400"
}

function getRoleLabel(role: TeamRole) {
  if (role === "OWNER") return "Propietario"
  if (role === "ADMIN") return "Admin"
  return "Usuario"
}

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  return (email ?? "?").slice(0, 2).toUpperCase()
}

function getActionText(action: string, entity: string, label?: string | null) {
  const entityName = label ?? entity
  const actions: Record<string, string> = {
    created: "creó",
    updated: "actualizó",
    deleted: "eliminó",
    invited: "invitó a",
    removed: "eliminó a",
    role_changed: "cambió el rol de",
    sent: "envió",
    accepted: "aceptó",
    rejected: "rechazó",
    viewed: "vio",
  }
  return `${actions[action] ?? action} ${entityName}`
}

function getEntityColor(entity: string) {
  const colors: Record<string, string> = {
    invoice: "text-blue-600 bg-blue-50",
    lead: "text-purple-600 bg-purple-50",
    client: "text-emerald-600 bg-emerald-50",
    member: "text-amber-600 bg-amber-50",
    automation: "text-pink-600 bg-pink-50",
  }
  return colors[entity] ?? "text-slate-600 bg-slate-50"
}

export function ActivityLogSection() {
  const [page, setPage] = useState(1)
  const [allLogs, setAllLogs] = useState<ActivityLogEntry[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const { data, isLoading } = useSWR<ActivityResponse>(
    `/api/settings/activity?page=1`,
    fetcher,
    {
      onSuccess: (d) => {
        if (page === 1) setAllLogs(d.logs)
      },
    }
  )

  const loadMore = useCallback(async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/settings/activity?page=${nextPage}`)
      const json: ActivityResponse = await res.json()
      setAllLogs((prev) => [...prev, ...json.logs])
      setPage(nextPage)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }, [page])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Actividad</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Registro de acciones del equipo en el workspace.
        </p>
      </div>

      {/* Log list */}
      {allLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <ClockIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Sin actividad registrada aún.</p>
          <p className="text-xs text-slate-400 mt-1">
            Las acciones del equipo aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {allLogs.map((log) => (
              <div key={log.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5 ${getAvatarColor(log.userRole)}`}
                >
                  {log.user.image ? (
                    <img
                      src={log.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(log.user.name, log.user.email)
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#0B1F2A]">
                    <span className="font-semibold">{log.user.name ?? log.user.email}</span>
                    <span className="text-slate-400 text-xs ml-1">
                      ({getRoleLabel(log.userRole)})
                    </span>{" "}
                    <span>{getActionText(log.action, log.entity, log.entityLabel)}</span>
                    {log.entity && (
                      <span
                        className={`ml-1.5 inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded ${getEntityColor(log.entity)}`}
                      >
                        {log.entity}
                      </span>
                    )}
                  </p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                  {getRelativeTime(log.createdAt)}
                </span>
              </div>
            ))}
          </div>

          {/* Load more */}
          {data?.hasMore && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[var(--accent)] transition-colors disabled:opacity-50"
              >
                <ChevronDownIcon className="w-4 h-4" />
                {loadingMore ? "Cargando…" : "Cargar más"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
