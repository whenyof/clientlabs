/**
 * ClientLabs Plugin — Scroll Depth
 *
 * Tracks scroll milestones:
 * - scroll_50: visitor scrolled past 50% of the page
 * - scroll_90: visitor scrolled past 90% of the page
 *
 * Each threshold fires exactly once per page load.
 * Listener is removed after both thresholds are hit.
 */

import type { ClientLabsPlugin, PluginContext } from '../types'

function createScrollPlugin(): ClientLabsPlugin {
    let scrolled50 = false
    let scrolled90 = false
    let handler: (() => void) | null = null

    return {
        name: 'scroll',

        init(ctx: PluginContext): void {
            if (typeof window === 'undefined') return

            handler = (): void => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
                if (scrollHeight <= 0) return

                const pct = window.scrollY / scrollHeight

                if (!scrolled50 && pct >= 0.5) {
                    scrolled50 = true
                    ctx.track('scroll_50', { percent: 50, url: window.location.href })
                }

                if (!scrolled90 && pct >= 0.9) {
                    scrolled90 = true
                    ctx.track('scroll_90', { percent: 90, url: window.location.href })
                    // Both thresholds hit — remove listener
                    if (handler) {
                        window.removeEventListener('scroll', handler, { capture: true })
                    }
                }
            }

            window.addEventListener('scroll', handler, { passive: true, capture: true })
        },

        destroy(): void {
            if (handler && typeof window !== 'undefined') {
                window.removeEventListener('scroll', handler, { capture: true })
                handler = null
            }
        },
    }
}

export default createScrollPlugin
