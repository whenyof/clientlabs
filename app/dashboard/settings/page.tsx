"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { BackupsPanel } from "./components/BackupsPanel"
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
  limits:        BackupsPanel,
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

function SettingsContent() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get("section") || "account"
  const ActiveComponent = sections[activeSection] ?? ProfileForm

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
        <span style={{ fontSize: 12, color: C.ink3 }}>Los cambios se guardan automáticamente</span>
      </div>

      {/* ── CONTENT (la navegación de ajustes vive ahora en el sidebar) ──── */}
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
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <SettingsContent />
    </Suspense>
  )
}
