/**
 * ClientLabs SDK — Auto Capture
 *
 * Automatically tracks:
 * - Page views (with smart URL detection for pricing/features)
 * - Scroll depth (50% and 90%, each fired once)
 * - Form interactions (form_start on first focus, form_submit on submit)
 * - Email detection for auto-identify
 */

type TrackFn = (eventType: string, metadata?: Record<string, unknown>) => void
type IdentifyFn = (data: { email?: string; name?: string }) => void

let scrolled50 = false
let scrolled90 = false
let formStartTracked = new WeakSet<HTMLFormElement>()

/**
 * Start all auto-capture listeners.
 * Call this once after init.
 */
export function startAutoCapture(track: TrackFn, identify: IdentifyFn): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    capturePageView(track)
    captureScroll(track)
    captureForms(track, identify)
}

/* ── Page View ──────────────────────────────────────── */

function capturePageView(track: TrackFn): void {
    const path = window.location.pathname.toLowerCase()
    const meta = {
        url: window.location.href,
        path,
        referrer: document.referrer || undefined,
        title: document.title || undefined,
    }

    if (path.includes('/pricing') || path.includes('/precios')) {
        track('pricing_page_view', meta)
    } else if (path.includes('/features') || path.includes('/funcionalidades')) {
        track('features_page_view', meta)
    } else {
        track('page_view', meta)
    }
}

/* ── Scroll Tracking ────────────────────────────────── */

function captureScroll(track: TrackFn): void {
    const handler = (): void => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        if (scrollHeight <= 0) return

        const pct = window.scrollY / scrollHeight

        if (!scrolled50 && pct >= 0.5) {
            scrolled50 = true
            track('scroll_50', { percent: 50, url: window.location.href })
        }

        if (!scrolled90 && pct >= 0.9) {
            scrolled90 = true
            track('scroll_90', { percent: 90, url: window.location.href })
            // Both thresholds hit — remove listener
            window.removeEventListener('scroll', handler, { capture: true })
        }
    }

    window.addEventListener('scroll', handler, { passive: true, capture: true })
}

/* ── Form Tracking ──────────────────────────────────── */

function captureForms(track: TrackFn, identify: IdentifyFn): void {
    // form_start: first focus on any input within a form
    document.addEventListener('focusin', (e: FocusEvent) => {
        const target = e.target as HTMLElement
        if (!target || !('tagName' in target)) return

        const tag = target.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return

        const form = target.closest('form')
        if (!form || formStartTracked.has(form)) return

        formStartTracked.add(form)
        track('form_start', {
            formId: form.id || undefined,
            formAction: form.action || undefined,
            url: window.location.href,
        })
    }, { passive: true, capture: true })

    // form_submit + auto-identify from email fields
    document.addEventListener('submit', (e: SubmitEvent) => {
        const form = e.target as HTMLFormElement
        if (!form || form.tagName !== 'FORM') return

        // Extract email if present
        const emailInput = form.querySelector<HTMLInputElement>(
            'input[type="email"], input[name*="email"], input[name*="correo"]'
        )

        const metadata: Record<string, unknown> = {
            formId: form.id || undefined,
            formAction: form.action || undefined,
            url: window.location.href,
        }

        if (emailInput?.value) {
            metadata.email = emailInput.value
            // Auto-identify with detected email
            identify({ email: emailInput.value })
        }

        track('form_submit', metadata)
    }, { passive: true, capture: true })
}
