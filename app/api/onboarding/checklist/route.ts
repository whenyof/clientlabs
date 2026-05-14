export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const [clientCount, leadCount, invoiceCount, automationCount, businessProfile, user] =
    await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.lead.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.automatizacion.count({ where: { userId, activa: true } }),
      prisma.businessProfile.findUnique({
        where: { userId },
        select: { taxId: true, address: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          onboardingCompleted: true,
          firstClientAt: true,
          firstLeadAt: true,
          firstInvoiceAt: true,
          firstAutomationAt: true,
          taxConfiguredAt: true,
        },
      }),
    ])

  const addedClient   = clientCount > 0
  const addedLead     = leadCount > 0
  const createdInvoice = invoiceCount > 0
  const configuredTax  = Boolean(businessProfile?.taxId && businessProfile?.address)
  const createdAutomation = automationCount > 0

  const updates: Record<string, Date> = {}
  if (addedClient && !user?.firstClientAt)     updates.firstClientAt     = new Date()
  if (addedLead && !user?.firstLeadAt)         updates.firstLeadAt       = new Date()
  if (createdInvoice && !user?.firstInvoiceAt) updates.firstInvoiceAt    = new Date()
  if (createdAutomation && !user?.firstAutomationAt) updates.firstAutomationAt = new Date()
  if (configuredTax && !user?.taxConfiguredAt)  updates.taxConfiguredAt  = new Date()

  const allDone = addedClient && addedLead && createdInvoice && configuredTax && createdAutomation
  if (allDone && !user?.onboardingCompleted) {
    updates.onboardingCompleted = new Date() as unknown as Date
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        ...(allDone ? { onboardingCompleted: true } : {}),
      },
    })
  }

  return NextResponse.json({
    checklist: { addedClient, addedLead, createdInvoice, configuredTax, createdAutomation },
    onboardingCompleted: allDone || Boolean(user?.onboardingCompleted),
  })
}
