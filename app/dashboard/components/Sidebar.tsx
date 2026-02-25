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
    pro: 'bg-gradient-to-r from-purple-500 to-pink-500 text-[var(--text-primary)]',
    beta: 'bg-cyan-500 text-[var(--text-primary)]',
    premium: 'bg-gradient-to-r from-amber-400 to-orange-500 text-[var(--text-primary)]'
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
      <div className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    )
  }

  const menu: MenuGroup[] = [
    {
      title: "CORE",
      items: [
        { label: nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { label: nav.leads, href: "/dashboard/leads", icon: Target },
        { label: nav.clients, href: "/dashboard/clients", icon: Users },
        { label: nav.providers, href: "/dashboard/providers", icon: Building2 },
        { label: nav.tasks, href: "/dashboard/tasks", icon: CheckSquare },
        { label: nav.finance, href: "/dashboard/finance", icon: DollarSign },
      ],
    },
    {
      title: "INTELIGENCIA",
      items: [
        { label: labels.automations.title, href: "/dashboard/automations", icon: Zap },
        { label: labels.aiAssistant.title, href: "/dashboard/ai-assistant", icon: Sparkles },
      ],
    },
    {
      title: "SISTEMA",
      items: [
        { label: nav.integrations, href: "/dashboard/integrations", icon: Plug },
        ...(session?.user?.plan === "PRO" || session?.user?.plan === "ENTERPRISE" || isAdmin
          ? [{ label: "Sistema de Backups", href: "/dashboard/system/backups", icon: ShieldCheck }]
          : []
        ),
        { label: nav.settings, href: "/dashboard/settings", icon: Settings },
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
      className="h-screen bg-[var(--bg-card)] border-r border-[var(--border-subtle)] shadow-[var(--shadow-sidebar)] flex flex-col shrink-0"
    >

      {/* HEADER */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">

        {!isCollapsed && (
          <span className="text-[var(--text-primary)] font-bold text-lg">
            Client<span className="text-[var(--accent)]">Labs</span>
          </span>
        )}

        <div className="flex items-center gap-2">

          {/* NOTIFICATIONS */}
          <button
            onClick={() => router.push("/dashboard/notifications")}
            className="p-2 rounded-lg hover:bg-[var(--border-subtle)]"
          >
            <Bell size={18} className="text-[var(--text-secondary)]" />
          </button>

          {/* COLLAPSE */}
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              className="p-2 rounded-lg hover:bg-[var(--border-subtle)]"
            >
              {isCollapsed ? (
                <ChevronRight size={18} className="text-[var(--text-secondary)]" />
              ) : (
                <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
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
              <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-2">
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
                      w-full flex items-center gap-3 px-3 py-2 text-sm
                      transition-all
                      ${active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium border-l-[3px] border-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] border-l-[3px] border-transparent"
                      }
                    `}
                  >
                    <Icon size={18} />

                    {!isCollapsed && (
                      <div className="flex justify-between w-full">
                        <span>{item.label}</span>

                        {item.count && (
                          <span
                            className="bg-[var(--accent-soft)] text-[var(--accent)] text-xs px-2 rounded-full"
                          >
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
      <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">

        {/* USER */}
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="h-9 w-9 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--accent)] font-bold overflow-hidden">
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
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {session?.user?.email || "user@email.com"}
              </p>
            </div>
          )}
        </div>

        {/* PLAN */}
        {!isCollapsed && session?.user?.plan && (
          <button
            onClick={() => router.push("/dashboard/finance/billing")}
            className="w-full text-left text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            Plan: <b>{session.user.plan.toUpperCase()}</b> → Cambiar plan
          </button>
        )}

      </div>

    </motion.aside>
  )
}