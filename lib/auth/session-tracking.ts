import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export interface SessionInfo {
  id: string
  sessionToken: string
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  createdAt: Date
  lastUsedAt: Date
  revokedAt: Date | null
  isCurrent?: boolean
}

// Derives a stable session token from a JWT jti (or falls back to a hash of userId+ua+ip)
export function deriveSessionToken(jti: string): string {
  return crypto.createHash("sha256").update(jti).digest("hex")
}

export async function recordSession(
  userId: string,
  jti: string,
  ipAddress: string | null,
  userAgent: string | null
): Promise<void> {
  const sessionToken = deriveSessionToken(jti)
  await prisma.sessionRevocation.upsert({
    where: { sessionToken },
    create: {
      userId,
      sessionToken,
      ipAddress,
      userAgent,
      lastUsedAt: new Date(),
    },
    update: {
      lastUsedAt: new Date(),
    },
  })
}

export async function listActiveSessions(userId: string): Promise<SessionInfo[]> {
  const sessions = await prisma.sessionRevocation.findMany({
    where: {
      userId,
      revokedAt: null,
    },
    orderBy: { lastUsedAt: "desc" },
    select: {
      id: true,
      sessionToken: true,
      ipAddress: true,
      userAgent: true,
      location: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
  })
  return sessions
}

export async function isSessionRevoked(jti: string): Promise<boolean> {
  const sessionToken = deriveSessionToken(jti)
  const record = await prisma.sessionRevocation.findUnique({
    where: { sessionToken },
    select: { revokedAt: true },
  })
  return record?.revokedAt != null
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.sessionRevocation.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllOtherSessions(
  userId: string,
  currentJti: string
): Promise<void> {
  const currentToken = deriveSessionToken(currentJti)
  await prisma.sessionRevocation.updateMany({
    where: {
      userId,
      revokedAt: null,
      NOT: { sessionToken: currentToken },
    },
    data: { revokedAt: new Date() },
  })
}

// Parses a rough device name from User-Agent header
export function parseUserAgent(ua: string | null): string {
  if (!ua) return "Dispositivo desconocido"
  if (/iPhone/i.test(ua)) return "iPhone"
  if (/iPad/i.test(ua)) return "iPad"
  if (/Android/i.test(ua)) return "Android"
  if (/Macintosh/i.test(ua)) return "Mac"
  if (/Windows/i.test(ua)) return "Windows PC"
  if (/Linux/i.test(ua)) return "Linux"
  return "Navegador web"
}
