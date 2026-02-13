import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/settings/business — load BusinessProfile for current user.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({
      success: true,
      profile: null,
    })
  }

  return NextResponse.json({
    success: true,
    profile: {
      id: profile.id,
      userId: profile.userId,
      sector: profile.sector,
      name: profile.name,
      logoUrl: profile.logoUrl ?? null,
      companyName: profile.companyName ?? null,
      legalName: profile.legalName ?? null,
      taxId: profile.taxId ?? null,
      address: profile.address ?? null,
      city: profile.city ?? null,
      postalCode: profile.postalCode ?? null,
      country: profile.country ?? null,
      phone: profile.phone ?? null,
      email: profile.email ?? null,
      website: profile.website ?? null,
      iban: profile.iban ?? null,
      bic: profile.bic ?? null,
      invoiceLanguage: profile.invoiceLanguage ?? null,
      defaultNotesTemplate: profile.defaultNotesTemplate ?? null,
      defaultTermsTemplate: profile.defaultTermsTemplate ?? null,
    },
  })
}

/**
 * PATCH /api/settings/business — update BusinessProfile.
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  const allowed = [
    "name", "logoUrl", "companyName", "legalName", "taxId", "address",
    "city", "postalCode", "country", "phone", "email", "website",
    "iban", "bic", "invoiceLanguage", "defaultNotesTemplate", "defaultTermsTemplate", "sector",
  ]
  for (const key of allowed) {
    if (body[key] !== undefined) {
      data[key] = body[key] === "" ? null : body[key]
    }
  }

  const updatePayload: Record<string, unknown> = { ...data, updatedAt: new Date() }

  await prisma.businessProfile.upsert({
    where: { userId: session.user.id },
    update: updatePayload as Parameters<typeof prisma.businessProfile.update>[0]["data"],
    create: {
      userId: session.user.id,
      sector: (data.sector as string) ?? "servicios",
      name: (data.name as string) ?? session.user.name ?? "Empresa",
      logoUrl: data.logoUrl as string | undefined,
      companyName: data.companyName as string | undefined,
      legalName: data.legalName as string | undefined,
      taxId: data.taxId as string | undefined,
      address: data.address as string | undefined,
      city: data.city as string | undefined,
      postalCode: data.postalCode as string | undefined,
      country: data.country as string | undefined,
      phone: data.phone as string | undefined,
      email: data.email as string | undefined,
      website: data.website as string | undefined,
      iban: data.iban as string | undefined,
      bic: data.bic as string | undefined,
      invoiceLanguage: data.invoiceLanguage as string | undefined,
      defaultNotesTemplate: data.defaultNotesTemplate as string | undefined,
      defaultTermsTemplate: data.defaultTermsTemplate as string | undefined,
    },
  })

  console.log("BUSINESS PROFILE UPDATED")
  return NextResponse.json({ success: true })
}
