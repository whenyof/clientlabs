"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  CreditCard,
  FileText,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  Package,
  X,
  FileEdit,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { ProviderOrderRow } from "@/modules/providers/types"

export type ProviderOrdersTabProps = {
  isLight: boolean
  loading: boolean
  orders: ProviderOrderRow[]
  expandedOrderId: string | null
  labels: { orders: { plural: string }; providers: { actions: { newOrder: string; markReceived: string } } }
  formatCurrency: (n: number) => string
  fileCategoryLabel: (category: string) => string
  onNewOrder: () => void
  onExpandOrder: (orderId: string) => void
  onMarkReceived: (orderId: string) => void
  onCancelOrder: (orderId: string) => void
  onRegisterPayment: (order: ProviderOrderRow) => void
  onUploadInvoice: (orderId: string) => void
  onUploadOrderFile: (orderId: string) => void
  onUploadOrderSheet?: (orderId: string) => void
  onPreviewFile: (file: { id: string; name: string; url?: string; category: string; createdAt?: Date }) => void
  onDeleteFile: (file: { id: string; name: string }) => void
  /** Abre el modal de confirmación «¿Has enviado el pedido?» para pedidos en PENDING_SEND_CONFIRMATION */
  onConfirmSendOrder?: (orderId: string) => void
  /** Abre el borrador en el modal de pedido para continuar editando */
  onOpenDraft?: (order: ProviderOrderRow) => void
  /** Elimina el pedido (con confirmación en el padre o aquí) */
  onDeleteOrder?: (orderId: string) => void
}

