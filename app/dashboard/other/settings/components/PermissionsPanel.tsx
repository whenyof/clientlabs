"use client"

import { motion } from "framer-motion"
import { ROLE_PERMISSIONS, getPermissionsByRole, hasPermission } from "../lib/permissions"
import { CheckIcon } from "@heroicons/react/24/outline"

export function PermissionsPanel() {
  const currentRole = 'ADMIN' // Mock - would come from auth context

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Permisos del rol</h2>
        <p className="text-gray-400">Rol actual: <span className="text-purple-400 font-medium">Administrador</span></p>
      </div>

      <div className="space-y-6">
        {Object.entries(permissionCategories).map(([categoryKey, category], categoryIndex) => (
          <motion.div
            key={categoryKey}
            className="bg-gray-900/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * categoryIndex, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">{category.title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.items.map((permission) => {
                const hasPerm = hasPermission(currentRole, permission.key as any)

                return (
                  <div
                    key={permission.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      hasPerm
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-gray-800/50 border-gray-700/50'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      hasPerm ? 'bg-green-500/20' : 'bg-gray-700/50'
                    }`}>
                      {hasPerm ? (
                        <CheckIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      hasPerm ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {permission.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Role Info */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl p-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Información del rol</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {ROLE_PERMISSIONS.find(r => r.role === currentRole)?.permissions.length}
            </div>
            <div className="text-sm text-gray-400">Permisos activos</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Object.keys(permissionCategories).length}
            </div>
            <div className="text-sm text-gray-400">Categorías</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">100%</div>
            <div className="text-sm text-gray-400">Acceso total</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}