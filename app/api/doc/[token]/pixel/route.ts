export const maxDuration = 10

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  // Registrar primera apertura del email (emailOpenedAt) siempre que sea null
  prisma.documentView.updateMany({
    where: { token, emailOpenedAt: null },
    data: { emailOpenedAt: new Date() },
  }).catch(() => {})

  // Avanzar status solo si está en SENT — nunca regresar DOC_OPENED u otros
  prisma.documentView.updateMany({
    where: { token, status: "SENT" },
    data: { status: "EMAIL_OPENED" },
  }).catch(() => {})

  const gif = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  )

  return new Response(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    }
  })
}
