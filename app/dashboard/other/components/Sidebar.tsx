"use client"

import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useSectorConfig } from "@/hooks/useSectorConfig"
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
  ShieldCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  Crown
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

export default function Sidebar({ isCollapsed = false, onToggleCollapsed }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { labels } = useSectorConfig()
  const nav = labels.nav
  const isAdmin = session?.user?.role === "ADMIN"

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="w-64 bg-[#0e1424]/95 backdrop-blur-xl border-r border-white/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  const menu: MenuGroup[] = [
    {
      title: "CORE",
      items: [
        { label: nav.dashboard, href: "/dashboard/other", icon: LayoutDashboard },
        { label: nav.leads, href: "/dashboard/other/leads", icon: Target },
        { label: nav.clients, href: "/dashboard/clients", icon: Users },
        { label: nav.providers, href: "/dashboard/providers", icon: Building2 },
        { label: nav.tasks, href: "/dashboard/tasks", icon: CheckSquare },
        { label: nav.finance, href: "/dashboard/finance", icon: DollarSign },
      ],
    },
    {
      title: "INTELIGENCIA",
      items: [
        { label: nav.analytics, href: "/dashboard/other/analytics", icon: BarChart3 },
        { label: labels.automations.title, href: "/dashboard/other/automations", icon: Zap },
        { label: labels.aiAssistant.title, href: "/dashboard/other/ai-assistant", icon: Sparkles },
      ],
    },
    {
      title: "SISTEMA",
      items: [
        { label: nav.integrations, href: "/dashboard/other/integrations", icon: Plug },
        ...(session?.user?.plan === "PRO" || session?.user?.plan === "ENTERPRISE" || isAdmin
          ? [{ label: "Sistema de Backups", href: "/dashboard/other/system/backups", icon: ShieldCheck }]
          : []
        ),
        { label: nav.settings, href: "/dashboard/other/settings", icon: Settings },
      ],
    },
  ]

  // Add admin section if user is admin
  if (isAdmin) {
    menu.push({
      title: "ADMIN",
      items: [
        { label: "Admin Panel", href: "/admin", icon: Crown },
      ],
    })
  }

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
                  key={`${group.title}-${item.href}`}
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
          <div className="h-9 w-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">
                {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-white/60 truncate">
                {session?.user?.email || "user@email.com"}
              </p>
            </div>
          )}
        </div>

        {/* PLAN */}
        {!isCollapsed && session?.user?.plan && (
          <button
            onClick={() => router.push("/dashboard/finance/billing")}
            className="w-full text-left text-xs text-purple-400 hover:text-purple-300"
          >
            Plan: <b>{session.user.plan.toUpperCase()}</b> → Cambiar plan
          </button>
        )}

      </div>

    </motion.aside>
  )
}