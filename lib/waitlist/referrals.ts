import { prisma } from "@/lib/prisma"

/** Nº de referidos CONFIRMADOS de una entrada. Siempre derivado, nunca contador almacenado. */
export async function getConfirmedReferralCount(entryId: string): Promise<number> {
  return prisma.waitlistEntry.count({
    where: { referredById: entryId, confirmedAt: { not: null } },
  })
}

/** Lista de referidos confirmados (solo campos seguros para mostrar enmascarados). */
export async function getConfirmedReferrals(entryId: string) {
  return prisma.waitlistEntry.findMany({
    where: { referredById: entryId, confirmedAt: { not: null } },
    select: { email: true, confirmedAt: true },
    orderBy: { confirmedAt: "desc" },
    take: 100,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK PREMIOS (post-launch) — NO implementado a propósito en esta fase.
//
// Cuando un referido convierta a cuenta de pago, el webhook de Stripe
// (app/api/stripe/webhook/route.ts, case "checkout.session.completed") deberá
// localizar la WaitlistEntry por email del comprador y, si tiene referredById,
// llamar aquí a algo como:
//
//   export async function onReferralConverted(referredEntryId: string): Promise<void>
//
// que evalúe los umbrales de premio (1 mes gratis, BUSINESS de por vida a 25, …)
// y los conceda UNA sola vez (idempotente). Hasta entonces, este módulo solo
// cuenta y lista: ningún premio se concede automáticamente.
// ─────────────────────────────────────────────────────────────────────────────
