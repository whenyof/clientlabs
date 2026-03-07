/**
 * ClientLabs SDK — Validation Engine
 * Strict format checks for PublicKey and UUID.
 */

const PUBLIC_KEY_PREFIX = "cl_pub_";

/**
 * Validar si la PublicKey cumple el estándar institucional.
 */
export function validatePublicKey(key: string | null | undefined): boolean {
    if (!key) return false;
    return key.startsWith(PUBLIC_KEY_PREFIX);
}

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validar UUID v4 para visitorId y sessionId.
 * @param uuid 
 */
export function validateUuid(uuid: string): boolean {
    return UUID_V4_REGEX.test(uuid);
}
