"use client"

import {
 DocumentTextIcon,
 ShoppingCartIcon,
 BanknotesIcon,
} from "@heroicons/react/24/outline"
import type { ComponentType, SVGProps } from "react"

// ---------------------------------------------------------------------------
// Widget slot definitions
// ---------------------------------------------------------------------------

interface WidgetSlot {
 id: string
 title: string
 icon: ComponentType<SVGProps<SVGSVGElement>>
 gradient: string
 /** Span 2 columns on large screens */
 wide?: boolean
}

const WIDGET_SLOTS: WidgetSlot[] = [
 {
 id: "invoices",
 title: "Facturas",
 icon: DocumentTextIcon,
 gradient: " ",
 },
 {
 id: "sales",
 title: "Ventas",
 icon: ShoppingCartIcon,
 gradient: " ",
 },
 {
 id: "payments",
 title: "Pagos",
 icon: BanknotesIcon,
 gradient: " ",
 },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClientMainGrid() {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {WIDGET_SLOTS.map((slot) => {
 const Icon = slot.icon
 return (
 <div
 key={slot.id}
 id={`client360-widget-${slot.id}`}
 className={`
 rounded-2xl bg-[var(--bg-card)] backdrop-
 border border-[var(--border-subtle)]
 overflow-hidden
 transition-all duration-300
 hover:border-[var(--border-subtle)]
 ${slot.wide ? "lg:col-span-2" : ""}
 `}
 >
 {/* Widget header */}
 <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-subtle)]">
 <div
 className={`p-2 rounded-lg bg-[var(--bg-card)] ${slot.gradient} shadow-md`}
 >
 <Icon className="w-4 h-4 text-[var(--text-primary)]" />
 </div>
 <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
 {slot.title}
 </h3>
 </div>

 {/* Placeholder content */}
 <div className="flex flex-col items-center justify-center py-16 px-6">
 <div
 className={`
 w-12 h-12 rounded-2xl mb-4
 bg-[var(--bg-card)] ${slot.gradient}
 opacity-20 flex items-center justify-center
 `}
 >
 <Icon className="w-6 h-6 text-[var(--text-primary)]" />
 </div>
 <p className="text-sm text-gray-500 font-medium">
 Próximamente
 </p>
 <p className="text-xs text-gray-600 mt-1">
 Este módulo se activará en la siguiente fase
 </p>
 </div>
 </div>
 )
 })}
 </div>
 )
}
