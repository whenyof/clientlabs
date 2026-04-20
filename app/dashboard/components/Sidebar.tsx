"use client"

import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
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
  ShieldCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  Crown,
  Link2,
  Lock,
  Receipt,
  Megaphone,
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
    pro: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-[var(--text-primary)]',
    beta: 'bg-teal-500 text-[var(--text-primary)]',
    premium: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-[var(--text-primary)]'
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

  const [urgentCount, setUrgentCount] = useState(0)
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/tasks/kpis")
      .then((r) => r.json())
      .then((d) => setUrgentCount(d?.urgent ?? 0))
      .catch(() => {})
  }, [session?.user?.id])

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
        { label: nav.tasks, href: "/dashboard/tasks", icon: CheckSquare, count: urgentCount || undefined },
        { label: nav.finance, href: "/dashboard/finance", icon: DollarSign },
      ],
    },
    {
      title: "INTELIGENCIA",
      items: [
        { label: "Automatizaciones", href: "/dashboard/automatizaciones", icon: Zap },
        { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
        { label: "Conectar", href: "/dashboard/connect", icon: Link2 },
      ],
    },
    {
      title: "SISTEMA",
      items: [
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
      className="h-screen bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col shrink-0"
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
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* CORE + rest of menu groups */}
        {menu.map((group, groupIdx) => (
          <>
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
                        w-full flex items-center gap-3 px-3 py-2 text-sm rounded-r-md
                        transition-all
                        ${active
                          ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium border-l-[4px] border-[var(--accent)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border-l-[4px] border-transparent"
                        }
                      `}
                    >
                      <Icon size={18} />

                      {!isCollapsed && (
                        <div className="flex justify-between w-full">
                          <span>{item.label}</span>

                          {item.count && (
                            <span
                              className="text-xs px-2 rounded-full font-semibold"
                              style={{
                                background: item.href === "/dashboard/tasks" ? "#FEF2F2" : "var(--accent-soft)",
                                color: item.href === "/dashboard/tasks" ? "#EF4444" : "var(--accent)",
                              }}
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

            {/* PRÓXIMAMENTE — inserted after SISTEMA (last non-admin group) */}
            {groupIdx === menu.length - (isAdmin ? 2 : 1) && (
              <div key="proximamente">
                {!isCollapsed && (
                  <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-2 opacity-60">
                    Próximamente
                  </p>
                )}
                {[
                  { icon: Zap,      label: labels.automations.title },
                  { icon: Sparkles, label: labels.aiAssistant.title },
                  { icon: Receipt,  label: "Verifactu" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    title={isCollapsed ? `${label} — Próximamente` : undefined}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-r-md border-l-[4px] border-transparent opacity-45 cursor-not-allowed select-none"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Icon size={18} />
                    {!isCollapsed && (
                      <div className="flex justify-between w-full items-center">
                        <span>{label}</span>
                        <span style={{
                          display: "flex", alignItems: "center", gap: 3,
                          fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
                          padding: "2px 6px", borderRadius: 4,
                          background: "var(--bg-surface)",
                          border: "0.5px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}>
                          <Lock size={9} />
                          Pronto
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">

        {/* USER */}
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="h-9 w-9 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--accent)] font-bold overflow-hidden">
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
            className="w-full text-left text-xs text-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
          >
            Plan: <b>{session.user.plan.toUpperCase()}</b>
          </button>
        )}

      </div>

    </motion.aside>
  )
}