/**
 * ClientLabs SDK — Type Definitions (v1.1.0)
 *
 * Shared types for core, plugins, and transport.
 */

/* ── Public Config ──────────────────────────────────── */

export interface SDKFeatures {
    /** Enable ecommerce tracking (product views, cart actions) */
    ecommerce?: boolean
    /** Enable automatic form discovery and capture */
    forms?: boolean
    /** Enable popup open and submit detection */
    popups?: boolean
    /** Enable heartbeat for dwell time accuracy */
    heartbeat?: boolean
    /** Enable commercial intent (CTA clicks, WhatsApp, etc) */
    commercialEvents?: boolean
}

export interface ClientLabsConfig {
    /** Account identifier for multi-tenant routing */
    accountId: string
    /** Public API key (not secret — safe for browser) */
    publicKey: string
    /** High-level feature toggles. If omitted, everything is ON. */
    features?: SDKFeatures
    /** Enable automatic page/scroll/form tracking (default: true) */
    autoCapture?: boolean
    /** API endpoint override (default: auto-detected or /api/track) */
    endpoint?: string
    /** Plugins to load (overwrites automatic feature mapping) */
    plugins?: string[]
    /** UTM attribution model (default: 'first-touch') */
    attributionMode?: 'first-touch' | 'last-touch' | 'first-per-session'
    /** Heartbeat interval in seconds (optional, default: 30) */
    heartbeatInterval?: number
    /** Enable debug logging (default: false — silent mode) */
    debug?: boolean
}

/* ── Events ─────────────────────────────────────────── */

export interface TrackEvent {
    /** Event type matching backend scoreRules (e.g. "form_submit") */
    eventType: string
    /** Arbitrary metadata */
    metadata: Record<string, unknown>
    /** ISO timestamp */
    timestamp: string
}

export interface BatchPayload {
    accountId: string
    publicKey: string
    visitorId: string
    sdkVersion: string
    events: TrackEvent[]
}

export interface IdentifyData {
    email?: string
    name?: string
    phone?: string
    [key: string]: unknown
}

/* ── Plugin System ──────────────────────────────────── */

export interface PluginContext {
    /** Track an event */
    track(eventType: string, metadata?: Record<string, unknown>): void
    /** Identify the current visitor */
    identify(data: IdentifyData): void
    /** Get the current visitor ID */
    getVisitorId(): string
    /** SDK configuration (read-only) */
    config: Readonly<ClientLabsConfig>
    /** Simple logger */
    logger: PluginLogger
}

export interface PluginLogger {
    info(msg: string): void
    warn(msg: string): void
    error(msg: string): void
}

export interface ClientLabsPlugin {
    /** Unique plugin name */
    name: string
    /** Called when plugin is loaded. Set up listeners here. */
    init(context: PluginContext): void
    /** Called when plugin is unloaded. Clean up listeners here. */
    destroy?(): void
}

/* ── Valid Event Types ──────────────────────────────── */

/** Valid event types aligned 1:1 with backend scoreRules.ts */
export const VALID_EVENT_TYPES = new Set([
    // Engagement web
    'page_view', 'pricing_page_view', 'features_page_view',
    'scroll_50', 'scroll_90',
    'popup_open', 'popup_submit',
    'form_start', 'form_submit',
    // Interés activo
    'email_open', 'email_click', 'link_click_strategic',
    'resource_download', 'webinar_register', 'demo_request',
    // Intención comercial
    'booking_created', 'quote_requested', 'cart_started',
    'checkout_started', 'payment_intent_created',
    // Conversión
    'payment_completed', 'deal_closed',
    // Penalizaciones (manual)
    'email_bounced', 'unsubscribe',
    // SDK-specific
    'identify',
    // Commercial intent (auto-detected by SDK)
    'cta_click', 'whatsapp_click', 'phone_click', 'email_click', 'manual_intent',
    // Ecommerce (auto-detected by SDK)
    'product_view', 'add_to_cart',
    // Internal
    'heartbeat',
    'sdk_loaded',
])
