"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderTemplatesEmptyStateProps = {
  isLight: boolean
  onCreateTemplate: () => void
}

export function ProviderTemplatesEmptyState({
  isLight,
  onCreateTemplate,
}: ProviderTemplatesEmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-14 px-6 rounded-xl",
        isLight
          ? "bg-white border border-neutral-200"
          : "border border-white/10 bg-white/[0.02]"
      )}
    >
      <FileText
        className={cn(
          "h-14 w-14 mx-auto mb-4",
          isLight ? "text-neutral-300" : "text-white/20"
        )}
      />
      <p className={cn("font-medium", isLight ? "text-neutral-800" : "text-white/90")}>
        Aún no hay plantillas de correo
      </p>
      <p
        className={cn(
          "text-sm mt-1 max-w-sm mx-auto",
          isLight ? "text-neutral-500" : "text-white/50"
        )}
      >
        Crea una plantilla para generar correos de pedido con asunto y cuerpo personalizables usando variables.
      </p>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "mt-6",
          isLight
            ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
        )}
        onClick={onCreateTemplate}
      >
        <Plus className="h-4 w-4 mr-2" /> Nueva plantilla
      </Button>
    </div>
  )
}
