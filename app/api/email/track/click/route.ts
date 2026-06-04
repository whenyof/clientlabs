export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const campaignId = searchParams.get("c") ?? ""
  const encodedEmail = searchParams.get("e") ?? ""
  const encodedUrl = searchParams.get("u") ?? ""

  let destination = "/"

  try {
    destination = decodeURIComponent(encodedUrl) || "/"
    const recipientEmail = Buffer.from(encodedEmail, "base64").toString("utf8")

    if (campaignId && recipientEmail) {
      await prisma.emailClick.create({
        data: {
          campaignId,
          recipientEmail,
          url: destination,
          ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
        },
      })

      await prisma.emailCampaign
        .update({ where: { id: campaignId }, data: { totalClicks: { increment: 1 } } })
        .catch(() => {})
    }
  } catch {
    // Always redirect even on error
  }

  return Response.redirect(destination, 302)
}
