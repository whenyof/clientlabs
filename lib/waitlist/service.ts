import { prisma } from "@/lib/prisma"
import {
  generateReferralCode,
  generatePanelToken,
  isUniqueConstraintError,
  TOKEN_MAX_RETRIES,
} from "./tokens"

export type JoinResult =
  | { status: "created"; panelToken: string; email: string }
  | { status: "already_confirmed"; email: string }
  | { status: "already_unconfirmed"; panelToken: string; email: string }

/**
 * Alta en la waitlist con atribución de referido. Idempotente por email.
 * - ref inexistente → sin atribución, el alta sigue.
 * - auto-referido (mismo email que el referrer) → atribución bloqueada.
 * - email duplicado → no crea nada; devuelve el estado para que la ruta
 *   reenvíe la confirmación si procede.
 * El envío de emails es responsabilidad de la ruta (waitUntil), no del servicio.
 */
export async function joinWaitlist(input: {
  email: string
  name?: string | null
  ref?: string | null
  source?: string | null
}): Promise<JoinResult> {
  const email = input.email.toLowerCase().trim()
  const name = input.name?.trim() || null

  // Resolver atribución: ref inexistente o auto-referido → null
  let referredById: string | null = null
  const ref = input.ref?.trim()
  if (ref) {
    const referrer = await prisma.waitlistEntry.findUnique({
      where: { referralCode: ref },
      select: { id: true, email: true },
    })
    if (referrer && referrer.email !== email) {
      referredById = referrer.id
    }
  }

  // Idempotencia: si ya existe, no crear ni re-atribuir
  const existing = await prisma.waitlistEntry.findUnique({
    where: { email },
    select: { id: true, confirmedAt: true, panelToken: true },
  })
  if (existing) {
    if (existing.confirmedAt) return { status: "already_confirmed", email }
    // Sin confirmar: garantizar panelToken (filas legacy pueden no tenerlo) y reenviar
    const panelToken = existing.panelToken ?? (await assignTokensToLegacyEntry(existing.id)).panelToken
    return { status: "already_unconfirmed", panelToken, email }
  }

  // Crear con reintento ante colisión de tokens (P2002)
  for (let attempt = 0; attempt < TOKEN_MAX_RETRIES; attempt++) {
    const referralCode = generateReferralCode()
    const panelToken = generatePanelToken()
    try {
      await prisma.waitlistEntry.create({
        data: {
          email,
          name,
          source: input.source?.trim() || "whitelist",
          referralCode,
          panelToken,
          referredById,
        },
      })
      return { status: "created", panelToken, email }
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        // Puede ser colisión de token… o carrera con otro alta del mismo email
        const raced = await prisma.waitlistEntry.findUnique({
          where: { email },
          select: { confirmedAt: true, panelToken: true },
        })
        if (raced) {
          if (raced.confirmedAt) return { status: "already_confirmed", email }
          if (raced.panelToken) return { status: "already_unconfirmed", panelToken: raced.panelToken, email }
        }
        continue // colisión de referralCode/panelToken → regenerar
      }
      throw err
    }
  }
  throw new Error("No se pudo generar un token único tras varios intentos")
}

/** Marca confirmada una entrada por panelToken. Idempotente. Null si el token no existe. */
export async function confirmByPanelToken(panelToken: string): Promise<{ panelToken: string; justConfirmed: boolean } | null> {
  const entry = await prisma.waitlistEntry.findUnique({
    where: { panelToken },
    select: { id: true, confirmedAt: true },
  })
  if (!entry) return null
  if (entry.confirmedAt) return { panelToken, justConfirmed: false }
  await prisma.waitlistEntry.updateMany({
    where: { id: entry.id, confirmedAt: null },
    data: { confirmedAt: new Date() },
  })
  return { panelToken, justConfirmed: true }
}

/**
 * Filas legacy (pre-referidos) sin tokens: rellena SOLO los que falten,
 * sin regenerar los existentes (un referralCode ya compartido no debe cambiar).
 */
export async function assignTokensToLegacyEntry(id: string): Promise<{ referralCode: string; panelToken: string }> {
  const current = await prisma.waitlistEntry.findUnique({
    where: { id },
    select: { referralCode: true, panelToken: true },
  })
  if (current?.referralCode && current?.panelToken) {
    return { referralCode: current.referralCode, panelToken: current.panelToken }
  }
  for (let attempt = 0; attempt < TOKEN_MAX_RETRIES; attempt++) {
    const referralCode = current?.referralCode ?? generateReferralCode()
    const panelToken = current?.panelToken ?? generatePanelToken()
    try {
      await prisma.waitlistEntry.update({
        where: { id },
        data: { referralCode, panelToken },
      })
      return { referralCode, panelToken }
    } catch (err) {
      if (isUniqueConstraintError(err)) continue
      throw err
    }
  }
  throw new Error("No se pudo generar un token único tras varios intentos")
}
