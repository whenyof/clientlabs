"use client"

import { motion } from "framer-motion"
import { integrationCategories } from "../mock"

interface IntegrationCategoriesProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function IntegrationCategories({ selectedCategory, onCategoryChange }: IntegrationCategoriesProps) {
  return (
    <motion.div
      className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Categorías de Integración</h3>
        <p className="text-[var(--text-secondary)]">Explora integraciones por tipo de funcionalidad</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* All category */}
        <motion.button
          onClick={() => onCategoryChange('all')}
          className={`
            p-4 rounded-xl border transition-all duration-300 hover:scale-105
            ${selectedCategory === 'all'
              ? 'bg-emerald-600/20 border-emerald-500/50 shadow-[var(--shadow-card)] shadow-emerald-500/10'
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-subtle)]'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🔗</div>
            <div className={`text-sm font-medium ${
              selectedCategory === 'all' ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
            }`}>
              Todas
            </div>
          </div>
        </motion.button>

        {/* Category buttons */}
        {integrationCategories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              p-4 rounded-xl border transition-all duration-300 hover:scale-105
              ${selectedCategory === category.id
                ? 'bg-emerald-600/20 border-emerald-500/50 shadow-[var(--shadow-card)] shadow-emerald-500/10'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-subtle)]'
            }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{category.icon}</div>
              <div className={`text-sm font-medium ${
                selectedCategory === category.id ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
              }`}>
                {category.name}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {category.integrations.length} disponibles
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Category description */}
      {selectedCategory !== 'all' && (
        <motion.div
          className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const category = integrationCategories.find(c => c.id === selectedCategory)
            return category ? (
              <div>
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {category.icon} {category.name}
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">{category.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {category.integrations.map(integration => (
                    <span
                      key={integration}
                      className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full"
                    >
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            ) : null
          })()}
        </motion.div>
      )}
    </motion.div>
  )
}