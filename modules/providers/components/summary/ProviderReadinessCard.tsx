"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderReadinessCardProps = {
  isLight: boolean
  ready: boolean
  hasOrderEmail: boolean
  hasCatalog: boolean
  hasDefaultTemplate: boolean
  onNewOrder: () => void
  onAddEmail: () => void
  onImportProducts: () => void
  onCreateTemplate: () => void
}

export function ProviderReadinessCard({
  isLight,
  ready,
  hasOrderEmail,
  hasCatalog,
  hasDefaultTemplate,
  onNewOrder,
  onAddEmail,
  onImportProducts,
  onCreateTemplate,
}: ProviderReadinessCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isLight
          ? "bg-white border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2"
          : "border-white/10 bg-white/[0.02] lg:col-span-2"
      )}
    >
      <h3
        className={cn(
          "text-xs font-semibold uppercase tracking-wider mb-3",
          isLight ? "text-neutral-500" : "text-white/50"
        )}
      >
        Preparación para pedidos
      </h3>
      {ready ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={cn("text-sm", isLight ? "text-neutral-700" : "text-white/80")}>
            Correo configurado, catálogo cargado y plantilla predeterminada lista.
          </p>
          <Button
            size="sm"
            className="bg-[var(--accent)] hover:opacity-90 text-white"
            onClick={onNewOrder}
          >
            <ShoppingBag className="h-4 w-4 mr-1.5" /> Nuevo pedido
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <ul className={cn("text-sm space-y-1", isLight ? "text-neutral-600" : "text-white/70")}>
            {!hasOrderEmail && <li>• Correo de pedidos no configurado</li>}
            {!hasCatalog && <li>• Catálogo sin productos</li>}
            {!hasDefaultTemplate && <li>• Sin plantilla predeterminada</li>}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            {!hasOrderEmail && (
              <Button
                variant="outline"
                size="sm"
                className={isLight ? "border-neutral-200 text-neutral-700" : "border-white/20 text-white/80"}
                onClick={onAddEmail}
              >
                Añadir correo
              </Button>
            )}
            {!hasCatalog && (
              <Button
                variant="outline"
                size="sm"
                className={isLight ? "border-neutral-200 text-neutral-700" : "border-white/20 text-white/80"}
                onClick={onImportProducts}
              >
                Importar productos
              </Button>
            )}
            {!hasDefaultTemplate && (
              <Button
                variant="outline"
                size="sm"
                className={isLight ? "border-neutral-200 text-neutral-700" : "border-white/20 text-white/80"}
                onClick={onCreateTemplate}
              >
                Crear plantilla
              </Button>
            )}
            {hasCatalog && (hasOrderEmail || hasDefaultTemplate) && (
              <Button
                size="sm"
                variant="outline"
                className={isLight ? "border-neutral-200" : "border-white/20"}
                onClick={onNewOrder}
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" /> Nuevo pedido
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
