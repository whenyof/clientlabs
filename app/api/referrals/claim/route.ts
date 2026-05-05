export const maxDuration = 15
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

const schema = z.object({
  rewardDescription: z.string().min(1).max(500),
  levelName: z.string().min(1).max(100),
  subscribedCount: z.number().int().min(0),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, referralCode: true },
    })

    await prisma.activityLog.create({
      data: {
        workspaceId: session.user.id,
        userId: session.user.id,
        action: "referral_reward_claimed",
        entity: "referral",
        metadata: {
          reward: parsed.data.rewardDescription,
          levelName: parsed.data.levelName,
          subscribedCount: parsed.data.subscribedCount,
          userId: session.user.id,
        },
      },
    }).catch(() => null)

    await sendEmail(
      "hola@clientlabs.io",
      `Solicitud de recompensa — ${parsed.data.levelName}`,
      `
        <h2>Nueva solicitud de recompensa de referidos</h2>
        <table style="border-collapse:collapse;width:100%;max-width:560px">
          <tr><td style="padding:8px 0;font-weight:600;color:#0B1F2A">Nombre</td><td style="padding:8px 0;color:#374151">${user?.name ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#0B1F2A">Email</td><td style="padding:8px 0;color:#374151">${user?.email ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#0B1F2A">Código de referido</td><td style="padding:8px 0;color:#374151">${user?.referralCode ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#0B1F2A">Nivel alcanzado</td><td style="padding:8px 0;color:#374151">${parsed.data.levelName}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#0B1F2A">Referidos suscritos</td><td style="padding:8px 0;color:#374151">${parsed.data.subscribedCount}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600;color:#0B1F2A">Recompensa solicitada</td><td style="padding:8px 0;color:#1FA97A;font-weight:600">${parsed.data.rewardDescription}</td></tr>
        </table>
        <p style="margin-top:24px;color:#6B7280;font-size:13px">Solicitud enviada el ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
      `
    )

    return NextResponse.json({
      success: true,
      message: "Recompensa solicitada. En un plazo máximo de 24 horas nos pondremos en contacto contigo.",
    })
  } catch (err) {
    console.error("[api/referrals/claim]", err)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
