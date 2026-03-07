/**
 * ClientLabs Plugin — Heartbeat (Optional)
 *
 * Sends periodic heartbeat events to keep the backend session alive.
 * NOT enabled by default — only activates if config.heartbeatInterval is set.
 *
 * Usage:
 *   clientlabs.init({
 *     accountId: 'xxx',
 *     publicKey: 'pk_xxx',
 *     heartbeatInterval: 30, // seconds
 *   })
 *
 * The heartbeat event updates lastActivityAt on the backend,
 * preventing premature session close during long reading/idle periods.
 */

import type { ClientLabsPlugin, PluginContext } from '../types'

function createHeartbeatPlugin(): ClientLabsPlugin {
    let intervalId: ReturnType<typeof setInterval> | null = null

    return {
        name: 'heartbeat',

        init(ctx: PluginContext): void {
            const seconds = ctx.config.heartbeatInterval
            if (!seconds || typeof seconds !== 'number' || seconds < 5) return

            const intervalMs = seconds * 1000

            intervalId = setInterval(() => {
                // Only send heartbeat if page is visible
                if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
                ctx.track('heartbeat', { url: window.location.href })
            }, intervalMs)
        },

        destroy(): void {
            if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
            }
        },
    }
}

export default createHeartbeatPlugin
