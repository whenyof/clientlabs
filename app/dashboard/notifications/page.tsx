"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { NotificationList } from "./components/NotificationList"

export default function NotificationsPage() {
  const { labels } = useSectorConfig()
  const n = labels.notifications
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{n.title}</h1>
          <p className="text-[var(--text-secondary)]">{n.pageSubtitle}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg transition-colors">
            {n.markAllRead}
          </button>
        </div>
      </div>

      <NotificationList />
    </div>
  )
}