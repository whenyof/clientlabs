"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import {
  calendarEventStore,
  useCalendarEventStore,
  getEventsForRange,
  type DateRange,
  type CalendarEvent,
} from "@/modules/tasks/store/calendar-event-store"

const BUFFER_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

function expandRange(range: DateRange, bufferMs: number): DateRange {
  return {
    start: new Date(range.start.getTime() - bufferMs),
    end: new Date(range.end.getTime() + bufferMs),
  }
}

function rangeKey(r: DateRange): string {
  return `${r.start.getTime()}_${r.end.getTime()}`
}

// Module-level dedupe: one in-flight fetch per range key.
const inFlight = new Set<string>()

async function fetchCalendarEvents(fetchRange: DateRange): Promise<CalendarEvent[]> {
  const from = fetchRange.start.toISOString()
  const to = fetchRange.end.toISOString()
  const res = await fetch(
    `/api/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  )
  if (!res.ok) throw new Error("Failed to load calendar events")
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export type UseCalendarWindowResult = {
  /** Events for the requested (visible) range only. */
  events: CalendarEvent[]
  /** True while a fetch for this window is in progress (including deduped). */
  isLoading: boolean
  /** Set if the last fetch failed. */
  error: Error | null
}

/**
 * Window-based calendar loading: fetches only visible range + buffer (1 week each side).
 * - Checks store.isRangeLoaded(fetchRange) before fetching.
 * - Dedupes concurrent requests for the same range.
 * - Merges results via store.addRange(); safe for fast navigation.
 * - Works for day/week/month (range is arbitrary).
 */
export function useCalendarWindow(range: DateRange | null): UseCalendarWindowResult {
  const fetchRange = useMemo(
    () => (range ? expandRange(range, BUFFER_MS) : null),
    [range?.start.getTime(), range?.end.getTime()]
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  // Subscribe so we re-run when loadedRanges/eventsByDay change (e.g. after addRange).
  const loadedRanges = useCalendarEventStore((s) => s.loadedRanges)
  const eventsByDay = useCalendarEventStore((s) => s.eventsByDay)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!range || !fetchRange) {
      setIsLoading(false)
      setError(null)
      return
    }

    const key = rangeKey(fetchRange)
    const loaded = calendarEventStore.getState().isRangeLoaded(fetchRange)

    if (loaded) {
      setIsLoading(false)
      setError(null)
      return
    }

    if (inFlight.has(key)) {
      setIsLoading(true)
      setError(null)
      return
    }

    let cancelled = false
    inFlight.add(key)
    setIsLoading(true)
    setError(null)

    fetchCalendarEvents(fetchRange)
      .then((events) => {
        if (cancelled || !mountedRef.current) return
        calendarEventStore.getState().addRange(fetchRange, events)
        setError(null)
      })
      .catch((err) => {
        if (cancelled || !mountedRef.current) return
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        inFlight.delete(key)
        if (mountedRef.current) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [range?.start.getTime(), range?.end.getTime(), fetchRange?.start.getTime(), fetchRange?.end.getTime(), loadedRanges])

  const eventsForRange = useMemo(() => {
    if (!range) return []
    const store = calendarEventStore.getState()
    return getEventsForRange(store, range)
  }, [range?.start.getTime(), range?.end.getTime(), eventsByDay])

  return {
    events: eventsForRange,
    isLoading,
    error,
  }
}
