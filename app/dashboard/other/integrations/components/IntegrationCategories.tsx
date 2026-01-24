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
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Categorías de Integración</h3>
        <p className="text-gray-400">Explora integraciones por tipo de funcionalidad</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* All category */}
        <motion.button
          onClick={() => onCategoryChange('all')}
          className={`
            p-4 rounded-xl border transition-all duration-300 hover:scale-105
            ${selectedCategory === 'all'
              ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
              : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🔗</div>
            <div className={`text-sm font-medium ${
              selectedCategory === 'all' ? 'text-purple-400' : 'text-gray-300'
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
                ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
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
                selectedCategory === category.id ? 'text-purple-400' : 'text-gray-300'
              }`}>
                {category.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {category.integrations.length} disponibles
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Category description */}
      {selectedCategory !== 'all' && (
        <motion.div
          className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const category = integrationCategories.find(c => c.id === selectedCategory)
            return category ? (
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {category.icon} {category.name}
                </h4>
                <p className="text-gray-400 text-sm">{category.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {category.integrations.map(integration => (
                    <span
                      key={integration}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
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