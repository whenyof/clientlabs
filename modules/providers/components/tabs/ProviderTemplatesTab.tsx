"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProviderTemplateCard } from "../templates/ProviderTemplateCard"
import { ProviderTemplatesEmptyState } from "../templates/ProviderTemplatesEmptyState"
import { ProviderTemplateVariablesHelp } from "../templates/ProviderTemplateVariablesHelp"
import type { ProviderTemplateRow } from "@/modules/providers/types"
import { cn } from "@/lib/utils"

export type ProviderTemplatesTabProps = {
  isLight: boolean
  loading?: boolean
  /** List of templates. For base visual, pass [] or leave empty. */
  templates?: ProviderTemplateRow[]
  onCreateTemplate: () => void
  /** Optional: for when templates exist */
  onSetDefault?: (templateId: string) => void
  onEdit?: (template: ProviderTemplateRow) => void
  onDelete?: (template: ProviderTemplateRow) => void
}

export function ProviderTemplatesTab({
  isLight,
  loading = false,
  templates = [],
  onCreateTemplate,
  onSetDefault,
  onEdit,
  onDelete,
}: ProviderTemplatesTabProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <div className={cn("h-6 w-56 rounded", isLight ? "bg-neutral-200/60" : "bg-white/5")} />
          <div className={cn("h-4 w-72 rounded", isLight ? "bg-neutral-200/60" : "bg-white/5")} />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-14 w-full rounded-lg animate-pulse",
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
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3
              className={cn(
                "font-medium text-lg",
                isLight ? "text-neutral-900" : "text-white"
              )}
            >
              Plantillas de correo para pedidos
            </h3>
            <p
              className={cn(
                "text-sm mt-0.5",
                isLight ? "text-neutral-500" : "text-white/50"
              )}
            >
              Define asunto y cuerpo del correo que se generará al crear un pedido. Usa variables para personalizar cada envío.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "shrink-0",
              isLight
                ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                : "bg-white/5 text-white border-white/10 hover:bg-white/10"
            )}
            onClick={onCreateTemplate}
          >
            <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
          </Button>
        </div>
      </div>

      {/* List or empty state */}
      {templates.length === 0 ? (
        <ProviderTemplatesEmptyState
          isLight={isLight}
          onCreateTemplate={onCreateTemplate}
        />
      ) : onSetDefault && onEdit && onDelete ? (
        <ul className="space-y-2">
          {templates.map((t) => (
            <ProviderTemplateCard
              key={t.id}
              template={t}
              isLight={isLight}
              onSetDefault={onSetDefault}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : (
        <div
          className={cn(
            "p-6 text-center text-sm rounded-xl border",
            isLight ? "text-neutral-500 border-neutral-200" : "text-white/50 border-white/10"
          )}
        >
          {templates.length} plantilla(s) — la lista completa se mostrará cuando estén configuradas las acciones.
        </div>
      )}

      {/* Variables help — always visible for reference */}
      <ProviderTemplateVariablesHelp isLight={isLight} />
    </div>
  )
}
