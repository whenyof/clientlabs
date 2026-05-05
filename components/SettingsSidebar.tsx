"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  User,
  Building2,
  Users,
  FileText,
  CreditCard,
  Bell,
  Key,
  Gauge,
  ShieldCheck,
  Palette,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react"

const PRIMARY_SECTIONS = [
  { id: "account",       label: "Mi cuenta",          icon: User,         href: "/dashboard/settings?section=account" },
  { id: "company",       label: "Empresa",             icon: Building2,    href: "/dashboard/settings?section=company" },
  { id: "team",          label: "Equipo",              icon: Users,        href: "/dashboard/settings?section=team" },
  { id: "invoicing",     label: "Facturación",         icon: FileText,     href: "/dashboard/settings?section=invoicing" },
  { id: "subscription",  label: "Suscripción",         icon: CreditCard,   href: "/dashboard/settings?section=subscription" },
  { id: "notifications", label: "Notificaciones",      icon: Bell,         href: "/dashboard/settings?section=notifications" },
  { id: "api",           label: "API e Integraciones", icon: Key,          href: "/dashboard/settings/api" },
  { id: "limits",        label: "Límites del plan",    icon: Gauge,        href: "/dashboard/settings?section=limits" },
]

const SECONDARY_SECTIONS = [
  { id: "security",   label: "Seguridad",       icon: ShieldCheck,   href: "/dashboard/settings?section=security" },
  { id: "appearance", label: "Apariencia",      icon: Palette,       href: "/dashboard/settings?section=appearance" },
  { id: "activity",   label: "Actividad",       icon: Clock,         href: "/dashboard/settings?section=activity" },
  { id: "catalog",    label: "Catálogo",        icon: Package,       href: "/dashboard/settings?section=catalog" },
  { id: "danger",     label: "Zona Peligrosa",  icon: AlertTriangle, href: "/dashboard/settings?section=danger", danger: true },
]

// Maps legacy section IDs → canonical ID for active highlighting
const ALIASES: Record<string, string> = {
  profile:    "account",
  plans:      "subscription",
  billing:    "subscription",
  usage:      "limits",
  verifactu:  "invoicing",
  permissions:"team",
}

export function SettingsSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rawSection = searchParams.get("section") || "account"
  const activeSection = ALIASES[rawSection] ?? rawSection

  function isActive(section: { id: string; href: string }) {
    if (section.id === "api") return pathname === "/dashboard/settings/api"
    if (pathname !== "/dashboard/settings") return false
    return activeSection === section.id
  }

  function renderItem(section: { id: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; href: string; danger?: boolean; pro?: boolean }) {
    const Icon = section.icon
    const active = isActive(section)

    return (
      <Link
        key={section.id}
        href={section.href}
        className={cn(
          "group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-150",
          active
            ? "bg-slate-50 text-[#0B1F2A] font-semibold"
            : section.danger
            ? "text-red-500 hover:bg-red-50"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors",
            active
              ? "text-[var(--accent)]"
              : section.danger
              ? "text-red-400"
              : "text-slate-400 group-hover:text-slate-500"
          )}
          strokeWidth={active ? 2 : 1.5}
        />
        <span className="truncate">{section.label}</span>
        {section.pro && (
          <span className="ml-auto text-[10px] font-semibold tracking-wide bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded uppercase">
            PRO
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl border border-slate-200 sticky top-24 p-1.5">
        <nav className="flex flex-col gap-0.5">
          {PRIMARY_SECTIONS.map(renderItem)}

          <div className="my-1.5 h-px bg-slate-100 mx-3" />

          {SECONDARY_SECTIONS.map(renderItem)}
        </nav>
      </div>
    </div>
  )
}
