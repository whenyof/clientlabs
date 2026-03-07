/**
 * Score Rules — Centralized scoring configuration (PRODUCTION)
 *
 * Exact event types aligned 1:1 with the clientlabs.track() SDK.
 * These names MUST NOT be changed.
 *
 * Resolution: in-memory O(1) lookup. No DB table.
 *
 * Penalty events for inactivity have been removed —
 * inactivity is handled exclusively by the daily decay cron (-1/day).
 */

/* ── Score Rule Definition ──────────────────────────── */
export interface ScoreRule {
    readonly eventType: string
    readonly delta: number
    readonly label: string
    readonly category: ScoreCategory
}

export type ScoreCategory =
    | 'engagement_web'
    | 'interes_activo'
    | 'intencion_comercial'
    | 'conversion'
    | 'penalizacion'

/* ── Complete Rule Set (24 types) ───────────────────── */

const RULES: readonly ScoreRule[] = [
    // ── Engagement web ─────────────────────────────────
    { eventType: 'page_view', delta: 1, label: 'Página vista', category: 'engagement_web' },
    { eventType: 'pricing_page_view', delta: 10, label: 'Vista página de precios', category: 'engagement_web' },
    { eventType: 'features_page_view', delta: 6, label: 'Vista página de features', category: 'engagement_web' },
    { eventType: 'scroll_50', delta: 3, label: 'Scroll 50%', category: 'engagement_web' },
    { eventType: 'scroll_90', delta: 6, label: 'Scroll 90%', category: 'engagement_web' },
    { eventType: 'popup_open', delta: 5, label: 'Popup abierto', category: 'engagement_web' },
    { eventType: 'popup_submit', delta: 15, label: 'Popup enviado', category: 'engagement_web' },
    { eventType: 'form_start', delta: 8, label: 'Formulario iniciado', category: 'engagement_web' },
    { eventType: 'form_submit', delta: 20, label: 'Formulario enviado', category: 'engagement_web' },

    // ── Interés activo ─────────────────────────────────
    { eventType: 'email_open', delta: 3, label: 'Email abierto', category: 'interes_activo' },
    { eventType: 'email_click', delta: 10, label: 'Click en email', category: 'interes_activo' },
    { eventType: 'link_click_strategic', delta: 15, label: 'Click link estratégico', category: 'interes_activo' },
    { eventType: 'resource_download', delta: 12, label: 'Recurso descargado', category: 'interes_activo' },
    { eventType: 'webinar_register', delta: 20, label: 'Registro a webinar', category: 'interes_activo' },
    { eventType: 'demo_request', delta: 35, label: 'Solicitud de demo', category: 'interes_activo' },

    // ── Intención comercial ────────────────────────────
    { eventType: 'booking_created', delta: 40, label: 'Reserva creada', category: 'intencion_comercial' },
    { eventType: 'quote_requested', delta: 35, label: 'Presupuesto solicitado', category: 'intencion_comercial' },
    { eventType: 'cart_started', delta: 25, label: 'Carrito iniciado', category: 'intencion_comercial' },
    { eventType: 'checkout_started', delta: 45, label: 'Checkout iniciado', category: 'intencion_comercial' },
    { eventType: 'payment_intent_created', delta: 50, label: 'Intención de pago creada', category: 'intencion_comercial' },

    // ── Conversión ─────────────────────────────────────
    { eventType: 'payment_completed', delta: 100, label: 'Pago completado', category: 'conversion' },
    { eventType: 'deal_closed', delta: 120, label: 'Deal cerrado', category: 'conversion' },

    // ── Penalizaciones (manuales, no inactividad) ──────
    { eventType: 'email_bounced', delta: -30, label: 'Email rebotado', category: 'penalizacion' },
    { eventType: 'unsubscribe', delta: -40, label: 'Baja de suscripción', category: 'penalizacion' },
] as const

/* ── Lookup Map ─────────────────────────────────────── */
const RULES_MAP: ReadonlyMap<string, ScoreRule> = new Map(
    RULES.map((r) => [r.eventType, r])
)

/* ── Public API ─────────────────────────────────────── */

export function getScoreDelta(eventType: string): number {
    return RULES_MAP.get(eventType)?.delta ?? 0
}

export function isValidEventType(eventType: string): boolean {
    return RULES_MAP.has(eventType)
}

export function getScoreRule(eventType: string): ScoreRule | undefined {
    return RULES_MAP.get(eventType)
}

export function getAllScoreRules(category?: ScoreCategory): readonly ScoreRule[] {
    if (!category) return RULES
    return RULES.filter((r) => r.category === category)
}

export function getValidEventTypes(): readonly string[] {
    return RULES.map((r) => r.eventType)
}
