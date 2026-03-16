"use client"

import { Button } from "@/components/ui/button"
import { Package, Plus, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderProductsEmptyStateProps = {
  isLight: boolean
  onAddProduct: () => void
  onImport?: () => void
}

export function ProviderProductsEmptyState({
  isLight,
  onAddProduct,
  onImport,
}: ProviderProductsEmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-14 px-6 rounded-xl",
        isLight
          ? "bg-white border border-neutral-200"
          : "border border-white/10 bg-white/[0.02]"
      )}
    >
      <Package
        className={cn(
          "h-14 w-14 mx-auto mb-4",
          isLight ? "text-neutral-300" : "text-white/20"
        )}
      />
      <p className={cn("font-medium", isLight ? "text-neutral-800" : "text-white/90")}>
        Aún no hay productos en el catálogo
      </p>
      <p
        className={cn(
          "text-sm mt-1 max-w-sm mx-auto",
          isLight ? "text-neutral-500" : "text-white/50"
        )}
      >
        Añade productos manualmente o importa un catálogo desde Excel o CSV para preparar pedidos más rápido.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            isLight
              ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              : "bg-white/5 text-white border-white/10 hover:bg-white/10"
          )}
          onClick={onAddProduct}
        >
          <Plus className="h-4 w-4 mr-2" /> Añadir producto
        </Button>
        {onImport && (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              isLight
                ? "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                : "bg-white/5 text-white/90 border-white/10 hover:bg-white/10"
            )}
            onClick={onImport}
          >
            <Upload className="h-4 w-4 mr-2" /> Importar catálogo
          </Button>
        )}
      </div>
    </div>
  )
}
