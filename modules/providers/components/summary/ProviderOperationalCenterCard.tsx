"use client"

import { cn } from "@/lib/utils"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"
import { formatCurrency as formatCurrencyFn } from "@/modules/providers/lib/provider-order-calculations"

export type PurchaseChartPoint = { month: string; gasto: number; pedidos: number }

export type ProviderOperationalCenterCardProps = {
  isLight: boolean
  operationalSubtext: string
  daysSinceLastOrder: number | null
  pendingOrdersCount: number
  productsCount: number
  pendingPaymentsCount: number
  loadingProducts: boolean
  purchaseChartData: PurchaseChartPoint[]
  formatCurrency: typeof formatCurrencyFn
}

export function ProviderOperationalCenterCard({
  isLight,
  operationalSubtext,
  daysSinceLastOrder,
  pendingOrdersCount,
  productsCount,
  pendingPaymentsCount,
  loadingProducts,
  purchaseChartData,
  formatCurrency,
}: ProviderOperationalCenterCardProps) {
  const hasChartData = purchaseChartData.some((d) => d.gasto > 0)

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        isLight
          ? "bg-white border-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:col-start-1 lg:row-start-1"
          : "border-white/10 bg-white/[0.02]"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className={cn("text-sm font-semibold", isLight ? "text-neutral-900" : "text-white")}>
          Centro operativo
        </h3>
        <span
          className={cn(
            "text-[11px] font-medium",
            isLight ? "text-neutral-500" : "text-white/50"
          )}
        >
          {operationalSubtext}
        </span>
      </div>
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3")}>
        <div
          className={cn(
            "rounded-lg border p-2.5 min-h-[52px] flex flex-col justify-center",
            isLight ? "border-neutral-100" : "border-white/10"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/40"
            )}
          >
            Último pedido
          </p>
          <p
            className={cn(
              "text-sm font-semibold mt-0.5",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            {daysSinceLastOrder != null
              ? daysSinceLastOrder === 0
                ? "Hoy"
                : `Hace ${daysSinceLastOrder}d`
              : "Sin pedidos"}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-2.5 min-h-[52px] flex flex-col justify-center",
            isLight ? "border-neutral-100" : "border-white/10"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/40"
            )}
          >
            Pedidos abiertos
          </p>
          <p
            className={cn(
              "text-sm font-semibold mt-0.5",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            {pendingOrdersCount > 0 ? pendingOrdersCount : "Ninguno"}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-2.5 min-h-[52px] flex flex-col justify-center",
            isLight ? "border-neutral-100" : "border-white/10"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/40"
            )}
          >
            Productos en catálogo
          </p>
          <p
            className={cn(
              "text-sm font-semibold mt-0.5",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            {loadingProducts ? "…" : productsCount > 0 ? productsCount : "Ninguno"}
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg border p-2.5 min-h-[52px] flex flex-col justify-center",
            isLight ? "border-neutral-100" : "border-white/10"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/40"
            )}
          >
            Pagos pendientes
          </p>
          <p
            className={cn(
              "text-sm font-semibold mt-0.5",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            {pendingPaymentsCount > 0 ? pendingPaymentsCount : "Ninguno"}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "mt-4 pt-4 border-t",
          isLight ? "border-neutral-100" : "border-white/10"
        )}
      >
        <p
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider mb-3",
            isLight ? "text-neutral-400" : "text-white/40"
          )}
        >
          Compras últimos 6 meses
        </p>
        {hasChartData ? (
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={purchaseChartData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  stroke={isLight ? "#a3a3a3" : "rgba(255,255,255,0.4)"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                />
                <YAxis
                  stroke={isLight ? "#a3a3a3" : "rgba(255,255,255,0.4)"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                />
                <Tooltip
                  contentStyle={
                    isLight
                      ? {
                          backgroundColor: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }
                      : {
                          backgroundColor: "#27272a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }
                  }
                  formatter={(value: number) => [formatCurrency(value), "Gasto"]}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Bar
                  dataKey="gasto"
                  fill={isLight ? "#16a34a" : "#22c55e"}
                  radius={[4, 4, 0, 0]}
                  name="Gasto"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center py-6 rounded-lg border border-dashed",
              isLight
                ? "bg-neutral-50/50 border-neutral-200"
                : "bg-white/[0.02] border-white/10"
            )}
          >
            <p
              className={cn(
                "text-xs font-medium",
                isLight ? "text-neutral-500" : "text-white/50"
              )}
            >
              Todavía no hay suficiente actividad para mostrar evolución
            </p>
            <p
              className={cn(
                "text-[11px] mt-0.5",
                isLight ? "text-neutral-400" : "text-white/40"
              )}
            >
              Los pedidos con pago aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
