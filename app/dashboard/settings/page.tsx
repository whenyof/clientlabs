"use client"

import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileForm } from "./components/ProfileForm"
import { SecuritySettings } from "./components/SecuritySettings"
import { CompanySettings } from "./components/CompanySettings"
import { NotificationSettings } from "./components/NotificationSettings"
import { TeamMembers } from "./components/TeamMembers"
import { PermissionsPanel } from "./components/PermissionsPanel"
import { PlansSection } from "./components/PlansSection"
import { BillingHistory } from "./components/BillingHistory"
import { UsageLimits } from "./components/UsageLimits"
import { AppearanceSettings } from "./components/AppearanceSettings"
import { DangerZone } from "./components/DangerZone"

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('section') || 'profile'

  const sections = [
    { id: 'profile', component: ProfileForm },
    { id: 'security', component: SecuritySettings },
    { id: 'company', component: CompanySettings },
    { id: 'notifications', component: NotificationSettings },
    { id: 'team', component: TeamMembers },
    { id: 'permissions', component: PermissionsPanel },
    { id: 'plans', component: PlansSection },
    { id: 'billing', component: BillingHistory },
    { id: 'usage', component: UsageLimits },
    { id: 'appearance', component: AppearanceSettings },
    { id: 'danger', component: DangerZone },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || ProfileForm

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