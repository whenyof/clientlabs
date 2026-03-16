"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { ProviderTemplateRow } from "@/modules/providers/types"
import { cn } from "@/lib/utils"

export type ProviderTemplateCardProps = {
  template: ProviderTemplateRow
  isLight: boolean
  onSetDefault: (templateId: string) => void
  onEdit: (template: ProviderTemplateRow) => void
  onDelete: (template: ProviderTemplateRow) => void
}

export function ProviderTemplateCard({
  template,
  isLight,
  onSetDefault,
  onEdit,
  onDelete,
}: ProviderTemplateCardProps) {
  return (
    <li
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border p-3",
        isLight
          ? "bg-white border-neutral-200 hover:bg-neutral-50/80"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium truncate",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            {template.name}
          </span>
          {template.isDefault && (
            <Badge className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              Predeterminada
            </Badge>
          )}
        </div>
        <p
          className={cn(
            "text-xs truncate mt-0.5",
            isLight ? "text-neutral-500" : "text-white/50"
          )}
        >
          {template.subject}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!template.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onSetDefault(template.id)}
          >
            Predeterminada
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-red-600 hover:text-red-700",
            !isLight && "text-red-400 hover:text-red-300"
          )}
          onClick={() => onDelete(template)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}
