import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

const uploadSchema = z.object({
  fileUrl: z.string().url(),
})

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = uploadSchema.safeParse(json)
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

  if (scanSession.publicToken !== token) {
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
      { error: `Cannot upload from status ${scanSession.status}` },
      { status: 400 },
    )
  }

  const updated = await prisma.scanSession.update({
    where: { id },
    data: {
      status: "UPLOADED",
      fileUrl,
    },
  })

  return NextResponse.json({ success: true, status: updated.status })
}

