export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

type Params = Promise<{ id: string }>

// Rejects after ms — ensures Prisma cold-start hangs don't block the response
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout — inténtalo de nuevo")), ms)
    ),
  ])
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id: clientId } = await params
    const body = await req.json()
    const { email, phone, company, country, additionalInfo, isVip, status, taxId, legalName, address, postalCode, city } = body

    const data: Record<string, string | null | boolean> = {}
    if (email !== undefined) data.email = email || null
    if (phone !== undefined) data.phone = phone || null
    if (company !== undefined) data.companyName = company || null
    if (country !== undefined) data.country = country || null
    if (additionalInfo !== undefined) data.additionalInfo = additionalInfo?.trim() || null
    if (typeof isVip === "boolean") data.isVip = isVip
    if (typeof status === "string") data.status = status
    if (taxId !== undefined) data.taxId = taxId || null
    if (legalName !== undefined) data.legalName = legalName || null
    if (address !== undefined) data.address = address || null
    if (postalCode !== undefined) data.postalCode = postalCode || null
    if (city !== undefined) data.city = city || null

    // Recompute isFiscalComplete when any fiscal field changes
    const fiscalChanged = taxId !== undefined || legalName !== undefined || company !== undefined
    if (fiscalChanged) {
      const current = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
        select: { taxId: true, legalName: true, companyName: true },
      })
      const effectiveTaxId = taxId !== undefined ? (taxId || null) : current?.taxId
      const effectiveLegalName = legalName !== undefined ? (legalName || null) : current?.legalName
      const effectiveCompanyName = company !== undefined ? (company || null) : current?.companyName
      data.isFiscalComplete = !!(effectiveTaxId && (effectiveLegalName || effectiveCompanyName))
    }

    // Single query — ownership validated via where clause (throws P2025 if not found/owned)
    const updated = await withTimeout(
      prisma.client.update({
        where: { id: clientId, userId: session.user.id },
        data: { ...data, updatedAt: new Date() },
        select: { id: true, name: true, email: true, phone: true, companyName: true, country: true, updatedAt: true, isVip: true, status: true, taxId: true, legalName: true, address: true, postalCode: true, city: true, isFiscalComplete: true },
      }),
      8000
    )

    revalidatePath(`/dashboard/clients/${clientId}`)

    return NextResponse.json(updated)
  } catch (err: any) {
    const isNotFound = err?.code === "P2025"
    console.error("Error PATCH /api/clients/[id]:", err)
    return NextResponse.json(
      { error: isNotFound ? "Cliente no encontrado" : (err.message || "Error interno") },
      { status: isNotFound ? 404 : 500 }
    )
  }
}
