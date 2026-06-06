export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { DocumentViewType } from "@prisma/client"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const documentId = searchParams.get("documentId")
  const type = searchParams.get("type")

  if (!documentId || !type) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  const view = await prisma.documentView.findFirst({
    where: {
      documentId,
      type: type as DocumentViewType,
      userId: session.user.id
    },
    select: {
      id: true, token: true, type: true, status: true,
      sentAt: true, emailOpenedAt: true, docOpenedAt: true,
      viewCount: true, downloadedAt: true, decidedAt: true,
      signatureName: true, rejectionReason: true,
      reminderCount: true, lastReminderAt: true, expiresAt: true,
      recipientEmail: true, recipientName: true
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json({ view })
}
