export const maxDuration = 10

/**
 * GET /api/files/[...path]
 *
 * Serves files from the /uploads directory (outside /public) with authentication.
 * Replaces direct access to /public/uploads/ which was publicly accessible.
 *
 * Usage: /api/files/invoices/file.pdf → serves uploads/invoices/file.pdf
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { readFile } from "fs/promises"
import path from "path"

const UPLOADS_ROOT = path.join(process.cwd(), "uploads")

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { path: segments } = await params
  if (!segments || segments.length === 0) {
    return new NextResponse("Not found", { status: 404 })
  }

  // Build absolute path and prevent path traversal
  const requestedPath = path.join(UPLOADS_ROOT, ...segments)
  if (!requestedPath.startsWith(UPLOADS_ROOT + path.sep) && requestedPath !== UPLOADS_ROOT) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Determine MIME type from extension
  const ext = path.extname(requestedPath).toLowerCase()
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream"

  try {
    const file = await readFile(requestedPath)
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
