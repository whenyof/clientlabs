import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

const UPLOAD_DIR = "public/uploads/business"
const MAX_SIZE = 2 * 1024 * 1024 // 2MB for logo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

/**
 * POST /api/settings/upload
 * Upload company logo; save file to storage and persist logoUrl in BusinessProfile.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid type (use JPEG, PNG, GIF, WebP)" }, { status: 400 })
    }

    const ext = path.extname(file.name) || ".png"
    const safeName = `logo-${Date.now()}${ext}`
    const dir = path.join(process.cwd(), UPLOAD_DIR)
    await mkdir(dir, { recursive: true })
    const filePath = path.join(dir, safeName)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/business/${safeName}`

    await prisma.businessProfile.upsert({
      where: { userId: session.user.id },
      update: { logoUrl: url, updatedAt: new Date() },
      create: {
        userId: session.user.id,
        sector: "servicios",
        name: session.user.name ?? "Empresa",
        logoUrl: url,
      },
    })

    console.log("LOGO SAVED:", url)
    return NextResponse.json({ url, name: file.name })
  } catch (err) {
    console.error("Settings upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
