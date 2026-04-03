export const maxDuration = 20
import { NextRequest, NextResponse } from "next/server"
import type { UploadApiResponse } from "cloudinary"
import cloudinary from "@/lib/cloudinary"
import { prisma } from "@/lib/prisma"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function uploadRawToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "scans",
        resource_type: "raw",
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        if (!result) {
          reject(new Error("Cloudinary returned no result"))
          return
        }
        resolve(result)
      },
    )
    uploadStream.end(buffer)
  })
}

/**
 * POST /api/scan-sessions/[id]/upload-file?token=...
 * Uploads scan PDF to Cloudinary (no local filesystem — Vercel-safe).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.nextUrl.searchParams.get("token")

    console.log("[upload-file] request", {
      sessionId: id,
      hasToken: Boolean(token),
      tokenLength: token?.length ?? 0,
    })

    if (!id || !token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scanSession = await prisma.scanSession.findUnique({
      where: { id },
    })

    console.log(
      "[upload-file] session:",
      scanSession
        ? {
            id: scanSession.id,
            status: scanSession.status,
            expiresAt: scanSession.expiresAt.toISOString(),
            hasPublicToken: Boolean(scanSession.publicToken),
            tokenMatches: scanSession.publicToken === token,
          }
        : null,
    )

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

    const formData = await req.formData()
    console.log("FORM DATA RECEIVED")

    const file = formData.get("file") as File | null
    console.log(
      "file:",
      file instanceof File
        ? { name: file.name, size: file.size, type: file.type }
        : file,
    )

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadRawToCloudinary(buffer)
    const secureUrl = result.secure_url
    if (!secureUrl) {
      throw new Error("Cloudinary upload missing secure_url")
    }

    await prisma.scanSession.update({
      where: { id },
      data: { fileUrl: secureUrl },
    })

    console.log("[upload-file] success", { url: secureUrl })

    return NextResponse.json({
      success: true,
      url: secureUrl,
    })
  } catch (err) {
    console.error("UPLOAD ERROR:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === "development" && err instanceof Error && err.stack
          ? { stack: err.stack }
          : {}),
      },
      { status: 500 },
    )
  }
}
