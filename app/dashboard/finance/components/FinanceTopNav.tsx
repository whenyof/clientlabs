"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Landmark,
  CalendarClock,
  Building2,
  ChevronRight,
  AlertCircle,
} from "lucide-react"

type SubItem = { label: string; href: string }

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  exact?: boolean
  children?: SubItem[]
  badge?: boolean
}

function getDeadlineForQuarter(quarter: string): Date {
  const now = new Date()
  const year = now.getFullYear()
  switch (quarter) {
    case "q1": return new Date(year, 3, 20)
    case "q2": return new Date(year, 6, 20)
    case "q3": return new Date(year, 9, 20)
    case "q4": return new Date(year + 1, 0, 30)
    default:   return new Date(year, 3, 20)
  }
}

function getNextUrgentQuarter(): { quarter: string; daysLeft: number } | null {
  const now = new Date()
  const quarters = ["q1", "q2", "q3", "q4"]
  for (const q of quarters) {
    const deadline = getDeadlineForQuarter(q)
    if (deadline > now) {
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysLeft <= 30) return { quarter: q, daysLeft }
      return null
    }
  }
  return null
}

const NAV: NavItem[] = [
  {
    label: "Resumen",
    href: "/dashboard/finance",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Facturación",
    href: "/dashboard/finance/facturas",
    icon: FileText,
    children: [
      { label: "Presupuestos", href: "/dashboard/finance/presupuestos" },
      { label: "Facturas", href: "/dashboard/finance/facturas" },
      { label: "Albaranes", href: "/dashboard/finance/albaranes" },
      { label: "Rectificativas", href: "/dashboard/finance/rectificativas" },
    ],
  },
  {
    label: "Gastos",
    href: "/dashboard/finance/gastos",
    icon: ShoppingCart,
  },
  {
    label: "Tesorería",
    href: "/dashboard/finance/cobros",
    icon: Landmark,
    children: [
      { label: "Cobros", href: "/dashboard/finance/cobros" },
      { label: "Pagos", href: "/dashboard/finance/pagos" },
    ],
  },
  {
    label: "Banco",
    href: "/dashboard/finance/banco",
    icon: Building2,
    exact: true,
  },
  {
    label: "Trimestral",
    href: "/dashboard/finance/trimestral",
    icon: CalendarClock,
    badge: true,
    children: [
      { label: "1T · Ene–Mar", href: "/dashboard/finance/trimestral/q1" },
      { label: "2T · Abr–Jun", href: "/dashboard/finance/trimestral/q2" },
      { label: "3T · Jul–Sep", href: "/dashboard/finance/trimestral/q3" },
      { label: "4T · Oct–Dic", href: "/dashboard/finance/trimestral/q4" },
    ],
  },
]

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href
  if (pathname === item.href || pathname.startsWith(item.href + "/")) return true
  if (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))) return true
  return false
}

export function FinanceTopNav() {
  const pathname = usePathname()
  const urgentQuarter = getNextUrgentQuarter()
  const activeItem = NAV.find((item) => isItemActive(item, pathname)) ?? NAV[0]

  return (
    <div className="w-full shrink-0 bg-white border-b border-slate-200">
      {/* ── Level 1 ──────────────────────────────────────── */}
      <nav
        className="flex items-center gap-1 px-4 overflow-x-auto"
        aria-label="Navegación finanzas"
      >
        {NAV.map((item) => {
          const active = isItemActive(item, pathname)
          const Icon = item.icon
          const showBadge = item.badge && urgentQuarter !== null

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-1.5 shrink-0 h-11 px-3.5 text-[13px] font-medium rounded-lg my-1 transition-all duration-150",
                active
                  ? "bg-[#1FA97A]/10 text-[#1FA97A]"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-[15px] w-[15px] shrink-0 transition-colors",
                  active ? "text-[#1FA97A]" : "text-slate-400"
                )}
                aria-hidden
              />
              {item.label}
              {showBadge && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    urgentQuarter && urgentQuarter.daysLeft <= 7
                      ? "bg-red-500 animate-pulse"
                      : "bg-amber-400 animate-pulse"
                  )}
                  aria-label="Plazo próximo"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Level 2 ──────────────────────────────────────── */}
      {activeItem.children && activeItem.children.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/70">
          <nav
            className="flex items-center gap-1 px-5 py-1.5 overflow-x-auto"
            aria-label={`Secciones de ${activeItem.label}`}
          >
            {/* Breadcrumb context */}
            <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 mr-1 select-none">
              <activeItem.icon className="h-3 w-3" aria-hidden />
              {activeItem.label}
              <ChevronRight className="h-3 w-3" aria-hidden />
            </span>

            {activeItem.children.map((child) => {
              const childActive =
                pathname === child.href ||
                (child.href !== activeItem.href && pathname.startsWith(child.href + "/"))

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "shrink-0 h-6 px-3 rounded-md text-[11px] font-medium transition-all duration-150",
                    childActive
                      ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/80"
                  )}
                  aria-current={childActive ? "page" : undefined}
                >
                  {child.label}
                </Link>
              )
            })}

            {/* Urgency warning for Trimestral */}
            {activeItem.badge && urgentQuarter && (
              <span className={cn(
                "ml-auto shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                urgentQuarter.daysLeft <= 7
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              )}>
                <AlertCircle className="h-3 w-3" aria-hidden />
                {urgentQuarter.daysLeft} días para el plazo
              </span>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
