"use client"

import { useState, useEffect, useCallback } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface UIPrefs {
  theme: "light" | "dark" | "system"
  sidebarCollapsed: boolean
  highDensity: boolean
  animationsEnabled: boolean
}

const DEFAULTS: UIPrefs = {
  theme: "light",
  sidebarCollapsed: false,
  highDensity: false,
  animationsEnabled: true,
}

const STORAGE_KEY = "cl_appearance"

function applyTheme(theme: UIPrefs["theme"]) {
  const root = document.documentElement
  const mq = window.matchMedia("(prefers-color-scheme: dark)")

  if (theme === "system") {
    root.setAttribute("data-theme", mq.matches ? "dark" : "light")
    const handler = (e: MediaQueryListEvent) =>
      root.setAttribute("data-theme", e.matches ? "dark" : "light")
    mq.addEventListener("change", handler)
    // Store cleanup ref on window to avoid duplicate listeners
    ;(window as Window & { __themeCleanup?: () => void }).__themeCleanup?.()
    ;(window as Window & { __themeCleanup?: () => void }).__themeCleanup = () =>
      mq.removeEventListener("change", handler)
  } else {
    ;(window as Window & { __themeCleanup?: () => void }).__themeCleanup?.()
    root.setAttribute("data-theme", theme)
  }
  // Keep legacy "theme" key in sync for ThemeProvider
  localStorage.setItem("theme", theme === "system" ? (mq.matches ? "dark" : "light") : theme)
}

function applySidebar(collapsed: boolean) {
  localStorage.setItem("cl_sidebar_collapsed", collapsed ? "true" : "false")
  window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { collapsed } }))
}

function applyDensity(high: boolean) {
  document.documentElement.classList.toggle("density-high", high)
}

function applyAnimations(enabled: boolean) {
  document.documentElement.classList.toggle("no-animations", !enabled)
}

function saveLocal(prefs: UIPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

export function AppearanceSettings() {
  const [prefs, setPrefs] = useState<UIPrefs>(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings/appearance")
      .then((r) => r.json())
      .then((data) => {
        if (data.prefs) {
          const p = { ...DEFAULTS, ...data.prefs } as UIPrefs
          setPrefs(p)
          applyTheme(p.theme)
          applySidebar(p.sidebarCollapsed)
          applyDensity(p.highDensity)
          applyAnimations(p.animationsEnabled)
          saveLocal(p)
        }
      })
      .catch(() => {
        // Fallback to localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) {
            const p = { ...DEFAULTS, ...JSON.parse(raw) } as UIPrefs
            setPrefs(p)
            applyTheme(p.theme)
            applySidebar(p.sidebarCollapsed)
            applyDensity(p.highDensity)
            applyAnimations(p.animationsEnabled)
          }
        } catch {
          // ignore
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const update = useCallback(async (patch: Partial<UIPrefs>) => {
    const next = { ...prefs, ...patch }
    setPrefs(next)

    // Apply DOM immediately
    if (patch.theme !== undefined) applyTheme(patch.theme)
    if (patch.sidebarCollapsed !== undefined) applySidebar(patch.sidebarCollapsed)
    if (patch.highDensity !== undefined) applyDensity(patch.highDensity)
    if (patch.animationsEnabled !== undefined) applyAnimations(patch.animationsEnabled)

    saveLocal(next)

    fetch("/api/settings/appearance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {
      // silent — localStorage already saved
    })
  }, [prefs])

  const themes = [
    { id: "light" as const, label: "Claro", desc: "Interfaz de alta luminosidad.", Icon: Sun },
    { id: "dark" as const, label: "Oscuro", desc: "Configuración de bajo ruido visual.", Icon: Moon },
    { id: "system" as const, label: "Sistema", desc: "Sincronización automática con el OS.", Icon: Monitor },
  ]

  const toggles = [
    {
      label: "Sidebar compacto",
      desc: "Reducir ancho de la barra lateral.",
      value: prefs.sidebarCollapsed,
      onChange: () => update({ sidebarCollapsed: !prefs.sidebarCollapsed }),
    },
    {
      label: "Densidad alta",
      desc: "Optimizar espacio para vistas analíticas.",
      value: prefs.highDensity,
      onChange: () => update({ highDensity: !prefs.highDensity }),
    },
    {
      label: "Animaciones",
      desc: "Transiciones fluidas de interfaz.",
      value: prefs.animationsEnabled,
      onChange: () => update({ animationsEnabled: !prefs.animationsEnabled }),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-100 rounded" />
        <div className="h-40 bg-slate-50 rounded-xl border border-slate-200" />
        <div className="h-40 bg-slate-50 rounded-xl border border-slate-200" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0B1F2A]">Apariencia</h2>
        <p className="text-sm text-slate-500 mt-0.5">Configuración visual y preferencias de interfaz.</p>
      </div>

      {/* Theme */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Tema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map(({ id, label, desc, Icon }) => {
            const active = prefs.theme === id
            return (
              <button
                key={id}
                onClick={() => update({ theme: id })}
                className={cn(
                  "p-4 rounded-lg border text-left transition-colors",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors",
                    active ? "bg-[var(--accent)] border-[var(--accent)]" : "bg-white border-slate-200"
                  )}>
                    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400")} />
                  </div>
                  <span className={cn("text-sm font-semibold", active ? "text-[#0B1F2A]" : "text-slate-500")}>
                    {label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Layout toggles */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-medium text-slate-500 mb-4">Opciones de layout</h3>
        <div className="space-y-4">
          {toggles.map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-b-0">
              <div>
                <div className="text-sm font-semibold text-[#0B1F2A]">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
              <button
                onClick={onChange}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  value ? "bg-[var(--accent)]" : "bg-slate-200"
                )}
                aria-checked={value}
                role="switch"
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                  value ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">Los cambios se guardan automáticamente.</p>
      </div>
    </div>
  )
}
