export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const uploadSchema = z.object({
  fileUrl: z.string().url(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const scanSession = await prisma.scanSession.findUnique({
    where: { id },
  })

  if (!scanSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // If the request comes from an authenticated session, verify ownership.
  // Auth-less mobile uploads (via publicToken) skip this check.
  const session = await getServerSession(authOptions)
  if (session?.user?.id && scanSession.createdByUserId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // 1) Idempotencia: si ya fue procesada como UPLOADED, tratar como éxito.
  if (scanSession.status === "UPLOADED") {
    return NextResponse.json({
      success: true,
      status: "UPLOADED",
      alreadyProcessed: true,
    })
  }

  // 2) Si ya está completada, bloquear.
  if (scanSession.status === "COMPLETED") {
    return NextResponse.json({ error: "Already completed" }, { status: 400 })
  }

  // 3) Expiración.
  if (scanSession.expiresAt <= new Date()) {
    await prisma.scanSession.update({
      where: { id },
      data: { status: "EXPIRED" },
    })
    return NextResponse.json({ error: "Session expired" }, { status: 400 })
  }

  // Para cualquier otro estado no permitido, bloquear.
  if (scanSession.status !== "PENDING") {
    return NextResponse.json(
      { error: `Cannot upload from status ${scanSession.status}` },
      { status: 400 }
    )
  }

  // 4) Token obligatorio solo cuando sigue PENDING.
  const token = req.nextUrl.searchParams.get("token")
  if (!token || scanSession.publicToken !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = uploadSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { fileUrl } = parsed.data

  const uploadBase = process.env.UPLOAD_BASE_URL
  const isCloudinaryUrl = fileUrl.startsWith("https://res.cloudinary.com/")
  if (uploadBase && !fileUrl.startsWith(uploadBase) && !isCloudinaryUrl) {
    return NextResponse.json(
      { error: "Invalid file URL domain" },
      { status: 400 }
    )
  }

  const updated = await prisma.scanSession.update({
    where: { id },
    data: {
      status: "UPLOADED",
      fileUrl,
      publicToken: null, // 🔥 invalidación correcta
    },
  })

  return NextResponse.json({
    success: true,
    status: updated.status,
  })
}