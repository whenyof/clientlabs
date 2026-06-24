// Estructura de navegación de Ajustes — fuente de verdad compartida entre el
// sidebar (app/dashboard/components/Sidebar.tsx) y la página de ajustes
// (app/dashboard/settings/page.tsx). Cada item navega a /dashboard/settings?section=<id>.

export type SettingsNavItem = {
  id: string
  label: string
  warn?: boolean
  danger?: boolean
  soon?: boolean
}

export type SettingsNavGroup = {
  title: string
  items: SettingsNavItem[]
}

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    title: "Workspace",
    items: [
      { id: "company",      label: "General" },
      { id: "team",         label: "Equipo y permisos" },
      { id: "subscription", label: "Plan y facturación" },
    ],
  },
  {
    title: "Facturación",
    items: [
      { id: "invoicing",  label: "Configuración de facturación" },
      { id: "templates",  label: "Plantillas de factura" },
      { id: "verifactu",  label: "Verifactu" },
    ],
  },
  {
    title: "Apariencia",
    items: [
      { id: "appearance", label: "Marca y apariencia" },
    ],
  },
  {
    title: "Productos y datos",
    items: [
      { id: "catalog",        label: "Mis productos y servicios" },
      { id: "import-export",  label: "Importar / Exportar" },
      { id: "limits",         label: "Backups" },
    ],
  },
  {
    title: "Notificaciones",
    items: [
      { id: "notifications", label: "Avisos del producto" },
    ],
  },
  {
    title: "Seguridad",
    items: [
      { id: "security",    label: "Doble factor (2FA)", warn: true },
      { id: "activity",    label: "Auditoría · registro" },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { id: "account", label: "Mi perfil" },
      { id: "danger",  label: "Zona de peligro", danger: true },
    ],
  },
]
