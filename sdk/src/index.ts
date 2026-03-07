/**
 * ClientLabs SDK — IIFE Entry Point (v1.1.0)
 *
 * Exposes window.clientlabs with:
 *   init(), track(), identify(), flush(), destroy(), version
 *
 * Public API is 100% backward compatible with v1.0.
 */

import { init, track, identify, flush, destroy, version } from './core'

const clientlabs = { init, track, identify, flush, destroy, version }

// Expose globally
if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).clientlabs = clientlabs
}

export default clientlabs
