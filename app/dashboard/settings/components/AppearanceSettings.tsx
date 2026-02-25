"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ComputerDesktopIcon, MoonIcon, SunIcon, Bars3Icon } from "@heroicons/react/24/outline"

export function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    // TODO: Apply theme to app
    console.log('Theme changed to:', newTheme)
  }

  const handleSettingChange = (setting: string, value: boolean) => {
    console.log(`${setting} changed to:`, value)
    // TODO: Save to user preferences
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Apariencia</h2>
        <p className="text-[var(--text-secondary)]">Personaliza la apariencia de tu dashboard</p>
      </div>

      <div className="space-y-8">
        {/* Theme Selection */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Tema</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)] bg-[var(--bg-main)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <SunIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-[var(--text-primary)] font-medium">Claro</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Interfaz clara y luminosa
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)] bg-[var(--bg-main)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <MoonIcon className="w-6 h-6 text-blue-400" />
                <span className="text-[var(--text-primary)] font-medium">Oscuro</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Tema oscuro profesional
              </div>
            </motion.button>

            <motion.button
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'system'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)] bg-[var(--bg-main)]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <ComputerDesktopIcon className="w-6 h-6 text-purple-400" />
                <span className="text-[var(--text-primary)] font-medium">Sistema</span>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Sigue la configuración del sistema
              </div>
            </motion.button>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Diseño</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-primary)] font-medium">Sidebar compacto</div>
                <div className="text-sm text-[var(--text-secondary)]">Reduce el ancho de la barra lateral</div>
              </div>
              <motion.button
                onClick={() => {
                  setSidebarCollapsed(!sidebarCollapsed)
                  handleSettingChange('sidebarCollapsed', !sidebarCollapsed)
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sidebarCollapsed ? 'bg-purple-600' : 'bg-[var(--bg-surface)]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[var(--bg-card)] transition-transform ${
                    sidebarCollapsed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-primary)] font-medium">Modo compacto</div>
                <div className="text-sm text-[var(--text-secondary)]">Reduce el espaciado y tamaños de elementos</div>
              </div>
              <motion.button
                onClick={() => {
                  setCompactMode(!compactMode)
                  handleSettingChange('compactMode', !compactMode)
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  compactMode ? 'bg-purple-600' : 'bg-[var(--bg-surface)]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[var(--bg-card)] transition-transform ${
                    compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[var(--text-primary)] font-medium">Animaciones</div>
                <div className="text-sm text-[var(--text-secondary)]">Activa transiciones y animaciones suaves</div>
              </div>
              <motion.button
                onClick={() => {
                  setAnimationsEnabled(!animationsEnabled)
                  handleSettingChange('animationsEnabled', !animationsEnabled)
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  animationsEnabled ? 'bg-purple-600' : 'bg-[var(--bg-surface)]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[var(--bg-card)] transition-transform ${
                    animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[var(--bg-card)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Vista previa</h3>

          <div className="bg-[var(--bg-main)] rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-3 bg-[var(--bg-surface)] rounded mb-2"></div>
                <div className="h-2 bg-[var(--bg-surface)] rounded w-3/4"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-[var(--bg-surface)] rounded"></div>
              <div className="h-16 bg-[var(--bg-surface)] rounded"></div>
            </div>

            {animationsEnabled && (
              <motion.div
                className="mt-4 h-2 bg-purple-500 rounded"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            )}
          </div>

          <div className="mt-4 text-sm text-[var(--text-secondary)]">
            Esta es una vista previa de cómo se verán los cambios en tu interfaz.
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-[var(--text-primary)] font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Guardar preferencias
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}