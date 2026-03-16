"use client"

import { ExternalLink, Plus, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProviderReadinessCard } from "../summary/ProviderReadinessCard"
import { ProviderOperationalCenterCard } from "../summary/ProviderOperationalCenterCard"
import type { PurchaseChartPoint } from "../summary/ProviderOperationalCenterCard"
import { ProviderSuggestionCard } from "../summary/ProviderSuggestionCard"
import { ProviderQuickActionsCard } from "../summary/ProviderQuickActionsCard"
import { ProviderContactCard } from "../summary/ProviderContactCard"
import { ProviderRiskCard } from "../summary/ProviderRiskCard"
import { ProviderRecentActivityCard } from "../summary/ProviderRecentActivityCard"
import { formatCurrency as formatCurrencyFn } from "@/modules/providers/lib/provider-order-calculations"

export type RuntimeAlert = {
  id: string
  severity: "error" | "warning"
  message: string
  action?: { label: string; onClick: () => void }
}

export type ProviderSummaryTabProps = {
  isLight: boolean
  // Readiness
  hasOrderEmail: boolean
  hasCatalog: boolean
  hasDefaultTemplate: boolean
  onNewOrder: () => void
  onAddEmail: () => void
  onImportProducts: () => void
  onCreateTemplate: () => void
  // Operational center
  operationalSubtext: string
  daysSinceLastOrder: number | null
  pendingOrdersCount: number
  productsCount: number
  pendingPaymentsCount: number
  loadingProducts: boolean
  purchaseChartData: PurchaseChartPoint[]
  // Suggestion
  suggestionMessage: string
  suggestionOnClick: () => void
  // Alerts
  runtimeAlerts: RuntimeAlert[]
  // Products block
  onAddProduct: () => void
  onGoToProductos: () => void
  // Quick actions
  onQuickOrder: () => void
  onQuickTask: () => void
  onQuickNote: () => void
  onQuickFile: () => void
  // Contact
  contactEmail?: string | null
  contactPhone?: string | null
  // Risk
  dependencyLevel: string
  operationalState: string
  affectedArea?: string | null
  hasAlternative?: boolean
  // Recent activity
  recentActivityText: string
  onViewTimeline: () => void
  // Notes
  notesContent?: string | null
}

