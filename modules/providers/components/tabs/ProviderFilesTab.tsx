"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Plus,
  ShoppingBag,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type FileGroup = {
  order?: { id: string; description?: string | null; amount?: number }
  payment?: { id: string; concept?: string | null; amount?: number; status?: string }
  files: { id: string; name: string; url: string; category: string; createdAt?: Date }[]
}

export type ProviderFilesTabProps = {
  isLight: boolean
  loadingFiles: boolean
  loadingInvoices: boolean
  providerInvoices: { id: string; number: string; status: string }[]
  groupedFiles: { orders: FileGroup[]; payments: FileGroup[]; general: FileGroup[] }
  collapsedGroups: Record<string, boolean>
  formatCurrency: (n: number) => string
  fileCategoryLabel: (category: string) => string
  onUploadProvider: () => void
  onUploadOrder: (orderId: string, presetCategory?: "INVOICE" | "ORDER") => void
  onUploadPayment: (paymentId: string) => void
  onToggleGroup: (key: string) => void
  onPreviewFile: (file: { id: string; name: string; url?: string; category: string; createdAt?: Date }) => void
  onDeleteFile: (file: { id: string; name: string }) => void
}

export function ProviderFilesTab({
  isLight,
  loadingFiles,
  loadingInvoices,
  providerInvoices,
  groupedFiles,
  collapsedGroups,
  formatCurrency,
  fileCategoryLabel,
  onUploadProvider,
  onUploadOrder,
  onUploadPayment,
  onToggleGroup,
  onPreviewFile,
  onDeleteFile,
}: ProviderFilesTabProps) {
  const totalFiles =
    groupedFiles.orders.reduce((s, g) => s + g.files.length, 0) +
    groupedFiles.payments.reduce((s, g) => s + g.files.length, 0) +
    groupedFiles.general.reduce((s, g) => s + g.files.length, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <h4
          className={cn(
            "text-xs font-bold uppercase tracking-widest flex items-center gap-2",
            isLight ? "text-emerald-700" : "text-green-400/80"
          )}
        >
          <FileText className="h-3.5 w-3.5" /> Facturas recibidas
        </h4>
        {loadingInvoices ? (
          <p className={cn("text-xs", isLight ? "text-neutral-500" : "text-white/40")}>
            Cargando…
          </p>
        ) : providerInvoices.length === 0 ? (
          <p className={cn("text-xs", isLight ? "text-neutral-500" : "text-white/40")}>
            Ninguna factura vinculada a este proveedor
          </p>
        ) : (
          <div className="space-y-2">
            {providerInvoices.map((inv) => (
              <a
                key={inv.id}
                href={`/dashboard/finance/billing?invoice=${inv.id}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  isLight
                    ? "bg-neutral-50 border border-neutral-100 hover:bg-neutral-100"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                )}
              >
                <span className={cn("text-sm font-medium", isLight ? "text-neutral-900" : "text-white")}>
                  {inv.number}
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", isLight ? "border-neutral-200 text-neutral-600" : "border-white/20 text-white/70")}
                >
                  {inv.status}
                </Badge>
                <ExternalLink className={cn("h-3.5 w-3.5", isLight ? "text-neutral-400" : "text-white/40")} />
              </a>
            ))}
          </div>
        )}
      </div>

      {loadingFiles ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-20 w-full rounded-lg animate-pulse",
                isLight ? "bg-neutral-200/60" : "bg-white/5 border border-white/10"
              )}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className={cn("font-medium", isLight ? "text-neutral-900" : "text-white")}>
              Documentos del proveedor
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadProvider}
              className={
                isLight
                  ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                  : "border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20"
              }
            >
              <Upload className="h-4 w-4 mr-2" /> Subir archivo
            </Button>
          </div>

          {groupedFiles.orders.length > 0 && (
            <div className="space-y-3">
              <h4
                className={cn(
                  "text-xs font-bold uppercase tracking-widest flex items-center gap-2",
                  isLight ? "text-blue-600" : "text-blue-400/80"
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Archivos de Pedidos
              </h4>
              {groupedFiles.orders.map((group) => {
                const orderKey = `order-${group.order?.id ?? "unknown"}`
                const isCollapsed = collapsedGroups[orderKey]
                return (
                  <div
                    key={orderKey}
                    className={cn(
                      "rounded-lg border overflow-hidden",
                      isLight ? "border-blue-100 bg-blue-50/30" : "border-blue-500/10 bg-blue-500/5"
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onToggleGroup(orderKey)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onToggleGroup(orderKey)
                        }
                      }}
                      className={cn(
                        "w-full p-3 flex items-center justify-between text-left cursor-pointer transition-colors",
                        isLight ? "hover:bg-blue-50/50" : "hover:bg-blue-500/10"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isCollapsed ? (
                          <ChevronDown className={cn("h-4 w-4 shrink-0", isLight ? "text-blue-600" : "text-blue-400")} />
                        ) : (
                          <ChevronUp className={cn("h-4 w-4 shrink-0", isLight ? "text-blue-600" : "text-blue-400")} />
                        )}
                        <ShoppingBag className={cn("h-3.5 w-3.5 shrink-0", isLight ? "text-blue-600" : "text-blue-400")} />
                        <span className={cn("text-xs font-medium truncate", isLight ? "text-neutral-800" : "text-white/80")}>
                          {group.order?.description ?? `Pedido #${group.order?.id?.slice(-4).toUpperCase()}`}
                        </span>
                        {group.order?.amount != null && (
                          <span className={cn("text-[10px] font-mono shrink-0", isLight ? "text-neutral-500" : "text-white/40")}>
                            {formatCurrency(group.order.amount)}
                          </span>
                        )}
                        <span className={cn("text-[10px] shrink-0", isLight ? "text-neutral-400" : "text-white/30")}>
                          ({group.files?.length ?? 0})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (group.order?.id) onUploadOrder(group.order.id)
                        }}
                        className="text-xs shrink-0"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adjuntar
                      </Button>
                    </div>
                    {!isCollapsed && (
                      <div className="px-3 pb-3 flex flex-col gap-2">
                        {group.files?.map((file) => (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center gap-2 rounded px-2.5 py-1.5 text-[11px] transition-colors",
                              isLight
                                ? "bg-white border border-neutral-100 text-neutral-700"
                                : "bg-white/5 border border-white/10 text-zinc-200 hover:border-blue-500/30 hover:bg-blue-500/10"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => onPreviewFile(file)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-left"
                            >
                              <FileText className={cn("h-3.5 w-3.5 shrink-0", isLight ? "text-blue-600" : "text-blue-400")} />
                              <span className="truncate flex-1 min-w-0">{file.name}</span>
                              <span className={cn("shrink-0", isLight ? "text-neutral-500" : "text-blue-300/80")}>
                                {fileCategoryLabel(file.category)}
                              </span>
                              {file.createdAt && (
                                <span className={cn("shrink-0", isLight ? "text-neutral-400" : "text-white/50")}>
                                  {format(new Date(file.createdAt), "dd/MM/yyyy", { locale: es })}
                                </span>
                              )}
                            </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className={cn("shrink-0 p-1", isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300")}
                              title="Descargar"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => onDeleteFile({ id: file.id, name: file.name })}
                              className={cn("shrink-0 p-1", "text-red-500 hover:text-red-600")}
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {groupedFiles.payments.length > 0 && (
            <div className="space-y-3">
              <h4
                className={cn(
                  "text-xs font-bold uppercase tracking-widest flex items-center gap-2",
                  isLight ? "text-green-700" : "text-green-400/80"
                )}
              >
                <CreditCard className="h-3.5 w-3.5" /> Justificantes de Pago
              </h4>
              {groupedFiles.payments.map((group) => {
                const payKey = `payment-${group.payment?.id ?? "unknown"}`
                const isCollapsed = collapsedGroups[payKey]
                return (
                  <div
                    key={payKey}
                    className={cn(
                      "rounded-lg border overflow-hidden",
                      isLight ? "border-green-100 bg-green-50/30" : "border-green-500/10 bg-green-500/5"
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onToggleGroup(payKey)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          onToggleGroup(payKey)
                        }
                      }}
                      className={cn(
                        "w-full p-3 flex items-center justify-between text-left cursor-pointer transition-colors",
                        isLight ? "hover:bg-green-50/50" : "hover:bg-green-500/10"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isCollapsed ? (
                          <ChevronDown className={cn("h-4 w-4 shrink-0", isLight ? "text-green-600" : "text-green-400")} />
                        ) : (
                          <ChevronUp className={cn("h-4 w-4 shrink-0", isLight ? "text-green-600" : "text-green-400")} />
                        )}
                        <CreditCard className={cn("h-3.5 w-3.5 shrink-0", isLight ? "text-green-600" : "text-green-400")} />
                        <span className={cn("text-xs font-medium truncate", isLight ? "text-neutral-800" : "text-white/80")}>
                          {group.payment?.concept ?? "Pago"}
                        </span>
                        {group.payment?.amount != null && (
                          <span className={cn("text-[10px] font-mono shrink-0", isLight ? "text-neutral-500" : "text-white/40")}>
                            {formatCurrency(group.payment.amount)}
                          </span>
                        )}
                        {group.payment?.status && (
                          <Badge
                            className={cn(
                              "text-[8px] px-1 py-0 h-3.5 border-0 shrink-0",
                              group.payment.status === "PAID"
                                ? "bg-green-500/20 text-green-600"
                                : group.payment.status === "FAILED"
                                  ? "bg-red-500/20 text-red-600"
                                  : "bg-amber-500/20 text-amber-600"
                            )}
                          >
                            {group.payment.status === "PAID" ? "Pagado" : group.payment.status === "FAILED" ? "Fallido" : "Pendiente"}
                          </Badge>
                        )}
                        <span className={cn("text-[10px] shrink-0", isLight ? "text-neutral-400" : "text-white/30")}>
                          ({group.files?.length ?? 0})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (group.payment?.id) onUploadPayment(group.payment.id)
                        }}
                        className="text-xs shrink-0"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Adjuntar
                      </Button>
                    </div>
                    {!isCollapsed && (
                      <div className="px-3 pb-3 flex flex-col gap-2">
                        {group.files?.map((file) => (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center gap-2 rounded px-2.5 py-1.5 text-[11px] transition-colors",
                              isLight
                                ? "bg-white border border-neutral-100 text-neutral-700"
                                : "bg-white/5 border border-white/10 text-zinc-200 hover:border-green-500/30 hover:bg-green-500/10"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => onPreviewFile(file)}
                              className="flex items-center gap-2 min-w-0 flex-1 text-left"
                            >
                              <FileText className={cn("h-3.5 w-3.5 shrink-0", isLight ? "text-green-600" : "text-green-400")} />
                              <span className="truncate flex-1 min-w-0">{file.name}</span>
                              <span className={cn("shrink-0", isLight ? "text-neutral-500" : "text-green-300/80")}>
                                {fileCategoryLabel(file.category)}
                              </span>
                              {file.createdAt && (
                                <span className={cn("shrink-0", isLight ? "text-neutral-400" : "text-white/50")}>
                                  {format(new Date(file.createdAt), "dd/MM/yyyy", { locale: es })}
                                </span>
                              )}
                            </button>
                            <a
                              href={file.url}
                              download={file.name}
                              className={cn("shrink-0 p-1", isLight ? "text-green-600 hover:text-green-700" : "text-green-400 hover:text-green-300")}
                              title="Descargar"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => onDeleteFile({ id: file.id, name: file.name })}
                              className="shrink-0 p-1 text-red-500 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-3">
            <h4
              className={cn(
                "text-xs font-bold uppercase tracking-widest flex items-center gap-2",
                isLight ? "text-neutral-500" : "text-white/30"
              )}
            >
              <FileText className="h-3.5 w-3.5" /> Documentos Generales
            </h4>
            {groupedFiles.general.length === 0 ||
          groupedFiles.general.every((g) => !g.files?.length) ? (
              <div
                className={cn(
                  "text-center py-8 rounded-lg border border-dashed",
                  isLight ? "border-neutral-200 bg-neutral-50/50" : "text-white/20 border-white/10"
                )}
              >
                <FileText className={cn("h-8 w-8 mx-auto mb-2", isLight ? "text-neutral-300" : "opacity-30")} />
                <p className={cn("text-xs", isLight ? "text-neutral-500" : "text-white/40")}>
                  Sin documentos generales
                </p>
                <Button type="button" variant="outline" size="sm" onClick={onUploadProvider} className="mt-2 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Subir documento
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {groupedFiles.general.flatMap((g) => g.files ?? []).map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isLight
                        ? "bg-white border border-neutral-100 hover:bg-neutral-50"
                        : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => onPreviewFile(file)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <FileText className={cn("h-4 w-4 shrink-0", isLight ? "text-neutral-500" : "text-zinc-400")} />
                      <div className="min-w-0">
                        <p className={cn("text-xs truncate", isLight ? "text-neutral-800" : "text-white/80")}>
                          {file.name}
                        </p>
                        <p className={cn("text-[10px]", isLight ? "text-neutral-500" : "text-zinc-500")}>
                          {format(new Date(file.createdAt ?? 0), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-[11px]", isLight ? "text-neutral-400" : "text-zinc-400")}>
                        {fileCategoryLabel(file.category)}
                      </span>
                      <a
                        href={file.url}
                        download={file.name}
                        className={cn("p-1", isLight ? "text-neutral-500 hover:text-neutral-700" : "text-zinc-500 hover:text-white")}
                        title="Descargar"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onPreviewFile(file)}
                        className={cn("p-1", isLight ? "text-neutral-500 hover:text-neutral-700" : "text-zinc-500 hover:text-white")}
                        title="Vista previa"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteFile({ id: file.id, name: file.name })}
                        className="p-1 text-red-500 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalFiles === 0 && (
            <div
              className={cn(
                "text-center py-12 rounded-xl",
                isLight ? "border border-neutral-200 bg-neutral-50/50" : "text-white/20 border-2 border-dashed border-white/5"
              )}
            >
              <Upload className={cn("h-12 w-12 mx-auto mb-3", isLight ? "text-neutral-300" : "opacity-20")} />
              <p className={cn("text-sm", isLight ? "text-neutral-600" : "text-white/70")}>Sin archivos</p>
              <p className={cn("text-xs mt-1", isLight ? "text-neutral-500" : "text-white/40")}>
                Sube facturas, albaranes o contratos
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

