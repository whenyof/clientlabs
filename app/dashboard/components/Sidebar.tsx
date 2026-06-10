"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import {
  LayoutDashboard,
  Target,
  Users,
  Truck,
  CheckSquare,
  Receipt,
  Megaphone,
  Zap,
  BarChart3,
  Sparkles,
  Plug2,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  ChevronsUpDown,
  Check,
  Plus,
} from "lucide-react"

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  bg2: "#fafafa",
  bg3: "#f5f5f5",
  ink: "#0a0a0a",
  ink2: "#404040",
  ink3: "#737373",
  ink4: "#a3a3a3",
  ink5: "#d4d4d4",
  line: "#e8e8e8",
  line2: "#eeeeee",
  accent: "#16986e",
  accentSoft: "#ecf6f1",
  accentInk: "#0d7a56",
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
  onNavItemClick?: () => void
}

type Sub = { label: string; href: string }

type NavItem = {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  href?: string
  badge?: string
  badgeHot?: boolean
  subs?: Sub[]
}

type NavGroup = { title: string; items: NavItem[] }

// ─── Navigation structure ────────────────────────────────────────────────────

const NAV: NavGroup[] = [
  {
    title: "Core",
    items: [
      { id: "dash", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ],
  },
  {
    title: "Ventas",
    items: [
      { id: "leads", label: "Leads", icon: Target, href: "/dashboard/leads" },
      { id: "clients",   label: "Clientes",    icon: Users, href: "/dashboard/clients" },
      { id: "providers", label: "Proveedores", icon: Truck, href: "/dashboard/providers" },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { id: "tasks", label: "Tareas y proyectos", icon: CheckSquare, badgeHot: true, href: "/dashboard/tasks" },
      {
        id: "finance",
        label: "Facturación",
        icon: Receipt,
        subs: [
          { label: "Resumen",                 href: "/dashboard/finance?tab=resumen" },
          { label: "Facturas emitidas",       href: "/dashboard/finance?tab=facturas" },
          { label: "Presupuestos",            href: "/dashboard/finance?tab=presupuestos" },
          { label: "Albaranes",               href: "/dashboard/finance?tab=albaranes" },
          { label: "Pedidos",                 href: "/dashboard/finance?tab=pedidos" },
          { label: "Recurrentes",             href: "/dashboard/finance?tab=recurrentes" },
          { label: "Gastos · Compras",        href: "/dashboard/finance?tab=gastos" },
          { label: "Productos · Servicios",   href: "/dashboard/finance?tab=productos" },
          { label: "Impuestos · IVA/IRPF",    href: "/dashboard/finance?tab=impuestos" },
          { label: "Verifactu · AEAT",        href: "/dashboard/finance?tab=verifactu" },
          { label: "Configuración",           href: "/dashboard/finance?tab=configuracion" },
        ],
      },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      { id: "marketing", label: "Email Marketing", icon: Megaphone, href: "/dashboard/marketing" },
      { id: "auto", label: "Automatizaciones", icon: Zap, href: "/dashboard/automations" },
      { id: "reports", label: "Informes", icon: BarChart3, href: "/dashboard/reporting" },
      { id: "ai", label: "Asistente IA", icon: Sparkles, href: "/dashboard/ai-assistant" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { id: "team",     label: "Equipo",        icon: Users,     href: "/dashboard/team" },
      { id: "integ",    label: "Integraciones",  icon: Plug2,     href: "/dashboard/integrations" },
      { id: "settings", label: "Ajustes",        icon: Settings,  href: "/dashboard/settings" },
    ],
  },
]

// ─── NavItem component ───────────────────────────────────────────────────────

function NavItemRow({
  item,
  pathname,
  isCollapsed,
  onNavItemClick,
}: {
  item: NavItem
  pathname: string
  isCollapsed: boolean
  onNavItemClick?: () => void
}) {
  const hasSubs = !!item.subs?.length

  const isActive = !hasSubs && item.href
    ? pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
    : false

  const isChildActive = hasSubs
    ? item.subs!.some(
        (s) => pathname === s.href || pathname.startsWith(s.href + "/")
      )
    : false

  const [open, setOpen] = useState(isChildActive)

  const Icon = item.icon

  const itemBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: isCollapsed ? "5px 6px" : "5px 10px",
    borderRadius: 6,
    fontSize: 13,
    letterSpacing: "-0.003em",
    whiteSpace: "nowrap",
    cursor: "pointer",
    width: "100%",
    justifyContent: isCollapsed ? "center" : "flex-start",
    transition: "background .1s ease, color .1s ease",
  }

  const activeStyle: React.CSSProperties = {
    background: C.bg,
    color: C.ink,
    fontWeight: 550,
    boxShadow: `0 0 0 1px ${C.line} inset, 0 1px 2px rgba(0,0,0,0.02)`,
  }

  const inactiveStyle: React.CSSProperties = {
    background: "transparent",
    color: C.ink2,
    fontWeight: 450,
  }

  if (hasSubs) {
    const isParentActive = isChildActive
    return (
      <>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            ...itemBase,
            ...( isParentActive ? activeStyle : inactiveStyle),
            border: "none",
          }}
          onMouseEnter={(e) => {
            if (!isParentActive) {
              const el = e.currentTarget as HTMLElement
              el.style.background = C.bg3
              el.style.color = C.ink
            }
          }}
          onMouseLeave={(e) => {
            if (!isParentActive) {
              const el = e.currentTarget as HTMLElement
              el.style.background = "transparent"
              el.style.color = C.ink2
            }
          }}
        >
          <span style={{ width: 16, height: 16, display: "grid", placeItems: "center", color: isParentActive ? C.ink : C.ink3, flexShrink: 0 }}>
            <Icon size={15} strokeWidth={1.7} />
          </span>
          {!isCollapsed && (
            <>
              <span style={{ flex: 1, textAlign: "left", color: "inherit" }}>{item.label}</span>
              {item.badgeHot && (
                <span style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10, padding: "1px 5px",
                  borderRadius: 99, background: C.ink, color: "white", fontWeight: 500,
                }}>!</span>
              )}
              {item.badge && !item.badgeHot && (
                <span style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 10, padding: "1px 5px",
                  borderRadius: 99, background: C.bg3, color: C.ink3, fontWeight: 500,
                }}>{item.badge}</span>
              )}
              <span style={{
                width: 12, height: 12, display: "flex", alignItems: "center",
                color: C.ink4,
                transform: open ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform .15s ease",
              }}>
                <ChevronRight size={11} strokeWidth={2} />
              </span>
            </>
          )}
        </button>

        {!isCollapsed && open && (
          <div style={{
            paddingLeft: 14,
            marginLeft: 12,
            borderLeft: `1px solid ${C.line2}`,
            marginTop: 2,
            marginBottom: 2,
          }}>
            {item.subs!.map((sub) => {
              const subActive = pathname === sub.href || pathname.startsWith(sub.href + "/")
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  onClick={onNavItemClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderRadius: 5,
                    fontSize: 12.5,
                    color: subActive ? C.ink : C.ink3,
                    fontWeight: subActive ? 550 : 450,
                    background: "transparent",
                    textDecoration: "none",
                    transition: "color .1s ease, background .1s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!subActive) {
                      const el = e.currentTarget as HTMLElement
                      el.style.color = C.ink
                      el.style.background = C.bg3
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!subActive) {
                      const el = e.currentTarget as HTMLElement
                      el.style.color = C.ink3
                      el.style.background = "transparent"
                    }
                  }}
                >
                  <span style={{
                    width: 4, height: 4, borderRadius: 99,
                    background: subActive ? C.accent : C.ink5,
                    marginRight: 9, flexShrink: 0, display: "inline-block",
                  }} />
                  {sub.label}
                </Link>
              )
            })}
          </div>
        )}
      </>
    )
  }

  // Direct link
  return (
    <Link
      href={item.href!}
      onClick={onNavItemClick}
      style={{
        ...itemBase,
        ...(isActive ? activeStyle : inactiveStyle),
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          const el = e.currentTarget as HTMLElement
          el.style.background = C.bg3
          el.style.color = C.ink
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          const el = e.currentTarget as HTMLElement
          el.style.background = "transparent"
          el.style.color = C.ink2
        }
      }}
    >
      <span style={{ width: 16, height: 16, display: "grid", placeItems: "center", color: isActive ? C.ink : C.ink3, flexShrink: 0 }}>
        <Icon size={15} strokeWidth={1.7} />
      </span>
      {!isCollapsed && (
        <>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge && !item.badgeHot && (
            <span style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 10, padding: "1px 5px",
              borderRadius: 99, background: C.bg3, color: C.ink3, fontWeight: 500,
            }}>{item.badge}</span>
          )}
        </>
      )}
    </Link>
  )
}

