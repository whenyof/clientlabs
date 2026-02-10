import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = "public/uploads/providers"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/providers/upload
 * Subida real de archivo para proveedores.
 * Guarda en public/uploads/providers y devuelve la URL para registrar en BD.
 * En producción (ej. Vercel) considerar Vercel Blob o S3.
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
            return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
        }

        const ext = path.extname(file.name) || ""
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
        const dir = path.join(process.cwd(), UPLOAD_DIR)
        await mkdir(dir, { recursive: true })
        const filePath = path.join(dir, safeName)
        const bytes = await file.arrayBuffer()
        await writeFile(filePath, Buffer.from(bytes))

        const url = `/uploads/providers/${safeName}`
        return NextResponse.json({ url, name: file.name })
    } catch (err) {
        console.error("Provider upload error:", err)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
