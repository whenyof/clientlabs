"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type SubItem = { label: string; href: string }

type NavItem = {
  label: string
  href: string
  exact?: boolean
  children?: SubItem[]
  badge?: boolean
}

// Deadline dates for each quarter (fixed dates each year)
function getDeadlineForQuarter(quarter: string): Date {
  const now = new Date()
  const year = now.getFullYear()
  switch (quarter) {
    case "q1": return new Date(year, 3, 20)       // April 20
    case "q2": return new Date(year, 6, 20)       // July 20
    case "q3": return new Date(year, 9, 20)       // October 20
    case "q4": return new Date(year + 1, 0, 30)   // January 30 next year
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
  { label: "Resumen", href: "/dashboard/finance", exact: true },
  {
    label: "Facturación",
    href: "/dashboard/finance/facturas",
    children: [
      { label: "Facturas", href: "/dashboard/finance/facturas" },
      { label: "Presupuestos", href: "/dashboard/finance/presupuestos" },
      { label: "Albaranes", href: "/dashboard/finance/albaranes" },
      { label: "Rectificativas", href: "/dashboard/finance/rectificativas" },
    ],
  },
  { label: "Gastos", href: "/dashboard/finance/gastos" },
  {
    label: "Tesorería",
    href: "/dashboard/finance/cobros",
    children: [
      { label: "Cobros", href: "/dashboard/finance/cobros" },
      { label: "Pagos", href: "/dashboard/finance/pagos" },
    ],
  },
  {
    label: "Trimestral",
    href: "/dashboard/finance/trimestral",
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
  // Check direct href match
  if (pathname === item.href || pathname.startsWith(item.href + "/")) return true
  // Check if any child href matches (for items like Presupuestos / Albaranes
  // that live under Facturación but have their own top-level path)
  if (item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/"))) return true
  return false
}

export function FinanceTopNav() {
  const pathname = usePathname()
  const urgentQuarter = getNextUrgentQuarter()

  const activeItem = NAV.find((item) => isItemActive(item, pathname)) ?? NAV[0]

  return (
    <div className="w-full shrink-0">
      {/* Level 1 — main categories */}
      <div className="bg-white border-b border-[#E2E8ED]">
        <nav
          className="flex items-center gap-0 px-6 overflow-x-auto"
          aria-label="Navegación de finanzas"
        >
          {NAV.map((item) => {
            const active = isItemActive(item, pathname)
            const showBadge = item.badge && urgentQuarter !== null
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 shrink-0 h-11 px-4 text-[13px] font-medium border-b-2 transition-colors",
                  active
                    ? "border-[#1FA97A] text-[#1FA97A]"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-200"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
                {showBadge && (
                  <span
                    className={cn(
                      "inline-flex h-2 w-2 rounded-full shrink-0",
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
      </div>

      {/* Level 2 — sub-navigation for active category */}
      {activeItem.children && activeItem.children.length > 0 && (
        <div className="bg-[#F8FAFB] border-b border-[#E2E8ED]">
          <nav
            className="flex items-center gap-1.5 px-6 py-2 overflow-x-auto"
            aria-label="Subnav de finanzas"
          >
            {activeItem.children.map((child) => {
              const childActive =
                pathname === child.href ||
                (child.href !== activeItem.href && pathname.startsWith(child.href))
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "shrink-0 h-7 px-3 rounded-md text-[12px] font-medium transition-colors",
                    childActive
                      ? "bg-white border border-[#D1D9E0] text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                  )}
                  aria-current={childActive ? "page" : undefined}
                >
                  {child.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
