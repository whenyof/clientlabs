"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { usePlan } from "@/hooks/use-plan"
import { useTour } from "@/components/tour/TourContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Target,
  CheckSquare,
  DollarSign,
  BarChart3,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Sparkles,
  Crown,
  Link2,
  Lock,
  Receipt,
  Megaphone,
  LogOut,
  Landmark,
  ShoppingCart,
  FileText,
  Wallet,
  Banknote,
  Wrench,
  UserPlus,
  Radio,
  Globe,
  Code2,
  Activity,
} from "lucide-react"

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
  /** Called when a nav item is clicked — used to close mobile drawer */
  onNavItemClick?: () => void
}

interface SubItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string
  count?: number
  children?: SubItem[]
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

// ─── NavItem ────────────────────────────────────────────────────────────────

function NavItem({
  item,
  isCollapsed,
  onNavigate,
  isTourHighlighted,
}: {
  item: MenuItem
  isCollapsed: boolean
  onNavigate?: () => void
  isTourHighlighted?: boolean
}) {
  const pathname = usePathname()
  const hasChildren = !!item.children?.length

  const isChildActive = hasChildren
    ? item.children!.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/")
      )
    : false

  const [open, setOpen] = useState(isChildActive)

  useEffect(() => {
    if (isChildActive) setOpen(true)
  }, [pathname, isChildActive])

  const isActive = item.href
    ? pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
    : false

  const Icon = item.icon

  // ── Dropdown parent ──────────────────────────────────────────────────────
  if (hasChildren) {
    return (
      <div className="relative">
        {isTourHighlighted && (
          <span
            className="absolute inset-0 rounded-r-md pointer-events-none z-10 animate-[tour-pulse_1.6s_ease-in-out_infinite]"
            style={{ boxShadow: "0 0 0 2px #1FA97A, 0 0 12px rgba(31,169,122,0.4)" }}
          />
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-r-md transition-all border-l-[4px]",
            isChildActive
              ? "text-[var(--accent)] font-medium border-[var(--accent)] bg-[var(--accent-soft)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border-transparent",
            isTourHighlighted ? "bg-[#1FA97A]/8 text-[#1FA97A]" : ""
          )}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase mr-1">
                  {item.badge}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  open ? "rotate-0" : "-rotate-90"
                )}
              />
            </>
          )}
        </button>

        {open && !isCollapsed && (
          <div className="ml-[22px] mt-0.5 mb-1 space-y-0.5 border-l border-white/[0.08] pl-3">
            {item.children!.map((child) => {
              const childActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/")
              const ChildIcon = child.icon
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] transition-colors",
                    childActive
                      ? "bg-[#1FA97A]/15 text-[#1FA97A] font-medium"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  )}
                >
                  {ChildIcon ? (
                    <ChildIcon className="h-[14px] w-[14px] shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                  )}
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Direct link ──────────────────────────────────────────────────────────
  return (
    <div className="relative">
      {isTourHighlighted && (
        <span
          className="absolute inset-0 rounded-r-md pointer-events-none z-10 animate-[tour-pulse_1.6s_ease-in-out_infinite]"
          style={{ boxShadow: "0 0 0 2px #1FA97A, 0 0 12px rgba(31,169,122,0.4)" }}
        />
      )}
      {isTourHighlighted && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-[#1FA97A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          AQUÍ
        </span>
      )}
      <Link
        href={item.href!}
        onClick={onNavigate}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-r-md transition-all border-l-[4px]",
          isActive
            ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium border-[var(--accent)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border-transparent",
          isTourHighlighted ? "bg-[#1FA97A]/8 text-[#1FA97A]" : ""
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!isCollapsed && (
          <div className="flex justify-between w-full items-center">
            <span>{item.label}</span>
            <div className="flex items-center gap-1">
              {item.count !== undefined && item.count > 0 && (
                <span
                  className="text-xs px-2 rounded-full font-semibold"
                  style={{
                    background:
                      item.href === "/dashboard/tasks"
                        ? "#FEF2F2"
                        : "var(--accent-soft)",
                    color:
                      item.href === "/dashboard/tasks"
                        ? "#EF4444"
                        : "var(--accent)",
                  }}
                >
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="text-[9px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapsed,
  onNavItemClick,
}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { labels } = useSectorConfig()
  const { active: tourActive, currentStep: tourStep } = useTour()
  const nav = labels.nav
  const isAdmin = session?.user?.role === "ADMIN"

  const [urgentCount, setUrgentCount] = useState(0)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/tasks/kpis")
      .then((r) => r.json())
      .then((d) => setUrgentCount(d?.urgent ?? 0))
      .catch(() => {})
  }, [session?.user?.id])

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
        { label: nav.dashboard, icon: LayoutDashboard, href: "/dashboard" },
        { label: nav.leads, icon: Target, href: "/dashboard/leads" },
        { label: nav.clients, icon: Users, href: "/dashboard/clients" },
        { label: nav.providers, icon: Building2, href: "/dashboard/providers" },
        {
          label: nav.tasks,
          icon: CheckSquare,
          href: "/dashboard/tasks",
          count: urgentCount || undefined,
        },
        {
          label: nav.finance,
          icon: DollarSign,
          children: [
            { label: "Resumen", href: "/dashboard/finance", icon: BarChart3 },
            { label: "Facturación", href: "/dashboard/finance/invoicing", icon: FileText },
            { label: "Gastos", href: "/dashboard/finance/gastos", icon: Receipt },
          ],
        },
      ],
    },
    {
      title: "INTELIGENCIA",
      items: [
        { label: "Automatizaciones", icon: Zap, href: "/dashboard/automatizaciones" },
        { label: "Marketing", icon: Megaphone, href: "/dashboard/marketing" },
        {
          label: "Conectar",
          icon: Link2,
          children: [
            { label: "Analíticas", href: "/dashboard/connect/analytics", icon: Activity },
            { label: "Conexiones", href: "/dashboard/connect", icon: Globe },
          ],
        },
      ],
    },
    {
      title: "SISTEMA",
      items: [
        { label: nav.settings, icon: Settings, href: "/dashboard/settings" },
      ],
    },
  ]

  if (isAdmin) {
    menu.push({
      title: "ADMIN",
      items: [{ label: "Admin Panel", icon: Crown, href: "/admin" }],
    })
  }

  return (
    <>
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
          {menu.map((group, groupIdx) => (
            <div key={group.title}>
              {!isCollapsed && (
                <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-2">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const itemHref = item.href ?? item.children?.[0]?.href ?? ""
                  const isTourHighlighted =
                    tourActive && tourStep.href === itemHref
                  return (
                    <NavItem
                      key={item.label}
                      item={item}
                      isCollapsed={isCollapsed}
                      onNavigate={onNavItemClick}
                      isTourHighlighted={isTourHighlighted}
                    />
                  )
                })}
              </div>

              {/* PRÓXIMAMENTE — inserted after the last non-admin group */}
              {groupIdx === menu.length - (isAdmin ? 2 : 1) && (
                <div className="mt-3">
                  {!isCollapsed && (
                    <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2 px-2 opacity-60">
                      Próximamente
                    </p>
                  )}
                  {[
                    { icon: Sparkles, label: labels.aiAssistant.title },
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
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "var(--bg-surface)",
                              border: "0.5px solid var(--border-subtle)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            <Lock size={9} />
                            Pronto
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">
          {/* USER */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center text-[var(--accent)] font-bold overflow-hidden shrink-0">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">
                  {session?.user?.name?.charAt(0)?.toUpperCase() ||
                    session?.user?.email?.charAt(0)?.toUpperCase() ||
                    "U"}
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

            <button
              onClick={() => setShowLogoutModal(true)}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>

          {/* PLAN */}
          {!isCollapsed && session?.user?.plan && (() => {
            const plan = session.user.plan.toUpperCase()
            const isFree = plan === "FREE"
            const isPro = plan === "PRO"
            return (
              <button
                onClick={() => router.push("/precios")}
                className="w-full group flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Crown size={14} className={`shrink-0 ${isFree ? "text-slate-400" : isPro ? "text-[#1FA97A]" : "text-amber-500"}`} />
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--text-primary)] leading-tight truncate">
                      Plan {isFree ? "Free" : isPro ? "Pro" : "Business"}
                    </p>
                    <p className="text-[10px] text-[var(--accent)] leading-tight">Cambiar plan</p>
                  </div>
                </div>
                <ChevronRight size={12} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
              </button>
            )
          })()}
        </div>
      </motion.aside>

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 mx-auto mb-4">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] text-center mb-1">
              ¿Cerrar sesión?
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] text-center mb-6">
              Se cerrará tu sesión en este dispositivo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl text-[13.5px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/auth" })}
                className="flex-1 py-2.5 rounded-xl text-[13.5px] font-semibold text-white bg-red-500 hover:bg-red-600 transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
