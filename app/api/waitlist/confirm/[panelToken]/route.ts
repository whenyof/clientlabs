export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { prisma } from "@/lib/prisma"
import { confirmByPanelToken } from "@/lib/waitlist/service"
import { sendWelcomeEmail, sendAnnouncementEmail } from "@/lib/waitlist/emails"
import { checkWaitlistConfirmLimit } from "@/lib/rate-limit"
import { getBaseUrl } from "@/lib/api/baseUrl"

const BASE_COUNT = 17 // mismo offset que el contador público de /api/waitlist

// El email de anuncio dice "el 23 de junio lanzamos": no programarlo para
// confirmaciones posteriores al lanzamiento (copy obsoleto). Decisión: cutoff.
const ANNOUNCEMENT_CUTOFF = new Date("2026-06-24T00:00:00+02:00")
const ANNOUNCEMENT_DELAY_MS = 10 * 60 * 1000 // welcome → anuncio: +10 minutos

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
            select: { id: true, email: true, name: true, referralCode: true, createdAt: true, announcementSentAt: true },
          })
          if (!entry) return
          const position =
            (await prisma.waitlistEntry.count({ where: { createdAt: { lte: entry.createdAt } } })) + BASE_COUNT
          await sendWelcomeEmail(entry.email, position, entry.referralCode, panelToken)

          // Anuncio de lanzamiento programado a +10 min (Resend scheduled_at).
          // Solo hasta el cutoff y solo si nunca se le envió/programó (idempotente
          // también frente al broadcast masivo, que respeta announcementSentAt).
          if (entry.announcementSentAt || new Date() >= ANNOUNCEMENT_CUTOFF) return
          const scheduledAt = new Date(Date.now() + ANNOUNCEMENT_DELAY_MS).toISOString()
          const scheduled = await sendAnnouncementEmail(entry.email, panelToken, entry.name, scheduledAt)
          if (scheduled) {
            // Marcar al programar: si el POST falló, queda elegible para el broadcast
            await prisma.waitlistEntry.update({
              where: { id: entry.id },
              data: { announcementSentAt: new Date() },
            })
          }
        })().catch((err) => console.error("Waitlist welcome email error:", err))
      )
    }

    return NextResponse.redirect(`${base}/referidos/${panelToken}`, 302)
  } catch (error) {
    console.error("WAITLIST CONFIRM ERROR:", error)
    return NextResponse.redirect(`${base}/whitelist?confirm=error`, 302)
  }
}
