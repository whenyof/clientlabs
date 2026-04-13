export const maxDuration = 25

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { UploadApiResponse } from "cloudinary"
import cloudinary from "@/lib/cloudinary"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function uploadToCloudinary(buffer: Buffer, filename: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "gastos",
        resource_type: "auto",
        public_id: `${Date.now()}-${filename.replace(/[^a-z0-9]/gi, "_")}`,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error("No result from Cloudinary"))
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se recibio archivo" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Archivo demasiado grande (max 10MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const result = await uploadToCloudinary(buffer, file.name)

    return NextResponse.json({ url: result.secure_url, name: file.name })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error"
    console.error("Gastos upload error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
