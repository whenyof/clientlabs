"use client"

import { useState, useMemo } from "react"
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedCard } from "./AnimatedCard"

interface ActivityTableProps {
  selectedRange: string
}

type FilterType = 'all' | 'manual' | 'bot'
type SortField = 'date' | 'impact' | 'event'

/** No analytics activity backend — empty table. */
const emptyActivityData: { date: string; event: string; user: string; category: string; impact: number; type: string }[] = []

export function ActivityTable({ selectedRange: _selectedRange }: ActivityTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredAndSortedData = useMemo(() => {
    let filtered = emptyActivityData

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType)
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'date') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortOrder === 'asc' ? comparison : -comparison
      }

      if (typeof aValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [searchTerm, filterType, sortField, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      venta: 'bg-green-500/20 text-green-400',
      lead: 'bg-blue-500/20 text-blue-400',
      marketing: 'bg-emerald-500/20 text-emerald-400',
      facturacion: 'bg-orange-500/20 text-orange-400',
      cliente: 'bg-cyan-500/20 text-cyan-400',
      finanzas: 'bg-red-500/20 text-red-400',
      oportunidad: 'bg-yellow-500/20 text-yellow-400'
    }
    return colors[category] || 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <AnimatedCard delay={0.6}>
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Actividad reciente
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              Historial de acciones y eventos del sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Búsqueda */}
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <motion.input
                type="text"
                placeholder="Buscar actividad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>

            {/* Filtros */}
            <motion.div
              className="flex bg-[var(--bg-surface)] rounded-lg p-1"
              layout
            >
              {[
                { key: 'all', label: 'Todo' },
                { key: 'manual', label: 'Manual' },
                { key: 'bot', label: 'Bot' }
              ].map(({ key, label }) => (
                <motion.button
                  key={key}
                  onClick={() => setFilterType(key as FilterType)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filterType === key
                      ? 'bg-emerald-600 text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  {label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--bg-card)]">
            <motion.tr
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              {[
                { key: 'date', label: 'Fecha' },
                { key: 'event', label: 'Evento' },
                { key: 'user', label: 'Usuario' },
                { key: 'impact', label: 'Impacto' },
                { key: 'type', label: 'Tipo' },
                { key: 'category', label: 'Categoría' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key as SortField)}
                  className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {sortField === key && (
                      <motion.span
                        className="text-emerald-400"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
            </motion.tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            <AnimatePresence>
              {paginatedData.map((activity, index) => (
                <motion.tr
                  key={(activity as any).id ?? index}
                  className="hover:bg-[var(--bg-surface)] transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    delay: 0.1 * index,
                    duration: 0.3
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <td className="px-6 py-4 text-[var(--text-secondary)]">
                    {formatDate(activity.date)}
                  </td>
                  <td className="px-6 py-4">
                    <motion.div
                      className="text-[var(--text-primary)] font-medium"
                      whileHover={{ scale: 1.02 }}
                    >
                      {activity.event}
                    </motion.div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {activity.type === 'manual' ? (
                        <UserIcon className="w-4 h-4 text-blue-400" />
                      ) : (
                        <CpuChipIcon className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="text-[var(--text-secondary)]">{activity.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      className={`font-medium ${
                        activity.impact > 0 ? 'text-green-400' :
                        activity.impact < 0 ? 'text-red-400' : 'text-[var(--text-secondary)]'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {activity.impact !== 0 ? `€${activity.impact.toLocaleString('es-ES')}` : '-'}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'bot'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {activity.type === 'bot' ? 'Bot' : 'Manual'}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <motion.span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(activity.category)}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {activity.category}
                    </motion.span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <motion.div
          className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.3 }}
        >
          <div className="text-sm text-[var(--text-secondary)]">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} resultados
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] disabled:bg-[var(--bg-main)] disabled:text-[var(--text-secondary)] text-[var(--text-primary)] rounded text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Anterior
            </motion.button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <motion.button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {pageNum}
                </motion.button>
              )
            })}

            <motion.button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] disabled:bg-[var(--bg-main)] disabled:text-[var(--text-secondary)] text-[var(--text-primary)] rounded text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Siguiente
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      <AnimatePresence>
        {paginatedData.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <AdjustmentsHorizontalIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">
              No se encontraron actividades
            </h3>
            <p className="text-[var(--text-secondary)]">
              No hay actividades que coincidan con tu búsqueda.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}