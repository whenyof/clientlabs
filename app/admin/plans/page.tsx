import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

async function getPlanStats() {
  try {
    const [starterCount, proCount, businessCount, totalUsers] = await Promise.all([
      prisma.user.count({ where: { plan: { in: ["FREE", "TRIAL", "STARTER"] } } }),
      prisma.user.count({ where: { plan: "PRO" } }),
      prisma.user.count({ where: { plan: "BUSINESS" } }),
      prisma.user.count(),
    ])

    return {
      plans: [
        {
          name: "STARTER",
          label: "Starter",
          description: "Para autónomos que empiezan — 12,99€/mes",
          userCount: starterCount,
          color: "bg-sky-500/20 text-sky-400 border-sky-500/30",
          features: [
            "Facturas ilimitadas",
            "Verifactu incluido",
            "CRM hasta 200 leads",
            "1 usuario",
            "Soporte por email",
          ]
        },
        {
          name: "PRO",
          label: "Pro",
          description: "Para pymes — 24,99€/mes",
          userCount: proCount,
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          features: [
            "Todo lo de Starter",
            "Leads y clientes ilimitados",
            "Hasta 5 usuarios",
            "Automatizaciones (10 reglas)",
            "Email marketing (1.000/mes)",
          ]
        },
        {
          name: "BUSINESS",
          label: "Business",
          description: "Para empresas en crecimiento — 39,99€/mes",
          userCount: businessCount,
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          features: [
            "Todo lo de Pro",
            "Usuarios ilimitados",
            "Automatizaciones ilimitadas",
            "Email marketing ilimitado",
            "API completa",
          ]
        }
      ],
      totalUsers
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
      <div className="grid gap-4 md:grid-cols-3">
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
                  <td className="py-3 px-4 text-white/60">Dashboard Access</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Lead Tracking</td>
                  <td className="text-center py-3 px-4 text-white/40">Limited</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">AI Insights</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Priority Support</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white/60">Custom Integrations</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-red-400">✗</td>
                  <td className="text-center py-3 px-4 text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white/60">User Seats</td>
                  <td className="text-center py-3 px-4 text-white/40">1</td>
                  <td className="text-center py-3 px-4 text-white/40">5</td>
                  <td className="text-center py-3 px-4 text-white/40">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}