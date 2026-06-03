"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Search, HelpCircle, Plus } from "lucide-react"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { SearchModal } from "@/components/layout/SearchModal"
import { useOS, getShortcutKeys } from "@/hooks/use-os"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/leads": "Leads",
  "/dashboard/leads/kanban": "Pipeline",
  "/dashboard/leads/analytics": "Analíticas · Leads",
  "/dashboard/leads/feed": "Feed de actividad",
  "/dashboard/clients": "Clientes",
  "/dashboard/clients/analytics": "Analíticas · Clientes",
  "/dashboard/providers": "Proveedores",
  "/dashboard/tasks": "Tareas",
  "/dashboard/tasks/projects": "Proyectos",
  "/dashboard/finance": "Facturación",
  "/dashboard/finance/facturas": "Facturas",
  "/dashboard/finance/albaranes": "Albaranes",
  "/dashboard/finance/cobros": "Cobros",
  "/dashboard/finance/gastos": "Gastos",
  "/dashboard/finance/pagos": "Pagos",
  "/dashboard/finance/configuracion": "Configuración",
  "/dashboard/marketing": "Email Marketing",
  "/dashboard/automations": "Automatizaciones",
  "/dashboard/reporting": "Informes",
  "/dashboard/ai-assistant": "Asistente IA",
  "/dashboard/integrations": "Integraciones",
  "/dashboard/settings": "Ajustes",
  "/dashboard/admin": "Admin",
}

function getPageLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  const sorted = Object.keys(ROUTE_LABELS).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    if (pathname.startsWith(key + "/") || pathname.startsWith(key)) {
      return ROUTE_LABELS[key]
    }
  }
  const seg = pathname.split("/").filter(Boolean).pop() || "Dashboard"
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}

export function DashboardHeader() {
  const pathname = usePathname()
  const pageLabel = getPageLabel(pathname)
  const [searchOpen, setSearchOpen] = useState(false)
  const os = useOS()
  const shortcutKeys = getShortcutKeys(os)

  useKeyboardShortcut("k", () => setSearchOpen(true))

  return (
    <>
      <header
        style={{
          height: 52,
          borderBottom: "1px solid #eeeeee",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 20px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Breadcrumbs */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 12.5, color: "#737373",
        }}>
          <span style={{ cursor: "pointer" }}>Workspace</span>
          <span style={{ color: "#d4d4d4" }}>/</span>
          <span style={{ color: "#0a0a0a", fontWeight: 550 }}>{pageLabel}</span>
        </div>

        {/* Search bar */}
        <div
          role="button"
          aria-label="Abrir búsqueda"
          tabIndex={0}
          onClick={() => setSearchOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setSearchOpen(true)}
          style={{
            marginLeft: "auto",
            display: "flex", alignItems: "center", gap: 10,
            background: "#fafafa",
            border: "1px solid #e8e8e8",
            borderRadius: 7,
            padding: "5px 10px",
            width: 320,
            fontSize: 12.5, color: "#737373",
            cursor: "pointer",
            transition: "border-color .12s ease, background .12s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = "#a3a3a3"
            el.style.background = "#ffffff"
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = "#e8e8e8"
            el.style.background = "#fafafa"
          }}
        >
          <Search size={14} color="#737373" strokeWidth={2} />
          <span style={{ flex: 1 }}>Buscar clientes, facturas, leads…</span>

          {shortcutKeys && (
            <span style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
              {shortcutKeys.map((k, i) => (
                <span key={i} style={{ display: "contents" }}>
                  {i > 0 && (
                    <span style={{ fontSize: 9, color: "#a3a3a3", lineHeight: 1 }}>+</span>
                  )}
                  <kbd
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 10,
                      padding: "1px 5px",
                      background: "white",
                      border: "1px solid #e8e8e8",
                      borderRadius: 3,
                      color: "#737373",
                      fontWeight: 500,
                    }}
                >
                  {k}
                </kbd>
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            style={{
              width: 30, height: 30, borderRadius: 6,
              display: "grid", placeItems: "center",
              color: "#404040", background: "none", border: "none", cursor: "pointer",
              transition: "background .12s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none" }}
            aria-label="Centro de ayuda"
          >
            <HelpCircle size={15} strokeWidth={1.8} />
          </button>

          <NotificationBell />

          <div style={{ width: 1, height: 18, background: "#e8e8e8", margin: "0 4px" }} />

          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "7px 12px", borderRadius: 6,
              fontWeight: 550, fontSize: 12.5, letterSpacing: "-0.005em",
              background: "#0a0a0a", color: "white",
              border: "none", cursor: "pointer",
              transition: "background .12s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1f1f1f" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#0a0a0a" }}
          >
            <Plus size={12} strokeWidth={2.5} />
            Nuevo
          </button>
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
