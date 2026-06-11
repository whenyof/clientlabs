export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { prisma } from "@/lib/prisma"
import { confirmByPanelToken } from "@/lib/waitlist/service"
import { sendWelcomeEmail } from "@/lib/waitlist/emails"
import { checkWaitlistConfirmLimit } from "@/lib/rate-limit"
import { getBaseUrl } from "@/lib/api/baseUrl"

const BASE_COUNT = 17 // mismo offset que el contador público de /api/waitlist

/**
 * GET /api/waitlist/confirm/[panelToken] — doble opt-in.
 * Idempotente: confirmar dos veces redirige igual al panel.
 * Token inválido → redirect neutro (sin 404 que permita enumerar).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ panelToken: string }> }) {
  const base = getBaseUrl()
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"
    const allowed = await checkWaitlistConfirmLimit(`confirm:${ip}`).catch(() => true)
    if (!allowed) {
      return NextResponse.redirect(`${base}/whitelist?confirm=ratelimit`, 302)
    }

    const { panelToken } = await params
    if (!panelToken || panelToken.length < 16 || panelToken.length > 64) {
      return NextResponse.redirect(`${base}/whitelist?confirm=invalid`, 302)
    }

    const result = await confirmByPanelToken(panelToken)
    if (!result) {
      return NextResponse.redirect(`${base}/whitelist?confirm=invalid`, 302)
    }

    // Welcome (posición + enlace de referido) solo en la primera confirmación
    if (result.justConfirmed) {
      waitUntil(
        (async () => {
          const entry = await prisma.waitlistEntry.findUnique({
            where: { panelToken },
            select: { email: true, referralCode: true, createdAt: true },
          })
          if (!entry) return
          const position =
            (await prisma.waitlistEntry.count({ where: { createdAt: { lte: entry.createdAt } } })) + BASE_COUNT
          await sendWelcomeEmail(entry.email, position, entry.referralCode, panelToken)
        })().catch((err) => console.error("Waitlist welcome email error:", err))
      )
    }

    return NextResponse.redirect(`${base}/referidos/${panelToken}`, 302)
  } catch (error) {
    console.error("WAITLIST CONFIRM ERROR:", error)
    return NextResponse.redirect(`${base}/whitelist?confirm=error`, 302)
  }
}
