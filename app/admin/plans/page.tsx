import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { PLANS as MKT_PLANS, formatEUR } from "@/lib/pricing"

async function getPlanStats() {
  try {
    // Autónomo = STARTER (+ FREE/TRIAL); Pro = PRO (+ legacy BUSINESS).
    const [autonomoCount, proCount, totalUsers] = await Promise.all([
      prisma.user.count({ where: { plan: { in: ["FREE", "TRIAL", "STARTER"] } } }),
      prisma.user.count({ where: { plan: { in: ["PRO", "BUSINESS"] } } }),
      prisma.user.count(),
    ])
    const counts: Record<string, number> = { STARTER: autonomoCount, PRO: proCount }
    const colors: Record<string, string> = {
      STARTER: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      PRO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    }

    return {
      plans: MKT_PLANS.map((p) => ({
        name: p.stripePlan,
        label: p.name,
        description: `${p.tagline} — ${formatEUR(p.monthlyEUR)}/mes`,
        userCount: counts[p.stripePlan] ?? 0,
        color: colors[p.stripePlan] ?? "bg-white/10 text-white border-white/20",
        features: p.features,
      })),
      totalUsers,
    }
  } catch (error) {
    console.error("Error fetching plan stats:", error)
    return {
      plans: [],
      totalUsers: 0
    }
  }
}

export default async function AdminPlansPage() {
  const { plans, totalUsers } = await getPlanStats()

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Plan Management</h1>
        <p className="text-white/60">View plan distribution and manage user subscriptions</p>
      </div>

      {/* Plan Distribution Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={plan.color}>
                  {plan.label}
                </Badge>
                <Shield className="h-5 w-5 text-white/40" />
              </div>
              <CardTitle className="text-white mt-4">{plan.label} Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-white">{plan.userCount}</p>
                <p className="text-white/60 text-sm">
                  {totalUsers > 0 ? `${Math.round((plan.userCount / totalUsers) * 100)}%` : "0%"} of total users
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm font-medium">Features:</p>
                <ul className="space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-white/60 text-xs flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/admin/users">
                <div className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm cursor-pointer transition-colors">
                  <Users className="h-4 w-4" />
                  View {plan.label} users
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Comparison */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Plan Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center py-3 px-4">
                      <Badge className={plan.color}>{plan.label}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">CRM, facturación, impuestos, tareas</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Email marketing</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Automatizaciones</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Asistente de IA</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Soporte prioritario</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white/60">Usuarios</td>
                  <td className="text-center py-3 px-4 text-white/40">1</td>
                  <td className="text-center py-3 px-4 text-white/40">5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}