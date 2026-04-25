// lib/team-permissions.ts
export type Permission =
  | "manage_members"    // invite/remove/role-change
  | "manage_billing"    // upgrade, cancel plan
  | "create_invoice"    // create invoices
  | "delete_invoice"    // delete invoices
  | "create_automation" // create automations
  | "delete_data"       // delete clients/leads in bulk
  | "view_logs"         // view activity log
  | "manage_settings"   // company settings, integrations

import { TeamRole } from "@prisma/client"

const PERMISSIONS: Record<TeamRole, Permission[]> = {
  OWNER: [
    "manage_members", "manage_billing", "create_invoice", "delete_invoice",
    "create_automation", "delete_data", "view_logs", "manage_settings",
  ],
  ADMIN: [
    "create_invoice", "delete_invoice", "create_automation",
    "delete_data", "view_logs", "manage_settings",
  ],
  USER: ["create_invoice", "view_logs"],
}

export function hasPermission(role: TeamRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false
}

export { PERMISSIONS }
