import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const token = req.nextUrl.searchParams.get("token")

  let scanSession = await prisma.scanSession.findUnique({
    where: { id },
  })

  if (!scanSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const tokenOk = Boolean(token && scanSession.publicToken && token === scanSession.publicToken)
  const session = await getServerSession(authOptions)
  const desktopOk = Boolean(session?.user?.id && scanSession.createdByUserId === session.user.id)

  // Hardening:
  // - Mobile (auth-less) must provide a valid token.
  // - Desktop must be authenticated and be the owner, even if the token was invalidated after upload.
  if (!tokenOk && !desktopOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  let current = scanSession

  if (scanSession.status === "PENDING" && scanSession.expiresAt <= now) {
    current = await prisma.scanSession.update({
      where: { id },
      data: { status: "EXPIRED" },
    })
  }

  return NextResponse.json({
    status: current.status,
    documentName: current.documentName,
    category: current.category,
    fileUrl: current.fileUrl,
    expiresAt: current.expiresAt,
  })
}