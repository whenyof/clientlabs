"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

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
  predictions?: {
    nextMonthRevenue?: number
    nextMonthExpenses?: number
    nextMonthCashFlow?: number
  }
  budgets?: Array<{ id: string; category: string; limit: number; spent: number; remaining?: number; status?: string; utilization?: number }>
  alerts?: Array<{ id: string; type: string; message: string; severity: string; read: boolean }>
  fixedExpenses?: Array<{ id: string; name: string; amount: number; frequency: string; nextPayment: string; active: boolean }>
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

type FinanceDataContextValue = {
  analytics: FinanceAnalyticsData | null
  transactions: TransactionsResponse | null
  loading: boolean
  transactionsLoading: boolean
  refetch: () => void
  refetchTransactions: () => void
}

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null)

export function FinanceDataProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<FinanceAnalyticsData | null>(null)
  const [transactions, setTransactions] = useState<TransactionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/finance/analytics")
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      } else {
        setAnalytics(null)
      }
    } catch {
      setAnalytics(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    try {
      const res = await fetch("/api/transactions?limit=200")
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      } else {
        setTransactions(null)
      }
    } catch {
      setTransactions(null)
    } finally {
      setTransactionsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const refetchTransactions = useCallback(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return (
    <FinanceDataContext.Provider
      value={{
        analytics,
        transactions,
        loading,
        transactionsLoading,
        refetch,
        refetchTransactions,
      }}
    >
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
