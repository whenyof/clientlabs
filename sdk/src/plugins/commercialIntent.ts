/**
 * ClientLabs Plugin — Commercial Intent Detection (Production)
 *
 * Auto-detects high-intent interactions via a SINGLE delegated click listener:
 * 1. Data-attribute markers (data-cta, data-track, data-intent) → manual_intent
 * 2. Communication links (WhatsApp, tel:, mailto:) → whatsapp_click, phone_click, email_click
 * 3. Strategic external links (Calendly, Stripe, Typeform, etc.) → link_click_strategic
 * 4. Booking keywords + external booking URL → booking_created
 * 5. Demo keywords → demo_request
 * 6. CTA keyword buttons → cta_click
 * 7. Popup open detection (MutationObserver) → popup_open
 * 8. Popup submit detection (delegation) → popup_submit
 *
 * Rules:
 * - Single click listener + single submit listener + MutationObserver
 * - Anti-spam: 500ms debounce on clicks
 * - Invisible elements ignored
 * - Text sanitized to 150 chars
 * - Memory safe: destroy() cleans all listeners + observer
 */

import type { ClientLabsPlugin, PluginContext } from '../types'

/* ── Constants ──────────────────────────────────────── */

const MAX_TEXT = 150
const DEBOUNCE_MS = 500

const CTA_KEYWORDS = [
    'reservar', 'solicitar', 'presupuesto', 'demo', 'prueba',
    'comprar', 'contratar', 'empezar', 'agenda', 'contactar',
    'whatsapp', 'hablar', 'call', 'book', 'buy', 'checkout',
    'get started', 'request', 'quote', 'schedule',
]

const DEMO_KEYWORDS = ['demo', 'prueba gratis', 'free trial', 'try free']
const BOOKING_KEYWORDS = ['reservar', 'book', 'schedule', 'agendar', 'agenda']

/** External strategic link patterns */
const STRATEGIC_PATTERNS = [
    'calendly.com', 'cal.com', 'acuityscheduling.com',
    'checkout.stripe.com', 'buy.stripe.com',
    'typeform.com', 'jotform.com',
    'notion.so', 'notion.site',
    'booking', 'calendar', 'checkout',
]

const CLICK_TAGS = new Set(['A', 'BUTTON', 'INPUT'])

/** Popup selectors for modal detection */
const POPUP_SELECTOR = '[role="dialog"], [aria-modal="true"]'
const POPUP_CLASS_KEYWORDS = ['modal', 'popup', 'overlay', 'lightbox', 'dialog']

/* ── Plugin ─────────────────────────────────────────── */

