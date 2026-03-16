"use client"

import { ProviderProductsHeader } from "../products/ProviderProductsHeader"
import { ProviderProductsTable } from "../products/ProviderProductsTable"
import { ProviderProductsEmptyState } from "../products/ProviderProductsEmptyState"
import type { ProviderProductRow } from "@/modules/providers/types"
import { cn } from "@/lib/utils"

export type ProviderProductsTabProps = {
  isLight: boolean
  loading?: boolean
  /** Product count or list. For base visual, pass [] or leave empty. */
  products?: ProviderProductRow[]
  searchTerm?: string
  onSearchChange?: (value: string) => void
  onAddProduct: () => void
  onImport: () => void
  onDownloadTemplate?: () => void
  /** For future CRUD: edit product */
  onEdit?: (product: ProviderProductRow) => void
  /** For future CRUD: toggle active */
  onToggleActive?: (product: ProviderProductRow) => void
}

export function ProviderProductsTab({
  isLight,
  loading = false,
  products = [],
  searchTerm = "",
  onSearchChange,
  onAddProduct,
  onImport,
  onDownloadTemplate,
  onEdit,
  onToggleActive,
}: ProviderProductsTabProps) {
  const filtered =
    searchTerm.trim() && onSearchChange
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.code || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
      : products

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className={cn("h-6 w-48 rounded", isLight ? "bg-neutral-200/60" : "bg-white/5")} />
          <div className={cn("h-4 w-64 rounded", isLight ? "bg-neutral-200/60" : "bg-white/5")} />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-[48px] w-full rounded-lg animate-pulse",
                isLight ? "bg-neutral-200/60" : "bg-white/5 border border-white/10"
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <ProviderProductsHeader
        isLight={isLight}
        count={products.length}
        onAddProduct={onAddProduct}
        onImport={onImport}
        onDownloadTemplate={onDownloadTemplate}
        searchTerm={onSearchChange != null ? searchTerm : undefined}
        onSearchChange={onSearchChange}
      />

      {/* Content: empty state or table — structure ready for future search/table */}
      {products.length === 0 ? (
        <ProviderProductsEmptyState
          isLight={isLight}
          onAddProduct={onAddProduct}
          onImport={onImport}
        />
      ) : filtered.length === 0 ? (
        <div
          className={cn(
            "p-6 text-center text-sm rounded-xl border",
            isLight ? "text-neutral-500 border-neutral-200" : "text-white/50 border-white/10"
          )}
        >
          No hay productos que coincidan con la búsqueda.
        </div>
      ) : onEdit && onToggleActive ? (
        <ProviderProductsTable
          products={filtered}
          isLight={isLight}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
        />
      ) : (
        /* Placeholder when props for table actions not yet provided */
        <div
          className={cn(
            "p-6 text-center text-sm rounded-xl border",
            isLight ? "text-neutral-500 border-neutral-200" : "text-white/50 border-white/10"
          )}
        >
          {filtered.length} producto(s) — la tabla se mostrará cuando estén configuradas las acciones de edición.
        </div>
      )}
    </div>
  )
}
