/**
 * ClientLabs Plugin — UTM Persistence (v1.2)
 *
 * Implements session-start attribution and flexible attribution models.
 * Rules:
 * - Attribution: Supports first-touch, last-touch, and first-per-session.
 * - Persistence: 30-day TTL in localStorage (_cl_utm).
 * - Delivery: Attached ONLY to the first 'page_view' (or equivalent) of the session.
 * - Auto-Start: If no page_view fires in 2 seconds, auto-fires one for session capture.
 */

import type { ClientLabsPlugin, PluginContext } from '../types'

/* ── Constants ──────────────────────────────────────── */

const STORAGE_KEY = '_cl_utm'
const SESSION_KEY = '_cl_utm_session'
const TTL_MS = 30 * 24 * 60 * 60 * 1000
const MAX_VAL = 200
const AUTO_SESSION_TIMEOUT = 2000
const PAGE_VIEW_TYPES = new Set(['page_view', 'pricing_page_view', 'features_page_view'])

/* ── Types ──────────────────────────────────────────── */

interface UtmData {
    source: string | undefined
    medium: string | undefined
    campaign: string | undefined
    term: string | undefined
    content: string | undefined
    timestamp: number
}

/* ── Plugin Implementation ──────────────────────────── */

function createUtmPlugin(): ClientLabsPlugin {
    let sessionStarted = false
    let autoStartTimer: ReturnType<typeof setTimeout> | null = null

    return {
        name: 'utm',

        init(ctx: PluginContext): void {
            if (typeof window === 'undefined') return

            const mode = ctx.config.attributionMode || 'first-touch'
            const utm = getAttributedUtm(mode)

            // Intercept track to inject UTMs only into session-starting events
            const originalTrack = ctx.track
            ctx.track = (eventType, metadata) => {
                if (!sessionStarted && PAGE_VIEW_TYPES.has(eventType)) {
                    sessionStarted = true
                    if (autoStartTimer) {
                        clearTimeout(autoStartTimer)
                        autoStartTimer = null
                    }

                    if (utm) {
                        const enriched = {
                            ...(metadata || {}),
                            utmSource: utm.source,
                            utmMedium: utm.medium,
                            utmCampaign: utm.campaign,
                            utmTerm: utm.term,
                            utmContent: utm.content,
                            referrer: document.referrer || null,
                        }
                        // Cleanup undefined values
                        Object.keys(enriched).forEach(k => {
                            if (enriched[k as keyof typeof enriched] === undefined) {
                                delete enriched[k as keyof typeof enriched]
                            }
                        })
                        originalTrack(eventType, enriched)
                    } else {
                        originalTrack(eventType, metadata)
                    }
                } else {
                    originalTrack(eventType, metadata)
                }
            }

            // Fallback: If no page_view is fired in 2 seconds, force session start
            autoStartTimer = setTimeout(() => {
                if (!sessionStarted) {
                    ctx.track('page_view', { autoSessionStart: true })
                }
            }, AUTO_SESSION_TIMEOUT)
        },

        destroy(): void {
            if (autoStartTimer) {
                clearTimeout(autoStartTimer)
                autoStartTimer = null
            }
        },
    }
}

/* ── Attribution Logic ──────────────────────────────── */

function getAttributedUtm(mode: string): UtmData | null {
    const now = Date.now()
    const urlUtm = parseUrlUtm(now)
    const globalUtm = getStoredUtm(now, STORAGE_KEY, 'local')

    // Mode: last-touch
    if (mode === 'last-touch') {
        if (urlUtm) {
            saveStoredUtm(urlUtm, STORAGE_KEY, 'local')
            return urlUtm
        }
        return globalUtm
    }

    // Mode: first-per-session (Self-contained in sessionStorage, doesn't touch global)
    if (mode === 'first-per-session') {
        const sessionUtm = getStoredUtm(now, SESSION_KEY, 'session')
        if (sessionUtm) return sessionUtm
        if (urlUtm) {
            saveStoredUtm(urlUtm, SESSION_KEY, 'session')
            return urlUtm
        }
        return globalUtm
    }

    // Mode: first-touch (default)
    if (globalUtm) return globalUtm
    if (urlUtm) {
        saveStoredUtm(urlUtm, STORAGE_KEY, 'local')
        return urlUtm
    }

    return null
}

/* ── Helpers ────────────────────────────────────────── */

function parseUrlUtm(timestamp: number): UtmData | null {
    const params = new URLSearchParams(window.location.search)
    const s = clean(params.get('utm_source'))
    const m = clean(params.get('utm_medium'))
    const c = clean(params.get('utm_campaign'))

    if (s || m || c) {
        return {
            source: s,
            medium: m,
            campaign: c,
            term: clean(params.get('utm_term')),
            content: clean(params.get('utm_content')),
            timestamp
        }
    }
    return null
}

function getStoredUtm(now: number, key: string, type: 'local' | 'session'): UtmData | null {
    try {
        const storage = type === 'local' ? localStorage : sessionStorage
        const raw = storage.getItem(key)
        if (!raw) return null
        const data = JSON.parse(raw) as UtmData
        if (type === 'session') return data // session storage doesn't need TTL
        if (now - data.timestamp < TTL_MS) return data
        storage.removeItem(key)
    } catch { /* skip */ }
    return null
}

function saveStoredUtm(data: UtmData, key: string, type: 'local' | 'session'): void {
    try {
        const storage = type === 'local' ? localStorage : sessionStorage
        storage.setItem(key, JSON.stringify(data))
    } catch { /* skip */ }
}

function clean(val: string | null): string | undefined {
    if (!val || typeof val !== 'string') return undefined
    const t = val.trim()
    return t ? t.substring(0, MAX_VAL) : undefined
}

export default createUtmPlugin
