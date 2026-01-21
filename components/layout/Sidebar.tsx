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
import { Badge } from "../ui/Badge"

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
      { label: "Clientes", icon: Users, href: "/dashboard/other/clients" },
      { label: "Ventas", icon: BarChart3, href: "/dashboard/other/sales" },
      { label: "Tareas", icon: CheckSquare, href: "/dashboard/other/tasks" },
    ],
  },
  {
    title: "INTELIGENCIA",
    items: [
      { label: "Automatizaciones", icon: Zap, href: "/dashboard/other/automations", badge: "pro" },
      { label: "Analytics", icon: LineChart, href: "/dashboard/other/analytics", badge: "beta" },
      { label: "Reportes", icon: FileText, href: "/dashboard/other/reports" },
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
      className="fixed left-0 top-0 h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col z-40"
    >
      {/* HEADER */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-extrabold tracking-wide"
              >
                Client<span className="text-purple-400">Labs</span>
              </motion.h2>
            )}
          </AnimatePresence>

          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
                  <ChevronRight size={20} className="text-white/70" />
                </motion.div>
              ) : (
                <motion.div
                  key="collapse"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft size={20} className="text-white/70" />
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
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs uppercase tracking-widest text-white/40 mb-3"
                >
                  {group.title}
                </motion.p>
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
                      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm
                      transition-all duration-200 group
                      ${
                        active
                          ? "bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/20"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={18} className="flex-shrink-0" />

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
                            <Badge variant={item.badge} className="ml-2 scale-75">
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
                          <Badge variant={item.badge} className="scale-75">
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

      {/* USER SECTION */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">
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
                <p className="font-semibold text-white text-sm truncate">Usuario</p>
                <p className="text-white/60 text-xs truncate">user@email.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}