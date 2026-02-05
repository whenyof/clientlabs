"use client"

import { useMemo } from "react"
import { mockProviders, formatCurrency, getProvidersByCategory, getProvidersByStatus } from "../mock"
import {
  PencilIcon,
  TrashIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface ProvidersTableProps {
  searchTerm: string
  categoryFilter: string
  statusFilter: string
  onEditProvider: (provider: any) => void
}

export function ProvidersTable({
  searchTerm,
  categoryFilter,
  statusFilter,
  onEditProvider
}: ProvidersTableProps) {
  const filteredProviders = useMemo(() => {
    let filtered = mockProviders

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(provider => provider.category === categoryFilter)
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.status === statusFilter)
    }

    return filtered
  }, [searchTerm, categoryFilter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'inactive':
        return 'Inactivo'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-600'
          }`}
      />
    ))
  }

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Gastado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Último Pedido
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredProviders.map((provider, index) => (
              <motion.tr
                key={provider.id}
                className="hover:bg-gray-700/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-white font-medium">{provider.name}</div>
                    <div className="text-gray-400 text-sm">{provider.company}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{provider.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{provider.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    {provider.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(provider.status)}`}>
                    {getStatusLabel(provider.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {renderStars(provider.rating)}
                    <span className="text-gray-400 text-sm ml-1">
                      {provider.rating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">
                    {formatCurrency(provider.totalSpent)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {provider.totalOrders} pedidos
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(provider.lastOrder).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => onEditProvider(provider)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProviders.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BuildingStorefrontIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            No se encontraron proveedores
          </h3>
          <p className="text-gray-500">
            No hay proveedores que coincidan con tu búsqueda.
          </p>
        </motion.div>
      )}

      {/* Resumen */}
      {filteredProviders.length > 0 && (
        <motion.div
          className="bg-gray-900/50 px-6 py-4 border-t border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {filteredProviders.length} proveedor{filteredProviders.length > 1 ? 'es' : ''} encontrado{filteredProviders.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-6">
              <span className="text-gray-400">
                Gasto total: <span className="text-white font-medium">
                  {formatCurrency(filteredProviders.reduce((sum, p) => sum + p.totalSpent, 0))}
                </span>
              </span>
              <span className="text-gray-400">
                Rating promedio: <span className="text-white font-medium">
                  {(filteredProviders.reduce((sum, p) => sum + p.rating, 0) / filteredProviders.length).toFixed(1)}
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}