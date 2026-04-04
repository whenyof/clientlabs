export const maxDuration = 10
import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  try {
    const zipPath = join(
      process.cwd(),
      "public",
      "downloads",
      "clientlabs-lead-capture.zip"
    )
    const file = readFileSync(zipPath)

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="clientlabs-lead-capture.zip"',
        "Content-Length": file.length.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Plugin no disponible" },
      { status: 404 }
    )
  }
}
