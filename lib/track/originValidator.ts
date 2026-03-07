/**
 * Origin Validation — Domain whitelist check for /api/track (Hardened v2)
 *
 * Validates the request Origin header against the tenant's allowedDomains list.
 *
 * Security guarantees:
 * - ALWAYS uses URL parsing (new URL) for hostname extraction — no string tricks
 * - Subdomain check uses strict ".domain" prefix matching — no suffix bypass
 * - No includes() — only exact hostname match or .endsWith("." + hostname)
 * - Prevents bypass via: evil.com/midominio.com, evilmidominio.com, midominio.com@evil.com
 *
 * Rules:
 * - allowedDomains = [] → allow all origins (backward-compatible default)
 * - allowedDomains with values → origin must match exactly or be a subdomain
 * - Null origin + domains configured → blocked (unless wildcard "*" present)
 * - Comparison is case-insensitive, protocol-agnostic
 */

/**
 * Check if a request origin is allowed for a given tenant's domain whitelist.
 *
 * @param origin - The Origin header from the request (may be null)
 * @param allowedDomains - Array of allowed domains/origins from User.allowedDomains
 * @returns Object with `allowed` boolean and the `matchedDomain` if applicable
 */
export function validateOrigin(
    origin: string | null,
    allowedDomains: string[]
): { allowed: boolean; matchedDomain: string | null } {
    // No domains configured → allow everything (backward compatibility)
    if (!allowedDomains || allowedDomains.length === 0) {
        return { allowed: true, matchedDomain: origin || '*' }
    }

    // Check for explicit wildcard first
    if (allowedDomains.includes('*')) {
        return { allowed: true, matchedDomain: '*' }
    }

    // Domains configured but no origin header → block
    // sendBeacon may omit origin, but with domains configured we must enforce
    if (!origin) {
        return { allowed: false, matchedDomain: null }
    }

    // Parse origin hostname safely
    const originHostname = safeExtractHostname(origin)
    if (!originHostname) {
        return { allowed: false, matchedDomain: null }
    }

    for (const domain of allowedDomains) {
        const domainHostname = safeExtractHostname(domain)
        if (!domainHostname) continue

        // Exact hostname match (protocol-agnostic)
        if (originHostname === domainHostname) {
            return { allowed: true, matchedDomain: domain }
        }

        // Subdomain match: origin "app.example.com" matches domain "example.com"
        // The dot prefix prevents "evilexample.com" from matching "example.com"
        if (originHostname.endsWith('.' + domainHostname)) {
            return { allowed: true, matchedDomain: domain }
        }
    }

    return { allowed: false, matchedDomain: null }
}

/**
 * Build CORS headers for a response.
 *
 * @param matchedDomain - The domain that matched (or '*' for wildcard, or null for blocked)
 * @param origin - The actual request origin header
 */
export function buildCorsHeaders(
    matchedDomain: string | null,
    origin: string | null
): Record<string, string> {
    // Security: when a specific domain matched, echo the exact request origin
    // (browsers require the exact origin, not the configured domain).
    // Only use '*' when explicitly configured as wildcard or no restriction.
    let allowOrigin: string

    if (matchedDomain === '*') {
        allowOrigin = '*'
    } else if (matchedDomain && origin) {
        // Echo the actual request origin (standard CORS practice)
        allowOrigin = origin
    } else {
        // Blocked or unknown — use 'null' to signal browser to reject
        allowOrigin = 'null'
    }

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400', // 24h preflight cache
        'Vary': 'Origin',                  // Required when ACAO is not '*'
    }
}

/* ── Utilities ─────────────────────────────────────────── */

/**
 * Safely extract a lowercase hostname from an origin or domain string.
 *
 * Uses URL parsing to prevent any bypass via special characters
 * (userinfo, port, path, etc.).
 *
 * @returns Lowercase hostname, or null if parsing fails completely
 */
function safeExtractHostname(input: string): string | null {
    if (!input || typeof input !== 'string') return null

    const trimmed = input.trim().toLowerCase()
    if (trimmed.length === 0) return null

    // Try parsing as-is first (handles "https://example.com")
    try {
        const url = new URL(trimmed)
        // Reject if hostname is empty or contains special chars that slipped through
        if (url.hostname && !url.hostname.includes('@')) {
            return url.hostname
        }
    } catch {
        // Not a valid URL as-is — try with protocol prefix
    }

    // Try with https:// prefix (handles "example.com", "app.example.com")
    try {
        const url = new URL(`https://${trimmed}`)
        if (url.hostname && !url.hostname.includes('@')) {
            return url.hostname
        }
    } catch {
        // Completely invalid
    }

    return null
}
