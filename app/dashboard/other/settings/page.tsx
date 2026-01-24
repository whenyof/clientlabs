"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardContainer } from "@/components/layout/DashboardContainer"
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
import {
  UserIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BellIcon,
  UsersIcon,
  KeyIcon,
  CreditCardIcon,
  ChartBarIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', label: 'Perfil', icon: UserIcon, component: ProfileForm },
    { id: 'security', label: 'Seguridad', icon: ShieldCheckIcon, component: SecuritySettings },
    { id: 'company', label: 'Empresa', icon: BuildingOfficeIcon, component: CompanySettings },
    { id: 'notifications', label: 'Notificaciones', icon: BellIcon, component: NotificationSettings },
    { id: 'team', label: 'Equipo', icon: UsersIcon, component: TeamMembers },
    { id: 'permissions', label: 'Permisos', icon: KeyIcon, component: PermissionsPanel, pro: true },
    { id: 'plans', label: 'Planes', icon: CreditCardIcon, component: PlansSection },
    { id: 'billing', label: 'Facturación', icon: ChartBarIcon, component: BillingHistory },
    { id: 'usage', label: 'Límites', icon: ChartBarIcon, component: UsageLimits },
    { id: 'appearance', label: 'Apariencia', icon: PaintBrushIcon, component: AppearanceSettings },
    { id: 'danger', label: 'Zona Peligrosa', icon: ExclamationTriangleIcon, component: DangerZone, danger: true },
  ]

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || ProfileForm

  return (
    <DashboardContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Configuración</h1>
        <p className="text-sm text-white/60">
          Gestiona tu cuenta, equipo, facturación y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sticky top-6">
            <nav className="space-y-2">
              {sections.map((section, index) => {
                const Icon = section.icon
                const isActive = activeSection === section.id

                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300
                      ${isActive
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }
                      ${section.danger ? 'text-red-400 hover:text-red-300' : ''}
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.label}</span>
                    {section.pro && (
                      <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                        PRO
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="lg:col-span-3"
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <ActiveComponent />
          </div>
        </motion.div>
      </div>
    </DashboardContainer>
  )
}