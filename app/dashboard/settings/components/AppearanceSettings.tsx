"use client"

import { useState, useEffect, useCallback } from "react"
import { Sun, LayoutDashboard, Users, Target, Receipt, CheckSquare, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UiPreferences } from "@/lib/types/ui-preferences"
import { DEFAULT_PREFERENCES } from "@/lib/types/ui-preferences"
import {
  applyTheme,
  applyAccentColor,
  applySidebar,
  applyDensity,
  applyAnimations,
} from "@/lib/utils/apply-preferences"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STORAGE_KEY = "cl_appearance"

const ACCENT_COLORS = [
  { name: "Verde",     hex: "#0F766E" },
  { name: "Esmeralda", hex: "#059669" },
  { name: "Azul",      hex: "#2563EB" },
  { name: "Índigo",    hex: "#4F46E5" },
  { name: "Morado",    hex: "#7C3AED" },
  { name: "Rosa",      hex: "#DB2777" },
  { name: "Rojo",      hex: "#DC2626" },
  { name: "Naranja",   hex: "#EA580C" },
  { name: "Ámbar",     hex: "#D97706" },
  { name: "Gris",      hex: "#475569" },
]

const DATE_FORMATS = [
  { id: "DD/MM/YYYY", label: "DD/MM/YYYY", example: "31/12/2026 (España)" },
  { id: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "12/31/2026 (Internacional)" },
  { id: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-12-31 (ISO 8601)" },
]

const CURRENCIES = [
  { id: "EUR", label: "€ EUR — Euro" },
  { id: "USD", label: "$ USD — Dólar" },
  { id: "GBP", label: "£ GBP — Libra" },
]

const TIMEZONES = [
  { id: "Europe/Madrid",        label: "Europe/Madrid (UTC+1/+2)" },
  { id: "Europe/London",        label: "Europe/London (UTC+0/+1)" },
  { id: "America/Mexico_City",  label: "America/Mexico_City (UTC-6/-5)" },
  { id: "America/Bogota",       label: "America/Bogota (UTC-5)" },
  { id: "America/Lima",         label: "America/Lima (UTC-5)" },
  { id: "America/Santiago",     label: "America/Santiago (UTC-3/-4)" },
  { id: "America/Buenos_Aires", label: "America/Buenos_Aires (UTC-3)" },
  { id: "America/Caracas",      label: "America/Caracas (UTC-4)" },
  { id: "America/New_York",     label: "America/New_York (UTC-5/-4)" },
]

const LANGUAGES = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "ca", label: "Català" },
  { id: "eu", label: "Euskera" },
]

const DEFAULT_PAGES = [
  { id: "/dashboard",                  label: "Dashboard",    Icon: LayoutDashboard },
  { id: "/dashboard/leads",            label: "Leads",        Icon: Target },
  { id: "/dashboard/clients",          label: "Clientes",     Icon: Users },
  { id: "/dashboard/finance/invoices", label: "Facturas",     Icon: Receipt },
  { id: "/dashboard/tasks",            label: "Tareas",       Icon: CheckSquare },
  { id: "/dashboard/providers",        label: "Proveedores",  Icon: Truck },
]

