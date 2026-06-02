export const maxDuration = 60
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  const userId = session.user.id

  const [profile, leads, clients, invoices, providers, products] = await Promise.all([
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
  ])

  const JSZip = (await import("jszip")).default
  const zip = new JSZip()

  zip.file("profile.json", JSON.stringify({ exportedAt: new Date().toISOString(), ...profile }, null, 2))
  zip.file("leads.json", JSON.stringify(leads, null, 2))
  zip.file("clients.json", JSON.stringify(clients, null, 2))
  zip.file("invoices.json", JSON.stringify(invoices, null, 2))
  zip.file("providers.json", JSON.stringify(providers, null, 2))
  zip.file("products.json", JSON.stringify(products, null, 2))

  const content = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })

  return new NextResponse(new Uint8Array(content), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="clientlabs-export-${new Date().toISOString().slice(0, 10)}.zip"`,
      "Cache-Control": "no-store",
    },
  })
}