export function ProviderOrdersTab({
  isLight,
  loading,
  orders,
  expandedOrderId,
  labels,
  formatCurrency,
  fileCategoryLabel,
  onNewOrder,
  onExpandOrder,
  onMarkReceived,
  onCancelOrder,
  onRegisterPayment,
  onUploadInvoice,
  onUploadOrderFile,
  onUploadOrderSheet,
  onPreviewFile,
  onDeleteFile,
  onConfirmSendOrder,
  onOpenDraft,
  onDeleteOrder,
}: ProviderOrdersTabProps) {
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; description?: string } | null>(null)

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-[100px] w-full rounded-lg animate-pulse",
                isLight ? "bg-neutral-200/60" : "bg-white/5 border border-white/10"
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={cn("font-medium", isLight ? "text-neutral-900" : "text-white")}>
          Historial de {labels.orders.plural}
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={
            isLight
              ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              : "bg-white/5 text-white border-white/10 hover:bg-white/10"
          }
          onClick={onNewOrder}
        >
          <Plus className="h-4 w-4 mr-2" /> {labels.providers.actions.newOrder}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div
          className={cn(
            "text-center py-12 rounded-xl",
            isLight ? "border border-neutral-200 bg-white" : "text-white/20 border-2 border-dashed border-white/5"
          )}
        >
          <ShoppingBag className={cn("h-12 w-12 mx-auto mb-3", isLight ? "text-neutral-300" : "opacity-20")} />
          <p className={isLight ? "text-neutral-600" : "text-white/70"}>No hay pedidos registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const expanded = expandedOrderId === order.id
            const orderWithFiles = order as ProviderOrderRow & { files?: { id: string; name: string; url?: string; category: string; createdAt?: Date }[] }
            const files = orderWithFiles.files ?? []
            return (
              <div
                key={order.id}
                className={cn(
                  "rounded-lg border overflow-hidden transition-all",
                  isLight ? "bg-white border-neutral-100" : "bg-white/5",
                  expanded ? "border-blue-500/30" : isLight ? "hover:border-neutral-200" : "border-white/10 hover:border-white/20"
                )}
              >
                <button
                  type="button"
                  onClick={() => onExpandOrder(expanded ? "" : order.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-wider",
                          isLight ? "text-neutral-400" : "text-white/40"
                        )}
                      >
                        {format(new Date(order.orderDate), "PPP", { locale: es })}
                      </span>
                      <h4 className={cn("font-medium mt-0.5", isLight ? "text-neutral-900" : "text-white")}>
                        {order.description || "Pedido sin descripción"}
                      </h4>
                    </div>
                    <div className="text-right flex items-start gap-2">
                      <div>
                        <p className={cn("font-bold", isLight ? "text-neutral-900" : "text-white")}>
                          {formatCurrency(order.amount)}
                        </p>
                        <Badge
                          className={cn(
                            "text-[10px] py-0 px-1.5",
                            order.status === "PAID" || order.status === "CLOSED"
                              ? "bg-green-500/20 text-green-600 border-green-500/30"
                              : order.status === "RECEIVED"
                                ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                : order.status === "ISSUE"
                                  ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                                  : order.status === "CANCELLED"
                                    ? "bg-red-500/20 text-red-600 border-red-500/30"
                                    : order.status === "DRAFT"
                                      ? "bg-gray-500/20 text-gray-600 border-gray-500/30"
                                      : order.status === "PENDING_SEND_CONFIRMATION"
                                        ? "bg-amber-500/20 text-amber-600 border-amber-500/30"
                                        : order.status === "SENT"
                                          ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                                          : "bg-amber-500/20 text-amber-600 border-amber-500/30"
                          )}
                        >
                          {order.status === "PAID" || order.status === "CLOSED"
                            ? "PAGADO"
                            : order.status === "RECEIVED"
                              ? "RECIBIDO"
                              : order.status === "ISSUE"
                                ? "INCIDENCIA"
                                : order.status === "CANCELLED"
                                  ? "CANCELADO"
                                  : order.status === "DRAFT"
                                    ? "BORRADOR"
                                    : order.status === "PENDING_SEND_CONFIRMATION"
                                      ? "PEND. CONFIRMAR"
                                      : order.status === "SENT"
                                        ? "ENVIADO"
                                        : "PENDIENTE"}
                        </Badge>
                      </div>
                      {expanded ? (
                        <ChevronUp className={cn("h-4 w-4", isLight ? "text-neutral-400" : "text-white/40")} />
                      ) : (
                        <ChevronDown className={cn("h-4 w-4", isLight ? "text-neutral-400" : "text-white/40")} />
                      )}
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div
                    className={cn(
                      "px-4 pb-4 space-y-4 border-t pt-4",
                      isLight ? "border-neutral-100" : "border-white/5"
                    )}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className={cn("rounded-lg p-3", isLight ? "bg-neutral-50" : "bg-white/5")}>
                        <p className={cn("text-[10px] uppercase mb-1", isLight ? "text-neutral-500" : "text-white/40")}>
                          Tipo
                        </p>
                        <p className={cn("text-sm", isLight ? "text-neutral-900" : "text-white")}>
                          {order.type === "RECURRING" ? "Recurrente" : "Puntual"}
                        </p>
                      </div>
                      <div className={cn("rounded-lg p-3", isLight ? "bg-neutral-50" : "bg-white/5")}>
                        <p className={cn("text-[10px] uppercase mb-1", isLight ? "text-neutral-500" : "text-white/40")}>
                          ID Pedido
                        </p>
                        <p className={cn("text-sm font-mono", isLight ? "text-neutral-900" : "text-white")}>
                          {order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {order.payment && (
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          isLight ? "bg-green-50 border border-green-100" : "bg-green-500/10 border border-green-500/20"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className={cn("h-4 w-4", isLight ? "text-green-600" : "text-green-400")} />
                          <span className={cn("text-sm font-medium", isLight ? "text-green-700" : "text-green-400")}>
                            Pago vinculado
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className={cn("text-xs", isLight ? "text-neutral-500" : "text-white/40")}>Importe</p>
                            <p className={cn("font-bold", isLight ? "text-neutral-900" : "text-white")}>
                              {formatCurrency(order.payment.amount)}
                            </p>
                          </div>
                          <div>
                            <p className={cn("text-xs", isLight ? "text-neutral-500" : "text-white/40")}>Fecha</p>
                            <p className={isLight ? "text-neutral-900" : "text-white"}>
                              {format(new Date(order.payment.paymentDate), "dd/MM/yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {order.invoice && (
                      <div
                        className={cn(
                          "rounded-lg p-3",
                          isLight ? "bg-blue-50 border border-blue-100" : "bg-blue-500/10 border border-blue-500/20"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className={cn("h-4 w-4", isLight ? "text-blue-600" : "text-blue-400")} />
                            <span className={cn("text-sm font-medium", isLight ? "text-blue-700" : "text-blue-400")}>
                              Factura asociada
                            </span>
                          </div>
                          <a
                            href={`/dashboard/finance/billing?invoice=${order.invoice.id}`}
                            className={cn(
                              "text-xs flex items-center gap-1",
                              isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-300 hover:text-blue-200"
                            )}
                          >
                            {order.invoice.number}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <p className={cn("text-[10px] mt-1", isLight ? "text-neutral-500" : "text-white/50")}>
                          {order.invoice.status}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p
                        className={cn(
                          "text-[10px] uppercase tracking-wider",
                          isLight ? "text-neutral-500" : "text-white/40"
                        )}
                      >
                        Archivos adjuntos
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center gap-1 rounded px-2 py-1.5 text-[11px] transition-colors",
                              isLight
                                ? "bg-neutral-100 border border-neutral-200 text-neutral-700"
                                : "bg-white/5 border border-white/10 text-zinc-200 hover:border-white/30"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => onPreviewFile(file)}
                              className="flex items-center gap-2 min-w-0 text-left flex-1"
                            >
                              <FileText className={cn("h-3 w-3 shrink-0", isLight ? "text-blue-600" : "text-blue-400")} />
                              <span className="truncate max-w-[120px]">{file.name}</span>
                              <span className={cn("shrink-0", isLight ? "text-neutral-500" : "text-white/50")}>
                                {fileCategoryLabel(file.category)}
                              </span>
                              {file.createdAt && (
                                <span className={cn("shrink-0", isLight ? "text-neutral-400" : "text-white/40")}>
                                  {format(new Date(file.createdAt), "dd/MM/yy", { locale: es })}
                                </span>
                              )}
                            </button>
                            {file.url && (
                              <a
                                href={file.url}
                                download={file.name}
                                className={cn("p-0.5 shrink-0", isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300")}
                                title="Descargar"
                              >
                                <Download className="h-3 w-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteFile({ id: file.id, name: file.name })
                              }}
                              className={cn("p-0.5 shrink-0", "text-red-500 hover:text-red-600")}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-[11px]"
                            onClick={() => onUploadInvoice(order.id)}
                          >
                            <Upload className="h-3.5 w-3.5 mr-1.5" /> Subir factura
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-[11px]"
                            onClick={() => onUploadOrderFile(order.id)}
                          >
                            <Upload className="h-3.5 w-3.5 mr-1.5" /> Subir albarán
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-[11px]"
                            onClick={() => onUploadOrderSheet?.(order.id)}
                            disabled={!onUploadOrderSheet}
                          >
                            <Upload className="h-3.5 w-3.5 mr-1.5" /> Subir hoja de pedido
                          </Button>
                        </div>
                      </div>
                    </div>

                    {order.status === "DRAFT" && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {onOpenDraft && (
                          <Button size="sm" className="flex-1 min-w-[120px]" onClick={() => onOpenDraft(order)}>
                            <FileEdit className="h-4 w-4 mr-2" />
                            Ver borrador
                          </Button>
                        )}
                        {onDeleteOrder && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            onClick={() => setOrderToDelete({ id: order.id, description: order.description ?? undefined })}
                          >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Eliminar pedido
                          </Button>
                        )}
                      </div>
                    )}
                    {order.status === "PENDING_SEND_CONFIRMATION" && onConfirmSendOrder && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => onConfirmSendOrder(order.id)}>
                          ¿Has enviado el pedido?
                        </Button>
                      </div>
                    )}
                    {order.status === "PENDING" && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => onMarkReceived(order.id)}>
                          <Package className="h-4 w-4 mr-2" />
                          {labels.providers.actions.markReceived}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCancelOrder(order.id)}>
                          <X className="h-4 w-4 mr-1.5" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {(order.status === "RECEIVED" || order.status === "SENT") && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => onRegisterPayment(order)}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Marcar como pagado
                        </Button>
                      </div>
                    )}
                    {order.status === "ISSUE" && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={() => onMarkReceived(order.id)}>
                          Resolver → Pendiente
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCancelOrder(order.id)}>
                          <X className="h-4 w-4 mr-1.5" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {order.status !== "DRAFT" && onDeleteOrder && (
                      <div className="pt-2 mt-2 border-t border-[var(--border-main)]/50">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn("text-red-600 hover:text-red-700 hover:bg-red-50", !isLight && "text-red-400 hover:bg-red-500/10")}
                          onClick={() => setOrderToDelete({ id: order.id, description: order.description ?? undefined })}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Eliminar pedido
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (orderToDelete && onDeleteOrder) {
                  await Promise.resolve(onDeleteOrder(orderToDelete.id))
                  setOrderToDelete(null)
                }
              }}
            >
              Eliminar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
