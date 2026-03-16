"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload, Download } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderProductsHeaderProps = {
  isLight: boolean
  count: number
  onAddProduct: () => void
  onImport: () => void
  onDownloadTemplate?: () => void
  /** Optional: for future search. Not rendered if undefined. */
  searchTerm?: string
  onSearchChange?: (value: string) => void
}

export function ProviderProductsHeader({
  isLight,
  count,
  onAddProduct,
  onImport,
  onDownloadTemplate,
  searchTerm,
  onSearchChange,
}: ProviderProductsHeaderProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3
          className={cn(
            "font-medium text-lg",
            isLight ? "text-neutral-900" : "text-white"
          )}
        >
          Catálogo del proveedor
        </h3>
        <p
          className={cn(
            "text-sm mt-0.5",
            isLight ? "text-neutral-500" : "text-white/50"
          )}
        >
          Gestiona los productos y referencias de este proveedor para preparar pedidos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p
          className={cn(
            "text-sm font-medium",
            isLight ? "text-neutral-600" : "text-white/70"
          )}
        >
          {count === 0
            ? "Ningún producto"
            : count === 1
              ? "1 producto"
              : `${count} productos`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={
              isLight
                ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                : "bg-white/5 text-white border-white/10 hover:bg-white/10"
            }
            onClick={onAddProduct}
          >
            <Plus className="h-4 w-4 mr-2" /> Añadir producto
          </Button>
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
          {onDownloadTemplate && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs",
                isLight ? "text-neutral-600 hover:bg-neutral-100" : "text-white/70 hover:bg-white/10"
              )}
              onClick={onDownloadTemplate}
            >
              <Download className="h-4 w-4 mr-1" /> Descargar plantilla
            </Button>
          )}
        </div>
      </div>

      {searchTerm !== undefined && onSearchChange && (
        <div className="pt-1">
          <Input
            type="search"
            placeholder="Buscar por nombre o código…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "w-full max-w-xs h-9 text-sm",
              isLight
                ? "bg-white border-neutral-200"
                : "bg-white/5 border-white/10"
            )}
            aria-label="Buscar productos"
          />
        </div>
      )}
    </div>
  )
}
