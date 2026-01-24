// Professional Permissions System

export type Permission =
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'sales.view'
  | 'sales.create'
  | 'sales.edit'
  | 'automations.view'
  | 'automations.create'
  | 'automations.edit'
  | 'analytics.view'
  | 'finance.view'
  | 'finance.edit'
  | 'integrations.view'
  | 'integrations.manage'
  | 'team.view'
  | 'team.manage'
  | 'settings.view'
  | 'settings.edit'
  | 'billing.view'
  | 'billing.manage'

export type Role = 'ADMIN' | 'MANAGER' | 'USER'

export interface RolePermissions {
  role: Role
  permissions: Permission[]
  label: string
  description: string
}

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'ADMIN',
    label: 'Administrador',
    description: 'Acceso completo a todas las funciones',
    permissions: [
      'clients.view',
      'clients.create',
      'clients.edit',
      'clients.delete',
      'sales.view',
      'sales.create',
      'sales.edit',
      'automations.view',
      'automations.create',
      'automations.edit',
      'analytics.view',
      'finance.view',
      'finance.edit',
      'integrations.view',
      'integrations.manage',
      'team.view',
      'team.manage',
      'settings.view',
      'settings.edit',
      'billing.view',
      'billing.manage'
    ]
  },
  {
    role: 'MANAGER',
    label: 'Manager',
    description: 'Gestión de equipo y operaciones',
    permissions: [
      'clients.view',
      'clients.create',
      'clients.edit',
      'sales.view',
      'sales.create',
      'sales.edit',
      'automations.view',
      'automations.create',
      'automations.edit',
      'analytics.view',
      'integrations.view',
      'team.view',
      'settings.view',
      'billing.view'
    ]
  },
  {
    role: 'USER',
    label: 'Usuario',
    description: 'Acceso básico a funciones diarias',
    permissions: [
      'clients.view',
      'clients.create',
      'clients.edit',
      'sales.view',
      'sales.create',
      'sales.edit',
      'automations.view',
      'analytics.view',
      'integrations.view',
      'settings.view'
    ]
  }
]

export function getPermissionsByRole(role: Role): Permission[] {
  const rolePerms = ROLE_PERMISSIONS.find(rp => rp.role === role)
  return rolePerms?.permissions || []
}

export function hasPermission(userRole: Role, permission: Permission): boolean {
  const permissions = getPermissionsByRole(userRole)
  return permissions.includes(permission)
}

export function canManageRole(currentRole: Role, targetRole: Role): boolean {
  const roleHierarchy = { USER: 1, MANAGER: 2, ADMIN: 3 }
  return roleHierarchy[currentRole] > roleHierarchy[targetRole]
}

export function getRoleLabel(role: Role): string {
  const rolePerms = ROLE_PERMISSIONS.find(rp => rp.role === role)
  return rolePerms?.label || role
}

export function getRoleDescription(role: Role): string {
  const rolePerms = ROLE_PERMISSIONS.find(rp => rp.role === role)
  return rolePerms?.description || ''
}