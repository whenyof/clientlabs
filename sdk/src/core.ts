/**
 * ClientLabs SDK — Core API (v1.1.0 — Plugin Architecture)
 *
 * Public API (unchanged):
 *   clientlabs.init(config)
 *   clientlabs.track(eventType, metadata?)
 *   clientlabs.identify(data)
 *   clientlabs.flush()
 *   clientlabs.version
 *
 * Must call init() before track/identify.
 * Double-init is prevented.
 *
 * Internal changes:
 * - Auto-capture moved to plugins (pageview, scroll, forms)
 * - Plugin manager handles DOM listener lifecycle
 * - Core has ZERO DOM listeners
 */

import type { ClientLabsConfig, IdentifyData } from './types'
import { VALID_EVENT_TYPES } from './types'
import { getVisitorId } from './identity'
import { isAllowed } from './rateLimiter'
import { initTransport, enqueue, flush, getSdkVersion } from './transport'
import { registerPlugin, loadPlugins, destroyPlugins } from './pluginManager'
import { initIngestTransport, sendIngestEvent, setIngestSampleRate } from './ingestTransport'

// ── Register built-in plugins ──────────────────────────
import createPageViewPlugin from './plugins/pageview'
import createScrollPlugin from './plugins/scroll'
import createFormsPlugin from './plugins/forms'
import createUtmPlugin from './plugins/utm'
import createCommercialIntentPlugin from './plugins/commercialIntent'
import createHeartbeatPlugin from './plugins/heartbeat'
import createEcommercePlugin from './plugins/ecommerce'
import createAutoIngestPlugin from './plugins/autoIngest'

registerPlugin('pageview', createPageViewPlugin)
registerPlugin('scroll', createScrollPlugin)
registerPlugin('forms', createFormsPlugin)
registerPlugin('utm', createUtmPlugin)
registerPlugin('commercialIntent', createCommercialIntentPlugin)
registerPlugin('heartbeat', createHeartbeatPlugin)
registerPlugin('ecommerce', createEcommercePlugin)
registerPlugin('autoIngest', createAutoIngestPlugin)

// ── State ──────────────────────────────────────────────
let isInitialized = false
let currentVisitorId = ''
let debugMode = false

/**
 * SDK Version — exposed as clientlabs.version
 */
const version: string = getSdkVersion()

/**
 * Initialize the SDK. Must be called once before any tracking.
 */
function init(config: ClientLabsConfig): void {
    if (isInitialized) {
        console.warn('[ClientLabs] SDK already initialized. Ignoring duplicate init().')
        return
    }

    if (!config.accountId || typeof config.accountId !== 'string') {
        console.error('[ClientLabs] init() requires a valid accountId.')
        return
    }

    if (!config.publicKey || typeof config.publicKey !== 'string') {
        console.error('[ClientLabs] init() requires a valid publicKey.')
        return
    }

    debugMode = config.debug === true
    currentVisitorId = getVisitorId()

    // Determine endpoint
    const endpoint = config.endpoint || detectEndpoint()

    // Initialize transports
    initTransport(config.accountId, config.publicKey, currentVisitorId, endpoint)
    initIngestTransport(config.publicKey, currentVisitorId)
    // Optional internal sampling support (no public API change required)
    const maybeSampleRate = (config as any).sampleRate as number | undefined
    setIngestSampleRate(maybeSampleRate)

    isInitialized = true

    // Auto-inject heartbeat plugin if heartbeatInterval is configured
    if (config.heartbeatInterval && config.heartbeatInterval >= 5) {
        const pluginsWithHeartbeat = config.plugins
            ? (config.plugins.includes('heartbeat') ? config.plugins : [...config.plugins, 'heartbeat'])
            : undefined
        loadPlugins({ ...config, plugins: pluginsWithHeartbeat }, track, identify, () => currentVisitorId)
    } else {
        // Load plugins (replaces old startAutoCapture)
        loadPlugins(config, track, identify, () => currentVisitorId)
    }

    // 🚀 Verification System: Send loading event for backend validation (score pipeline)
    track('sdk_loaded', {
        domain: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
        api_key: config.publicKey,
    })

    // Mirror to ingest pipeline (non-breaking, same semantics)
    if (typeof window !== 'undefined') {
        sendIngestEvent('sdk_loaded', {})
    }

    if (debugMode) console.log(`[ClientLabs] SDK initialized — visitor: ${currentVisitorId.substring(0, 8)}… endpoint: ${endpoint}`)
}

/**
 * Track a custom event.
 *
 * @param eventType - Must be a valid event type from the scoring system
 * @param metadata  - Optional metadata object
 */
function track(eventType: string, metadata?: Record<string, unknown>): void {
    if (!isInitialized) {
        console.warn('[ClientLabs] SDK not initialized. Call clientlabs.init() first.')
        return
    }

    if (!eventType || typeof eventType !== 'string') {
        return
    }

    // Validate event type (warn but still send for forward compat)
    if (!VALID_EVENT_TYPES.has(eventType)) {
        console.warn(`[ClientLabs] Unknown event type: "${eventType}". Event will be sent but may not affect scoring.`)
    }

    // Rate limit check
    if (!isAllowed()) {
        return // Silently discard
    }

    enqueue({
        eventType,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
    })

    if (debugMode) console.log(`[ClientLabs] track: ${eventType}`, metadata ? Object.keys(metadata) : [])
}

/**
 * Identify the current visitor with contact information.
 * Sends an "identify" event so the backend can link visitorId → Lead.
 */
function identify(data: IdentifyData): void {
    if (!isInitialized) {
        console.warn('[ClientLabs] SDK not initialized. Call clientlabs.init() first.')
        return
    }

    if (!data || (!data.email && !data.name)) {
        return
    }

    enqueue({
        eventType: 'identify',
        metadata: { ...data, visitorId: currentVisitorId },
        timestamp: new Date().toISOString(),
    })
}

/**
 * Destroy the SDK — tear down all plugins and reset state.
 * Primarily for testing or SPA unmount scenarios.
 */
function destroy(): void {
    if (!isInitialized) return
    destroyPlugins()
    flush()
    isInitialized = false
    currentVisitorId = ''
}

/**
 * Auto-detect the API endpoint based on the current page.
 * Uses the same origin + /api/track by default.
 */
function detectEndpoint(): string {
    if (typeof window !== 'undefined') {
        return window.location.origin + '/api/track'
    }
    return '/api/track'
}

export { init, track, identify, flush, destroy, version }
