import type { UiPreferences } from "@/lib/types/ui-preferences"

type W = Window & { __themeCleanup?: () => void }

export function applyTheme(_theme: UiPreferences["theme"]) {
  // Dark mode not yet available — always light
  ;(window as W).__themeCleanup?.()
  document.documentElement.setAttribute("data-theme", "light")
  localStorage.setItem("theme", "light")
}

export function applyAccentColor(hex: string) {
  const root = document.documentElement
  root.style.setProperty("--accent", hex)
  root.style.setProperty("--brand-500", hex)
}

export function applySidebar(collapsed: boolean) {
  localStorage.setItem("cl_sidebar_collapsed", collapsed ? "true" : "false")
  window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: { collapsed } }))
}

export function applyDensity(high: boolean) {
  document.documentElement.classList.toggle("density-high", high)
}

export function applyAnimations(enabled: boolean) {
  document.documentElement.classList.toggle("no-animations", !enabled)
}

export function applyPreferences(prefs: Partial<UiPreferences>) {
  if (prefs.theme !== undefined) applyTheme(prefs.theme)
  if (prefs.accentColor !== undefined) applyAccentColor(prefs.accentColor)
  if (prefs.sidebarCollapsed !== undefined) applySidebar(prefs.sidebarCollapsed)
  if (prefs.highDensity !== undefined) applyDensity(prefs.highDensity)
  if (prefs.animationsEnabled !== undefined) applyAnimations(prefs.animationsEnabled)
  if (prefs.itemsPerPage !== undefined)
    localStorage.setItem("cl_items_per_page", String(prefs.itemsPerPage))
}
