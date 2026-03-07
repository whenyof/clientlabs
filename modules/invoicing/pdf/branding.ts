/**
 * Invoice PDF branding — single source of truth from BusinessProfile (Settings).
 * Fallback: User, env, defaults.
 */

import { prisma } from "@/lib/prisma"

export type InvoiceBranding = {
  logoUrl: string | null
  companyName: string
  taxId: string
  address: string
  email: string
  phone: string
  primaryColor: string
  legalFooter: string
  paymentConditions: string
  iban?: string | null
  bic?: string | null
  website?: string | null
  invoiceLanguage?: string | null
  defaultNotesTemplate?: string | null
  defaultTermsTemplate?: string | null
}

const DEFAULT_BRANDING: InvoiceBranding = {
  logoUrl: null,
  companyName: process.env.INVOICE_COMPANY_NAME ?? "Mi Empresa",
  taxId: process.env.INVOICE_TAX_ID ?? "B12345678",
  address: process.env.INVOICE_ADDRESS ?? "Calle Ejemplo 1, 28001 Madrid",
  email: process.env.INVOICE_EMAIL ?? "facturacion@empresa.com",
  phone: process.env.INVOICE_PHONE ?? "",
  primaryColor: process.env.INVOICE_PRIMARY_COLOR ?? "#1e3a5f",
  legalFooter:
    process.env.INVOICE_LEGAL_FOOTER ??
    "Factura exenta de IVA según art. 20 de la Ley 37/1992. Emitida con carácter de documento sustitutivo de factura.",
  paymentConditions:
    process.env.INVOICE_PAYMENT_CONDITIONS ?? "Pago a 30 días desde fecha de emisión. Transferencia bancaria.",
}

/**
 * Returns branding for invoice PDF/preview/emails from BusinessProfile (Settings).
 * Single source of truth; fallback to User and env when profile fields are empty.
 */
export async function getBrandingForUser(userId: string): Promise<InvoiceBranding> {
  try {
    const profile = await prisma.businessProfile.findUnique({
      where: { userId },
    })
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true },
    })

    if (profile) {
      const addressLine =
        [profile.address, profile.postalCode, profile.city, profile.country].filter(Boolean).join(", ") ||
        DEFAULT_BRANDING.address
      console.log("PROFILE USED:", profile.companyName ?? profile.name)
      return {
        ...DEFAULT_BRANDING,
        logoUrl: profile.logoUrl ?? user?.image ?? null,
        companyName: profile.companyName ?? profile.name ?? user?.name ?? DEFAULT_BRANDING.companyName,
        taxId: profile.taxId ?? DEFAULT_BRANDING.taxId,
        address: addressLine,
        email: profile.email ?? user?.email ?? DEFAULT_BRANDING.email,
        phone: profile.phone ?? DEFAULT_BRANDING.phone,
        iban: profile.iban ?? null,
        bic: profile.bic ?? null,
        website: profile.website ?? null,
        invoiceLanguage: profile.invoiceLanguage ?? null,
        defaultNotesTemplate: profile.defaultNotesTemplate ?? null,
        defaultTermsTemplate: profile.defaultTermsTemplate ?? null,
      }
    }

    return {
      ...DEFAULT_BRANDING,
      companyName: user?.name ?? DEFAULT_BRANDING.companyName,
      email: user?.email ?? DEFAULT_BRANDING.email,
      logoUrl: user?.image ?? null,
    }
  } catch {
    return DEFAULT_BRANDING
  }
}
