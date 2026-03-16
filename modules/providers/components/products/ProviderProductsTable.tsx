"use client"

import { Badge } from "@/components/ui/badge"
import { ProviderProductRowActions } from "./ProviderProductRowActions"
import { formatCurrency } from "@/modules/providers/lib/provider-order-calculations"
import type { ProviderProductRow } from "@/modules/providers/types"
import { cn } from "@/lib/utils"

export type ProviderProductsTableProps = {
  products: ProviderProductRow[]
  isLight: boolean
  onEdit: (product: ProviderProductRow) => void
  onToggleActive: (product: ProviderProductRow) => void
}

export function ProviderProductsTable({
  products,
  isLight,
  onEdit,
  onToggleActive,
}: ProviderProductsTableProps) {
  if (products.length === 0) return null

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border",
        isLight ? "border-neutral-200 bg-white" : "border-white/10"
      )}
    >
      <table className="w-full text-sm">
        <thead
          className={cn(
            "border-b",
            isLight ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10"
          )}
        >
          <tr>
            <th
              className={cn(
                "text-left p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Código
            </th>
            <th
              className={cn(
                "text-left p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Nombre
            </th>
            <th
              className={cn(
                "text-left p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Categoría
            </th>
            <th
              className={cn(
                "text-left p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Unidad
            </th>
            <th
              className={cn(
                "text-right p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Precio
            </th>
            <th
              className={cn(
                "text-left p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Estado
            </th>
            <th
              className={cn(
                "text-right p-3 text-xs font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/60"
              )}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr
              key={p.id}
              className={cn(
                "last:border-0",
                isLight
                  ? "border-b border-neutral-100 hover:bg-neutral-50/80"
                  : "border-b border-white/5 hover:bg-white/5"
              )}
            >
              <td
                className={cn(
                  "p-3 font-mono text-xs",
                  isLight ? "text-neutral-600" : "text-white/80"
                )}
              >
                {p.code}
              </td>
              <td
                className={cn(
                  "p-3 font-medium",
                  isLight ? "text-neutral-900" : "text-white"
                )}
              >
                {p.name}
              </td>
              <td
                className={cn(
                  "p-3",
                  isLight ? "text-neutral-600" : "text-white/60"
                )}
              >
                {p.category || "—"}
              </td>
              <td
                className={cn(
                  "p-3",
                  isLight ? "text-neutral-600" : "text-white/60"
                )}
              >
                {p.unit || "—"}
              </td>
              <td
                className={cn(
                  "p-3 text-right",
                  isLight ? "text-neutral-900" : "text-white"
                )}
              >
                {formatCurrency(p.price)}
              </td>
              <td className="p-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] py-0 px-1.5",
                    p.isActive
                      ? "border-green-500/30 text-green-600"
                      : isLight
                        ? "border-neutral-200 text-neutral-500"
                        : "border-white/20 text-white/50"
                  )}
                >
                  {p.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td className="p-3 text-right">
                <ProviderProductRowActions
                  product={p}
                  isLight={isLight}
                  onEdit={onEdit}
                  onToggleActive={onToggleActive}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
