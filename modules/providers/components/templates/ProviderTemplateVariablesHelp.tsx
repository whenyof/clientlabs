"use client"

import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const VARIABLES = [
  { key: "{provider_name}", description: "Nombre del proveedor" },
  { key: "{order_date}", description: "Fecha del pedido" },
  { key: "{order_number}", description: "Número de pedido" },
  { key: "{products_table}", description: "Tabla de productos (código, nombre, cantidad, precio)" },
  { key: "{total_amount}", description: "Importe total del pedido" },
  { key: "{notes}", description: "Notas del pedido" },
] as const

export type ProviderTemplateVariablesHelpProps = {
  isLight: boolean
}

export function ProviderTemplateVariablesHelp({ isLight }: ProviderTemplateVariablesHelpProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isLight ? "bg-neutral-50/80 border-neutral-200" : "bg-white/[0.03] border-white/10"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle
          className={cn("h-4 w-4 shrink-0", isLight ? "text-neutral-500" : "text-white/50")}
        />
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isLight ? "text-neutral-600" : "text-white/60"
          )}
        >
          Variables disponibles
        </span>
      </div>
      <p
        className={cn(
          "text-xs mb-3",
          isLight ? "text-neutral-500" : "text-white/50"
        )}
      >
        Usa estas variables en el asunto y el cuerpo de la plantilla. Se sustituirán al generar el correo del pedido.
      </p>
      <ul className="space-y-1.5">
        {VARIABLES.map(({ key, description }) => (
          <li
            key={key}
            className={cn(
              "flex items-baseline gap-2 text-xs font-mono",
              isLight ? "text-neutral-700" : "text-white/70"
            )}
          >
            <code
              className={cn(
                "shrink-0 px-1.5 py-0.5 rounded",
                isLight ? "bg-neutral-200 text-neutral-800" : "bg-white/10 text-white/90"
              )}
            >
              {key}
            </code>
            <span className={cn(isLight ? "text-neutral-500" : "text-white/50")}>
              {description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
