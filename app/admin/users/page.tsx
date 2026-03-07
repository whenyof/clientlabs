import { prisma } from "@/lib/prisma"
import { UserManagementTable } from "./UserManagementTable"

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        onboardingCompleted: true,
        createdAt: true,
        image: true,
        isBlocked: true,
        isActive: true,
        blockedReason: true,
        lastLoginAt: true,
        lastActiveAt: true,
      },
      orderBy: { createdAt: "desc" }
    })
    // Convert Date to string for client component
    return users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      lastActiveAt: user.lastActiveAt?.toISOString() || null,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-white/60">Manage user accounts, roles, and permissions</p>
      </div>

      <UserManagementTable initialUsers={users} />
    </div>
  )
}