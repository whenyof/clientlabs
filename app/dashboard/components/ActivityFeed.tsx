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
    let lastFocusFetch = 0
    const FOCUS_DEBOUNCE = 60_000
    const onFocus = () => {
      const now = Date.now()
      if (now - lastFocusFetch < FOCUS_DEBOUNCE) return
      lastFocusFetch = now
      setLoading(true)
      fetchActivities()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchActivities])

  return (
    <div>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
        </div>
      ) : activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">{labels.common.noResults}</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-50"
            >
              <div className="rounded-lg bg-neutral-100 p-2">
                <ActivityIcon className="h-4 w-4 text-neutral-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-neutral-900">{activity.title}</h4>
                {activity.description && (
                  <p className="text-sm text-neutral-600">{activity.description}</p>
                )}
                <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(new Date(activity.createdAt))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}