"use client"

import { useRouter } from "next/navigation"
import { Plus, Target, Users, FileText, FileCheck2, Package, Truck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Item = {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  href: string
}

type Group = {
  label: string
  items: Item[]
}

// Cada href es una ruta real verificada del proyecto
const GROUPS: Group[] = [
  {
    label: "CRM",
    items: [
      { label: "Nuevo lead",    icon: Target, href: "/dashboard/leads" },
      { label: "Nuevo cliente", icon: Users,  href: "/dashboard/clients" },
    ],
  },
  {
    label: "Ventas",
    items: [
      // ?newInvoice=1 hace que InvoiceView abra el modal automáticamente
      { label: "Nueva factura",     icon: FileText,   href: "/dashboard/finance/invoicing?newInvoice=1" },
      { label: "Nuevo presupuesto", icon: FileCheck2, href: "/dashboard/finance/presupuestos" },
      { label: "Nuevo albarán",     icon: Package,    href: "/dashboard/finance/albaranes" },
    ],
  },
  {
    label: "Compras",
    items: [
      { label: "Nuevo proveedor", icon: Truck, href: "/dashboard/providers" },
    ],
  },
]

export function QuickCreateMenu() {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "7px 12px", borderRadius: 6,
            fontWeight: 550, fontSize: 12.5, letterSpacing: "-0.005em",
            background: "var(--accent)", color: "white",
            border: "none", cursor: "pointer",
            transition: "background .12s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-hover)" }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)" }}
          aria-label="Creación rápida"
        >
          <Plus size={12} strokeWidth={2.5} />
          Nuevo
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 bg-white text-neutral-900 shadow-lg">
        {GROUPS.map((group, idx) => (
          <DropdownMenuGroup key={group.label}>
            {idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              {group.label}
            </DropdownMenuLabel>
            {group.items.map(({ label, icon: Icon, href }) => (
              <DropdownMenuItem
                key={href}
                className="cursor-pointer gap-2"
                onClick={() => router.push(href)}
              >
                <Icon className="size-4 text-neutral-400" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
