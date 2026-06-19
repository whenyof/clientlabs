/**
 * Invoice PDF branding — single source of truth: BusinessProfile (Settings).
 * Identidad fiscal (companyName/taxId/address): SOLO del perfil del usuario
 * (sin env). Campos no fiscales (email/phone/color/footer/condiciones): perfil
 * → env → default.
 */

import { prisma } from "@/lib/prisma"

export type InvoiceBranding = {
  logoUrl: string | null
  companyName: string
  legalName?: string | null
  taxId: string
  address: string
  province?: string | null
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

// Identidad fiscal (nombre/NIF/dirección): SIEMPRE del perfil del usuario,
// NUNCA de una env global — un valor global acabaría impreso como emisor en las
// facturas de cualquier usuario. Vacío = la emisión se bloquea (validador legal)
// hasta que el usuario complete sus datos fiscales en Ajustes.
const DEFAULT_BRANDING: InvoiceBranding = {
  logoUrl: null,
  companyName: "",
  taxId: "",
  address: "",
  email: process.env.INVOICE_EMAIL ?? "",
  phone: process.env.INVOICE_PHONE ?? "",
  primaryColor: process.env.INVOICE_PRIMARY_COLOR ?? "#1e3a5f",
  // Default neutro: nunca afirmar exención de IVA por defecto (sería falso en
  // facturas con IVA). El usuario define su nota legal en Ajustes.
  legalFooter: process.env.INVOICE_LEGAL_FOOTER ?? "",
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
        [profile.address, profile.postalCode, profile.city, profile.province, profile.country].filter(Boolean).join(", ") ||
        DEFAULT_BRANDING.address
      return {
        ...DEFAULT_BRANDING,
        logoUrl: profile.logoUrl ?? user?.image ?? null,
        companyName: profile.companyName ?? profile.name ?? user?.name ?? DEFAULT_BRANDING.companyName,
        // Nombre fiscal (emisor legal): legalName con fallback seguro a companyName → name
        // || (no ??) para que un "" también caiga al siguiente y el emisor nunca quede vacío
        legalName: profile.legalName || profile.companyName || profile.name || user?.name || null,
        taxId: profile.taxId ?? DEFAULT_BRANDING.taxId,
        address: addressLine,
        province: profile.province ?? null,
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
      legalName: user?.name || null,
      email: user?.email ?? DEFAULT_BRANDING.email,
      logoUrl: user?.image ?? null,
    }
  } catch {
    return DEFAULT_BRANDING
  }
}
