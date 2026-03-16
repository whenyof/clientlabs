"use client"

import { ShoppingBag, CheckCircle2, MessageSquare, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderQuickActionsCardProps = {
  isLight: boolean
  onOrder: () => void
  onTask: () => void
  onNote: () => void
  onFile: () => void
}

export function ProviderQuickActionsCard({
  isLight,
  onOrder,
  onTask,
  onNote,
  onFile,
}: ProviderQuickActionsCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-100 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        !isLight && "border-white/[0.06] bg-white/[0.02]"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider mb-2",
          isLight ? "text-neutral-400" : "text-white/40"
        )}
      >
        Acciones rápidas
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onOrder}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all group",
            isLight ? "hover:bg-neutral-50" : "bg-white/[0.03] hover:bg-blue-500/10"
          )}
        >
          <ShoppingBag
            className={cn(
              "h-4 w-4",
              isLight ? "text-neutral-400 group-hover:text-emerald-600" : "text-blue-400/60"
            )}
          />
          <span className={cn("text-[9px]", isLight ? "text-neutral-500" : "text-zinc-400")}>
            Pedido
          </span>
        </button>
        <button
          type="button"
          onClick={onTask}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all group",
            isLight ? "hover:bg-neutral-50" : "hover:bg-amber-500/10"
          )}
        >
          <CheckCircle2
            className={cn(
              "h-4 w-4",
              isLight ? "text-neutral-400 group-hover:text-amber-600" : "text-amber-400/60"
            )}
          />
          <span className={cn("text-[9px]", isLight ? "text-neutral-500" : "text-zinc-400")}>
            Tarea
          </span>
        </button>
        <button
          type="button"
          onClick={onNote}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all group",
            isLight ? "hover:bg-neutral-50" : "hover:bg-emerald-500/10"
          )}
        >
          <MessageSquare
            className={cn(
              "h-4 w-4",
              isLight ? "text-neutral-400 group-hover:text-emerald-600" : "text-emerald-400/60"
            )}
          />
          <span className={cn("text-[9px]", isLight ? "text-neutral-500" : "text-zinc-400")}>
            Nota
          </span>
        </button>
        <button
          type="button"
          onClick={onFile}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-all group",
            isLight ? "hover:bg-neutral-50" : "hover:bg-green-500/10"
          )}
        >
          <Upload
            className={cn(
              "h-4 w-4",
              isLight ? "text-neutral-400 group-hover:text-emerald-600" : "text-green-400/60"
            )}
          />
          <span className={cn("text-[9px]", isLight ? "text-neutral-500" : "text-zinc-400")}>
            Archivo
          </span>
        </button>
      </div>
    </div>
  )
}
