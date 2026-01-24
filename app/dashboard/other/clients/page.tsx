import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ClientsTable } from "./components/ClientsTable"

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth")
  }

  /* ---------------- DATA ---------------- */
  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    include: {
      convertedFromLead: {
        select: {
          id: true,
          name: true,
          convertedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  // KPIs
  const kpis = {
    total: clients.length,
    active: clients.filter((c) => c.status === "ACTIVE").length,
    inactive: clients.filter((c) => c.status === "INACTIVE").length,
    totalValue: clients.reduce((sum, c) => sum + (c.estimatedValue || 0), 0),
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clientes</h1>
          <p className="text-sm text-white/60">
            Gestiona tus clientes convertidos desde leads
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
          <p className="text-sm text-white/60">Total</p>
          <p className="text-2xl font-semibold text-white">{kpis.total}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
          <p className="text-sm text-white/60">Activos</p>
          <p className="text-2xl font-semibold text-green-400">{kpis.active}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
          <p className="text-sm text-white/60">Inactivos</p>
          <p className="text-2xl font-semibold text-red-400">{kpis.inactive}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
          <p className="text-sm text-white/60">Valor Total</p>
          <p className="text-2xl font-semibold text-white">
            ${kpis.totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}