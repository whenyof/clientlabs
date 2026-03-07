"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
    UserIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    BellIcon,
    UsersIcon,
    KeyIcon,
    CreditCardIcon,
    ChartBarIcon,
    PaintBrushIcon,
    ExclamationTriangleIcon,
    CommandLineIcon
} from "@heroicons/react/24/outline"

export function SettingsSidebar() {
    const { labels } = useSectorConfig()
    const s = labels.settings
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const activeSectionParam = searchParams.get('section') || 'profile'

    const sections = [
        { id: 'profile', label: s.profile, icon: UserIcon, href: '/dashboard/settings' },
        { id: 'security', label: s.security, icon: ShieldCheckIcon, href: '/dashboard/settings?section=security' },
        { id: 'company', label: s.company, icon: BuildingOfficeIcon, href: '/dashboard/settings?section=company' },
        { id: 'notifications', label: s.notifications, icon: BellIcon, href: '/dashboard/settings?section=notifications' },
        { id: 'team', label: s.team, icon: UsersIcon, href: '/dashboard/settings?section=team' },
        { id: 'permissions', label: s.permissions, icon: KeyIcon, href: '/dashboard/settings?section=permissions', pro: true },
        { id: 'plans', label: s.plans, icon: CreditCardIcon, href: '/dashboard/settings?section=plans' },
        { id: 'billing', label: s.billing, icon: ChartBarIcon, href: '/dashboard/settings?section=billing' },
        { id: 'usage', label: s.usage, icon: ChartBarIcon, href: '/dashboard/settings?section=usage' },
        { id: 'appearance', label: s.appearance, icon: PaintBrushIcon, href: '/dashboard/settings?section=appearance' },
        { id: 'api', label: s.api, icon: CommandLineIcon, href: '/dashboard/settings/api' },
        { id: 'danger', label: s.dangerZone, icon: ExclamationTriangleIcon, href: '/dashboard/settings?section=danger', danger: true },
    ]

    const isNavItemActive = (section: { id: string, href: string }) => {
        if (section.id === 'api') return pathname === '/dashboard/settings/api'
        if (pathname !== '/dashboard/settings') return false
        return activeSectionParam === section.id
    }

    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 sticky top-24 p-1.5">
                <nav className="flex flex-col gap-0.5">
                    {sections.map((section) => {
                        const Icon = section.icon
                        const isActive = isNavItemActive(section)

                        return (
                            <Link
                                key={section.id}
                                href={section.href}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 rounded-lg text-sm",
                                    isActive
                                        ? "bg-slate-50 text-[#0B1F2A] font-semibold"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                )}
                            >
                                <Icon className={cn(
                                    "w-4 h-4 flex-shrink-0 transition-colors",
                                    isActive ? "text-[var(--accent)]" : "text-slate-400 group-hover:text-slate-500"
                                )} strokeWidth={isActive ? 2 : 1.5} />
                                <span className="truncate">{section.label}</span>
                                {section.pro && (
                                    <span className="ml-auto text-[10px] font-semibold tracking-wide bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded uppercase">
                                        PRO
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
