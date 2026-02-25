import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

async function getPlanStats() {
 try {
 const [freeCount, proCount, enterpriseCount, totalUsers] = await Promise.all([
 prisma.user.count({ where: { plan: "FREE" } }),
 prisma.user.count({ where: { plan: "PRO" } }),
 prisma.user.count({ where: { plan: "ENTERPRISE" } }),
 prisma.user.count(),
 ])

 return {
 plans: [
 {
 name: "FREE",
 label: "Free",
 description: "Basic features for getting started",
 userCount: freeCount,
 color: "bg-gray-500/20 text-[var(--text-secondary)] border-gray-500/30",
 features: [
 "Basic dashboard access",
 "Limited lead tracking",
 "Email support",
 "1 user seat"
 ]
 },
 {
 name: "PRO",
 label: "Pro",
 description: "Advanced features for growing businesses",
 userCount: proCount,
 color: "bg-[var(--accent-soft)]-primary/15 text-[var(--accent)]-hover border-[var(--accent)]-primary/30",
 features: [
 "Full dashboard access",
 "Unlimited lead tracking",
 "Priority email support",
 "AI-powered insights",
 "Up to 5 user seats"
 ]
 },
 {
 name: "ENTERPRISE",
 label: "Enterprise",
 description: "Full features with priority support",
 userCount: enterpriseCount,
 color: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
 features: [
 "Everything in Pro",
 "Custom integrations",
 "24/7 phone support",
 "Dedicated account manager",
 "Unlimited user seats",
 "Custom SLA"
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
 <h1 className="text-3xl font-bold text-[var(--text-primary)]">Plan Management</h1>
 <p className="text-[var(--text-secondary)]">View plan distribution and manage user subscriptions</p>
 </div>

 {/* Plan Distribution Overview */}
 <div className="grid gap-4 md:grid-cols-3">
 {plans.map((plan) => (
 <Card key={plan.name} className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
 <CardHeader>
 <div className="flex items-center justify-between">
 <Badge className={plan.color}>
 {plan.label}
 </Badge>
 <Shield className="h-5 w-5 text-[var(--text-secondary)]" />
 </div>
 <CardTitle className="text-[var(--text-primary)] mt-4">{plan.label} Plan</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <p className="text-3xl font-bold text-[var(--text-primary)]">{plan.userCount}</p>
 <p className="text-[var(--text-secondary)] text-sm">
 {totalUsers > 0 ? `${Math.round((plan.userCount / totalUsers) * 100)}%` : "0%"} of total users
 </p>
 </div>

 <div className="space-y-2">
 <p className="text-[var(--text-secondary)] text-sm font-medium">Features:</p>
 <ul className="space-y-1">
 {plan.features.map((feature, idx) => (
 <li key={idx} className="text-[var(--text-secondary)] text-xs flex items-start gap-2">
 <span className="text-green-400 mt-0.5">✓</span>
 {feature}
 </li>
 ))}
 </ul>
 </div>

 <Link href="/admin/users">
 <div className="flex items-center gap-2 text-[var(--accent)]-hover hover:text-[var(--accent)]-primary text-sm cursor-pointer transition-colors">
 <Users className="h-4 w-4" />
 View {plan.label} users
 </div>
 </Link>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Plan Comparison */}
 <Card className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
 <CardHeader>
 <CardTitle className="text-[var(--text-primary)] flex items-center gap-2">
 <TrendingUp className="h-5 w-5" />
 Plan Comparison
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-[var(--border-subtle)]">
 <th className="text-left py-3 px-4 text-[var(--text-secondary)] font-medium">Feature</th>
 {plans.map((plan) => (
 <th key={plan.name} className="text-center py-3 px-4">
 <Badge className={plan.color}>{plan.label}</Badge>
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 <tr className="border-b border-[var(--border-subtle)]">
 <td className="py-3 px-4 text-[var(--text-secondary)]">Dashboard Access</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 </tr>
 <tr className="border-b border-[var(--border-subtle)]">
 <td className="py-3 px-4 text-[var(--text-secondary)]">Lead Tracking</td>
 <td className="text-center py-3 px-4 text-[var(--text-secondary)]">Limited</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 </tr>
 <tr className="border-b border-[var(--border-subtle)]">
 <td className="py-3 px-4 text-[var(--text-secondary)]">AI Insights</td>
 <td className="text-center py-3 px-4 text-[var(--critical)]">✗</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 </tr>
 <tr className="border-b border-[var(--border-subtle)]">
 <td className="py-3 px-4 text-[var(--text-secondary)]">Priority Support</td>
 <td className="text-center py-3 px-4 text-[var(--critical)]">✗</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 </tr>
 <tr className="border-b border-[var(--border-subtle)]">
 <td className="py-3 px-4 text-[var(--text-secondary)]">Custom Integrations</td>
 <td className="text-center py-3 px-4 text-[var(--critical)]">✗</td>
 <td className="text-center py-3 px-4 text-[var(--critical)]">✗</td>
 <td className="text-center py-3 px-4 text-green-400">✓</td>
 </tr>
 <tr>
 <td className="py-3 px-4 text-[var(--text-secondary)]">User Seats</td>
 <td className="text-center py-3 px-4 text-[var(--text-secondary)]">1</td>
 <td className="text-center py-3 px-4 text-[var(--text-secondary)]">5</td>
 <td className="text-center py-3 px-4 text-[var(--text-secondary)]">Unlimited</td>
 </tr>
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>
 )
}