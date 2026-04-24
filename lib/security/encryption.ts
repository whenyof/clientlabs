import crypto from 'crypto'

const MASTER_SECRET = process.env.API_KEY_MASTER_SECRET

if (!MASTER_SECRET) {
    throw new Error("Missing API_KEY_MASTER_SECRET")
}

// Derive exactly 32 bytes key from the master secret using SHA-256
const ALGO = 'aes-256-gcm'
const KEY = crypto.createHash('sha256').update(MASTER_SECRET).digest()

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output includes IV and AuthTag, encoded as a Base64 string.
 */
export function encrypt(plaintext: string): string {
    if (!plaintext) {
        throw new Error("Cannot encrypt empty payload")
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGO, KEY, iv)

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ])

    const authTag = cipher.getAuthTag()

    // Payload structure: IV (16) + AuthTag (16) + Encrypted Data
    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

/**
 * Decrypts a previously encrypted base64 payload.
 */
export function decrypt(payload: string): string {
    if (!payload) {
        throw new Error("Cannot decrypt empty payload")
    }

    try {
        const data = Buffer.from(payload, 'base64')

        if (data.length < 32) {
            throw new Error("Invalid payload length")
        }

        const iv = data.subarray(0, 16)
        const authTag = data.subarray(16, 32)
        const encrypted = data.subarray(32)

        const decipher = crypto.createDecipheriv(ALGO, KEY, iv, { authTagLength: 16 })
        decipher.setAuthTag(authTag)

        const decrypted = Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ])

        return decrypted.toString('utf8')
    } catch (error) {
        throw new Error("Failed to decrypt payload. Payload may be corrupted or invalid.")
    }
}
