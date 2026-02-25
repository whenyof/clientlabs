"use client"

import { useState, useEffect, useCallback } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Clock, Activity as ActivityIcon } from "lucide-react"

function formatTimeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 60) return 'Hace un momento'
  if (sec < 3600) return `Hace ${Math.floor(sec / 60)} min`
  if (sec < 86400) return `Hace ${Math.floor(sec / 3600)} h`
  if (sec < 604800) return `Hace ${Math.floor(sec / 86400)} días`
  return date.toLocaleDateString('es-ES')
}

export function ActivityFeed() {
  const { labels } = useSectorConfig()
  const w = labels.dashboard.widgets
  const [activities, setActivities] = useState<{ id: string; type: string; title: string; description: string | null; createdAt: string }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivities = useCallback(() => {
    fetch('/api/dashboard/activity')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setActivities(data.activities ?? []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  useEffect(() => {
    const onFocus = () => {
      setLoading(true)
      fetchActivities()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchActivities])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{w.activityFeedTitle}</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]" />
        </div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center text-[var(--text-secondary)] text-sm">
          {labels.common.noResults}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors">
              <div className="p-2 bg-[var(--bg-main)] rounded-lg">
                <ActivityIcon className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[var(--text-primary)] text-sm">{activity.title}</h4>
                {activity.description && (
                  <p className="text-[var(--text-secondary)] text-sm">{activity.description}</p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)] text-xs">{formatTimeAgo(new Date(activity.createdAt))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}