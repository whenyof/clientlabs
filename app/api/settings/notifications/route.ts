export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"

const channelSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
})

const notificationsSchema = z.object({
  notifications: z.record(z.string(), channelSchema).optional(),
  marketingEmails: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPrefs: true },
    })
  )

  return NextResponse.json({ success: true, prefs: user?.notificationPrefs ?? null })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = notificationsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const user = await safePrismaQuery(() =>
    prisma.user.update({
      where: { id: session.user.id },
      data: { notificationPrefs: parsed.data as object },
      select: { notificationPrefs: true },
    })
  )

  return NextResponse.json({ success: true, prefs: user.notificationPrefs })
}
