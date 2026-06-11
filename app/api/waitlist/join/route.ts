export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { waitUntil } from "@vercel/functions"
import { joinWaitlist } from "@/lib/waitlist/service"
import { sendConfirmationEmail } from "@/lib/waitlist/emails"
import { checkWaitlistJoinLimit } from "@/lib/rate-limit"

const joinSchema = z.object({
  email: z.string().email("Email no válido").max(255),
  name: z.string().max(120).optional(),
  ref: z.string().max(32).optional(),
  source: z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"
    const allowed = await checkWaitlistJoinLimit(`join:${ip}`).catch(() => true)
    if (!allowed) {
      return NextResponse.json({ error: "Demasiados intentos. Espera un minuto." }, { status: 429 })
    }

    const raw = await req.json().catch(() => null)
    const result = joinSchema.safeParse(raw)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }

    // El ref puede venir en el body o en la cookie cl_ref puesta por la landing
    const ref = result.data.ref ?? req.cookies.get("cl_ref")?.value ?? null

    const outcome = await joinWaitlist({
      email: result.data.email,
      name: result.data.name ?? null,
      ref,
      source: result.data.source ?? null,
    })

    // Respuesta neutra: sin IDs internos ni tokens (el panelToken solo viaja por email)
    if (outcome.status === "created") {
      waitUntil(sendConfirmationEmail(outcome.email, outcome.panelToken).catch((err) =>
        console.error("Waitlist confirm email error:", err)
      ))
      return NextResponse.json({ success: true, needsConfirmation: true })
    }
    if (outcome.status === "already_unconfirmed") {
      // Idempotente: reenvía la confirmación, no crea duplicado
      waitUntil(sendConfirmationEmail(outcome.email, outcome.panelToken).catch((err) =>
        console.error("Waitlist confirm resend error:", err)
      ))
      return NextResponse.json({ success: true, already: true, needsConfirmation: true })
    }
    return NextResponse.json({ success: true, already: true, needsConfirmation: false })
  } catch (error) {
    console.error("WAITLIST JOIN ERROR:", error)
    return NextResponse.json({ error: "Error interno. Inténtalo de nuevo." }, { status: 500 })
  }
}
