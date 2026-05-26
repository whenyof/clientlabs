// Finance Module — configuration and utility exports

export interface FinanceKPIs {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  burnRate: number
  recurringPayments: number
  growthRate: number
  cashFlow: number
}

export interface FinanceAnalytics {
  monthlyTrend: {
    month: string
    income: number
    expenses: number
    profit: number
  }[]
  categoryBreakdown: {
    category: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }[]
  clientRevenue: {
    clientId: string
    clientName: string
    totalRevenue: number
    transactions: number
  }[]
}

// Categories for transactions
export const transactionCategories = {
  income: [
    'Ventas productos',
    'Servicios profesionales',
    'Consultoría',
    'Licencias software',
    'Comisiones',
    'Ingresos pasivos',
    'Subvenciones',
    'Otros ingresos'
  ],
  expense: [
    'Marketing y publicidad',
    'Sueldos y nóminas',
    'Alquiler oficina',
    'Software y herramientas',
    'Materiales oficina',
    'Viajes y representación',
    'Formación y cursos',
    'Mantenimiento equipos',
    'Servicios profesionales',
    'Impuestos y tasas',
    'Seguros',
    'Otros gastos'
  ]
}

// Payment methods
export const paymentMethods = [
  'Transferencia bancaria',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'PayPal',
  'Bizum',
  'Efectivo',
  'Cheque',
  'Domiciliación'
]

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const getTransactionTypeColor = (type: string) => {
  return type === 'INCOME' ? 'text-green-400' : 'text-red-400'
}

export const getTransactionStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'CANCELLED':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)] border-[var(--border-subtle)]'
  }
}

export const getBudgetStatus = (spent: number, limit: number) => {
  const percentage = (spent / limit) * 100
  if (percentage >= 90) return { status: 'danger', color: 'bg-red-500' }
  if (percentage >= 75) return { status: 'warning', color: 'bg-yellow-500' }
  return { status: 'good', color: 'bg-green-500' }
}

export const getGoalProgress = (current: number, target: number) => {
  return Math.min((current / target) * 100, 100)
}

export const getAlertSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default:
      return 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)] border-[var(--border-subtle)]'
  }
}

export const formatExpenseFrequency = (freq: string) => {
  return {
    monthly: "Mensual",
    weekly: "Semanal",
    yearly: "Anual",
    quarterly: "Trimestral",
    semiannual: "Semestral",
    annual: "Anual"
  }[freq.toLowerCase()] || freq
}