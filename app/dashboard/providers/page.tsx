import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProvidersView } from "@/modules/providers/components/ProvidersView"
import { getSectorConfigByPath } from "@/config/sectors"

async function getProviders(userId: string) {
    const providers = await prisma.provider.findMany({
        where: { userId },
        include: {
            payments: {
                orderBy: { paymentDate: 'desc' },
                take: 1
            },
            tasks: {
                where: { status: 'PENDING' }
            },
            _count: {
                select: {
                    payments: true,
                    tasks: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
    })

    return providers
}

function calculateKPIs(providers: any[]) {
    const totalMonthlyCost = providers.reduce((sum, p) => sum + (p.monthlyCost || 0), 0)
    const activeProviders = providers.filter(p => p.status === 'OK' || p.status === 'ACTIVE').length
    const providersWithIssues = providers.filter(p => p.status === 'ISSUE' || p.operationalState === 'RISK').length
    const criticalProviders = providers.filter(p =>
        (p.dependencyLevel === 'HIGH' || p.dependencyLevel === 'CRITICAL' || p.isCritical) &&
        (p.status === 'PENDING' || p.status === 'ISSUE' || p.operationalState === 'ATTENTION' || p.operationalState === 'RISK')
    ).length

    return {
        totalMonthlyCost,
        totalAnnualCost: totalMonthlyCost * 12,
        activeProviders,
        providersWithIssues,
        criticalProviders,
        totalProviders: providers.length
    }
}

export default async function ProvidersPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect("/auth/signin")
    }

    // En server components usamos helper directo
    const config = getSectorConfigByPath('/dashboard/providers')
    const { labels } = config

    const providers = await getProviders(session.user.id)
    const kpis = calculateKPIs(providers)

    return (
        <div className="space-y-6">
            {/* 1. Page identity */}
            <header className="pb-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                            {labels.providers.title}
                        </h1>
                        <p className="mt-1 text-base text-[var(--text-secondary)] max-w-xl">
                            Control de costes, dependencias y riesgos operativos
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white border border-neutral-200/80 px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] tabular-nums shadow-sm">
                            {kpis.totalProviders} {kpis.totalProviders === 1 ? labels.providers.singular.toLowerCase() : labels.providers.plural.toLowerCase()}
                        </span>
                    </div>
                </div>
            </header>

            <ProvidersView
                initialProviders={providers}
                initialKPIs={kpis}
            />
        </div>
    )
}
