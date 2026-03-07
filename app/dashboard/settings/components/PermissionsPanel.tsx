"use client"

import { ROLE_PERMISSIONS, getPermissionsByRole, hasPermission } from "../lib/permissions"
import { CheckIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export function PermissionsPanel() {
  const currentRole = 'ADMIN'
  const permissions = getPermissionsByRole(currentRole)

  const permissionCategories = {
    clients: {
      title: 'Clientes',
      items: [
        { key: 'clients.view', label: 'Ver clientes' },
        { key: 'clients.create', label: 'Crear clientes' },
        { key: 'clients.edit', label: 'Editar clientes' },
        { key: 'clients.delete', label: 'Eliminar clientes' }
      ]
    },
    sales: {
      title: 'Ventas',
      items: [
        { key: 'sales.view', label: 'Ver ventas' },
        { key: 'sales.create', label: 'Crear ventas' },
        { key: 'sales.edit', label: 'Editar ventas' }
      ]
    },
    analytics: {
      title: 'Analytics',
      items: [
        { key: 'analytics.view', label: 'Ver analytics' }
      ]
    },
    finance: {
      title: 'Finanzas',
      items: [
        { key: 'finance.view', label: 'Ver finanzas' },
        { key: 'finance.edit', label: 'Editar finanzas' }
      ]
    },
    integrations: {
      title: 'Integraciones',
      items: [
        { key: 'integrations.view', label: 'Ver integraciones' },
        { key: 'integrations.manage', label: 'Gestionar integraciones' }
      ]
    },
    team: {
      title: 'Equipo',
      items: [
        { key: 'team.view', label: 'Ver equipo' },
        { key: 'team.manage', label: 'Gestionar equipo' }
      ]
    },
    billing: {
      title: 'Facturación',
      items: [
        { key: 'billing.view', label: 'Ver facturación' },
        { key: 'billing.manage', label: 'Gestionar facturación' }
      ]
    },
    settings: {
      title: 'Ajustes',
      items: [
        { key: 'settings.view', label: 'Ver ajustes' },
        { key: 'settings.edit', label: 'Editar ajustes' }
      ]
    }
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Permisos</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Rol actual: <span className="text-[var(--accent)] font-semibold">Administrador</span>
        </p>
      </div>

      {/* Permission Categories */}
      {Object.entries(permissionCategories).map(([categoryKey, category]) => (
        <div key={categoryKey} className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-4">{category.title}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {category.items.map((permission) => {
              const hasPerm = hasPermission(currentRole, permission.key as any)

              return (
                <div
                  key={permission.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    hasPerm
                      ? "bg-emerald-50/50 border-emerald-200/60"
                      : "bg-slate-50 border-slate-100 opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    hasPerm ? "bg-[var(--accent)]" : "bg-white border border-slate-200"
                  )}>
                    {hasPerm && <CheckIcon className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn(
                    "text-sm",
                    hasPerm ? "text-[#0B1F2A] font-medium" : "text-slate-400"
                  )}>
                    {permission.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Resumen</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-[#0B1F2A]">
              {ROLE_PERMISSIONS.find(r => r.role === currentRole)?.permissions.length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Permisos activos</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-[#0B1F2A]">
              {Object.keys(permissionCategories).length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Módulos</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-[var(--accent)]">100%</div>
            <div className="text-xs text-slate-500 mt-0.5">Acceso</div>
          </div>
        </div>
      </div>
    </div>
  )
}