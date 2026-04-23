export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  businessName: z.string().max(200).optional(),
  sector: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  address: z.string().max(300).optional(),
  postalCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  accentColor: z.string().max(10).optional(),
  actionType: z.enum(["lead", "client"]).nullable().optional(),
  actionName: z.string().max(200).optional(),
  actionEmail: z.string().email().max(255).optional().or(z.literal("")),
  actionPhone: z.string().max(50).optional(),
  skip: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos no válidos" }, { status: 400 })
    }

    const { businessName, sector, taxId, address, postalCode, city, province,
            actionType, actionName, actionEmail, actionPhone } = parsed.data

    const userId = session.user.id

    // Full address with province
    const fullAddress = [address, province].filter(Boolean).join(", ")

    // Update BusinessProfile (upsert)
    await prisma.businessProfile.upsert({
      where: { userId },
      create: {
        userId,
        sector: sector ?? "otro",
        companyName: businessName,
        taxId,
        address: fullAddress || undefined,
        postalCode,
        city,
      },
      update: {
        ...(sector ? { sector } : {}),
        ...(businessName ? { companyName: businessName } : {}),
        ...(taxId ? { taxId } : {}),
        ...(fullAddress ? { address: fullAddress } : {}),
        ...(postalCode ? { postalCode } : {}),
        ...(city ? { city } : {}),
      },
    })

    // Mark onboarding complete + update selected sector on User
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        ...(sector ? { selectedSector: sector } : {}),
      },
    })

    // Optional: create first lead or client
    if (actionType && actionName) {
      if (actionType === "lead") {
        await prisma.lead.create({
          data: {
            userId,
            name: actionName,
            email: actionEmail || undefined,
            phone: actionPhone || undefined,
            source: "Onboarding",
            status: "NEW",
            leadStatus: "NEW",
          },
        })
      } else if (actionType === "client") {
        await prisma.client.create({
          data: {
            userId,
            name: actionName,
            email: actionEmail || undefined,
            phone: actionPhone || undefined,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[onboarding/complete]", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