function saveLocal(prefs: UiPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

function syncLocalStorage(patch: Partial<UiPreferences>) {
  if (patch.itemsPerPage !== undefined)
    localStorage.setItem("cl_items_per_page", String(patch.itemsPerPage))
  if (patch.dateFormat !== undefined)
    localStorage.setItem("cl_date_format", patch.dateFormat)
  if (patch.currency !== undefined)
    localStorage.setItem("cl_currency", patch.currency)
  if (patch.language !== undefined)
    localStorage.setItem("cl_language", patch.language)
}

export function AppearanceSettings() {
  const [prefs, setPrefs] = useState<UiPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [hoveredColor, setHoveredColor] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/settings/appearance")
      .then((r) => r.json())
      .then((data) => {
        if (data.prefs) {
          const p = { ...DEFAULT_PREFERENCES, ...data.prefs } as UiPreferences
          setPrefs(p)
          applyTheme(p.theme)
          applyAccentColor(p.accentColor)
          applySidebar(p.sidebarCollapsed)
          applyDensity(p.highDensity)
          applyAnimations(p.animationsEnabled)
          syncLocalStorage(p)
          saveLocal(p)
        }
      })
      .catch(() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) {
            const p = { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } as UiPreferences
            setPrefs(p)
            applyTheme(p.theme)
            applyAccentColor(p.accentColor)
            applySidebar(p.sidebarCollapsed)
            applyDensity(p.highDensity)
            applyAnimations(p.animationsEnabled)
            syncLocalStorage(p)
          }
        } catch { /* ignore */ }
      })
      .finally(() => setLoading(false))
  }, [])

  const update = useCallback((patch: Partial<UiPreferences>) => {
    const next = { ...prefs, ...patch }
    setPrefs(next)

    if (patch.theme !== undefined) applyTheme(patch.theme)
    if (patch.accentColor !== undefined) applyAccentColor(patch.accentColor)
    if (patch.sidebarCollapsed !== undefined) applySidebar(patch.sidebarCollapsed)
    if (patch.highDensity !== undefined) applyDensity(patch.highDensity)
    if (patch.animationsEnabled !== undefined) applyAnimations(patch.animationsEnabled)

    syncLocalStorage(patch)
    saveLocal(next)

    fetch("/api/settings/appearance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => { /* silent — localStorage persisted */ })
  }, [prefs])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-[var(--bg-surface)] rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-36 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)]" />
        ))}
      </div>
    )
  }

  const themes = [
    { id: "light" as const, label: "Claro", desc: "Interfaz de alta luminosidad.", Icon: Sun },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Apariencia</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Configuración visual y preferencias de interfaz.</p>
      </div>

      {/* ── Tema ─────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Tema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] hover:border-[var(--border-main)]"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors",
                    active
                      ? "bg-[var(--accent)] border-[var(--accent)]"
                      : "bg-[var(--bg-card)] border-[var(--border-main)]"
                  )}>
                    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-[var(--text-secondary)]")} />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                  )}>
                    {label}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
              </button>
            )
          })}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-3">
          El modo oscuro estará disponible próximamente.
        </p>
      </div>

      {/* ── Color de acento ──────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Color de acento</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">El color principal de la interfaz.</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(({ name, hex }) => {
            const active = prefs.accentColor === hex
            return (
              <button
                key={hex}
                title={name}
                onClick={() => update({ accentColor: hex })}
                onMouseEnter={() => setHoveredColor(name)}
                onMouseLeave={() => setHoveredColor(null)}
                style={{ backgroundColor: hex }}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  active
                    ? "ring-2 ring-offset-2 scale-110"
                    : "hover:scale-110 opacity-80 hover:opacity-100"
                )}
                aria-label={name}
                aria-pressed={active}
              />
            )
          })}
        </div>
        {hoveredColor && (
          <p className="text-xs text-[var(--text-secondary)] mt-3">{hoveredColor}</p>
        )}
        <p className="text-xs text-[var(--text-secondary)] mt-3">Los cambios se guardan automáticamente.</p>
      </div>

      {/* ── Layout toggles ───────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Opciones de layout</h3>
        <div className="space-y-4">
          {toggles.map(({ label, desc, value, onChange }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3 border-b border-[var(--border-subtle)] last:border-b-0"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</div>
              </div>
              <button
                onClick={onChange}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  value ? "bg-[var(--accent)]" : "bg-[var(--border-main)]"
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
        <p className="text-xs text-[var(--text-secondary)] mt-4">Los cambios se guardan automáticamente.</p>
      </div>

      {/* ── Idioma y región ──────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Idioma y región</h3>

        <div className="space-y-5">
          {/* Idioma */}
          <div>
            <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
              Idioma de la interfaz
            </label>
            <Select value={prefs.language} onValueChange={(v) => update({ language: v })}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] mt-2">
              <span className="text-sm text-[var(--text-secondary)]">
                La interfaz de ClientLabs está actualmente en español. Las traducciones completas al inglés, català y euskera estarán disponibles próximamente. Tu preferencia quedará guardada.
              </span>
            </div>
          </div>

          {/* Formato de fecha */}
          <div>
            <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
              Formato de fecha
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DATE_FORMATS.map(({ id, label, example }) => {
                const active = prefs.dateFormat === id
                return (
                  <button
                    key={id}
                    onClick={() => update({ dateFormat: id })}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/5"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-main)] hover:bg-[var(--bg-card)]"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-semibold",
                      active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                    )}>
                      {label}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{example}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Moneda + Zona horaria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
                Moneda
              </label>
              <Select value={prefs.currency} onValueChange={(v) => update({ currency: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(({ id, label }) => (
                    <SelectItem key={id} value={id}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--text-primary)] block mb-1.5">
                Zona horaria
              </label>
              <Select value={prefs.timezone} onValueChange={(v) => update({ timezone: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(({ id, label }) => (
                    <SelectItem key={id} value={id}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-4">Los cambios se guardan automáticamente.</p>
      </div>

      {/* ── Página de inicio ─────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Página de inicio</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Qué página ver al entrar a ClientLabs.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEFAULT_PAGES.map(({ id, label, Icon }) => {
            const active = prefs.defaultPage === id
            return (
              <button
                key={id}
                onClick={() => update({ defaultPage: id })}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-lg border text-left transition-colors",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] hover:border-[var(--border-main)]"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                )}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-4">Los cambios se guardan automáticamente.</p>
      </div>

      {/* ── Tablas y listas ──────────────────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] p-6">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Tablas y listas</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Configuración de la visualización de datos.</p>

        <div>
          <label className="text-sm font-semibold text-[var(--text-primary)] block mb-2">
            Elementos por página
          </label>
          <div className="inline-flex rounded-lg border border-[var(--border-main)] overflow-hidden">
            {([10, 25, 50, 100] as const).map((n) => {
              const active = prefs.itemsPerPage === n
              return (
                <button
                  key={n}
                  onClick={() => update({ itemsPerPage: n })}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-r border-[var(--border-main)] last:border-r-0",
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                  )}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Se aplica a leads, clientes, facturas y todas las listas de la app.
          </p>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-4">Los cambios se guardan automáticamente.</p>
      </div>
    </div>
  )
}
