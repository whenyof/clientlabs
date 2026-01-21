"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  CheckSquare,
  DollarSign,
  CreditCard,
  BarChart3,
  Zap,
  Settings,
  Plug,
  Bell,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles
} from "lucide-react"

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}

interface BadgeProps {
  variant: 'pro' | 'beta' | 'premium'
}

function Badge({ variant }: BadgeProps) {
  const variants = {
    pro: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    beta: 'bg-cyan-500 text-white',
    premium: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
  }

  const labels = {
    pro: 'PRO',
    beta: 'BETA',
    premium: 'PREMIUM'
  }

  return (
    <span className={`
      text-xs font-bold px-2 py-0.5 rounded-full
      ${variants[variant]}
    `}>
      {labels[variant]}
    </span>
  )
}

interface MenuItem {
  label: string
  href: string
  icon: any
  count?: number
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menu: MenuGroup[] = [
  {
    title: "CORE",
    items: [
      { label: "Dashboard", href: "/dashboard/other", icon: LayoutDashboard },
      { label: "Leads", href: "/dashboard/other/leads", icon: Target },
      { label: "Clientes", href: "/dashboard/other/clients", icon: Users },
      { label: "Proveedores", href: "/dashboard/other/providers", icon: Building2 },
      { label: "Ventas", href: "/dashboard/other/sales", icon: TrendingUp },
      { label: "Tareas", href: "/dashboard/other/tasks", icon: CheckSquare, count: 23 },
      { label: "Finanzas", href: "/dashboard/other/finance", icon: DollarSign },
      { label: "Facturación", href: "/dashboard/other/billing", icon: CreditCard },
    ],
  },
  {
    title: "INTELIGENCIA",
    items: [
      { label: "Analytics", href: "/dashboard/other/analytics", icon: BarChart3 },
      { label: "Automatizaciones", href: "/dashboard/other/automations", icon: Zap },
      { label: "IA Assistant", href: "/dashboard/other/ai-assistant", icon: Sparkles },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { label: "Integraciones", href: "/dashboard/other/integrations", icon: Plug },
      { label: "Ajustes", href: "/dashboard/other/settings", icon: Settings },
    ],
  },
]

export default function Sidebar({ isCollapsed = false, onToggleCollapsed }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-screen bg-[#0e1424]/95 backdrop-blur-xl border-r border-white/10 flex flex-col shrink-0"
    >

      {/* HEADER */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">

        {!isCollapsed && (
          <span className="text-white font-bold text-lg">
            Client<span className="text-purple-400">Labs</span>
          </span>
        )}

        <div className="flex items-center gap-2">

          {/* NOTIFICATIONS */}
          <button
            onClick={() => router.push("/dashboard/other/notifications")}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Bell size={18} className="text-white/70" />
          </button>

          {/* COLLAPSE */}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              {isCollapsed ? (
                <ChevronRight size={18} className="text-white/70" />
              ) : (
                <ChevronLeft size={18} className="text-white/70" />
              )}
            </button>
          )}

        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {menu.map((group) => (
          <div key={group.title}>

            {!isCollapsed && (
              <p className="text-xs uppercase tracking-widest text-white/40 mb-2 px-2">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      transition
                      ${
                        active
                          ? "bg-purple-600/20 text-purple-400"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <Icon size={18} />

                    {!isCollapsed && (
                      <div className="flex justify-between w-full">
                        <span>{item.label}</span>

                        {item.count && (
                          <span className="bg-purple-500/20 text-purple-400 text-xs px-2 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-white/10 p-4 space-y-3">

        {/* USER */}
        <div className="flex items-center gap-3">

          {/* AVATAR */}
          <div className="h-9 w-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            U
          </div>

          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Usuario</p>
              <p className="text-xs text-white/60">user@email.com</p>
            </div>
          )}

        </div>

        {/* PLAN */}
        {!isCollapsed && (
          <button
            onClick={() => router.push("/dashboard/other/billing")}
            className="w-full text-left text-xs text-purple-400 hover:text-purple-300"
          >
            Plan: <b>PRO</b> → Cambiar plan
          </button>
        )}

      </div>

    </motion.aside>
  )
}