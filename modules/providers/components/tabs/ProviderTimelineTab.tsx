"use client"

import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Plus,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  FileText,
  Package,
  X,
  Circle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type TimelineEvent = {
  id: string
  type: string
  entityId?: string
  content?: string
  name?: string
  title?: string
  url?: string
  category?: string
  status?: string
  amount?: number
  date: Date
  description?: string
  statusLabel?: string
  importance?: string
  [key: string]: unknown
}

export type ProviderTimelineTabProps = {
  isLight: boolean
  loading: boolean
  events: TimelineEvent[]
  formatCurrency: (n: number) => string
  onAddNote: () => void
  onAddFile: () => void
  onNavigateToOrder: (orderId: string) => void
  onNavigateToPayment: (paymentId: string) => void
  onNavigateToTask: (taskId: string) => void
  onViewNote: (content: string) => void
  onPreviewFile: (file: { id: string; name: string; url?: string; category?: string }) => void
  /** Optional: inline actions on timeline cards (preserve existing behavior) */
  onMarkOrderReceived?: (orderId: string) => void
  onCancelOrder?: (orderId: string) => void
  onResolveOrderIssue?: (orderId: string) => void
  onToggleTask?: (taskId: string, completed: boolean) => void
}

export function ProviderTimelineTab({
  isLight,
  loading,
  events,
  formatCurrency,
  onAddNote,
  onAddFile,
  onNavigateToOrder,
  onNavigateToPayment,
  onNavigateToTask,
  onViewNote,
  onPreviewFile,
  onMarkOrderReceived,
  onCancelOrder,
  onResolveOrderIssue,
  onToggleTask,
}: ProviderTimelineTabProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className={cn("space-y-6 pl-6 border-l ml-3", isLight ? "border-neutral-200" : "border-white/10")}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-[80px] w-full rounded-lg animate-pulse",
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
      <div className="flex justify-between items-center mb-4">
        <h3 className={cn("font-medium", isLight ? "text-neutral-900" : "text-white")}>
          Timeline de Actividad
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={onAddNote}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Nota
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={onAddFile}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Archivo
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div
          className={cn(
            "text-center py-12 rounded-xl",
            isLight ? "border border-neutral-200 bg-white" : "text-white/20 border-2 border-dashed border-white/5"
          )}
        >
          <MessageSquare className={cn("h-12 w-12 mx-auto mb-3", isLight ? "text-neutral-300" : "opacity-20")} />
          <p className={isLight ? "text-neutral-600" : "text-white/70"}>Sin actividad reciente</p>
        </div>
      ) : (
        <div
          className={cn(
            "relative pl-6 space-y-4 border-l ml-3",
            isLight ? "border-neutral-200" : "border-white/10"
          )}
        >
          {events.map((event) => {
            const isClickable = !!(
              (event.type === "ORDER" && event.entityId) ||
              (event.type === "PAYMENT" && event.entityId) ||
              (event.type === "TASK" && event.entityId) ||
              (event.type === "NOTE" && event.content) ||
              (event.type === "CONTACT_LOG") ||
              (event.type === "FILE_ADDED" && event.entityId)
            )
            const handleNavigate = () => {
              if (!isClickable) return
              if (event.type === "ORDER" && event.entityId) onNavigateToOrder(event.entityId)
              if (event.type === "PAYMENT" && event.entityId) onNavigateToPayment(event.entityId)
              if (event.type === "TASK" && event.entityId) onNavigateToTask(event.entityId)
              if (event.type === "NOTE" && event.content) onViewNote(event.content)
              if (event.type === "FILE_ADDED" && event.entityId && event.url) {
                onPreviewFile({
                  id: event.entityId,
                  name: event.name ?? event.title ?? "Archivo",
                  url: event.url,
                  category: event.category ?? "OTHER",
                })
              }
            }
            const ctaLabel =
              event.type === "ORDER"
                ? "Ver pedido"
                : event.type === "PAYMENT"
                  ? "Ver pago"
                  : event.type === "TASK"
                    ? "Ver tarea"
                    : event.type === "NOTE"
                      ? "Ver nota"
                      : event.type === "FILE_ADDED"
                        ? "Ver archivo"
                        : null
            const dotColor =
              event.type === "ORDER"
                ? "border-blue-500"
                : event.type === "PAYMENT"
                  ? "border-green-500"
                  : event.type === "TASK"
                    ? "border-amber-500"
                    : event.type === "NOTE"
                      ? "border-teal-500"
                      : event.type === "CONTACT_LOG"
                        ? "border-emerald-500"
                        : "border-white/20"
            const statusBadgeColor =
              event.status === "CLOSED" || event.status === "COMPLETED" || event.status === "PAID"
                ? "bg-green-500/20 text-green-400"
                : event.status === "RECEIVED"
                  ? "bg-blue-500/20 text-blue-400"
                  : event.status === "ISSUE" || event.status === "FAILED"
                    ? "bg-orange-500/20 text-orange-400"
                    : event.status === "CANCELLED"
                      ? "bg-red-500/20 text-red-400"
                      : event.status === "DRAFT"
                        ? "bg-gray-500/20 text-gray-400"
                        : event.status === "DONE"
                          ? "bg-green-500/20 text-green-400"
                          : event.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-400"
                            : null
            const Icon =
              event.type === "ORDER"
                ? ShoppingBag
                : event.type === "PAYMENT"
                  ? CreditCard
                  : event.type === "TASK"
                    ? CheckCircle2
                    : event.type === "NOTE"
                      ? MessageSquare
                      : FileText

            return (
              <div key={event.id} className="relative group/item">
                <div
                  className={cn(
                    "absolute -left-[31px] h-4 w-4 rounded-full border-2 flex items-center justify-center z-10 transition-transform group-hover/item:scale-110",
                    isLight ? "bg-white" : "bg-zinc-950",
                    dotColor
                  )}
                >
                  <Icon className="h-2 w-2 opacity-80" />
                </div>
                <div
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    isLight ? "bg-white border-neutral-100 hover:border-neutral-200" : "bg-white/5 border-white/10 hover:border-white/20",
                    isClickable && "cursor-pointer"
                  )}
                  onClick={handleNavigate}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault()
                      handleNavigate()
                    }
                  }}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[10px] uppercase tracking-wider", isLight ? "text-neutral-400" : "text-white/40")}>
                        {format(new Date(event.date), "d MMM yyyy · HH:mm", { locale: es })}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <p className={cn("text-sm font-medium truncate", isLight ? "text-neutral-900" : "text-white")}>
                          {event.title ?? event.name ?? event.type}
                        </p>
                        {event.statusLabel && statusBadgeColor && (
                          <span className={cn("text-[10px] px-1.5 py-0 h-4 border-0 rounded inline-flex items-center", statusBadgeColor)}>
                            {event.statusLabel}
                          </span>
                        )}
                        {event.type === "TASK" && !event.statusLabel && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4 border-0 rounded inline-flex items-center",
                              event.status === "DONE" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                            )}
                          >
                            {event.status === "DONE" ? "Completada" : "Pendiente"}
                          </span>
                        )}
                        {event.amount != null && (
                          <span className={cn("text-[10px] font-mono", isLight ? "text-neutral-500" : "text-white/50")}>
                            {formatCurrency(event.amount)}
                          </span>
                        )}
                      </div>
                      {event.type === "NOTE" && event.content && (
                        <div className={cn("rounded-md p-2 mt-2", isLight ? "bg-teal-50 border border-teal-100" : "bg-teal-500/10 border border-teal-500/20")}>
                          <p className={cn("text-xs whitespace-pre-wrap line-clamp-3", isLight ? "text-neutral-700" : "text-white/80")}>
                            {event.content}
                          </p>
                        </div>
                      )}
                      {event.type !== "NOTE" && event.description && (
                        <p className={cn("text-xs mt-1 line-clamp-2", isLight ? "text-neutral-500" : "text-white/50")}>
                          {event.description}
                        </p>
                      )}
                    </div>
                    {ctaLabel && (
                      <span className={cn("text-[10px] font-medium shrink-0", isLight ? "text-emerald-600" : "text-emerald-400")}>
                        {ctaLabel} →
                      </span>
                    )}
                  </div>
                  {/* Inline actions — same as panel when callbacks provided */}
                  {(
                    (event.type === "ORDER" && (event.status === "PENDING" || event.status === "ISSUE") && (onMarkOrderReceived || onCancelOrder || onResolveOrderIssue)) ||
                    (event.type === "TASK" && event.entityId && onToggleTask)
                  ) && (
                    <div
                      className={cn("mt-2 pt-2 border-t flex flex-wrap gap-1.5", isLight ? "border-neutral-100" : "border-white/5")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.type === "ORDER" && event.status === "PENDING" && event.entityId && onMarkOrderReceived && (
                        <>
                          <Button
                            onClick={() => onMarkOrderReceived(event.entityId!)}
                            size="sm"
                            variant="outline"
                            className={cn("h-6 px-2 text-[10px]", isLight ? "border-blue-200 text-blue-700 hover:bg-blue-50" : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10")}
                          >
                            <Package className="h-2.5 w-2.5 mr-1" /> Recibido
                          </Button>
                          {onCancelOrder && (
                            <Button
                              onClick={() => onCancelOrder(event.entityId!)}
                              size="sm"
                              variant="outline"
                              className={cn("h-6 px-2 text-[10px]", isLight ? "border-red-200 text-red-700 hover:bg-red-50" : "border-red-500/30 text-red-400 hover:bg-red-500/10")}
                            >
                              <X className="h-2.5 w-2.5 mr-1" /> Cancelar
                            </Button>
                          )}
                        </>
                      )}
                      {event.type === "ORDER" && event.status === "ISSUE" && event.entityId && onResolveOrderIssue && (
                        <Button
                          onClick={() => onResolveOrderIssue(event.entityId!)}
                          size="sm"
                          variant="outline"
                          className={cn("h-6 px-2 text-[10px]", isLight ? "border-blue-200 text-blue-700 hover:bg-blue-50" : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10")}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Resolver
                        </Button>
                      )}
                      {event.type === "TASK" && event.entityId && onToggleTask && (
                        <Button
                          onClick={() => onToggleTask(event.entityId!, event.status !== "DONE")}
                          size="sm"
                          variant="outline"
                          className={cn(
                            "h-6 px-2 text-[10px]",
                            event.status === "DONE"
                              ? isLight
                                ? "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                                : "border-white/20 text-white/50"
                              : isLight
                                ? "border-blue-200 text-blue-700 hover:bg-blue-50"
                                : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          )}
                        >
                          {event.status === "DONE" ? <Circle className="h-2.5 w-2.5 mr-1" /> : <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                          {event.status === "DONE" ? "Reabrir" : "Completar"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
