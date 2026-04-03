"use client"

import { useState, memo } from "react"
import { ShoppingBag, CheckSquare, Mail, Package, Building2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { RegisterOrderDialog } from "./RegisterOrderDialog"
import { CreateTaskDialog } from "./CreateTaskDialog"

type Provider = {
  id: string
  name: string
  type: string | null
  monthlyCost: number | null
  dependencyLevel: string
  status: string
  isCritical: boolean
  operationalState: string
  createdAt: Date
  updatedAt: Date
  payments: any[]
  tasks: any[]
  contactEmail?: string | null
  _count: { payments: number; tasks: number }
}

type Props = {
  providers: Provider[]
  onProviderClick: (p: Provider) => void
  onProviderUpdate: (id: string, data: any) => void
  resultCount?: number
  totalCount?: number
  hasActiveFilters?: boolean
  onCreateClick?: () => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  OK:      { label: "Estable",    bg: "#DCFCE7", text: "#166534" },
  ACTIVE:  { label: "Activo",     bg: "#DCFCE7", text: "#166534" },
  PAUSED:  { label: "Pausado",    bg: "#F1F5F9", text: "#475569" },
  PENDING: { label: "Pendiente",  bg: "#FEF9C3", text: "#854D0E" },
  ISSUE:   { label: "Incidencia", bg: "#FEF3C7", text: "#92400E" },
  BLOCKED: { label: "Bloqueado",  bg: "#FEE2E2", text: "#991B1B" },
}

const DEP_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  LOW:      { label: "Baja",     bg: "#F1F5F9", text: "#475569" },
  MEDIUM:   { label: "Media",    bg: "#DBEAFE", text: "#1E40AF" },
  HIGH:     { label: "Alta",     bg: "#FEE2E2", text: "#991B1B" },
  CRITICAL: { label: "Crítica",  bg: "#FEE2E2", text: "#7F1D1D" },
}

const TYPE_LABELS: Record<string, string> = {
  SERVICE: "Servicio", PRODUCT: "Producto", SOFTWARE: "Software", OTHER: "Otro",
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()
}

function formatEUR(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function Badge({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <span style={{ background: bg, color: text, fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px", display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  )
}

function ProvidersTableComponent({ providers, onProviderClick, onProviderUpdate, resultCount, totalCount, hasActiveFilters, onCreateClick }: Props) {
  const [orderDialog, setOrderDialog] = useState<Provider | null>(null)
  const [taskDialog, setTaskDialog] = useState<Provider | null>(null)

  if (providers.length === 0) {
    return (
      <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, padding: 48, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: "var(--bg-surface)", border: "0.5px solid var(--border-subtle)" }}>
            <Package size={24} style={{ color: "var(--text-secondary)" }} />
          </div>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>
          {hasActiveFilters ? "Sin resultados" : "Sin proveedores"}
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          {hasActiveFilters ? "Ajusta los filtros para ver más." : "Añade el primer proveedor para empezar."}
        </p>
        {!hasActiveFilters && onCreateClick && (
          <button onClick={onCreateClick} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#1FA97A", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>
            Nuevo proveedor
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-surface)", borderBottom: "0.5px solid var(--border-subtle)" }}>
                {["PROVEEDOR", "TIPO", "COSTE / MES", "ESTADO", "DEPENDENCIA", "ÚLTIMA ACCIÓN", ""].map((h, i) => (
                  <th key={i} style={{ padding: "11px 16px", textAlign: i === 6 ? "right" : "left", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {providers.map(p => {
                const isIncident = p.status === "ISSUE"
                const isInactive = p.status === "PAUSED" || p.status === "BLOCKED"
                const statusCfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.ACTIVE
                const depCfg = DEP_CONFIG[p.dependencyLevel] ?? DEP_CONFIG.LOW

                return (
                  <tr
                    key={p.id}
                    onClick={() => onProviderClick(p)}
                    style={{
                      borderBottom: "0.5px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      background: isIncident ? "rgba(245,158,11,0.04)" : "transparent",
                      opacity: isInactive ? 0.6 : 1,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = isIncident ? "rgba(245,158,11,0.08)" : "var(--bg-surface)")}
                    onMouseLeave={e => (e.currentTarget.style.background = isIncident ? "rgba(245,158,11,0.04)" : "transparent")}
                  >
                    {/* Proveedor */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(31,169,122,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#1FA97A" }}>{initials(p.name)}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
                        {p.isCritical && (
                          <span style={{ fontSize: 10, fontWeight: 600, background: "#FEE2E2", color: "#991B1B", borderRadius: 4, padding: "1px 5px" }}>CRÍTICO</span>
                        )}
                      </div>
                    </td>
                    {/* Tipo */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{TYPE_LABELS[p.type ?? "OTHER"] ?? p.type ?? "—"}</span>
                    </td>
                    {/* Coste */}
                    <td style={{ padding: "12px 16px" }}>
                      {p.monthlyCost ? (
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{formatEUR(p.monthlyCost)}</span>
                          <span style={{ fontSize: 11, color: "var(--text-secondary)", display: "block" }}>{formatEUR(p.monthlyCost * 12)}/año</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>—</span>
                      )}
                    </td>
                    {/* Estado */}
                    <td style={{ padding: "12px 16px" }}>
                      <Badge bg={statusCfg.bg} text={statusCfg.text} label={statusCfg.label} />
                    </td>
                    {/* Dependencia */}
                    <td style={{ padding: "12px 16px" }}>
                      <Badge bg={depCfg.bg} text={depCfg.text} label={depCfg.label} />
                    </td>
                    {/* Última acción */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true, locale: es })}
                      </span>
                    </td>
                    {/* Acciones */}
                    <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        {[
                          { Icon: ShoppingBag, title: "Nuevo pedido", color: "#1FA97A", bg: "rgba(31,169,122,0.08)", fn: () => setOrderDialog(p) },
                          { Icon: CheckSquare, title: "Nueva tarea", color: "#D97706", bg: "rgba(217,119,6,0.08)", fn: () => setTaskDialog(p) },
                          {
                            Icon: Mail, title: "Enviar email", color: "#0EA5E9", bg: "rgba(14,165,233,0.08)",
                            fn: () => p.contactEmail ? window.open(`mailto:${p.contactEmail}`) : onProviderClick(p),
                          },
                        ].map(({ Icon, title, color, bg, fn }) => (
                          <button key={title} title={title} onClick={fn}
                            style={{ width: 30, height: 30, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color, transition: "background 0.12s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = bg)}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Icon size={15} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "0.5px solid var(--border-subtle)", fontSize: 12, color: "var(--text-secondary)" }}>
          <span>
            Mostrando {hasActiveFilters ? `${resultCount ?? providers.length} de ${totalCount}` : providers.length}{" "}
            {providers.length === 1 ? "proveedor" : "proveedores"}
          </span>
          <span>Clic en fila para ver detalle</span>
        </div>
      </div>

      {orderDialog && (
        <RegisterOrderDialog
          providerId={orderDialog.id}
          providerName={orderDialog.name}
          open
          onOpenChange={open => !open && setOrderDialog(null)}
          onSuccess={() => onProviderUpdate(orderDialog.id, {})}
        />
      )}
      {taskDialog && (
        <CreateTaskDialog
          providerId={taskDialog.id}
          providerName={taskDialog.name}
          open
          onOpenChange={open => !open && setTaskDialog(null)}
          onSuccess={() => onProviderUpdate(taskDialog.id, {})}
        />
      )}
    </>
  )
}

export const ProvidersTable = memo(ProvidersTableComponent)
