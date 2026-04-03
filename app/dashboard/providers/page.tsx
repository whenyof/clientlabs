import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProvidersView } from "@/modules/providers/components/ProvidersView"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getProviders(userId: string) {
  return prisma.provider.findMany({
    where: { userId },
    include: {
      payments: { orderBy: { paymentDate: "desc" }, take: 1 },
      tasks: { where: { status: "PENDING" } },
      _count: { select: { payments: true, tasks: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
}

function calculateKPIs(providers: any[]) {
  const totalMonthlyCost = providers.reduce((s, p) => s + (p.monthlyCost || 0), 0)
  const activeProviders = providers.filter(p => p.status === "OK" || p.status === "ACTIVE").length
  const providersWithIssues = providers.filter(p => p.status === "ISSUE" || p.operationalState === "RISK").length
  const criticalProviders = providers.filter(
    p =>
      (p.dependencyLevel === "HIGH" || p.dependencyLevel === "CRITICAL" || p.isCritical) &&
      (p.status === "PENDING" || p.status === "ISSUE" || p.operationalState === "ATTENTION" || p.operationalState === "RISK")
  ).length
  return {
    totalMonthlyCost,
    totalAnnualCost: totalMonthlyCost * 12,
    activeProviders,
    providersWithIssues,
    criticalProviders,
    totalProviders: providers.length,
  }
}

export default async function ProvidersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const providers = await getProviders(session.user.id)
  const kpis = calculateKPIs(providers)

  return (
    <div className="space-y-4">
      <div className="pb-2">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Proveedores</h1>
        <p className="mt-0.5 text-[14px] text-[var(--text-secondary)]">Control de costes, dependencias y riesgos operativos</p>
      </div>
      <ProvidersView initialProviders={providers} initialKPIs={kpis} />
    </div>
  )
}
