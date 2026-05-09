export type ProjectRole = "owner" | "admin" | "member"

export function canManageProject(role: ProjectRole): boolean {
  return role === "owner" || role === "admin"
}

export function canInviteMembers(role: ProjectRole): boolean {
  return role === "owner" || role === "admin"
}

export function canDeleteProject(role: ProjectRole): boolean {
  return role === "owner"
}

export function canAssignTasks(role: ProjectRole): boolean {
  return role === "owner" || role === "admin"
}

export function canCreateTasks(_role: ProjectRole): boolean {
  return true
}

export function canEditTask(role: ProjectRole, isAssignee: boolean): boolean {
  return role === "owner" || role === "admin" || isAssignee
}
