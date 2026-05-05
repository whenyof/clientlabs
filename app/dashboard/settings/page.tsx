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
import { InvoicingSettings } from "./components/InvoicingSettings"
import { SubscriptionSettings } from "./components/SubscriptionSettings"

const sections: Record<string, React.ComponentType> = {
  // Primary sections
  account:       ProfileForm,
  company:       CompanySettings,
  team:          TeamMembers,
  invoicing:     InvoicingSettings,
  subscription:  SubscriptionSettings,
  notifications: NotificationSettings,
  limits:        UsageLimits,
  // Secondary sections
  security:    SecuritySettings,
  appearance:  AppearanceSettings,
  activity:    ActivityLogSection,
  permissions: PermissionsPanel,
  catalog:     ProductCatalog,
  danger:      DangerZone,
  // Backward-compat aliases
  profile:    ProfileForm,
  verifactu:  InvoicingSettings,
  plans:      SubscriptionSettings,
  billing:    SubscriptionSettings,
  usage:      UsageLimits,
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get("section") || "account"
  const ActiveComponent = sections[activeSection] ?? ProfileForm

  return (
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
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <SettingsContent />
    </Suspense>
  )
}
