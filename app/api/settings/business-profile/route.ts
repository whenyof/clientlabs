export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ALLOWED_KEYS = [
  "name",
  "logoUrl",
  "companyName",
  "legalName",
  "taxId",
  "address",
  "city",
  "postalCode",
  "country",
  "phone",
  "email",
  "website",
  "iban",
  "bic",
  "invoiceLanguage",
  "defaultNotesTemplate",
  "defaultTermsTemplate",
  "sector",
] as const

function toProfilePayload(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED_KEYS) {
    if (body[key] !== undefined) {
      data[key] = body[key] === "" ? null : body[key]
    }
  }
  return data
}

function serializeProfile(profile: {
  id: string
  userId: string
  sector: string
  name: string | null
  logoUrl: string | null
  companyName: string | null
  legalName: string | null
  taxId: string | null
  address: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  phone: string | null
  email: string | null
  website: string | null
  iban: string | null
  bic: string | null
  invoiceLanguage: string | null
  defaultNotesTemplate: string | null
  defaultTermsTemplate: string | null
}) {
  return {
    id: profile.id,
    userId: profile.userId,
    sector: profile.sector,
    name: profile.name ?? null,
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
    logoUrl: profile.logoUrl ?? null,
    iban: profile.iban ?? null,
    bic: profile.bic ?? null,
    invoiceLanguage: profile.invoiceLanguage ?? null,
    defaultNotesTemplate: profile.defaultNotesTemplate ?? null,
    defaultTermsTemplate: profile.defaultTermsTemplate ?? null,
  }
}

/**
 * GET /api/settings/business-profile
 * Load BusinessProfile for current user. Populate form from DB.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
  })

  return NextResponse.json({
    success: true,
    profile: profile ? serializeProfile(profile) : null,
  })
}

/**
 * PUT /api/settings/business-profile
 * Upsert BusinessProfile. If exists → update; else → create. Return updated object.
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const data = toProfilePayload(body)
  const updatePayload = { ...data, updatedAt: new Date() }

  let profile
  try {
    profile = await prisma.businessProfile.upsert({
      where: { userId },
      update: updatePayload as Parameters<typeof prisma.businessProfile.update>[0]["data"],
      create: {
        userId,
        sector: (data.sector as string) ?? "servicios",
        name: (data.name as string) ?? (session.user?.name as string) ?? "Empresa",
        logoUrl: (data.logoUrl as string) ?? null,
        companyName: (data.companyName as string) ?? null,
        legalName: (data.legalName as string) ?? null,
        taxId: (data.taxId as string) ?? null,
        address: (data.address as string) ?? null,
        city: (data.city as string) ?? null,
        postalCode: (data.postalCode as string) ?? null,
        country: (data.country as string) ?? null,
        phone: (data.phone as string) ?? null,
        email: (data.email as string) ?? null,
        website: (data.website as string) ?? null,
        iban: (data.iban as string) ?? null,
        bic: (data.bic as string) ?? null,
        invoiceLanguage: (data.invoiceLanguage as string) ?? null,
        defaultNotesTemplate: (data.defaultNotesTemplate as string) ?? null,
        defaultTermsTemplate: (data.defaultTermsTemplate as string) ?? null,
      },
    })
  } catch (err) {
    console.error("UPSERT ERROR:", err)
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    profile: serializeProfile(profile),
  })
}
