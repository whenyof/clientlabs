"use client"
import useSWR from "swr"
import { hasPermission, type Permission } from "@/lib/team-permissions"
import { TeamRole } from "@prisma/client"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useTeam() {
  const { data, mutate, isLoading } = useSWR("/api/settings/team", fetcher)

  const myRole: TeamRole = data?.myRole ?? "USER"

  return {
    members: data?.members ?? [],
    myRole,
    plan: data?.plan ?? "FREE",
    limit: data?.limit ?? 1,
    workspaceId: data?.workspaceId ?? null,
    workspaceName: data?.workspaceName ?? null,
    isOwner: myRole === "OWNER",
    isAdmin: myRole === "ADMIN" || myRole === "OWNER",
    isLoading,
    can: (permission: Permission) => hasPermission(myRole, permission),
    mutate,
  }
}
