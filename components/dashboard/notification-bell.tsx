"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  actionUrl?: string | null
  createdAt: string
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "ahora mismo"
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export function NotificationBell() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then(r => r.json()),
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    staleTime: 30_000,
  })

  const markRead = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/notifications/${id}`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markAllRead = useMutation({
    mutationFn: () =>
      fetch("/api/notifications/mark-all-read", { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const notifications: Notification[] = data?.data ?? []
  const unread: number = data?.unreadCount ?? 0

  const handleClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id)
    if (n.actionUrl) {
      setOpen(false)
      router.push(n.actionUrl)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-md hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-subtle)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative"
        aria-label="Notificaciones"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Notificaciones</span>
            {unread > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-[var(--accent)] hover:opacity-70 flex items-center gap-1">
                <Check size={11} /> Marcar todas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {notifications.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] text-sm py-8">Sin notificaciones</p>
            ) : (
              notifications.slice(0, 10).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors ${!n.read ? "bg-[var(--accent-soft)]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${n.read ? "text-[var(--text-secondary)]" : "text-[var(--text-primary)] font-medium"}`}>{n.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {n.actionUrl && <ExternalLink size={11} className="text-[var(--text-secondary)] shrink-0 mt-1" />}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
