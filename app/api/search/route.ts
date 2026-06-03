export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const QuerySchema = z.object({
  q: z.string().min(1).max(100).trim(),
})

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const parsed = QuerySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
  })
  if (!parsed.success) {
    return NextResponse.json({ results: [] })
  }
  const q = parsed.data.q

  const [leads, clients, invoices, providers] = await Promise.all([
    prisma.lead.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, name: true, email: true },
    }),
    prisma.client.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { companyName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, name: true, email: true, companyName: true },
    }),
    prisma.invoice.findMany({
      where: {
        userId,
        number: { contains: q, mode: "insensitive" },
      },
      take: 3,
      select: { id: true, number: true, status: true },
    }),
    prisma.provider.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { contactEmail: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: { id: true, name: true, contactEmail: true },
    }),
  ])

  const results = [
    ...leads.map((l) => ({
      title: l.name ?? l.email ?? "Lead sin nombre",
      subtitle: l.email ?? undefined,
      type: "Lead" as const,
      href: `/dashboard/leads`,
    })),
    ...clients.map((c) => ({
      title: c.name ?? c.companyName ?? "Cliente sin nombre",
      subtitle: c.email ?? undefined,
      type: "Cliente" as const,
      href: `/dashboard/clients`,
    })),
    ...invoices.map((inv) => ({
      title: inv.number,
      subtitle: inv.status,
      type: "Factura" as const,
      href: `/dashboard/finance/facturas`,
    })),
    ...providers.map((p) => ({
      title: p.name,
      subtitle: p.contactEmail ?? undefined,
      type: "Proveedor" as const,
      href: `/dashboard/providers`,
    })),
  ]

  return NextResponse.json({ results })
}
