export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface CompletionItem {
  label: string
  percent: number
  done: boolean
  nextStep?: string
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const [user, bp, clientCount, invoiceCount, leadCount, automationCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, firstClientAt: true, firstInvoiceAt: true, firstLeadAt: true, firstAutomationAt: true },
    }),
    prisma.businessProfile.findUnique({
      where: { userId },
      select: { taxId: true, address: true, logoUrl: true, verifactuEnabled: true },
    }),
    prisma.client.count({ where: { userId } }),
    prisma.invoice.count({ where: { userId } }),
    prisma.lead.count({ where: { userId } }),
    prisma.automatizacion.count({ where: { userId, activa: true } }),
  ])

  const items: CompletionItem[] = [
    {
      label: "Datos personales",
      percent: 10,
      done: Boolean(user?.name && user?.email),
      nextStep: "Completa tu nombre en Ajustes",
    },
    {
      label: "Datos de empresa",
      percent: 20,
      done: Boolean(bp?.taxId && bp?.address && bp?.logoUrl),
      nextStep: "Añade tu NIF, dirección y logo en Ajustes → Empresa",
    },
    {
      label: "Primer cliente",
      percent: 15,
      done: clientCount > 0,
      nextStep: "Añade tu primer cliente",
    },
    {
      label: "Primera factura",
      percent: 20,
      done: invoiceCount > 0,
      nextStep: "Genera tu primera factura",
    },
    {
      label: "Primer lead",
      percent: 15,
      done: leadCount > 0,
      nextStep: "Crea tu primer lead",
    },
    {
      label: "Primera automatización",
      percent: 10,
      done: automationCount > 0,
      nextStep: "Activa una automatización",
    },
    {
      label: "Verifactu activado",
      percent: 10,
      done: Boolean(bp?.verifactuEnabled),
      nextStep: "Activa Verifactu en Ajustes → Facturación",
    },
  ]

  const total = items.reduce((acc, i) => acc + (i.done ? i.percent : 0), 0)
  const nextIncomplete = items.find((i) => !i.done)

  return NextResponse.json({
    percent: total,
    nextStep: nextIncomplete?.nextStep ?? null,
    items: items.map(({ label, percent, done }) => ({ label, percent, done })),
  })
}
