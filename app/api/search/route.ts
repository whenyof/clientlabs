export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const QuerySchema = z.object({
  q: z.string().min(2).max(100).trim(),
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
    return NextResponse.json({ results: [], total: 0 })
  }
  const q = parsed.data.q

  const [leads, clients, invoices, providers, tasks, products] = await Promise.all([
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
      select: { id: true, name: true, email: true, phone: true },
    }),
    prisma.client.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { companyName: { contains: q, mode: "insensitive" } },
          { legalName: { contains: q, mode: "insensitive" } },
          { taxId: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, name: true, email: true, companyName: true, phone: true },
    }),
    prisma.invoice.findMany({
      where: {
        userId,
        OR: [
          { number: { contains: q, mode: "insensitive" } },
          { series: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        Client: { select: { name: true, companyName: true } },
      },
    }),
    prisma.provider.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { contactEmail: { contains: q, mode: "insensitive" } },
          { contactPhone: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: { id: true, name: true, contactEmail: true, contactPhone: true },
    }),
    prisma.task.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: { id: true, title: true, status: true, description: true },
    }),
    prisma.product.findMany({
      where: {
        userId,
        active: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: { id: true, name: true, description: true, price: true, isService: true },
    }),
  ])

  const results = [
    ...leads.map((l) => ({
      id: l.id,
      title: l.name ?? l.email ?? "Lead sin nombre",
      subtitle: l.email ?? l.phone ?? undefined,
      type: "Lead" as const,
      href: `/dashboard/leads/${l.id}`,
      icon: "user",
    })),
    ...clients.map((c) => ({
      id: c.id,
      title: c.name ?? c.companyName ?? "Cliente sin nombre",
      subtitle: c.email ?? c.phone ?? undefined,
      type: "Cliente" as const,
      href: `/dashboard/clients/${c.id}`,
      icon: "building",
    })),
    ...invoices.map((inv) => {
      const clientName = inv.Client?.name ?? inv.Client?.companyName
      return {
        id: inv.id,
        title: inv.number,
        subtitle: clientName ?? inv.status,
        type: "Factura" as const,
        href: `/dashboard/finance/facturas`,
        icon: "file",
      }
    }),
    ...providers.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.contactEmail ?? p.contactPhone ?? undefined,
      type: "Proveedor" as const,
      href: `/dashboard/providers/${p.id}`,
      icon: "truck",
    })),
    ...tasks.map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.status,
      type: "Tarea" as const,
      href: `/dashboard/tasks`,
      icon: "check",
    })),
    ...products.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.description ?? `${p.price.toFixed(2)} €`,
      type: p.isService ? ("Servicio" as const) : ("Producto" as const),
      href: `/dashboard/finance/productos`,
      icon: "package",
    })),
  ]

  return NextResponse.json({ results, total: results.length })
}
