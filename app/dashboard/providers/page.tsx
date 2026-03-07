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
            {/* Header: título + contador */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    {labels.providers.title}
                    <span className="ml-3 text-2xl font-normal text-white/50">
                        ({kpis.totalProviders})
                    </span>
                </h1>
                <p className="text-base text-white/60 max-w-2xl">
                    Control de costes, dependencias y riesgos operativos
                </p>
            </div>

            {/* Barra búsqueda + botón único y vista (KPIs + tabla) */}
            <ProvidersView
                initialProviders={providers}
                initialKPIs={kpis}
            />
        </div>
    )
}
