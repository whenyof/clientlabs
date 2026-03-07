"use client"

import { useState } from "react"
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

export function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    console.log('Theme changed to:', newTheme)
  }

  const themes = [
    { id: 'light' as const, label: 'Claro', desc: 'Interfaz de alta luminosidad.', icon: SunIcon },
    { id: 'dark' as const, label: 'Oscuro', desc: 'Configuración de bajo ruido visual.', icon: MoonIcon },
    { id: 'system' as const, label: 'Sistema', desc: 'Sincronización automática con el OS.', icon: ComputerDesktopIcon },
  ]

  const toggleSettings = [
    { label: 'Sidebar compacto', desc: 'Reducir ancho de la barra lateral.', value: sidebarCollapsed, onChange: () => setSidebarCollapsed(!sidebarCollapsed) },
    { label: 'Modo densidad alta', desc: 'Optimizar espacio para vistas analíticas.', value: compactMode, onChange: () => setCompactMode(!compactMode) },
    { label: 'Animaciones', desc: 'Transiciones fluidas de interfaz.', value: animationsEnabled, onChange: () => setAnimationsEnabled(!animationsEnabled) },
  ]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Apariencia</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configuración visual y preferencias de interfaz.</p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Tema</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon
            const isActive = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-colors",
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors",
                    isActive
                      ? "bg-[var(--accent)] border-[var(--accent)]"
                      : "bg-white border-slate-200"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-[#0B1F2A]" : "text-slate-500"
                  )}>
                    {t.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Layout Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Opciones de layout</h3>

        <div className="space-y-4">
          {toggleSettings.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
              <div>
                <div className="text-sm font-semibold text-[#0B1F2A]">{setting.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{setting.desc}</div>
              </div>
              <button
                onClick={setting.onChange}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  setting.value ? "bg-[var(--accent)]" : "bg-slate-200"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                  setting.value ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-colors">
          Guardar preferencias
        </button>
      </div>
    </div>
  )
}