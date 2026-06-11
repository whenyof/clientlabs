import { randomInt, randomBytes } from "crypto"

/** Alfabeto sin caracteres ambiguos (sin 0/O/o, 1/l/I). */
const REFERRAL_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz"
const REFERRAL_CODE_LENGTH = 8

/** Código corto público para el enlace ?ref= (~47 bits de entropía). */
export function generateReferralCode(): string {
  let code = ""
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += REFERRAL_ALPHABET[randomInt(REFERRAL_ALPHABET.length)]
  }
  return code
}

/** Token de panel: 32 chars urlsafe, 192 bits. Único mecanismo de acceso al panel. */
export function generatePanelToken(): string {
  return randomBytes(24).toString("base64url")
}

/** Error P2002 de Prisma = violación de constraint unique (colisión de token). */
export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2002"
  )
}

export const TOKEN_MAX_RETRIES = 5
