import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Database, Settings } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // AJUSTA SI TU PATH ES OTRO
import type { LucideIcon } from "lucide-react"
import { ClientDate } from "@/components/ClientNumber"

// 🔐 SERVER-SIDE AUTH CHECK (defensa extra)
async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard/other")
  }

  return session
}

async function getSystemStats() {
  try {
    const [
      userCount,
      adminCount,
      freeCount,
      proCount,
      enterpriseCount,
      blockedCount,
      activeImpersonations,
      recentUsers,
      lastBackup,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { plan: "FREE" } }),
      prisma.user.count({ where: { plan: "PRO" } }),
      prisma.user.count({ where: { plan: "ENTERPRISE" } }),
      prisma.user.count({ where: { isBlocked: true } }),
      prisma.impersonationSession.count({ where: { endedAt: null } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.backupMetadata.findFirst({
        orderBy: { createdAt: "desc" },
      }),
    ])

    return {
      users: userCount,
      admins: adminCount,
      plans: {
        free: freeCount,
        pro: proCount,
        enterprise: enterpriseCount,
      },
      blockedUsers: blockedCount,
      activeImpersonations,
      recentUsers: recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
      lastBackup: lastBackup
        ? {
          status: lastBackup.status,
          createdAt: lastBackup.createdAt.toISOString(),
        }
        : null,
      systemStatus: "operational" as const,
    }
  } catch {
    return {
      users: 0,
      admins: 0,
      plans: { free: 0, pro: 0, enterprise: 0 },
      blockedUsers: 0,
      activeImpersonations: 0,
      recentUsers: [],
      lastBackup: null,
      systemStatus: "error" as const,
    }
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  status,
}: {
  title: string
  value: string | number
  icon: LucideIcon
  status?: "operational" | "error"
}) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {status && (
          <Badge
            variant={status === "operational" ? "default" : "destructive"}
            className="mt-2"
          >
            {status}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard() {
  // 🔐 Bloquea aquí también
  await requireAdmin()

  const stats = await getSystemStats()

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-white/60">
          System overview and management
        </p>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats.users} icon={Users} />
        <StatCard title="Admin Users" value={stats.admins} icon={Shield} />
        <StatCard
          title="System Status"
          value="Operational"
          icon={Database}
          status={stats.systemStatus}
        />
        <StatCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={Users}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">FREE</span>
              <span className="text-white font-medium">{stats.plans.free}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">PRO</span>
              <span className="text-white font-medium">{stats.plans.pro}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">ENTERPRISE</span>
              <span className="text-white font-medium">{stats.plans.enterprise}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {stats.activeImpersonations}
            </div>
            <p className="text-white/60 text-xs mt-1">
              Active impersonation sessions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-sm">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lastBackup ? (
              <>
                <Badge className={
                  stats.lastBackup.status === "COMPLETED"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : stats.lastBackup.status === "FAILED"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }>
                  {stats.lastBackup.status}
                </Badge>
                <p className="text-white/60 text-xs mt-2">
                  <ClientDate date={stats.lastBackup.createdAt} />
                </p>
              </>
            ) : (
              <p className="text-white/60 text-sm">No backups yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent User Activity */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentUsers.length > 0 ? (
            <div className="space-y-2">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {user.name || "No name"}
                    </p>
                    <p className="text-white/60 text-sm">{user.email}</p>
                  </div>
                  <p className="text-white/40 text-xs">
                    <ClientDate date={user.createdAt} options={{ dateStyle: "short" }} />
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-4">No recent users</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/users">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">
                View and manage user accounts, roles, and permissions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/plans">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Plan Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">
                Manage plans and subscriptions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/system">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">
                Monitor system health and integrations
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}