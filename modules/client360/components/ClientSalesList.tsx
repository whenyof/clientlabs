"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Eye, Pencil, FileText, FilePlus2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import type { ClientSaleRow, ClientSalesKPIs } from "../services/getClientSales"

const STATUS_STYLES: Record<string, { label: string; style: string }> = {
  PAID:      { label: "Pagado",    style: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]"                    },
  PAGADO:    { label: "Pagado",    style: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]"                    },
  PENDING:   { label: "Pendiente", style: "bg-amber-50 text-amber-700 border-amber-200"                                            },
  CANCELED:  { label: "Cancelado", style: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]" },
  CANCELADO: { label: "Cancelado", style: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]" },
}

const ICON_BTN = "h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] shrink-0"

interface ClientSalesListProps {
  sales: ClientSaleRow[]
  kpis: ClientSalesKPIs
  clientId: string
}

export function ClientSalesList({ sales, kpis, clientId }: ClientSalesListProps) {
  const router = useRouter()

  const handleView        = useCallback((id: string) => router.push(`/dashboard/sales?sale=${id}`),                                     [router])
  const handleEdit        = useCallback((id: string) => router.push(`/dashboard/sales?sale=${id}&edit=true`),                           [router])
  const handleViewInvoice = useCallback((id: string) => router.push(`/dashboard/finance/billing?invoice=${id}`),                        [router])
  const handleCreateInvoice = useCallback((id: string) => router.push(`/dashboard/finance/billing?newFromSale=${id}&client=${clientId}`), [router, clientId])

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--text-secondary)]">
        <ShoppingBag className="h-8 w-8 opacity-30" />
        <p className="text-sm">No hay ventas registradas</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            {["Producto", "Fecha", "Estado", "Total", "Factura", ""].map((h) => (
              <th
                key={h}
                className="py-2.5 px-4 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap last:w-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const st = STATUS_STYLES[sale.status] ?? {
              label: sale.status,
              style: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
            }
            return (
              <tr
                key={sale.id}
                onClick={() => handleView(sale.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleView(sale.id) } }}
                aria-label={`Ver venta ${sale.product}`}
                className="border-b border-[var(--border-subtle)] transition-colors cursor-pointer hover:bg-[var(--bg-surface)]"
              >
                <td className="py-3 px-4 font-medium text-[var(--text-primary)] max-w-[220px] truncate">
                  {sale.product}
                </td>
                <td className="py-3 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDate(sale.saleDate)}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${st.style}`}>
                    {st.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-right tabular-nums font-medium text-[var(--text-primary)] whitespace-nowrap">
                  {formatCurrency(sale.total, sale.currency)}
                </td>
                <td className="py-3 px-4 text-center">
                  {sale.invoiceId ? (
                    <span className="inline-flex items-center rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                      Sí
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                      No
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="sm" className={ICON_BTN} title="Ver" onClick={() => handleView(sale.id)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className={ICON_BTN} title="Editar" onClick={() => handleEdit(sale.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {sale.invoiceId ? (
                      <Button variant="ghost" size="sm" className={ICON_BTN} title="Ver factura" onClick={() => handleViewInvoice(sale.invoiceId!)}>
                        <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className={ICON_BTN} title="Crear factura" onClick={() => handleCreateInvoice(sale.id)}>
                        <FilePlus2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
