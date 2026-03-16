"use client"

import { Button } from "@/components/ui/button"
import type { ProviderProductRow } from "@/modules/providers/types"
import { cn } from "@/lib/utils"

export type ProviderProductRowActionsProps = {
  product: ProviderProductRow
  isLight: boolean
  onEdit: (product: ProviderProductRow) => void
  onToggleActive: (product: ProviderProductRow) => void
}

export function ProviderProductRowActions({
  product,
  isLight,
  onEdit,
  onToggleActive,
}: ProviderProductRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={() => onEdit(product)}
      >
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={() => onToggleActive(product)}
      >
        {product.isActive ? "Desactivar" : "Activar"}
      </Button>
    </div>
  )
}
