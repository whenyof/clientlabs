import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

const completeSchema = z.object({
  fileUrl: z.string().url(),
})

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const json = await req.json().catch(() => null)
  const parsed = completeSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { fileUrl } = parsed.data

  const uploadBase = process.env.UPLOAD_BASE_URL
  if (uploadBase && !fileUrl.startsWith(uploadBase)) {
    return NextResponse.json({ error: "Invalid file URL domain" }, { status: 400 })
  }

  const scanSession = await prisma.scanSession.findUnique({
    where: { id },
  })

  if (!scanSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (scanSession.createdByUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date()
  if (scanSession.expiresAt <= now) {
    await prisma.scanSession.update({
      where: { id },
      data: { status: "EXPIRED" },
    })
    return NextResponse.json({ error: "Session expired" }, { status: 400 })
  }

  if (scanSession.status !== "PENDING") {
    return NextResponse.json(
      { error: `Cannot complete session from status ${scanSession.status}` },
      { status: 400 },
    )
  }

  if (scanSession.fileUrl) {
    return NextResponse.json({ error: "Session already has a fileUrl" }, { status: 400 })
  }

  const updated = await prisma.scanSession.update({
    where: { id },
    data: {
      status: "COMPLETED",
      fileUrl,
    },
  })

  return NextResponse.json({ success: true, status: updated.status })
}