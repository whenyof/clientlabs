// Ecommerce Plugin — Auto-detection with institutional-grade deduplication
import type { ClientLabsPlugin, PluginContext } from '../types'

const DL_KEY = '__cl_dl'
const DEBOUNCE_MS = 500
const MAX_T = 150
const DEDUP_KEY = '_cl_ecom'
const CART_KW = 'add to cart|añadir al carrito|agregar al carrito|comprar ahora|buy now|add to bag'.split('|')

/* ── Dedupe Engine ─────────────────────────────────────
 * Persists dedupe state in sessionStorage so it survives:
 * - Page refresh on /thank-you (revenue integrity)
 * - SPA navigation (product_view per-product)
 * - Re-renders / hydration
 *
 * Schema: { seen: { [fingerprint]: timestamp } }
 * Fingerprints:
 * - product_view:          "pv:" + productId or pathname
 * - checkout_started:      "ck:" + pathname
 * - payment_intent_created:"pi:" + pathname
 * - payment_completed:     "pc:" + orderId or pathname
 */

function dedupLoad(): Record<string, number> {
    try {
        const raw = sessionStorage.getItem(DEDUP_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch { return {} }
}

function dedupSave(seen: Record<string, number>): void {
    try { sessionStorage.setItem(DEDUP_KEY, JSON.stringify(seen)) } catch { /* skip */ }
}

function dedupCheck(key: string): boolean {
    const seen = dedupLoad()
    if (seen[key]) return true
    seen[key] = Date.now()
    dedupSave(seen)
    return false
}

function createEcommercePlugin(): ClientLabsPlugin {
    let clickH: ((e: MouseEvent) => void) | null = null
    let origPush: ((...a: unknown[]) => number) | null = null
    let navIid: ReturnType<typeof setInterval> | null = null

    return {
        name: 'ecommerce',
        init(ctx: PluginContext): void {
            if (typeof window === 'undefined' || typeof document === 'undefined') return
            let lastT = 0

            // Initial scan
            scanProduct(ctx); scanUrl(ctx)
            wrapDL(ctx)

            // SPA: poll URL for route changes (catches pushState, replaceState, popstate)
            // Dedupe engine makes re-scan O(1) for unchanged URL — zero cost
            let lastUrl = location.href
            navIid = setInterval(() => {
                const cur = location.href
                if (cur !== lastUrl) {
                    lastUrl = cur
                    setTimeout(() => { scanProduct(ctx); scanUrl(ctx) }, 80)
                }
            }, 1000)

            clickH = (e: MouseEvent): void => {
                const n = Date.now(); if (n - lastT < DEBOUNCE_MS) return; lastT = n
                const t = e.target as HTMLElement; if (!t) return
                const el = t.closest('a,button,input[type="submit"]') as HTMLElement | null
                if (!el || (el.offsetParent === null && el.style.position !== 'fixed')) return
                const txt = san(el.innerText || el.textContent || (el as HTMLInputElement).value || '')
                if (!txt) return
                const lo = txt.toLowerCase()
                if (CART_KW.some(k => lo.includes(k)) || el.getAttribute('name') === 'add-to-cart' || el.closest('.shopify-payment-button')) {
                    ctx.track('add_to_cart', { ...nearProd(el), source: 'dom', buttonText: txt, url: location.href })
                }
            }
            document.addEventListener('click', clickH, { passive: true, capture: true })
        },
        destroy(): void {
            if (clickH && typeof document !== 'undefined') { document.removeEventListener('click', clickH, { capture: true }); clickH = null }
            if (navIid) { clearInterval(navIid); navIid = null }
            unwrapDL()
        },
    }

    function wrapDL(ctx: PluginContext): void {
        if (typeof window === 'undefined') return
        const w = window as unknown as Record<string, unknown>
        if (!Array.isArray(w.dataLayer)) w.dataLayer = []
        const dl = w.dataLayer as unknown[]
        if ((dl as unknown as Record<string, unknown>)[DL_KEY]) return
        origPush = dl.push.bind(dl)
        dl.push = function (...a: unknown[]): number {
            for (const i of a) dlEvent(i, ctx)
            return origPush!(...a)
        }
            ; (dl as unknown as Record<string, unknown>)[DL_KEY] = true
        for (const i of dl) dlEvent(i, ctx)
    }

    function unwrapDL(): void {
        if (typeof window === 'undefined' || !origPush) return
        const dl = (window as unknown as Record<string, unknown>).dataLayer as unknown[]
        if (dl) { dl.push = origPush; delete (dl as unknown as Record<string, unknown>)[DL_KEY]; origPush = null }
    }

    function dlEvent(item: unknown, ctx: PluginContext): void {
        if (!item || typeof item !== 'object') return
        const o = item as Record<string, unknown>
        const ev = ((o.event as string) || '').toLowerCase()
        const ec = o.ecommerce as Record<string, unknown> | undefined
        const it = ((ec?.items || o.items) as Record<string, unknown>[] | undefined)?.[0]

        if (ev === 'view_item' || ev === 'product_view') {
            const pid = String(it?.item_id || it?.id || '')
            const key = 'pv:' + (pid || location.pathname)
            if (!dedupCheck(key)) {
                ctx.track('product_view', { productId: pid || undefined, name: it?.item_name || it?.name, price: num(it?.price), currency: ec?.currency || o.currency, category: it?.item_category || it?.category, source: 'datalayer' })
            }
        } else if (ev === 'add_to_cart') {
            ctx.track('add_to_cart', { productId: it?.item_id || it?.id, name: it?.item_name || it?.name, price: num(it?.price), currency: ec?.currency || o.currency, source: 'datalayer' })
        } else if (ev === 'begin_checkout') {
            if (!dedupCheck('ck:' + location.pathname)) {
                ctx.track('checkout_started', { source: 'datalayer', value: num(ec?.value || o.value), currency: ec?.currency || o.currency })
            }
        } else if (ev === 'add_payment_info') {
            if (!dedupCheck('pi:' + location.pathname)) {
                ctx.track('payment_intent_created', { source: 'datalayer', paymentType: o.payment_type })
            }
        } else if (ev === 'purchase') {
            const orderId = String(o.transaction_id || ec?.transaction_id || '')
            const key = 'pc:' + (orderId || location.pathname)
            if (!dedupCheck(key)) {
                ctx.track('payment_completed', { orderId: orderId || undefined, revenue: num(ec?.value || o.value), currency: ec?.currency || o.currency, source: 'datalayer' })
            }
        }
    }

    function scanProduct(ctx: PluginContext): void {
        // JSON-LD
        for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
            try {
                const d = JSON.parse(s.textContent || '')
                const p = Array.isArray(d) ? d.find((x: Record<string, unknown>) => x['@type'] === 'Product') : (d['@type'] === 'Product' ? d : null)
                if (p) {
                    const pid = String(p.sku || p.productID || '')
                    const key = 'pv:' + (pid || location.pathname)
                    if (dedupCheck(key)) return
                    const of_ = Array.isArray(p.offers) ? p.offers[0] : p.offers
                    ctx.track('product_view', { productId: pid || undefined, name: p.name, price: num(of_?.price), currency: of_?.priceCurrency, category: p.category, source: 'schema' })
                    return
                }
            } catch { /* skip */ }
        }
        // DOM
        const el = document.querySelector('[data-product-id],.product-detail,.product-single')
        if (el) {
            const pid = (el as HTMLElement).dataset?.productId || ''
            const key = 'pv:' + (pid || location.pathname)
            if (!dedupCheck(key)) {
                ctx.track('product_view', { productId: pid || undefined, source: 'dom', url: location.href })
            }
        }
    }

    function scanUrl(ctx: PluginContext): void {
        const p = location.pathname.toLowerCase(), q = (p + location.search).toLowerCase()
        if (p.includes('/checkout') && !dedupCheck('ck:' + p)) {
            ctx.track('checkout_started', { source: 'url', url: location.href })
        }
        if (location.hostname.includes('checkout.stripe.com') && !dedupCheck('pi:' + p)) {
            ctx.track('payment_intent_created', { source: 'url', url: location.href })
        }
        if (q.includes('thank-you') || q.includes('thankyou') || q.includes('order-confirmation') || (p.includes('/success') && !p.includes('/login'))) {
            if (!dedupCheck('pc:' + p)) {
                ctx.track('payment_completed', { source: 'url', url: location.href })
            }
        }
    }
}

function san(t: string): string { return t.trim().replace(/\s+/g, ' ').substring(0, MAX_T) }
function num(v: unknown): number | undefined { if (v == null) return undefined; const n = Number(v); return isNaN(n) ? undefined : n }

function nearProd(el: HTMLElement): Record<string, unknown> {
    const c = el.closest('[data-product-id],[data-product],.product,.product-card,.product-item') as HTMLElement | null
    if (!c) return {}
    return {
        productId: c.dataset?.productId || c.dataset?.product,
        name: c.querySelector('.product-name,.product-title,h2,h3')?.textContent?.trim()?.substring(0, MAX_T),
        price: num(c.dataset?.price || c.querySelector('.price .amount,.product-price')?.textContent?.replace(/[^0-9.,]/g, '')),
    }
}

export default createEcommercePlugin
