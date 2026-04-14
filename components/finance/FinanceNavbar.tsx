"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  Receipt,
  TrendingUp,
  Building2,
  Calendar,
  ChevronDown,
  FileCheck,
  Package,
  ClipboardList,
  FileMinus,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SUBTABS_FACTURACION = [
  {
    label: "Presupuestos",
    icon: FileCheck,
    href: "/dashboard/finance/presupuestos",
    desc: "Ofertas a clientes",
    match: "presupuest",
  },
  {
    label: "Facturas",
    icon: FileText,
    href: "/dashboard/finance/facturas",
    desc: "Facturas emitidas",
    match: "factura",
  },
  {
    label: "Albaranes",
    icon: Package,
    href: "/dashboard/finance/albaranes",
    desc: "Documentos de entrega",
    match: "albaran",
  },
  {
    label: "Hojas de pedido",
    icon: ClipboardList,
    href: "/dashboard/finance/pedidos",
    desc: "Confirmaciones de encargo",
    match: "pedido",
  },
  {
    label: "Rectificativas",
    icon: FileMinus,
    href: "/dashboard/finance/rectificativas",
    desc: "Correcciones de factura",
    match: "rectif",
  },
]

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

function isQuarterUrgent(): boolean {
  const now = new Date()
  for (const q of ["q1", "q2", "q3", "q4"]) {
    const dl = getDeadlineForQuarter(q)
    if (dl > now) {
      const days = Math.ceil((dl.getTime() - now.getTime()) / 86400000)
      return days <= 30
    }
  }
  return false
}

const TABS = [
  {
    key: "resumen",
    label: "Resumen",
    icon: LayoutDashboard,
    href: "/dashboard/finance",
    exact: true,
  },
  {
    key: "facturacion",
    label: "Facturación",
    icon: FileText,
    href: "/dashboard/finance/facturas",
    hasDropdown: true,
  },
  {
    key: "gastos",
    label: "Gastos",
    icon: Receipt,
    href: "/dashboard/finance/gastos",
  },
  {
    key: "tesoreria",
    label: "Tesorería",
    icon: TrendingUp,
    href: "/dashboard/finance/cobros",
  },
  {
    key: "banco",
    label: "Banco",
    icon: Building2,
    href: "/dashboard/finance/banco",
    exact: true,
  },
  {
    key: "trimestral",
    label: "Trimestral",
    icon: Calendar,
    href: "/dashboard/finance/trimestral",
    badge: true,
  },
]

function getActiveKey(pathname: string): string {
  if (pathname === "/dashboard/finance") return "resumen"
  if (
    pathname.includes("/facturas") ||
    pathname.includes("/presupuest") ||
    pathname.includes("/albaran") ||
    pathname.includes("/rectif") ||
    pathname.includes("/pedido")
  ) return "facturacion"
  if (pathname.includes("/gasto")) return "gastos"
  if (pathname.includes("/cobro") || pathname.includes("/pago") || pathname.includes("/tesoer")) return "tesoreria"
  if (pathname.includes("/banco")) return "banco"
  if (pathname.includes("/trimest")) return "trimestral"
  return "resumen"
}

export function FinanceNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const activeKey = getActiveKey(pathname)
  const urgent = isQuarterUrgent()

  return (
    <header className="h-16 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center px-5 gap-5 sticky top-0 z-40 w-full pointer-events-auto">

      {/* Wordmark */}
      <Link
        href="/dashboard/finance"
        className="flex items-center gap-2 shrink-0 select-none"
        aria-label="Finanzas — inicio"
      >
        <span className="text-[#1FA97A] font-bold text-[15px] leading-none">$</span>
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">Finanzas</span>
      </Link>

      <div className="w-px h-5 bg-[var(--border-subtle)] shrink-0" />

      {/* Tabs */}
      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto" aria-label="Módulos de finanzas">
        {TABS.map((tab) => {
          const active = activeKey === tab.key
          const Icon = tab.icon
          const isDropdownOpen = hovered === tab.key

          return (
            <div
              key={tab.key}
              className="relative shrink-0"
              onMouseEnter={() => tab.hasDropdown ? setHovered(tab.key) : undefined}
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
                  active
                    ? "bg-[#1FA97A]/10 text-[#1FA97A]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-[15px] w-[15px] shrink-0", active ? "text-[#1FA97A]" : "text-[var(--text-secondary)]")} aria-hidden />
                {tab.label}
                {tab.hasDropdown && (
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform duration-150 shrink-0", isDropdownOpen && "rotate-180")}
                    aria-hidden
                  />
                )}
                {tab.badge && urgent && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-600 text-[9px] font-bold shrink-0" aria-label="Plazo próximo">
                    !
                  </span>
                )}
              </Link>

              {/* Facturación dropdown */}
              {tab.hasDropdown && isDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-60 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl shadow-black/5 py-1.5 z-50"
                  role="menu"
                  aria-label="Opciones de Facturación"
                >
                  {SUBTABS_FACTURACION.map((sub) => {
                    const subActive = pathname.includes(sub.match)
                    const SubIcon = sub.icon
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        role="menuitem"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg transition-colors",
                          subActive
                            ? "bg-[#1FA97A]/8 text-[#1FA97A]"
                            : "hover:bg-[var(--bg-card)] text-[var(--text-primary)]"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          subActive ? "bg-[#1FA97A]/15" : "bg-[var(--bg-card)]"
                        )}>
                          <SubIcon className={cn("h-3.5 w-3.5", subActive ? "text-[#1FA97A]" : "text-[var(--text-secondary)]")} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-[13px] font-medium leading-tight", subActive ? "text-[#1FA97A]" : "text-[var(--text-primary)]")}>
                            {sub.label}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5">
                            {sub.desc}
                          </p>
                        </div>
                      </Link>
                    )
                  })}

                  {/* Urgency notice for Trimestral shown in dropdown context */}
                  {urgent && activeKey === "trimestral" && (
                    <div className="flex items-center gap-2 px-4 py-2 mt-1 border-t border-[var(--border-subtle)] text-[11px] text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Plazo trimestral próximo
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Acción rápida */}
      <button
        onClick={() => router.push("/dashboard/finance/facturas")}
        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-[#1FA97A] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1a9068] transition-colors"
      >
        + Nueva factura
      </button>
    </header>
  )
}
