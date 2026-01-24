"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Users, Shield, Database, ArrowLeft, ScrollText, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Settings
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Plans",
    href: "/admin/plans",
    icon: Shield
  },
  {
    title: "Logs",
    href: "/admin/logs",
    icon: ScrollText
  },
  {
    title: "Backups",
    href: "/admin/backups",
    icon: HardDrive
  },
  {
    title: "System",
    href: "/admin/system",
    icon: Database
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-[#0e1424]/95 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
        <h1 className="text-white font-bold text-lg">Admin Panel</h1>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <Shield className="w-3 h-3 mr-1" />
          ADMIN
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition",
                isActive
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Back to Dashboard */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/dashboard/other"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}