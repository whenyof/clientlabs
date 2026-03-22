import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

const UPLOAD_DIR = "public/uploads/providers"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

/** Public absolute URL for stored file (required by scan-sessions upload zod .url()) */
function filePublicUrl(req: NextRequest, pathname: string): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  let proto = req.headers.get("x-forwarded-proto")
  if (!proto) {
    proto = host?.includes("localhost") ? "http" : "https"
  }
  if (host) {
    return `${proto}://${host}${pathname}`
  }
  const base = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL
  if (base) {
    const normalized = base.startsWith("http") ? base : `https://${base}`
    return `${normalized.replace(/\/$/, "")}${pathname}`
  }
  return pathname
}

/**
 * POST /api/scan-sessions/[id]/upload-file?token=...
 * Same storage as /api/providers/upload but authenticates via scan publicToken
 * (mobile QR flow has no NextAuth cookie).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get("token")

  if (!id || !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const scanSession = await prisma.scanSession.findUnique({
    where: { id },
  })

  if (!scanSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (scanSession.status === "UPLOADED" || scanSession.status === "COMPLETED") {
    return NextResponse.json({ error: "Already uploaded" }, { status: 400 })
  }

  if (scanSession.expiresAt <= new Date()) {
    await prisma.scanSession.update({
      where: { id },
      data: { status: "EXPIRED" },
    })
    return NextResponse.json({ error: "Session expired" }, { status: 400 })
  }

  if (scanSession.status !== "PENDING") {
    return NextResponse.json({ error: "Cannot upload from this status" }, { status: 400 })
  }

  if (!scanSession.publicToken || scanSession.publicToken !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const ext = path.extname(file.name) || ""
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    const dir = path.join(process.cwd(), UPLOAD_DIR)
    await mkdir(dir, { recursive: true })
    const filePath = path.join(dir, safeName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const pathname = `/uploads/providers/${safeName}`
    const url = filePublicUrl(req, pathname)

    return NextResponse.json({ url, name: file.name })
  } catch (err) {
    console.error("Scan session file upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