function createCommercialIntentPlugin(): ClientLabsPlugin {
    let clickHandler: ((e: MouseEvent) => void) | null = null
    let submitHandler: ((e: SubmitEvent) => void) | null = null
    let observer: MutationObserver | null = null
    const trackedPopups = new WeakSet<Element>()

    return {
        name: 'commercialIntent',

        init(ctx: PluginContext): void {
            if (typeof document === 'undefined') return

            let lastClickTime = 0

            // ━━ Click Handler (single delegation) ━━━━━━━━━━
            clickHandler = (e: MouseEvent): void => {
                const now = Date.now()
                if (now - lastClickTime < DEBOUNCE_MS) return
                lastClickTime = now

                const target = e.target as HTMLElement
                if (!target) return

                const el = target.closest(
                    'a, button, input[type="submit"], [data-cta], [data-track], [data-intent]'
                ) as HTMLElement | null
                if (!el) return

                // Ignore invisible elements
                if (el.offsetParent === null && el.style.position !== 'fixed') return

                const tag = el.tagName
                const href = (el as HTMLAnchorElement).href || ''
                const text = sanitize(getVisibleText(el))
                const position = detectPosition(el)
                const url = window.location.href

                // ── 1. Data attribute markers (highest priority) ──
                if (el.hasAttribute('data-cta') || el.hasAttribute('data-track') || el.hasAttribute('data-intent')) {
                    ctx.track('manual_intent', {
                        text, url, tag: tag.toLowerCase(), position,
                        dataCta: el.getAttribute('data-cta') || undefined,
                        dataTrack: el.getAttribute('data-track') || undefined,
                        dataIntent: el.getAttribute('data-intent') || undefined,
                    })
                    return
                }

                // ── 2. Communication links ──
                if (tag === 'A' && href) {
                    const hrefLower = href.toLowerCase()

                    if (hrefLower.includes('wa.me/') || hrefLower.includes('whatsapp')) {
                        ctx.track('whatsapp_click', { href, text, position, url })
                        return
                    }
                    if (hrefLower.startsWith('tel:')) {
                        ctx.track('phone_click', { href, text, position, url })
                        return
                    }
                    if (hrefLower.startsWith('mailto:')) {
                        ctx.track('email_click', { href, text, position, url })
                        return
                    }

                    // ── 3. Strategic external links ──
                    if (isStrategicUrl(hrefLower)) {
                        // Check for booking-specific
                        const textLower = text.toLowerCase()
                        if (BOOKING_KEYWORDS.some(kw => textLower.includes(kw)) || isBookingUrl(hrefLower)) {
                            ctx.track('booking_created', { href, text, position, url })
                            return
                        }
                        ctx.track('link_click_strategic', { href, text, position, url })
                        return
                    }
                }

                // ── 4. CTA keyword detection ──
                if (!CLICK_TAGS.has(tag) || !text) return
                const textLower = text.toLowerCase()

                // Demo-specific
                if (DEMO_KEYWORDS.some(kw => textLower.includes(kw))) {
                    ctx.track('demo_request', { text, url, tag: tag.toLowerCase(), position })
                    return
                }

                // Booking-specific (CTA with booking keyword)
                if (BOOKING_KEYWORDS.some(kw => textLower.includes(kw))) {
                    const isExt = tag === 'A' && href
                        ? new URL(href, window.location.origin).origin !== window.location.origin
                        : false
                    if (isExt || isBookingUrl(href.toLowerCase())) {
                        ctx.track('booking_created', { text, url, tag: tag.toLowerCase(), position, href: href || undefined })
                        return
                    }
                }

                // General CTA
                if (CTA_KEYWORDS.some(kw => textLower.includes(kw))) {
                    const isExternal = tag === 'A' && href
                        ? new URL(href, window.location.origin).origin !== window.location.origin
                        : false
                    ctx.track('cta_click', { text, url, tag: tag.toLowerCase(), position, isExternal })
                }
            }

            // ━━ Submit Handler (popup_submit detection) ━━━━
            submitHandler = (e: SubmitEvent): void => {
                const form = e.target as HTMLFormElement
                if (!form || form.tagName !== 'FORM') return

                // Check if form is inside a popup
                const popup = form.closest(POPUP_SELECTOR) ||
                    findPopupByClass(form)
                if (popup) {
                    ctx.track('popup_submit', {
                        formId: form.id || undefined,
                        url: window.location.href,
                    })
                }
            }

            // ━━ Popup Open Detection (MutationObserver) ━━━━
            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    // Check added nodes
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType !== 1) continue
                        checkPopup(node as Element, ctx)
                    }
                    // Check attribute changes (modal becoming visible)
                    if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                        checkPopup(mutation.target as Element, ctx)
                    }
                }
            })

            const checkPopup = (el: Element, ctx: PluginContext): void => {
                // Direct match
                if (isPopupElement(el) && !trackedPopups.has(el)) {
                    if (isVisible(el as HTMLElement)) {
                        trackedPopups.add(el)
                        ctx.track('popup_open', { url: window.location.href })
                        return
                    }
                }
                // Check children (popup injected as subtree)
                const popups = el.querySelectorAll?.(POPUP_SELECTOR)
                if (popups) {
                    for (const popup of popups) {
                        if (!trackedPopups.has(popup) && isVisible(popup as HTMLElement)) {
                            trackedPopups.add(popup)
                            ctx.track('popup_open', { url: window.location.href })
                            return // Only one popup_open per mutation batch
                        }
                    }
                }
            }

            document.addEventListener('click', clickHandler, { passive: true, capture: true })
            document.addEventListener('submit', submitHandler, { passive: true, capture: true })
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'style', 'aria-modal', 'role', 'open'],
            })
        },

        destroy(): void {
            if (typeof document === 'undefined') return
            if (clickHandler) {
                document.removeEventListener('click', clickHandler, { capture: true })
                clickHandler = null
            }
            if (submitHandler) {
                document.removeEventListener('submit', submitHandler, { capture: true })
                submitHandler = null
            }
            if (observer) {
                observer.disconnect()
                observer = null
            }
        },
    }
}

/* ── Helpers ────────────────────────────────────────── */

function getVisibleText(el: HTMLElement): string {
    if (el.tagName === 'INPUT') return (el as HTMLInputElement).value || ''
    return el.innerText || el.textContent || ''
}

function sanitize(text: string): string {
    return text.trim().replace(/\s+/g, ' ').substring(0, MAX_TEXT)
}

function detectPosition(el: HTMLElement): string {
    if (el.closest('header, nav, [role="banner"]')) return 'header'
    if (el.closest('footer, [role="contentinfo"]')) return 'footer'
    if (el.closest('main, [role="main"], section, article')) return 'body'
    return 'unknown'
}

function isStrategicUrl(href: string): boolean {
    return STRATEGIC_PATTERNS.some(p => href.includes(p))
}

function isBookingUrl(href: string): boolean {
    return ['calendly.com', 'cal.com', 'acuityscheduling.com', 'booking'].some(p => href.includes(p))
}

function isPopupElement(el: Element): boolean {
    if (el.matches?.(POPUP_SELECTOR)) return true
    const cls = (el.className || '').toString().toLowerCase()
    return POPUP_CLASS_KEYWORDS.some(kw => cls.includes(kw))
}

function findPopupByClass(el: Element): Element | null {
    let current: Element | null = el.parentElement
    while (current && current !== document.body) {
        if (isPopupElement(current)) return current
        current = current.parentElement
    }
    return null
}

function isVisible(el: HTMLElement): boolean {
    return el.offsetParent !== null || el.style.position === 'fixed' || el.style.position === 'absolute'
}

export default createCommercialIntentPlugin
