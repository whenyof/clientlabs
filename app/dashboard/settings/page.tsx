"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Save } from "lucide-react"
import { ProfileForm } from "./components/ProfileForm"
import { SecuritySettings } from "./components/SecuritySettings"
import { CompanySettings } from "./components/CompanySettings"
import { NotificationSettings } from "./components/NotificationSettings"
import { TeamMembers } from "./components/TeamMembers"
import { PermissionsPanel } from "./components/PermissionsPanel"
import { UsageLimits } from "./components/UsageLimits"
import { AppearanceSettings } from "./components/AppearanceSettings"
import { DangerZone } from "./components/DangerZone"
import { ProductCatalog } from "./components/ProductCatalog"
import { ActivityLogSection } from "./components/ActivityLogSection"
import { InvoicingConfig } from "./components/InvoicingConfig"
import { ImportExportPanel } from "./components/ImportExportPanel"
import { InvoiceTemplates } from "./components/InvoiceTemplates"
import { VerifactuSettings } from "./components/VerifactuSettings"
import { SubscriptionSettings } from "./components/SubscriptionSettings"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff", bg2: "#fafafa", bg3: "#f5f5f5",
  ink: "#0a0a0a", ink2: "#404040", ink3: "#737373", ink4: "#a3a3a3", ink5: "#d4d4d4",
  line: "#e8e8e8", line2: "#eeeeee",
  accent: "#16986e", accentSoft: "#ecf6f1",
  warn: "#c2410c", warnSoft: "#fef3eb",
  red: "#b91c1c",
}

// ─── Section registry ──────────────────────────────────────────────────────
const sections: Record<string, React.ComponentType> = {
  account:       ProfileForm,
  company:       CompanySettings,
  team:          TeamMembers,
  invoicing:     InvoicingConfig,
  subscription:  SubscriptionSettings,
  notifications: NotificationSettings,
  limits:        UsageLimits,
  security:      SecuritySettings,
  appearance:    AppearanceSettings,
  activity:      ActivityLogSection,
  permissions:   PermissionsPanel,
  catalog:       ProductCatalog,
  danger:        DangerZone,
  // Aliases
  profile:          ProfileForm,
  verifactu:        VerifactuSettings,
  templates:        InvoiceTemplates,
  "import-export":  ImportExportPanel,
  plans:            SubscriptionSettings,
  billing:          SubscriptionSettings,
  usage:            UsageLimits,
}

// ─── Left nav structure ─────────────────────────────────────────────────────
const NAV_GROUPS = [
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
      { id: "permissions", label: "SSO · SAML", soon: true },
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

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeSection = searchParams.get("section") || "account"
  const ActiveComponent = sections[activeSection] ?? ProfileForm

  const setSection = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("section", id)
    router.push(`/dashboard/settings?${params.toString()}`)
  }

  return (
    <div style={{ fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)" }}>
      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, paddingBottom: 18, borderBottom: `1px solid ${C.line2}` }}>
        <div>
          <h1 style={{ fontWeight: 600, letterSpacing: "-0.022em", fontSize: 26, lineHeight: 1.1, margin: 0, color: C.ink }}>Ajustes</h1>
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: C.ink3, flexWrap: "wrap" }}>
            <span>Workspace: <strong style={{ color: C.ink }}>Estudio Vega</strong></span>
            <span style={{ color: C.ink5 }}>·</span>
            <span style={{ fontFamily: "ui-monospace,monospace" }}>Plan Business · renueva 15 nov 2026</span>
            <span style={{ color: C.ink5 }}>·</span>
            <span>Última modificación · hace 2 min</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.bg, border: `1px solid ${C.line}`, color: C.ink2, fontWeight: 550, fontSize: 12.5, cursor: "pointer" }}>
            <RefreshCw size={12} strokeWidth={2} />Descartar cambios
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 6, background: C.ink, color: "white", fontWeight: 550, fontSize: 12.5, border: "none", cursor: "pointer" }}>
            <Save size={12} strokeWidth={2} />Guardar
          </button>
        </div>
      </div>

      {/* ── LAYOUT: LEFT NAV + CONTENT ────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left nav */}
        <nav style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", position: "sticky", top: 16 }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title} style={{ borderBottom: gi < NAV_GROUPS.length - 1 ? `1px solid ${C.line2}` : "none" }}>
              <div style={{ padding: "10px 14px 6px", fontFamily: "ui-monospace,monospace", fontSize: 9.5, fontWeight: 500, color: C.ink4, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {group.title}
              </div>
              {group.items.map(item => {
                const isActive = activeSection === item.id
                const itemColor = (item as { danger?: boolean }).danger ? C.red : (item as { warn?: boolean }).warn ? C.warn : C.ink2
                return (
                  <button
                    key={`${group.title}-${item.id}`}
                    onClick={() => setSection(item.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "7px 14px",
                      fontSize: 13, fontWeight: isActive ? 550 : 450,
                      color: isActive ? C.ink : itemColor,
                      background: isActive ? C.bg3 : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left",
                      transition: "background .1s ease, color .1s ease",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = C.bg2 }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    <span>{item.label}</span>
                    {(item as { warn?: boolean }).warn && (
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 99, background: C.warnSoft, color: C.warn, fontWeight: 600, letterSpacing: "0.04em" }}>PDTE.</span>
                    )}
                    {(item as { soon?: boolean }).soon && (
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 9, padding: "1px 5px", borderRadius: 99, background: C.bg3, color: C.ink4, fontWeight: 600, letterSpacing: "0.04em" }}>PRONTO</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Section content */}
        <div style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <SettingsContent />
    </Suspense>
  )
}
