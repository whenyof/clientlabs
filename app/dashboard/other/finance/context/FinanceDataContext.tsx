"use client"

import { createContext, useContext, useMemo, useCallback } from "react"

export interface FinanceAnalyticsData {
  success?: boolean
  period?: string
  kpis?: {
    totalIncome: number
    totalExpenses: number
    netProfit: number
    pendingPayments: number
    burnRate: number
    recurringPayments: number
    growthRate: number
    cashFlow: number
  }
  trends?: { incomeGrowth?: number; expenseGrowth?: number; profitGrowth?: number }
  monthlyTrend?: { month: string; income: number; expenses: number; profit: number }[]
  chartSeries?: { date: string; label: string; income: number; expense: number; profit: number }[]
  predictions?: {
    nextMonthRevenue?: number
    nextMonthExpenses?: number
    nextMonthCashFlow?: number
  }
  budgets?: Array<{ id: string; category: string; limit: number; spent: number; remaining?: number; status?: string; utilization?: number }>
  alerts?: Array<{ id: string; type: string; message: string; severity: string; read: boolean }>
  fixedExpenses?: Array<{ id: string; name: string; amount: number; frequency: string; nextPayment: string; active: boolean }>
  detectedRecurringExpenses?: Array<{
    supplier: string
    averageAmount: number
    frequency: "monthly" | "weekly" | "quarterly"
    lastPayment: string
    nextEstimatedPayment: string
  }>
  financialGoals?: Array<{ id: string; title: string; target: number; current: number; deadline: string; status: string; priority?: string }>
}

export interface TransactionsResponse {
  success?: boolean
  transactions: Array<{
    id: string
    type: string
    amount: number
    concept: string
    category: string
    clientId?: string | null
    paymentMethod: string
    status: string
    origin: string
    date: string
    Client?: { id: string; name: string; email?: string } | null
  }>
  pagination?: { page: number; limit: number; total: number; totalPages: number }
  summary?: { totalAmount: number; totalCount: number }
}

export type MovementRow = {
  id: string
  type: string
  date: string
  amount: number
  label: string
  meta?: Record<string, unknown>
}

type FinanceDataContextValue = {
  analytics: FinanceAnalyticsData
  transactions: TransactionsResponse | null
  movements: MovementRow[]
  loading: boolean
  transactionsLoading: boolean
  period: string
  setPeriod: (period: string) => void
  refetch: (period?: string) => void
  refetchTransactions: () => void
}

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null)

const defaultKpis = {
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,
  pendingPayments: 0,
  burnRate: 0,
  recurringPayments: 0,
  growthRate: 0,
  cashFlow: 0,
}

function defaultMonthlyTrend(): { month: string; income: number; expenses: number; profit: number }[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      month: d.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      income: 0,
      expenses: 0,
      profit: 0,
    }
  })
}

const fallbackAnalytics: FinanceAnalyticsData = {
  success: false,
  kpis: defaultKpis,
  trends: { incomeGrowth: 0, expenseGrowth: 0, profitGrowth: 0 },
  monthlyTrend: defaultMonthlyTrend(),
  chartSeries: [],
}

type FinanceDataProviderProps = {
  children: React.ReactNode
  initialAnalytics: FinanceAnalyticsData
  initialMovements?: MovementRow[]
  period: string
  onSetPeriod: (period: string) => void
  onRefetch: () => void
}

export function FinanceDataProvider({
  children,
  initialAnalytics,
  initialMovements = [],
  period,
  onSetPeriod,
  onRefetch,
}: FinanceDataProviderProps) {
  const analytics = useMemo(
    () => ({
      ...fallbackAnalytics,
      ...initialAnalytics,
      kpis: initialAnalytics.kpis ?? defaultKpis,
      trends: initialAnalytics.trends ?? { incomeGrowth: 0, expenseGrowth: 0, profitGrowth: 0 },
      monthlyTrend:
        Array.isArray(initialAnalytics.monthlyTrend) && initialAnalytics.monthlyTrend.length > 0
          ? initialAnalytics.monthlyTrend
          : defaultMonthlyTrend(),
      chartSeries: initialAnalytics.chartSeries ?? [],
    }),
    [initialAnalytics]
  )

  const setPeriod = useCallback(
    (nextPeriod: string) => {
      onSetPeriod(nextPeriod)
    },
    [onSetPeriod]
  )

  const refetch = useCallback(
    (_period?: string) => {
      onRefetch()
    },
    [onRefetch]
  )

  const refetchTransactions = useCallback(() => {
    onRefetch()
  }, [onRefetch])

  const value = useMemo<FinanceDataContextValue>(
    () => ({
      analytics,
      transactions: null,
      movements: initialMovements,
      loading: false,
      transactionsLoading: false,
      period,
      setPeriod,
      refetch,
      refetchTransactions,
    }),
    [analytics, initialMovements, period, setPeriod, refetch, refetchTransactions]
  )

  return (
    <FinanceDataContext.Provider value={value}>
      {children}
    </FinanceDataContext.Provider>
  )
}

export function useFinanceData() {
  const ctx = useContext(FinanceDataContext)
  if (!ctx) {
    throw new Error("useFinanceData must be used within FinanceDataProvider")
  }
  return ctx
}
