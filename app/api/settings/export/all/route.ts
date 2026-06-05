export const maxDuration = 60
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  const userId = session.user.id

  const [
    profile, leads, clients, invoices, providers, products,
    tasks, automations, activityLogs, quotes, sales, purchaseOrders,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, plan: true, createdAt: true },
    }),
    prisma.lead.findMany({
      where: { userId },
      select: { id: true, name: true, email: true, phone: true, message: true, source: true, leadStatus: true, temperature: true, createdAt: true },
    }),
    prisma.client.findMany({
      where: { userId },
      select: { id: true, name: true, email: true, phone: true, notes: true, source: true, totalSpent: true, createdAt: true },
    }),
    prisma.invoice.findMany({
      where: { userId },
      select: { id: true, number: true, series: true, status: true, issueDate: true, dueDate: true, total: true, currency: true, createdAt: true },
    }),
    prisma.provider.findMany({
      where: { userId },
      select: { id: true, name: true, type: true, contactEmail: true, contactPhone: true, website: true, notes: true, monthlyCost: true, dependencyLevel: true },
    }),
    prisma.product.findMany({
      where: { userId, deletedAt: null },
      select: { id: true, name: true, description: true, price: true, taxRate: true, unit: true, category: true, isService: true },
    }),
    prisma.task.findMany({
      where: { userId },
      select: { id: true, title: true, status: true, priority: true, dueDate: true, completedAt: true, createdAt: true },
    }).catch(() => []),
    prisma.automation.findMany({
      where: { userId },
      select: { id: true, name: true, description: true, active: true, createdAt: true },
    }).catch(() => []),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, action: true, entity: true, entityId: true, entityLabel: true, createdAt: true },
    }).catch(() => []),
    prisma.quote.findMany({
      where: { userId },
      select: { id: true, number: true, status: true, total: true, issueDate: true, validUntil: true, createdAt: true },
    }).catch(() => []),
    prisma.sale.findMany({
      where: { userId },
      select: { id: true, clientName: true, total: true, amount: true, currency: true, createdAt: true },
    }).catch(() => []),
    prisma.purchaseOrder.findMany({
      where: { userId },
      select: { id: true, number: true, status: true, subtotal: true, taxTotal: true, issueDate: true, createdAt: true },
    }).catch(() => []),
  ])

  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  zip.file("profile.json", JSON.stringify({ exportedAt: new Date().toISOString(), ...profile }, null, 2))
  zip.file("leads.json", JSON.stringify(leads, null, 2))
  zip.file("clients.json", JSON.stringify(clients, null, 2))
  zip.file("invoices.json", JSON.stringify(invoices, null, 2))
  zip.file("providers.json", JSON.stringify(providers, null, 2))
  zip.file("products.json", JSON.stringify(products, null, 2))
  zip.file("tasks.json", JSON.stringify(tasks, null, 2))
  zip.file("automations.json", JSON.stringify(automations, null, 2))
  zip.file("activity_logs.json", JSON.stringify(activityLogs, null, 2))
  zip.file("quotes.json", JSON.stringify(quotes, null, 2))
  zip.file("sales.json", JSON.stringify(sales, null, 2))
  zip.file("purchase_orders.json", JSON.stringify(purchaseOrders, null, 2))

  const content = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="clientlabs-export-${new Date().toISOString().slice(0, 10)}.zip"`,
      "Cache-Control": "no-store",
    },
  })
}
