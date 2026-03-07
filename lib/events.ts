/**
 * Centralized event allowlists and validation helpers for ingestion endpoints.
 * Single source of truth for /api/track and /api/v1/ingest.
 */

import { getValidEventTypes } from "./events/scoreRules"

export const MAX_EVENT_TYPE_LENGTH = 50
export const MAX_PROPERTIES_BYTES = 5 * 1024 // 5KB
export const MAX_EVENT_BYTES = 6 * 1024 // 6KB per event
export const MAX_PROPERTY_KEY_LENGTH = 100
export const MAX_PROPERTY_STRING_VALUE_LENGTH = 1000
export const TIMESTAMP_MAX_FUTURE_MS = 60_000 // 60s
export const TIMESTAMP_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

/** Safe byte length; returns null on circular or throw. */
export function safeByteLength(obj: unknown): number | null {
  try {
    return Buffer.byteLength(JSON.stringify(obj), "utf8")
  } catch {
    return null
  }
}

export function normalizeEventType(s: string): string {
  return typeof s === "string" ? s.trim().toLowerCase() : ""
}

/** Must be plain object, not null, not array. */
export function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x)
}

/** Reject if any key length > 100 or string value length > 1000. */
export function validatePropertiesFields(properties: Record<string, unknown>): boolean {
  for (const [k, v] of Object.entries(properties)) {
    if (k.length > MAX_PROPERTY_KEY_LENGTH) return false
    if (typeof v === "string" && v.length > MAX_PROPERTY_STRING_VALUE_LENGTH) return false
  }
  return true
}

const SCORE_EVENT_TYPES = getValidEventTypes()

/** Event types allowed for POST /api/track (scoring + identify + installation verification). */
export const ALLOWED_TRACK_EVENTS = new Set<string>([
  "identify",
  "sdk_loaded",
  "sdk_heartbeat",
  ...SCORE_EVENT_TYPES,
])

/** Internal events for installation verification; exclude from user analytics metrics. */
export const INTERNAL_EVENT_TYPES = new Set<string>(["sdk_loaded", "sdk_heartbeat"])

/** Event types allowed for POST /api/v1/ingest (behavioral SDK events). */
export const ALLOWED_INGEST_EVENTS = new Set<string>([
  "pageview",
  "button_click",
  "form_submit",
  "checkout_click",
  "purchase_detected",
  "lead_identified",
  "sdk_loaded",
  "sdk_heartbeat",
  "email_detected",
  "email_capture",
  "identify",
  "contact",
  "signup",
  "scroll_depth",
  "rage_click",
  "session_end",
  "cta_click",
  "whatsapp_click",
  "cart_intent",
  "first_visit",
  "page_hidden",
  "page_visible",
  "test_event",
])

export function isAllowedTrackEvent(eventType: string): boolean {
  return ALLOWED_TRACK_EVENTS.has(eventType)
}

export function isAllowedIngestEvent(eventType: string): boolean {
  return ALLOWED_INGEST_EVENTS.has(eventType)
}