export function ProviderSummaryTab({
  isLight,
  hasOrderEmail,
  hasCatalog,
  hasDefaultTemplate,
  onNewOrder,
  onAddEmail,
  onImportProducts,
  onCreateTemplate,
  operationalSubtext,
  daysSinceLastOrder,
  pendingOrdersCount,
  productsCount,
  pendingPaymentsCount,
  loadingProducts,
  purchaseChartData,
  suggestionMessage,
  suggestionOnClick,
  runtimeAlerts,
  onAddProduct,
  onGoToProductos,
  onQuickOrder,
  onQuickTask,
  onQuickNote,
  onQuickFile,
  contactEmail,
  contactPhone,
  dependencyLevel,
  operationalState,
  affectedArea,
  hasAlternative,
  recentActivityText,
  onViewTimeline,
  notesContent,
}: ProviderSummaryTabProps) {
  const orderReadinessOk = hasOrderEmail && hasCatalog && hasDefaultTemplate

  return (
    <div
      className={cn(
        "p-4 sm:p-5 space-y-4",
        isLight &&
          "pt-0 lg:grid lg:grid-cols-[1fr_220px] lg:gap-4 lg:space-y-0 lg:items-stretch lg:auto-rows-auto"
      )}
    >
      <div className={isLight ? "lg:col-span-2 lg:row-start-1" : undefined}>
        <ProviderReadinessCard
        isLight={isLight}
        ready={orderReadinessOk}
        hasOrderEmail={hasOrderEmail}
        hasCatalog={hasCatalog}
        hasDefaultTemplate={hasDefaultTemplate}
        onNewOrder={onNewOrder}
        onAddEmail={onAddEmail}
        onImportProducts={onImportProducts}
        onCreateTemplate={onCreateTemplate}
      />
      </div>

      <div className={isLight ? "lg:col-start-1 lg:row-start-2" : undefined}>
        <ProviderOperationalCenterCard
          isLight={isLight}
          operationalSubtext={operationalSubtext}
          daysSinceLastOrder={daysSinceLastOrder}
          pendingOrdersCount={pendingOrdersCount}
          productsCount={productsCount}
          pendingPaymentsCount={pendingPaymentsCount}
          loadingProducts={loadingProducts}
          purchaseChartData={purchaseChartData}
          formatCurrency={formatCurrencyFn}
        />
      </div>
      <div className={isLight ? "lg:col-span-2 lg:row-start-3" : undefined}>
        <ProviderSuggestionCard
          isLight={isLight}
          message={suggestionMessage}
          onClick={suggestionOnClick}
        />
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 border-l-2 border-l-[var(--accent)]",
          isLight
            ? "bg-white border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2 lg:row-start-4"
            : "border-white/[0.06] bg-white/[0.02] border-l-emerald-500/50"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className={cn("text-sm font-semibold", isLight ? "text-neutral-800" : "text-white")}>
            Productos
          </h3>
          {!loadingProducts && productsCount > 0 && (
            <span
              className={cn(
                "text-[10px]",
                isLight ? "text-neutral-400" : "text-white/50"
              )}
            >
              {productsCount} en catálogo
            </span>
          )}
        </div>
        {loadingProducts ? (
          <p
            className={cn(
              "text-[11px] mt-2",
              isLight ? "text-neutral-400" : "text-white/50"
            )}
          >
            Cargando…
          </p>
        ) : productsCount === 0 ? (
          <div className="mt-2">
            <p
              className={cn(
                "text-[11px]",
                isLight ? "text-neutral-500" : "text-white/50"
              )}
            >
              Añade productos para usar en pedidos.
            </p>
            <button
              type="button"
              onClick={onAddProduct}
              className={cn(
                "mt-2 text-xs font-medium flex items-center gap-1.5",
                isLight ? "text-emerald-600 hover:underline" : "text-emerald-400 hover:underline"
              )}
            >
              <Plus className="h-3.5 w-3.5" /> Añadir producto
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={onGoToProductos}
              className={cn(
                "text-[11px] font-medium",
                isLight ? "text-emerald-600 hover:underline" : "text-emerald-400 hover:underline"
              )}
            >
              Ver catálogo
            </button>
            <span
              className={cn(
                "text-[10px]",
                isLight ? "text-neutral-400" : "text-white/40"
              )}
            >
              ·
            </span>
            <button
              type="button"
              onClick={onAddProduct}
              className={cn(
                "text-[11px]",
                isLight ? "text-neutral-500 hover:underline" : "text-white/50 hover:underline"
              )}
            >
              Añadir
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col gap-3",
          isLight && "lg:col-start-2 lg:row-start-2"
        )}
      >
        <ProviderQuickActionsCard
          isLight={isLight}
          onOrder={onQuickOrder}
          onTask={onQuickTask}
          onNote={onQuickNote}
          onFile={onQuickFile}
        />
        <ProviderContactCard
          isLight={isLight}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
        />
        <ProviderRiskCard
          isLight={isLight}
          dependencyLevel={dependencyLevel}
          operationalState={operationalState}
          affectedArea={affectedArea}
          hasAlternative={hasAlternative}
        />
        <ProviderRecentActivityCard
          isLight={isLight}
          recentActivityText={recentActivityText}
          onViewTimeline={onViewTimeline}
        />
      </div>

      {notesContent && (
        <details
          className={cn(
            "rounded-xl border",
            isLight
              ? "bg-white border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:col-span-2 lg:row-start-6"
              : "border-white/[0.06] bg-white/[0.02]"
          )}
        >
          <summary
            className={cn(
              "list-none px-4 py-2.5 cursor-pointer text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/40"
            )}
          >
            Notas internas
          </summary>
          <div
            className={cn(
              "px-4 pb-4 pt-0 border-t",
              isLight ? "border-neutral-100" : "border-white/10"
            )}
          >
            <p
              className={cn(
                "text-xs whitespace-pre-wrap leading-relaxed mt-2",
                isLight ? "text-neutral-600" : "text-white/70"
              )}
            >
              {notesContent}
            </p>
          </div>
        </details>
      )}

      {runtimeAlerts.length > 0 && (
        <div
          className={cn(
            "space-y-2",
            isLight && "lg:col-start-1 lg:col-span-2 lg:row-start-7"
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <h3
              className={cn(
                "text-[11px] font-medium uppercase tracking-wider",
                isLight ? "text-neutral-500" : "text-white/40"
              )}
            >
              {runtimeAlerts.length} alerta{runtimeAlerts.length > 1 ? "s" : ""}
            </h3>
          </div>
          {runtimeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                alert.severity === "error"
                  ? isLight
                    ? "bg-red-50/70 border-red-100"
                    : "bg-red-500/5 border-red-500/15"
                  : isLight
                    ? "bg-amber-50/70 border-amber-100"
                    : "bg-amber-500/5 border-amber-500/15"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-1.5 w-1.5 rounded-full shrink-0",
                  alert.severity === "error"
                    ? "bg-red-500 shadow-[0_0_6px] shadow-red-500/50"
                    : "bg-amber-500 shadow-[0_0_6px] shadow-amber-500/50"
                )}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    alert.severity === "error"
                      ? isLight
                        ? "text-red-700"
                        : "text-red-200/80"
                      : isLight
                        ? "text-amber-800"
                        : "text-amber-200/80"
                  )}
                >
                  {alert.message}
                </p>
                {alert.action && (
                  <button
                    type="button"
                    onClick={alert.action.onClick}
                    className={cn(
                      "mt-1.5 text-[10px] font-medium flex items-center gap-1 transition-colors",
                      alert.severity === "error"
                        ? "text-red-400/60 hover:text-red-400"
                        : "text-amber-400/60 hover:text-amber-400"
                    )}
                  >
                    {alert.action.label} <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
