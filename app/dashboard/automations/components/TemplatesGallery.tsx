"use client"

import { useState } from "react"
import { XMarkIcon, SparklesIcon, StarIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { automationTemplates } from "../mock"

interface TemplatesGalleryProps {
  onClose: () => void
}

export function TemplatesGallery({ onClose }: TemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'Todas', icon: '🎯' },
    { id: 'sales', label: 'Ventas', icon: '💰' },
    { id: 'ai', label: 'IA', icon: '🤖' },
    { id: 'operations', label: 'Operaciones', icon: '⚙️' },
    { id: 'marketing', label: 'Marketing', icon: '📈' }
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? automationTemplates
    : automationTemplates.filter(template => template.category === selectedCategory)

  const handleUseTemplate = (templateId: string) => {
    console.log('Usando template:', templateId)
    // Aquí se implementaría la lógica para usar el template
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[var(--bg-card)]/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-6xl bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    Galería de Templates
                  </h2>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Automatizaciones profesionales listas para usar
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Categories Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{category.icon}</span>
                    {category.label}
                  </motion.button>
                ))}
              </div>

              {/* Templates Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                layout
              >
                <AnimatePresence>
                  {filteredTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6 hover:border-purple-500/50 transition-all duration-300 group"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          {template.isPremium && (
                            <StarIcon className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.category === 'sales' ? 'bg-green-500/20 text-green-400' :
                          template.category === 'ai' ? 'bg-purple-500/20 text-purple-400' :
                          template.category === 'operations' ? 'bg-blue-500/20 text-blue-400' :
                          template.category === 'marketing' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
                        }`}>
                          {template.category}
                        </span>
                      </div>

                      <h3 className="text-[var(--text-primary)] font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                        {template.name}
                      </h3>

                      <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                        {template.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">Acciones:</span>
                          <span className="text-[var(--text-primary)]">{template.actions.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">Ahorro estimado:</span>
                          <span className="text-green-400">{template.estimatedSavings}h/año</span>
                        </div>
                      </div>

                      <motion.button
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-[var(--text-primary)] font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Usar Template
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Info Section */}
              <motion.div
                className="mt-8 p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <StarIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-medium mb-2">
                      Templates Premium Disponibles
                    </h4>
                    <p className="text-[var(--text-secondary)] text-sm mb-3">
                      Los templates marcados con ⭐ incluyen funcionalidades avanzadas como IA,
                      integraciones complejas y análisis predictivo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                        💬 WhatsApp integrado
                      </span>
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                        🤖 IA incluida
                      </span>
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                        📊 Analytics avanzado
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}