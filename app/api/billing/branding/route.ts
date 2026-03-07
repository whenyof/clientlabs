import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getBrandingForUser } from "@/modules/invoicing/pdf/branding"

/** GET /api/billing/branding — company info from billing profile for issue preview. */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const branding = await getBrandingForUser(session.user.id)
    return NextResponse.json({
      success: true,
      company: {
        companyName: branding.companyName,
        taxId: branding.taxId,
        address: branding.address,
        email: branding.email,
        phone: branding.phone ?? "",
        logoUrl: branding.logoUrl ?? null,
        defaultNotesTemplate: branding.defaultNotesTemplate ?? null,
        defaultTermsTemplate: branding.defaultTermsTemplate ?? null,
        invoiceLanguage: branding.invoiceLanguage ?? null,
      },
    })
  } catch (e) {
    console.error("Billing branding error:", e)
    return NextResponse.json({ error: "Failed to load company" }, { status: 500 })
  }
}