// ─── Main Sidebar component ──────────────────────────────────────────────────

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapsed,
  onNavItemClick,
}: SidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [wsOpen, setWsOpen] = useState(false)

  if (status === "loading") {
    return (
      <div style={{ width: "100%", height: "100%", background: C.bg2, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          border: `2px solid ${C.line}`,
          borderTopColor: C.accent,
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) }}`}</style>
      </div>
    )
  }

  const userName = session?.user?.name || "Usuario"
  const userEmail = session?.user?.email || ""
  const initials = userName
    .split(" ")
    .map((w: string) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orgName = (session?.user as any)?.organizationName as string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planName = (session?.user as any)?.plan as string | undefined

  const workspaceName = orgName || userName
  const workspaceInitials = workspaceName
    .split(" ")
    .map((w: string) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div style={{
      background: C.bg2,
      borderRight: `1px solid ${C.line2}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      width: "100%",
      height: "100%",
      fontSize: 13.5,
      lineHeight: 1.5,
    }}>
      {/* ── Brand header ────────────────────────────────── */}
      <div style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
        borderBottom: `1px solid ${C.line2}`,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          <img
            src="/clientlabs-icon-solid-green.svg"
            alt="ClientLabs"
            width={44}
            height={44}
            style={{ flexShrink: 0, borderRadius: 9 }}
          />
        </div>
        <button
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          style={{
            width: 22, height: 22,
            border: `1px solid ${C.line}`,
            borderRadius: 5,
            display: "grid", placeItems: "center",
            color: C.ink3, background: C.bg,
            cursor: "pointer",
            flexShrink: 0,
            marginLeft: isCollapsed ? 2 : 0,
          }}
        >
          {isCollapsed
            ? <ChevronRight size={11} strokeWidth={2.4} />
            : <ChevronLeft size={11} strokeWidth={2.4} />}
        </button>
      </div>

      {/* ── Workspace selector ──────────────────────────── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        {/* Backdrop */}
        {wsOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 9 }}
            onClick={() => setWsOpen(false)}
          />
        )}

        {/* Trigger */}
        {isCollapsed ? (
          <div
            onClick={() => setWsOpen(v => !v)}
            style={{
              margin: "10px auto 6px",
              padding: 8,
              border: `1px solid ${wsOpen ? C.accent : C.line}`,
              borderRadius: 8,
              background: C.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", width: 38,
            }}
          >
            <span style={{
              width: 22, height: 22,
              background: "linear-gradient(135deg, #0a0a0a 0%, #404040 100%)",
              color: "white", display: "grid", placeItems: "center",
              fontWeight: 600, fontSize: 10, borderRadius: 5,
            }}>
              {workspaceInitials}
            </span>
          </div>
        ) : (
          <div
            onClick={() => setWsOpen(v => !v)}
            style={{
              margin: "10px 10px 6px",
              padding: "8px 10px",
              border: `1px solid ${wsOpen ? C.accent : C.line}`,
              borderRadius: 8, background: C.bg,
              display: "flex", alignItems: "center", gap: 9,
              cursor: "pointer",
            }}
          >
            <span style={{
              width: 22, height: 22,
              background: "linear-gradient(135deg, #0a0a0a 0%, #404040 100%)",
              color: "white", display: "grid", placeItems: "center",
              fontWeight: 600, fontSize: 10, borderRadius: 5, flexShrink: 0,
            }}>
              {workspaceInitials}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 550, fontSize: 12.5, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.ink }}>
                {workspaceName}
              </div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.ink3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Plan {planName || "Starter"}
              </div>
            </div>
            <ChevronsUpDown size={12} color={wsOpen ? C.accent : C.ink3} strokeWidth={2} />
          </div>
        )}

        {/* Dropdown */}
        {wsOpen && (
          <div style={{
            position: "absolute",
            top: "calc(100% - 2px)",
            left: isCollapsed ? 0 : 10,
            right: isCollapsed ? "auto" : 10,
            width: isCollapsed ? 210 : "auto",
            zIndex: 10,
            background: "#fff",
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
            overflow: "hidden",
            padding: "5px 0",
          }}>
            {/* Active workspace */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 14px",
              background: C.accentSoft,
            }}>
              <span style={{
                width: 22, height: 22,
                background: "linear-gradient(135deg, #0a0a0a 0%, #404040 100%)",
                color: "white", display: "grid", placeItems: "center",
                fontWeight: 600, fontSize: 10, borderRadius: 5, flexShrink: 0,
              }}>
                {workspaceInitials}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 550, fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {workspaceName}
                </div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.ink3 }}>Activo</div>
              </div>
              <Check size={13} color={C.accent} strokeWidth={2.5} />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: C.line2, margin: "4px 0" }} />

            {/* Add workspace (disabled/teasing) */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 14px",
              opacity: 0.45,
              cursor: "not-allowed",
              userSelect: "none",
            }}>
              <div style={{
                width: 22, height: 22,
                border: `1.5px dashed ${C.ink4}`,
                borderRadius: 5, flexShrink: 0,
                display: "grid", placeItems: "center",
              }}>
                <Plus size={11} color={C.ink3} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 12.5, color: C.ink2, flex: 1 }}>Añadir workspace</span>
              <span style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 9, padding: "2px 5px",
                borderRadius: 4, background: C.bg3,
                color: C.ink4, fontWeight: 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                flexShrink: 0,
              }}>Próximamente</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation scroll area ───────────────────────── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "6px 8px 14px",
          scrollbarWidth: "thin",
          scrollbarColor: `${C.line} transparent`,
        }}
      >
        {NAV.map((group) => (
          <div key={group.title} style={{ marginTop: 14 }}>
            {/* Group title */}
            {isCollapsed ? (
              <div style={{ height: 8, position: "relative", marginBottom: 2 }}>
                <div style={{ position: "absolute", left: 4, right: 4, top: 4, height: 1, background: C.line2 }} />
              </div>
            ) : (
              <div style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 9.5, letterSpacing: "0.12em",
                textTransform: "uppercase", color: C.ink4,
                padding: "0 10px 6px", fontWeight: 500,
              }}>
                {group.title}
              </div>
            )}
            {group.items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                pathname={pathname}
                isCollapsed={isCollapsed}
                onNavItemClick={onNavItemClick}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── User footer ─────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.line2}`, padding: 8, flexShrink: 0 }}>
        <button
          onClick={() => signOut({ callbackUrl: "/auth" })}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 9,
            padding: isCollapsed ? 6 : "6px 8px",
            borderRadius: 6, cursor: "pointer",
            background: "none", border: "none",
            justifyContent: isCollapsed ? "center" : "flex-start",
            transition: "background .1s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.bg3 }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 99,
            background: C.ink, color: "white",
            display: "grid", placeItems: "center",
            fontWeight: 600, fontSize: 11, flexShrink: 0,
          }}>
            {initials}
          </div>
          {!isCollapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontWeight: 550, fontSize: 12.5, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: C.ink }}>
                  {userName}
                </div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10, color: C.ink3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {userEmail}
                </div>
              </div>
              <LogOut size={14} color={C.ink4} strokeWidth={2} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
