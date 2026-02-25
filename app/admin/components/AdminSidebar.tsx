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
 <div className="w-64 bg-[var(--bg-main)]/95 backdrop- border-r border-[var(--border-subtle)] flex flex-col">
 {/* Header */}
 <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
 <h1 className="text-[var(--text-primary)] font-bold text-lg">Admin Panel</h1>
 <Badge className="bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]">
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
 ? "bg-[var(--accent-soft)]-primary/15 text-[var(--accent)]-hover"
 : "text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
 )}
 >
 <Icon size={18} />
 {item.title}
 </Link>
 )
 })}
 </nav>

 {/* Back to Dashboard */}
 <div className="border-t border-[var(--border-subtle)] p-4">
 <Link
 href="/dashboard/other"
 className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition"
 >
 <ArrowLeft size={18} />
 Back to Dashboard
 </Link>
 </div>
 </div>
 )
}