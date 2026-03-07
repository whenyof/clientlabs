/**
 * Sales module types. Aligned with Prisma Sale model.
 */
export type Sale = {
  id: string
  userId: string
  clientId: string | null
  clientName: string
  clientEmail: string | null
  product: string
  category: string | null
  price: number
  discount: number
  tax: number
  total: number
  amount: number | null
  currency: string
  provider: string
  paymentMethod: string
  status: string
  stripePaymentId: string | null
  stripeCustomerId: string | null
  metadata: unknown
  notes: string | null
  saleDate: Date
  invoiceUrl: string | null
  createdAt: Date
  updatedAt: Date
  Client?: { id: string; name: string | null; email: string | null } | null
}

export type SaleCreateInput = {
  clientId?: string | null
  clientName: string
  clientEmail?: string | null
  product: string
  category?: string | null
  total: number
  currency?: string
  status?: string
  notes?: string | null
  saleDate?: Date
}

export type SaleUpdateInput = {
  product?: string
  total?: number
  status?: string
  notes?: string | null
  saleDate?: Date
  invoiceUrl?: string | null
}

export type SalesKPIs = {
  totalSales: number
  totalRevenue: number
  monthRevenue: number
  avgTicket: number
  paidCount: number
  pendingCount: number
  paidPercent: number
}

/** Presets del selector de rango temporal. Custom usa dateFrom/dateTo en estado. */
export type DateRangePreset = "today" | "7d" | "30d" | "month" | "6m" | "year" | "custom"

/** Punto de gráfica con label ya formateado (sin Invalid date). date es clave YYYY-MM-DD o YYYY-MM. */
export type SalesChartPoint = {
  label: string
  date: string
  revenue: number
  count: number
  avgTicket: number
}

export type SalesKPIsWithVariation = {
  totalRevenue: number
  totalRevenuePrev: number
  totalRevenueDelta: number
  totalRevenueVar: number | null
  totalSales: number
  totalSalesPrev: number
  totalSalesVar: number | null
  avgTicket: number
  avgTicketPrev: number
  avgTicketVar: number | null
  paidCount: number
  paidCountPrev: number
  paidPercent: number
  paidPercentPrev: number
  paidPercentVar: number | null
  topClient: { name: string; total: number } | null
}

/** Single scenario value (revenue + count) for a forecast horizon. */
export type SalesForecastScenarioValue = { revenue: number; count: number }

/** Three scenarios per horizon. Percentages are vs base (-10% / base / +10%). */
export type SalesForecastScenarios = {
  conservador: SalesForecastScenarioValue
  base: SalesForecastScenarioValue
  optimista: SalesForecastScenarioValue
}

/** Forecast result: medias, projections by horizon, chart series. Deterministic, no external AI. */
export type SalesForecastResult = {
  canCompute: boolean
  medias: {
    dailyRevenue: number
    dailyCount: number
    daysInPeriod: number
    trendRevenuePct: number | null
    trendCountPct: number | null
  }
  projections: {
    endOfMonth: SalesForecastScenarios
    next30: SalesForecastScenarios
    next90: SalesForecastScenarios
  }
  /** Combined chart: historical points + forecast points. revenue/count = actual; forecastRevenue/forecastCount = projected daily. */
  chartData: Array<{
    label: string
    date: string
    revenue: number
    count: number
    forecastRevenue: number | null
    forecastCount: number | null
  }>
}

/** Year-over-Year: same period previous year. No division by zero; null = no prior data. */
export type SalesYoYMetrics = {
  revenue: number
  revenuePrevious: number
  revenueVarPct: number | null
  salesCount: number
  salesCountPrevious: number
  salesCountVarPct: number | null
  avgTicket: number
  avgTicketPrevious: number
  avgTicketVarPct: number | null
  hasPreviousData: boolean
}

/** One point for YoY chart: current period vs same calendar period last year. */
export type SalesYoYChartPoint = {
  label: string
  date: string
  revenueCurrent: number
  revenuePrevious: number
  countCurrent: number
  countPrevious: number
}
