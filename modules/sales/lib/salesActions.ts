import type { SalesInsight } from "./sales-insights"

const MAX_ACTIONS = 2

export type SalesActionKind = "TASK" | "NAVIGATION" | "INFO"

export type SuggestedSalesAction = {
  id: string
  type: SalesActionKind
  title: string
  description: string
  ctaLabel: string
  payload: { href?: string; taskTitle?: string; scrollTarget?: string }
  /** Source insight severity for priority. */
  severity: SalesInsight["severity"]
}

const INSIGHT_ACTION_MAP: Record<
  string,
  Omit<SuggestedSalesAction, "id" | "severity"> & { severity: SalesInsight["severity"] }
> = {
  REVENUE_DROP: {
    type: "NAVIGATION",
    title: "Revisar clientes inactivos",
    description: "Identifica clientes que no han comprado en el periodo.",
    ctaLabel: "Ver clientes",
    payload: { href: "/dashboard/clients?filter=inactive" },
    severity: "risk",
  },
  AVG_TICKET_RISK: {
    type: "INFO",
    title: "Optimizar ticket medio",
    description: "Revisa ventas por producto para mejorar el mix.",
    ctaLabel: "Ver oportunidades",
    payload: { href: "/dashboard/other/sales?view=by-product" },
    severity: "warning",
  },
  CLIENT_DEPENDENCY: {
    type: "TASK",
    title: "Diversificar ingresos",
    description: "Reduce el riesgo concentrando menos en un solo cliente.",
    ctaLabel: "Crear tarea",
    payload: { taskTitle: "Contactar clientes alternativos esta semana" },
    severity: "risk",
  },
  GOOD_MOMENTUM: {
    type: "INFO",
    title: "Momento óptimo para escalar",
    description: "Ingresos y volumen al alza.",
    ctaLabel: "Ver ventas recientes",
    payload: { scrollTarget: "chart" },
    severity: "positive",
  },
}

/**
 * Maps insights to suggested actions. Max 2 actions; priority RISK > WARNING > positive.
 * At most one TASK action.
 */
export function getSalesActions(insights: SalesInsight[]): SuggestedSalesAction[] {
  const severityOrder: SalesInsight["severity"][] = ["risk", "warning", "positive"]
  const byInsight = insights.map((i) => {
    const config = INSIGHT_ACTION_MAP[i.type]
    if (!config) return null
    return {
      ...config,
      id: `action-${i.type}`,
      severity: config.severity,
    } as SuggestedSalesAction
  }).filter(Boolean) as SuggestedSalesAction[]

  const sorted = [...byInsight].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  )

  const taskActions = sorted.filter((a) => a.type === "TASK")
  const nonTaskActions = sorted.filter((a) => a.type !== "TASK")
  const atMostOneTask = taskActions.slice(0, 1)
  const rest = nonTaskActions.filter((_, i) => atMostOneTask.length + i < MAX_ACTIONS)
  const combined = [...atMostOneTask, ...rest].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  )

  return combined.slice(0, MAX_ACTIONS)
}
