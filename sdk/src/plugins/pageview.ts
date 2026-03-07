/**
 * ClientLabs Plugin — Page View
 *
 * Tracks page views with smart URL detection:
 * - /pricing or /precios → pricing_page_view
 * - /features or /funcionalidades → features_page_view
 * - Everything else → page_view
 *
 * Fires once per page load (no SPA re-tracking).
 */

import type { ClientLabsPlugin, PluginContext } from '../types'

function createPageViewPlugin(): ClientLabsPlugin {
    return {
        name: 'pageview',

        init(ctx: PluginContext): void {
            if (typeof window === 'undefined' || typeof document === 'undefined') return

            const fire = (): void => {
                const path = window.location.pathname.toLowerCase()
                const meta = {
                    url: window.location.href,
                    path,
                    referrer: document.referrer || undefined,
                    title: document.title || undefined,
                }

                if (path.includes('/pricing') || path.includes('/precios')) {
                    ctx.track('pricing_page_view', meta)
                } else if (path.includes('/features') || path.includes('/funcionalidades')) {
                    ctx.track('features_page_view', meta)
                } else {
                    ctx.track('page_view', meta)
                }
            }

            // Initial view
            fire()

            // SPA support
            if (typeof history !== 'undefined') {
                const originalPush = history.pushState
                const originalReplace = history.replaceState

                history.pushState = function (...args): any {
                    const result = originalPush.apply(this, args)
                    fire()
                    return result
                }
                history.replaceState = function (...args): any {
                    const result = originalReplace.apply(this, args)
                    fire()
                    return result
                }

                window.addEventListener('popstate', fire)

                    // Store originals for detroy
                    ; (this as any)._cleanup = (): void => {
                        history.pushState = originalPush
                        history.replaceState = originalReplace
                        window.removeEventListener('popstate', fire)
                    }
            }
        },

        destroy(): void {
            if ((this as any)._cleanup) {
                (this as any)._cleanup()
            }
        },
    }
}

export default createPageViewPlugin
