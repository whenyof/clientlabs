"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
 LayoutDashboard,
 Users,
 BarChart3,
 Zap,
 Settings,
 CheckSquare,
 LineChart,
 FileText,
 Plug,
 Shield,
 ChevronLeft,
 ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MenuItem {
 label: string
 icon: any
 href: string
 badge?: "pro" | "new" | "beta" | "premium"
}

interface MenuGroup {
 title: string
 items: MenuItem[]
}

const menu: MenuGroup[] = [
 {
 title: "CORE",
 items: [
 { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/other" },
 { label: "Clientes", icon: Users, href: "/dashboard/clients" },
 { label: "Finanzas", icon: BarChart3, href: "/dashboard/finance" },
 { label: "Tareas", icon: CheckSquare, href: "/dashboard/tasks" },
 ],
 },
 {
 title: "INTELIGENCIA",
 items: [
 { label: "Automatizaciones", icon: Zap, href: "/dashboard/other/automations", badge: "pro" },
 { label: "Analytics", icon: LineChart, href: "/dashboard/other/analytics", badge: "beta" },
 { label: "Reporte Ejecutivo", icon: FileText, href: "/dashboard/other/reporting" },
 ],
 },
 {
 title: "SISTEMA",
 items: [
 { label: "Integraciones", icon: Plug, href: "/dashboard/other/integrations" },
 { label: "Equipo", icon: Shield, href: "/dashboard/other/team" },
 { label: "Ajustes", icon: Settings, href: "/dashboard/other/settings" },
 ],
 },
]

export function Sidebar() {
 const [isCollapsed, setIsCollapsed] = useState(false)
 const router = useRouter()
 const pathname = usePathname()

 useEffect(() => {
 const saved = localStorage.getItem("sidebar-collapsed")
 if (saved) {
 setIsCollapsed(JSON.parse(saved))
 }
 }, [])

 const toggleCollapsed = () => {
 const newState = !isCollapsed
 setIsCollapsed(newState)
 localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
 }

 return (
 <motion.aside
 initial={false}
 animate={{
 width: isCollapsed ? 80 : 288,
 }}
 transition={{
 duration: 0.3,
 ease: "easeInOut"
 }}
 className="fixed left-0 top-0 h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col z-40"
 >
 {/* HEADER */}
 <div className="h-[56px] px-6 flex items-center border-b border-[var(--border-subtle)] shrink-0">
 <div className="flex items-center justify-between w-full">
 <AnimatePresence mode="wait">
 {!isCollapsed && (
 <motion.h2
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="text-2xl font-extrabold tracking-wide text-[var(--text-primary)]"
 >
 Client<span className="text-[var(--accent)]-primary">Labs</span>
 </motion.h2>
 )}
 </AnimatePresence>

 <button
 onClick={toggleCollapsed}
 className="p-2 rounded-lg hover:bg-[var(--bg-sidebar)] transition-colors"
 >
 <AnimatePresence mode="wait">
 {isCollapsed ? (
 <motion.div
 key="expand"
 initial={{ rotate: -90, opacity: 0 }}
 animate={{ rotate: 0, opacity: 1 }}
 exit={{ rotate: 90, opacity: 0 }}
 transition={{ duration: 0.2 }}
 >
 <ChevronRight size={20} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
 </motion.div>
 ) : (
 <motion.div
 key="collapse"
 initial={{ rotate: 90, opacity: 0 }}
 animate={{ rotate: 0, opacity: 1 }}
 exit={{ rotate: -90, opacity: 0 }}
 transition={{ duration: 0.2 }}
 >
 <ChevronLeft size={20} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
 </motion.div>
 )}
 </AnimatePresence>
 </button>
 </div>
 </div>

 {/* NAVIGATION */}
 <nav className="flex-1 p-6 space-y-8 overflow-hidden">
 {menu.map((group) => (
 <div key={group.title}>
 <AnimatePresence mode="wait">
 {!isCollapsed && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="mb-3 mt-14"
 >
 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]/40">
 {group.title}
 </span>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="space-y-1">
 {group.items.map((item) => {
 const active = pathname === item.href
 const Icon = item.icon

 return (
 <motion.button
 key={item.label}
 onClick={() => router.push(item.href)}
 className={`
 w-full flex items-center gap-3 py-2 text-[12px]
 transition-all duration-150 group relative
 ${active
 ? `bg-[var(--accent-soft)] border-l-[2px] border-[var(--accent)] text-[var(--text-primary)] font-medium ${isCollapsed ? 'pl-[18px]' : 'pl-4 pr-3'} `
 : `text-[var(--text-secondary)]/60 border-l-[2px] border-transparent hover:text-[var(--text-primary)] ${isCollapsed ? 'pl-[18px]' : 'pl-4 pr-3'} `
 }
 `}
 >
 <Icon size={12} className={`flex-shrink-0 transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]/50 group-hover:text-[var(--accent)]'}`} />

 <AnimatePresence mode="wait">
 {!isCollapsed && (
 <motion.div
 initial={{ opacity: 0, width: 0 }}
 animate={{ opacity: 1, width: "auto" }}
 exit={{ opacity: 0, width: 0 }}
 className="flex items-center justify-between flex-1 min-w-0"
 >
 <span className="truncate">{item.label}</span>
 {item.badge && (
 <Badge variant={item.badge as any} className="ml-2 scale-75">
 {item.badge}
 </Badge>
 )}
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence mode="wait">
 {isCollapsed && item.badge && (
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 exit={{ scale: 0 }}
 className="absolute -right-2 -top-1"
 >
 <Badge variant={item.badge as any} className="scale-75">
 {item.badge}
 </Badge>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.button>
 )
 })}
 </div>
 </div>
 ))}
 </nav>

 {/* USER SECTION (Strict ERP Footer) */}
 <div className="p-4 border-t border-[var(--border-subtle)] bg-transparent">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 bg-[#1A3A46] border border-transparent flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm text-xs">
 U
 </div>

 <AnimatePresence mode="wait">
 {!isCollapsed && (
 <motion.div
 initial={{ opacity: 0, width: 0 }}
 animate={{ opacity: 1, width: "auto" }}
 exit={{ opacity: 0, width: 0 }}
 className="flex-1 min-w-0"
 >
 <p className="font-semibold text-[var(--text-primary)] text-[13px] truncate">Admin User</p>
 <p className="text-[var(--text-secondary)]/60 text-[11px] truncate">user@clientlabs.com</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <AnimatePresence mode="wait">
 {!isCollapsed && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="mt-4 flex items-center justify-between"
 >
 <span className="text-[10px] font-medium text-[var(--text-secondary)]/80 uppercase tracking-widest">Plan FREE</span>
 <button className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent)]-bg-emerald-600 transition-colors">
 Cambiar
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.aside>
 )
}