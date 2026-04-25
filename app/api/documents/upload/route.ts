export const dynamic = "force-dynamic"
export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = "public/uploads/documents"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
])

/**
 * POST /api/documents/upload
 * Upload a document file (PDF or image).
 * Returns the accessible file URL.
 * Auth required.
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
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `El archivo supera el límite de 10MB` },
        { status: 413 }
      )
    }

    // Validate MIME type
    const mimeType = file.type.toLowerCase()
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}. Solo PDF e imágenes.` },
        { status: 415 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase() || (mimeType === "application/pdf" ? ".pdf" : ".jpg")
    const safeName = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`

    const uploadDir = path.join(process.cwd(), UPLOAD_DIR)
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/documents/${safeName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: safeName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("[POST /api/documents/upload]:", error)
    return NextResponse.json(
      { error: "Error al subir el documento" },
      { status: 500 }
    )
  }
}
