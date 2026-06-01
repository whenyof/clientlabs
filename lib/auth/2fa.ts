import QRCode from "qrcode"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const APP_NAME = "ClientLabs"
const ENCRYPTION_KEY = process.env.TWO_FACTOR_SECRET_KEY!
const ALGORITHM = "aes-256-gcm"

// ── Encryption ───────────────────────────────────────────────────────────────

function getKey(): Buffer {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error("TWO_FACTOR_SECRET_KEY must be at least 32 chars")
  }
  return Buffer.from(ENCRYPTION_KEY.slice(0, 32), "utf-8")
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString("hex"), encrypted.toString("hex"), tag.toString("hex")].join(":")
}

export function decryptSecret(ciphertext: string): string {
  const [ivHex, encHex, tagHex] = ciphertext.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const encrypted = Buffer.from(encHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf-8")
}

// ── TOTP (RFC 6238) — pure Node.js, no external TOTP dependency ───────────────

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32Decode(s: string): Buffer {
  s = s.toUpperCase().replace(/=+$/, "")
  let bits = 0
  let value = 0
  const output: number[] = []
  for (const char of s) {
    const idx = BASE32_CHARS.indexOf(char)
    if (idx < 0) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(output)
}

function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let output = ""
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_CHARS[(value << (5 - bits)) & 31]
  return output
}

function computeHOTP(secret: string, counter: bigint): string {
  const key = base32Decode(secret)
  const counterBuf = Buffer.alloc(8)
  counterBuf.writeBigInt64BE(counter)
  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  return (code % 1_000_000).toString().padStart(6, "0")
}

export function generateSecret(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes))
}

export function generateTOTPUri(secret: string, email: string): string {
  const params = new URLSearchParams({
    secret,
    issuer: APP_NAME,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  })
  return `otpauth://totp/${encodeURIComponent(APP_NAME)}:${encodeURIComponent(email)}?${params}`
}

export async function generateQRCode(secret: string, email: string): Promise<string> {
  return QRCode.toDataURL(generateTOTPUri(secret, email))
}

export function verifyToken(secret: string, token: string, window = 1): boolean {
  const clean = token.replace(/\s/g, "")
  if (!/^\d{6}$/.test(clean)) return false
  const step = BigInt(Math.floor(Date.now() / 1000 / 30))
  for (let i = -window; i <= window; i++) {
    if (computeHOTP(secret, step + BigInt(i)) === clean) return true
  }
  return false
}

// ── Backup codes ─────────────────────────────────────────────────────────────

export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase().match(/.{4}/g)!.join("-")
  )
}

export async function hashBackupCode(code: string): Promise<string> {
  return bcrypt.hash(code.replace(/-/g, "").toUpperCase(), 10)
}

export async function verifyBackupCode(input: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(input.replace(/-/g, "").toUpperCase(), hashed)
}
