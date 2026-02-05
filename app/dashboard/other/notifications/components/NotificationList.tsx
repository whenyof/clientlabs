// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { NotificationItem } from "./NotificationItem"

interface ApiNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

function formatTime(createdAt: string) {
  const d = new Date(createdAt)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'Ahora'
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`
  return d.toLocaleDateString('es-ES')
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Array<{ id: string | number; type: "success" | "warning" | "info" | "error"; title: string; message: string; time: string; read: boolean }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.ok ? res.json() : { data: [] })
      .then((json: { data?: ApiNotification[] }) => {
        const list = json.data || []
        setNotifications(list.map(n => ({
          id: n.id,
          type: (n.type?.toLowerCase() || 'info') as 'success' | 'warning' | 'info' | 'error',
          title: n.title,
          message: n.message,
          time: formatTime(n.createdAt),
          read: n.read,
        })))
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markAsRead = (id: string | number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return <div className="py-8 text-center text-gray-400">Cargando…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          {unreadCount} notificaciones sin leer
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <p className="text-white/80">Sin notificaciones</p>
          <p className="text-sm mt-1">Las notificaciones aparecerán aquí cuando existan en la BD.</p>
        </div>
      ) : (
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={String(notification.id)}
            notification={notification}
            onMarkAsRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
      )}
    </div>
  )
}