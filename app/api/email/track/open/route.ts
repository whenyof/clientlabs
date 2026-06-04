export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

const PIXEL_HEADERS = {
  "Content-Type": "image/gif",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const campaignId = searchParams.get("c") ?? ""
  const encodedEmail = searchParams.get("e") ?? ""

  if (campaignId && encodedEmail) {
    try {
      const recipientEmail = Buffer.from(encodedEmail, "base64").toString("utf8")

      const isNew = await prisma.emailOpen
        .create({
          data: {
            campaignId,
            recipientEmail,
            ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
            userAgent: req.headers.get("user-agent") ?? undefined,
          },
        })
        .then(() => true)
        .catch(() => false) // unique constraint → already opened

      if (isNew) {
        await prisma.emailCampaign
          .update({ where: { id: campaignId }, data: { totalAbiertos: { increment: 1 } } })
          .catch(() => {})
      }
    } catch {
      // Never fail — always return the pixel
    }
  }

  return new Response(PIXEL, { headers: PIXEL_HEADERS })
}
