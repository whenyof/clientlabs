import { createStore, useStore } from "zustand"
import type { CalendarItem } from "@/modules/calendar/types/calendar-item"

/** CalendarEvent in the store: same as CalendarItem (single source of truth). */
export type CalendarEvent = CalendarItem

export type DateRange = { start: Date; end: Date }

function toDayKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function rangeContains(outer: DateRange, inner: DateRange): boolean {
  return (
    outer.start.getTime() <= inner.start.getTime() &&
    outer.end.getTime() >= inner.end.getTime()
  )
}

function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.start.getTime() <= b.end.getTime() && b.start.getTime() <= a.end.getTime()
}

function mergeLoadedRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges].sort((a, b) => a.start.getTime() - b.start.getTime())
  const out: DateRange[] = [{ start: sorted[0].start, end: sorted[0].end }]
  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i]
    const last = out[out.length - 1]
    if (curr.start.getTime() <= last.end.getTime()) {
      last.end = new Date(Math.max(last.end.getTime(), curr.end.getTime()))
    } else {
      out.push({ start: curr.start, end: curr.end })
    }
  }
  return out
}

function* dayKeysInRange(range: DateRange): Generator<string> {
  const start = new Date(range.start)
  start.setHours(0, 0, 0, 0)
  const end = new Date(range.end)
  end.setHours(23, 59, 59, 999)
  for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
    yield toDayKey(d)
  }
}

export type CalendarEventStoreState = {
  eventsByDay: Record<string, CalendarEvent[]>
  loadedRanges: DateRange[]
}

export type CalendarEventStoreActions = {
  /** Merge events for a range into the store; index by dayKey. Never wipes existing data. */
  addRange: (range: DateRange, events: CalendarEvent[]) => void
  /** True if the given range is fully covered by at least one loaded range. */
  isRangeLoaded: (range: DateRange) => boolean
  /** Remove events and loaded-range coverage for the given range. */
  invalidateRange: (range: DateRange) => void
  /** Optimistic update: replace event by id (may move to another day). */
  updateEvent: (event: CalendarEvent) => void
  /** Remove event by id from the store. */
  removeEvent: (id: string) => void
}

export type CalendarEventStore = CalendarEventStoreState & CalendarEventStoreActions

const initialState: CalendarEventStoreState = {
  eventsByDay: {},
  loadedRanges: [],
}

export const createCalendarEventStore = () =>
  createStore<CalendarEventStore>()((set, get) => ({
    ...initialState,

    addRange(range, events) {
      set((state) => {
        const byDay: Record<string, Map<string, CalendarEvent>> = {}
        for (const dayKey of Object.keys(state.eventsByDay)) {
          const map = new Map<string, CalendarEvent>()
          for (const e of state.eventsByDay[dayKey]) map.set(e.id, e)
          byDay[dayKey] = map
        }
        for (const ev of events) {
          const key = toDayKey(ev.start)
          if (!byDay[key]) byDay[key] = new Map()
          byDay[key].set(ev.id, ev)
        }
        const nextEventsByDay: Record<string, CalendarEvent[]> = {}
        for (const key of Object.keys(byDay)) {
          nextEventsByDay[key] = Array.from(byDay[key].values())
        }
        const nextRanges = mergeLoadedRanges([...state.loadedRanges, range])
        return {
          eventsByDay: nextEventsByDay,
          loadedRanges: nextRanges,
        }
      })
    },

    isRangeLoaded(range) {
      const { loadedRanges } = get()
      return loadedRanges.some((r) => rangeContains(r, range))
    },

    invalidateRange(range) {
      set((state) => {
        const keysToDrop = new Set(dayKeysInRange(range))
        const nextEventsByDay = { ...state.eventsByDay }
        for (const key of keysToDrop) delete nextEventsByDay[key]
        const nextRanges = state.loadedRanges.flatMap((r) => {
          if (!rangesOverlap(r, range)) return [r]
          const rs = r.start.getTime()
          const re = r.end.getTime()
          const is = range.start.getTime()
          const ie = range.end.getTime()
          const out: DateRange[] = []
          if (rs < is) out.push({ start: new Date(rs), end: new Date(is - 1) })
          if (re > ie) out.push({ start: new Date(ie + 1), end: new Date(re) })
          return out.filter((x) => x.start.getTime() < x.end.getTime())
        })
        return {
          eventsByDay: nextEventsByDay,
          loadedRanges: nextRanges,
        }
      })
    },

    updateEvent(event) {
      set((state) => {
        let oldDayKey: string | null = null
        for (const [dayKey, list] of Object.entries(state.eventsByDay)) {
          if (list.some((e) => e.id === event.id)) {
            oldDayKey = dayKey
            break
          }
        }
        const newDayKey = toDayKey(event.start)
        const nextEventsByDay = { ...state.eventsByDay }
        if (oldDayKey) {
          nextEventsByDay[oldDayKey] = nextEventsByDay[oldDayKey].filter((e) => e.id !== event.id)
          if (nextEventsByDay[oldDayKey].length === 0) delete nextEventsByDay[oldDayKey]
        }
        const dayList = nextEventsByDay[newDayKey] ?? []
        const idx = dayList.findIndex((e) => e.id === event.id)
        if (idx >= 0) {
          dayList[idx] = event
        } else {
          dayList.push(event)
        }
        nextEventsByDay[newDayKey] = dayList.sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        return { eventsByDay: nextEventsByDay }
      })
    },

    removeEvent(id) {
      set((state) => {
        const nextEventsByDay = { ...state.eventsByDay }
        for (const key of Object.keys(nextEventsByDay)) {
          nextEventsByDay[key] = nextEventsByDay[key].filter((e) => e.id !== id)
          if (nextEventsByDay[key].length === 0) delete nextEventsByDay[key]
        }
        return { eventsByDay: nextEventsByDay }
      })
    },
  }))

export const calendarEventStore = createCalendarEventStore()

// ——— Selectors (use with store.getState() or subscribe) ———

export function getEventsForDay(store: CalendarEventStore, dayKey: string): CalendarEvent[] {
  return store.eventsByDay[dayKey] ?? []
}

export function getEventsForRange(store: CalendarEventStore, range: DateRange): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const seen = new Set<string>()
  for (const dayKey of dayKeysInRange(range)) {
    for (const ev of getEventsForDay(store, dayKey)) {
      if (seen.has(ev.id)) continue
      const start = new Date(ev.start).getTime()
      if (start >= range.start.getTime() && start <= range.end.getTime()) {
        seen.add(ev.id)
        events.push(ev)
      }
    }
  }
  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

export function getEventById(store: CalendarEventStore, id: string): CalendarEvent | null {
  for (const list of Object.values(store.eventsByDay)) {
    const found = list.find((e) => e.id === id)
    if (found) return found
  }
  return null
}

export function getAllDayKeys(store: CalendarEventStore): string[] {
  return Object.keys(store.eventsByDay).sort()
}

// ——— React hook (use with selectors for minimal re-renders) ———

export function useCalendarEventStore<T>(selector: (state: CalendarEventStore) => T): T {
  return useStore(calendarEventStore, selector)
}
