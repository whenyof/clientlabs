/**
 * Lightweight transport for /api/v1/ingest.
 * Used for automatic behavioural events (pageview, clicks, heartbeat, etc).
 *
 * All events include:
 *  - api_key
 *  - domain
 *  - visitor_id
 *  - session_id
 *  - timestamp
 */

let publicKey: string | null = null
let visitorId: string | null = null

const SESSION_STORAGE_KEY = "clientlabs_session_id"
const OFFLINE_QUEUE_KEY = "clientlabs_event_queue"
const MAX_OFFLINE_EVENTS = 100
const BATCH_INTERVAL_MS = 4000
const MAX_BATCH_SIZE = 20
const MAX_MEMORY_QUEUE = 50
const MAX_BATCH_BYTES = 60 * 1024 // 60KB
const MAX_EVENTS_PER_SECOND = 20
const EVENT_COOLDOWN_MS = 50
const MAX_OFFLINE_EVENT_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

type IngestEvent = {
  type: string
  domain: string
  visitor_id: string
  session_id: string
  timestamp: string
  [key: string]: unknown
}

let eventQueue: IngestEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let unloadBound = false
let sampleRate = 1

// Rate limiting state
const rateWindow: number[] = []
const lastEventByType = new Map<string, number>()

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "session_unknown"
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (existing && existing.length > 0) return existing
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id)
    return id
  } catch {
    return "session_unknown"
  }
}

export function initIngestTransport(key: string, vId: string): void {
  publicKey = typeof key === "string" && key.length > 0 ? key : null
  visitorId = typeof vId === "string" && vId.length > 0 ? vId : null
  if (typeof window === "undefined") return

  // Attach unload handler once
  if (!unloadBound) {
    unloadBound = true
    const handler = () => {
      flushQueue(true)
    }
    window.addEventListener("pagehide", handler)
    window.addEventListener("beforeunload", handler)
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") handler()
    })
  }

  // Try sending any offline queue immediately (drop events older than MAX_OFFLINE_EVENT_AGE)
  try {
    const stored = window.localStorage.getItem(OFFLINE_QUEUE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as IngestEvent[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        const now = Date.now()
        const fresh = parsed.filter((ev) => {
          const ts = typeof ev.timestamp === "string" ? new Date(ev.timestamp).getTime() : 0
          return now - ts <= MAX_OFFLINE_EVENT_AGE_MS
        })
        if (fresh.length > 0) {
          eventQueue.push(...fresh)
          scheduleFlush()
        }
        window.localStorage.removeItem(OFFLINE_QUEUE_KEY)
      }
    }
  } catch {
    // ignore localStorage issues
  }
}

function filterStaleOfflineEvents(events: IngestEvent[]): IngestEvent[] {
  const now = Date.now()
  return events.filter((ev) => {
    const ts = typeof ev.timestamp === "string" ? new Date(ev.timestamp).getTime() : 0
    return now - ts <= MAX_OFFLINE_EVENT_AGE_MS
  })
}

export function setIngestSampleRate(rate: number | undefined): void {
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    sampleRate = 1
    return
  }
  sampleRate = Math.max(0, Math.min(1, rate))
}

export function sendIngestEvent(type: string, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return
  if (!publicKey) return
  if (!type || typeof type !== "string") return

  // Optional sampling
  if (sampleRate < 1 && Math.random() > sampleRate) return

  const now = Date.now()
  // Global rate limiting: MAX_EVENTS_PER_SECOND in a 1s rolling window
  rateWindow.push(now)
  while (rateWindow.length && now - rateWindow[0] > 1000) {
    rateWindow.shift()
  }
  if (rateWindow.length > MAX_EVENTS_PER_SECOND) {
    return
  }

  // Per-type cooldown
  const lastTs = lastEventByType.get(type)
  if (lastTs != null && now - lastTs < EVENT_COOLDOWN_MS) {
    return
  }
  lastEventByType.set(type, now)

  const domain = window.location.hostname || "unknown"
  if (!domain) return

  const sessionId = getOrCreateSessionId()
  const rawEvent: IngestEvent = {
    type,
    domain,
    visitor_id: visitorId ?? "visitor_unknown",
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  // Trim large string fields to keep per-event payload under control
  const event: IngestEvent = { ...rawEvent }
  for (const key of Object.keys(event)) {
    const value = event[key]
    if (typeof value === "string" && value.length > 1024) {
      event[key] = value.slice(0, 1024)
    }
  }

  // Per-event size limit ~10KB (JSON length heuristic)
  try {
    const size = JSON.stringify(event).length
    if (size > 10 * 1024) {
      return
    }
  } catch {
    return
  }

  eventQueue.push(event)
  // Enforce in-memory queue cap by dropping oldest
  if (eventQueue.length > MAX_MEMORY_QUEUE) {
    eventQueue.splice(0, eventQueue.length - MAX_MEMORY_QUEUE)
  }

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flushQueue()
  } else {
    scheduleFlush()
  }
}

function scheduleFlush(): void {
  if (flushTimer != null) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    flushQueue()
  }, BATCH_INTERVAL_MS)
}

function flushQueue(useBeacon = false): void {
  if (typeof window === "undefined") return
  if (!publicKey) return
  if (eventQueue.length === 0) return

  const url = `${window.location.origin}/api/v1/ingest`
  const rawBatch = eventQueue.splice(0, eventQueue.length)
  const batch = filterStaleOfflineEvents(rawBatch)

  // Split into sub-batches under MAX_BATCH_BYTES
  let idx = 0
  while (idx < batch.length) {
    const chunk: IngestEvent[] = []
    while (idx < batch.length) {
      const candidate = chunk.concat(batch[idx])
      const body = {
        api_key: publicKey,
        events: candidate,
      }
      const json = JSON.stringify(body)
      const size = json.length
      if (size > MAX_BATCH_BYTES && chunk.length > 0) {
        break
      }
      if (size > MAX_BATCH_BYTES) {
        // Single event too large; drop it rather than blocking
        idx++
        continue
      }
      chunk.push(batch[idx])
      idx++
    }
    if (chunk.length === 0) continue

    const body = {
      api_key: publicKey,
      events: chunk,
    }
    const json = JSON.stringify(body)

    // Prefer sendBeacon on unload
    if (useBeacon && navigator.sendBeacon) {
      try {
        const blob = new Blob([json], { type: "application/json" })
        navigator.sendBeacon(url, blob)
        continue
      } catch {
        // fall through to fetch
      }
    }

    try {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
        keepalive: true,
      })
        .then((res) => {
          if (!res.ok) {
            // requeue offline
            persistOffline(chunk)
          }
        })
        .catch(() => {
          persistOffline(chunk)
        })
    } catch {
      persistOffline(chunk)
    }
  }
}

function persistOffline(events: IngestEvent[]): void {
  if (typeof window === "undefined") return
  try {
    const existingRaw = window.localStorage.getItem(OFFLINE_QUEUE_KEY)
    const existing: IngestEvent[] = existingRaw ? JSON.parse(existingRaw) : []
    const combined = filterStaleOfflineEvents([...existing, ...events])
    // Trim oldest beyond max (100)
    const trimmed =
      combined.length > MAX_OFFLINE_EVENTS
        ? combined.slice(combined.length - MAX_OFFLINE_EVENTS)
        : combined
    window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}
