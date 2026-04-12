"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  FileCheck,
  Package,
  FileMinus,
  Receipt,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

const FINANCE_NAV = [
  { href: "/dashboard/finance", label: "Resumen", icon: BarChart3, exact: true },
  { href: "/dashboard/finance/facturas", label: "Facturas", icon: FileText },
  { href: "/dashboard/finance/presupuestos", label: "Presupuestos", icon: FileCheck },
  { href: "/dashboard/finance/albaranes", label: "Albaranes", icon: Package },
  { href: "/dashboard/finance/rectificativas", label: "Rectificativas", icon: FileMinus },
  { href: "/dashboard/finance/gastos", label: "Gastos", icon: Receipt },
  { href: "/dashboard/finance/cobros", label: "Cobros", icon: TrendingUp },
  { href: "/dashboard/finance/pagos", label: "Pagos", icon: TrendingDown },
]

export function FinanceSidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación de facturación" className="flex flex-col gap-0.5">
      {FINANCE_NAV.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
              isActive
                ? "bg-[#1FA97A]/10 text-[#1FA97A]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
