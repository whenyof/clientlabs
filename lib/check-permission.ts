import { prisma } from "@/lib/prisma"
import type { MemberPermissions } from "@prisma/client"
import { DEFAULT_PERMISSIONS } from "@/lib/role-permissions"

type PermissionKey = keyof Omit<MemberPermissions, "id" | "memberId" | "updatedAt">

export async function checkPermission(
  userId: string,
  workspaceId: string,
  permission: PermissionKey
): Promise<boolean> {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
    select: { role: true, permissions: true },
  })

  if (!member) return false
  if (member.role === "OWNER") return true

  // Use custom permissions if set, otherwise fall back to role defaults
  if (member.permissions) {
    return member.permissions[permission] as boolean
  }

  return DEFAULT_PERMISSIONS[member.role]?.[permission] ?? false
}
