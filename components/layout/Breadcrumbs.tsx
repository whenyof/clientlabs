"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clientes",
  sales: "Ventas",
  automations: "Automatizaciones",
  tasks: "Tareas",
  analytics: "Analytics",
  settings: "Ajustes",
  other: "Dashboard",
  reports: "Reportes",
  integrations: "Integraciones",
  team: "Equipo",
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 2) return null

  const breadcrumbs = segments.slice(2).map((segment, index) => {
    const href = "/" + segments.slice(0, index + 3).join("/")
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === segments.slice(2).length - 1

    return {
      href,
      label,
      isLast
    }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
      <Link
        href="/dashboard/other"
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        <Home size={16} />
        <span>Dashboard</span>
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          <ChevronRight size={14} className="mx-2 text-gray-600" />
          {crumb.isLast ? (
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href || "/dashboard/other"}
              className="hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}