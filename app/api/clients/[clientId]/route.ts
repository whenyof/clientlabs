import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type Params = Promise<{ clientId: string }>

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { clientId } = await params
  const body = await req.json()
  const { email, phone, company, country } = body

  const client = await prisma.client.findUnique({
    where: { id: clientId, userId: session.user.id },
  })
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const data: Record<string, string | null> = {}
  if (email !== undefined) data.email = email || null
  if (phone !== undefined) data.phone = phone || null
  if (company !== undefined) data.companyName = company || null
  if (country !== undefined) data.country = country || null

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: { ...data, updatedAt: new Date() },
  })

  revalidatePath(`/dashboard/clients/${clientId}`)

  return NextResponse.json(updated)
}
