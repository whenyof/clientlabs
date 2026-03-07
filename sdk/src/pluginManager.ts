/**
 * ClientLabs SDK — Plugin Manager (Production Locked)
 *
 * Manages plugin lifecycle: register → load → destroy.
 * Default plugins: ['pageview', 'scroll', 'forms', 'utm', 'commercialIntent', 'ecommerce']
 *
 * Safety guarantees:
 * - Each plugin.init() isolated in try/catch
 * - Each plugin.destroy() isolated in try/catch
 * - One plugin failure never blocks others
 * - Debug logging only when config.debug === true
 */

import type { ClientLabsPlugin, PluginContext, ClientLabsConfig, IdentifyData } from './types'

const DEFAULT_PLUGINS = ['pageview', 'scroll', 'forms', 'utm', 'commercialIntent', 'ecommerce', 'heartbeat']
const registry = new Map<string, () => ClientLabsPlugin>()
const active = new Map<string, ClientLabsPlugin>()

export function registerPlugin(name: string, factory: () => ClientLabsPlugin): void {
    if (registry.has(name)) return
    registry.set(name, factory)
}

export function loadPlugins(
    config: ClientLabsConfig,
    trackFn: (eventType: string, metadata?: Record<string, unknown>) => void,
    identifyFn: (data: IdentifyData) => void,
    getVisitorIdFn: () => string
): void {
    let names: string[] = []

    if (config.plugins) {
        // Explicit plugins list (manual override)
        names = config.plugins
    } else {
        // Feature-based automatic mapping
        const f = config.features

        // If no features specified, all are enabled by default
        const ecommerce = !f || f.ecommerce !== false
        const forms = !f || f.forms !== false
        const popups = !f || f.popups !== false
        const heartbeat = !f || f.heartbeat !== false
        const commercial = !f || f.commercialEvents !== false

        names.push('pageview', 'scroll', 'utm')
        if (forms) names.push('forms')
        if (commercial || popups) names.push('commercialIntent')
        if (ecommerce) names.push('ecommerce')
        if (heartbeat) names.push('heartbeat')
    }

    // Always enable autoIngest plugin for behavioural ingest events
    if (!names.includes('autoIngest')) {
        names.push('autoIngest')
    }

    const isDebug = config.debug === true

    const ctx: PluginContext = {
        track: trackFn,
        identify: identifyFn,
        getVisitorId: getVisitorIdFn,
        config,
        logger: console as unknown as PluginContext['logger'],
    }

    for (const name of names) {
        if (active.has(name)) continue
        const f = registry.get(name)
        if (!f) continue
        try {
            const p = f()
            p.init(ctx)
            active.set(name, p)
            if (isDebug) console.log(`[ClientLabs] Plugin loaded: ${name}`)
        } catch (err) {
            // Plugin failure must NEVER block other plugins
            if (isDebug) console.error(`[ClientLabs] Plugin "${name}" failed to init:`, (err as Error).message)
        }
    }
}

export function destroyPlugins(): void {
    for (const [name, p] of active) {
        try {
            p.destroy?.()
        } catch (err) {
            // Plugin failure must NEVER block other plugins
            console.error(`[ClientLabs] Plugin "${name}" failed to destroy:`, (err as Error).message)
        }
    }
    active.clear()
}
