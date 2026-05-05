export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, name: true },
    })

    if (!user?.referralCode) {
      const firstName = user?.name?.split(" ")[0]?.toUpperCase().slice(0, 8) ?? "REF"
      const code = `CL-${firstName}-${nanoid()}`
      await prisma.user.update({ where: { id: session.user.id }, data: { referralCode: code } })
      return NextResponse.json({ referralCode: code, referralLink: `https://clientlabs.io/r/${code}` })
    }

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `https://clientlabs.io/r/${user.referralCode}`,
    })
  } catch (err) {
    console.error("[api/referrals/link]", err)
    return NextResponse.json({ error: "Error al generar enlace" }, { status: 500 })
  }
}
