"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useMemo } from "react"

type FeedItem = {
  visitorId: string
  shortId: string
  domain: string | null
  score: number
  scoreBucket: "cold" | "warm" | "hot"
  intent: string
  lastEvent: { type: string; createdAt: string } | null
  lastAction: string | null
  lastSeen: string | null
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 60) return sec === 1 ? "1 second ago" : `${sec} seconds ago`
  const min = Math.floor(sec / 60)
  if (sec < 3600) return min === 1 ? "1 minute ago" : `${min} minutes ago`
  const hr = Math.floor(sec / 3600)
  if (sec < 86400) return hr === 1 ? "1 hour ago" : `${hr} hours ago`
  const day = Math.floor(sec / 86400)
  if (sec < 604800) return day === 1 ? "1 day ago" : `${day} days ago`
  return date.toLocaleDateString()
}

const LAST_ACTION_LABELS: Record<string, string> = {
  signup_click: "Clicked signup button",
  submitted_email: "Submitted email",
  visited_pricing: "Visited pricing page",
  checkout_click: "Checkout click",
  deep_scroll: "Deep scroll",
  identified_lead: "Lead identified",
  purchase: "Purchase detected",
}

function lastActionLabel(key: string | null): string {
  if (!key) return "—"
  return LAST_ACTION_LABELS[key] ?? key
}

function IntentBadge({ scoreBucket }: { scoreBucket: "cold" | "warm" | "hot" }) {
  if (scoreBucket === "hot")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        🔥 HOT
      </span>
    )
  if (scoreBucket === "warm")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
        🟠 WARM
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
      ⚪ COLD
    </span>
  )
}

export function LeadFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeed = () => {
      fetch("/api/v1/leads/feed")
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data: FeedItem[]) => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }
    fetchFeed()
    const interval = setInterval(fetchFeed, 30000)
    return () => clearInterval(interval)
  }, [])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = a.lastSeen ? new Date(a.lastSeen).getTime() : 0
      const tb = b.lastSeen ? new Date(b.lastSeen).getTime() : 0
      return tb - ta
    })
  }, [items])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-sm text-neutral-500 shadow-sm">
        No visitor activity yet. Events will appear here once your site sends data.
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {sorted.map((item) => (
        <div
          key={item.visitorId}
          data-visitor-id={item.visitorId}
          className={`rounded-xl border bg-white p-6 shadow-sm transition-colors hover:bg-neutral-50 ${
            item.scoreBucket === "hot"
              ? "border-red-200 bg-red-50/30"
              : "border-neutral-200"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-medium text-neutral-900">
              Visitor {item.shortId}
            </span>
            <IntentBadge scoreBucket={item.scoreBucket} />
            <span className="text-sm text-neutral-500">Score {item.score}</span>
            <span className="text-sm text-neutral-600">
              {lastActionLabel(item.lastAction)}
            </span>
            <span className="ml-auto text-xs text-neutral-500">
              {formatRelativeTime(item.lastSeen)}
            </span>
          </div>
          {item.domain && (
            <p className="mt-1 text-xs text-neutral-500">{item.domain}</p>
          )}
        </div>
      ))}
    </div>
  )
}
