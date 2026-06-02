export interface UiPreferences {
  // Appearance
  theme: "light" | "dark" | "system"
  sidebarCollapsed: boolean
  highDensity: boolean
  animationsEnabled: boolean
  accentColor: string
  // Region
  language: string
  dateFormat: string
  timezone: string
  currency: string
  // Navigation
  defaultPage: string
  // Tables
  itemsPerPage: number
}

export const DEFAULT_PREFERENCES: UiPreferences = {
  theme: "light",
  sidebarCollapsed: false,
  highDensity: false,
  animationsEnabled: true,
  accentColor: "#0F766E",
  language: "es",
  dateFormat: "DD/MM/YYYY",
  timezone: "Europe/Madrid",
  currency: "EUR",
  defaultPage: "/dashboard",
  itemsPerPage: 25,
}
