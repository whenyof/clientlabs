import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
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

  if (token) {
    if (scanSession.publicToken !== token) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (scanSession.createdByUserId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
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