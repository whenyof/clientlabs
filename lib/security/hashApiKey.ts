import crypto from "node:crypto"

/**
 * Institutional API Key Utilities
 * 
 * Handles generation of cl_sec_... keys and secure SHA256 hashing.
 */

/**
 * Generates a random secure API Key with the institutional prefix.
 */
export function generateApiKey(): string {
    const randomBytes = crypto.randomBytes(24).toString('hex')
    return `cl_sec_${randomBytes}`
}

/**
 * Generates a random Public Key for SDK initialization.
 */
export function generatePublicKey(): string {
    const randomBytes = crypto.randomBytes(16).toString('hex')
    return `cl_pub_${randomBytes}`
}

/**
 * Generates a SHA256 hash of an API Key.
 * We only store the hash in the database.
 */
export function hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex')
}

/**
 * Prepares a new API key pair for storage and display.
 */
export function createApiKeyPair() {
    const rawKey = generateApiKey()
    const hash = hashApiKey(rawKey)
    return {
        rawKey, // Return once to the user
        hash    // Store in DB
    }
}

/**
 * Prepares a new Public Key pair for storage and display.
 */
export function createPublicKeyPair() {
    const rawKey = generatePublicKey()
    const hash = hashApiKey(rawKey)
    return {
        rawKey, // Return to the user/SDK
        hash    // Store in DB
    }
}
