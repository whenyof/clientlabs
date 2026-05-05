export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({ rewardDescription: z.string().min(1) })

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

  // Log the claim request — manual fulfillment by admin
  try {
    await prisma.activityLog.create({
      data: {
        workspaceId: session.user.id,
        userId: session.user.id,
        action: "referral_reward_claimed",
        entity: "referral",
        metadata: { reward: parsed.data.rewardDescription, userId: session.user.id },
      },
    }).catch(() => null)

    return NextResponse.json({ success: true, message: "Solicitud de recompensa registrada. El equipo de ClientLabs se pondrá en contacto contigo." })
  } catch (err) {
    console.error("[api/referrals/claim]", err)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
