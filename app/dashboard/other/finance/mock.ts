import { Transaction, FixedExpense, Budget, FinancialGoal, FinanceAlert, CashflowForecast } from '@prisma/client'

// Enhanced Mock Data for Professional Finance Module

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

// Client data for realistic transactions
export const clients = [
  { id: 'client-1', name: 'TechCorp Solutions', industry: 'Tecnología' },
  { id: 'client-2', name: 'DataFlow Systems', industry: 'Consultoría' },
  { id: 'client-3', name: 'InnovateLab', industry: 'Innovación' },
  { id: 'client-4', name: 'CloudMasters Ltd', industry: 'Cloud Computing' },
  { id: 'client-5', name: 'FutureApps Inc', industry: 'Desarrollo Software' },
  { id: 'client-6', name: 'GreenEnergy Corp', industry: 'Energía' },
  { id: 'client-7', name: 'RetailPlus', industry: 'Retail' },
  { id: 'client-8', name: 'EduTech Academy', industry: 'Educación' }
]

// Generate realistic transactions
export const mockTransactions: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  // Recent income transactions
  {
    type: 'INCOME',
    amount: 2500,
    concept: 'Desarrollo aplicación móvil',
    category: 'Servicios profesionales',
    clientId: 'client-1',
    paymentMethod: 'Transferencia bancaria',
    status: 'COMPLETED',
    origin: 'MANUAL',
    date: new Date('2025-01-15')
  },
  {
    type: 'INCOME',
    amount: 1800,
    concept: 'Consultoría sistema ERP',
    category: 'Consultoría',
    clientId: 'client-2',
    paymentMethod: 'Transferencia bancaria',
    status: 'COMPLETED',
    origin: 'MANUAL',
    date: new Date('2025-01-12')
  },
  {
    type: 'INCOME',
    amount: 950,
    concept: 'Licencia software anual',
    category: 'Licencias software',
    clientId: 'client-3',
    paymentMethod: 'PayPal',
    status: 'COMPLETED',
    origin: 'AUTOMATIC',
    date: new Date('2025-01-10')
  },
  {
    type: 'INCOME',
    amount: 3200,
    concept: 'Proyecto transformación digital',
    category: 'Servicios profesionales',
    clientId: 'client-4',
    paymentMethod: 'Transferencia bancaria',
    status: 'COMPLETED',
    origin: 'MANUAL',
    date: new Date('2025-01-08')
  },
  {
    type: 'INCOME',
    amount: 1200,
    concept: 'Comisión venta productos',
    category: 'Comisiones',
    clientId: 'client-5',
    paymentMethod: 'Bizum',
    status: 'PENDING',
    origin: 'AUTOMATIC',
    date: new Date('2025-01-05')
  },

  // Recent expenses
  {
    type: 'EXPENSE',
    amount: -450,
    concept: 'Marketing Google Ads',
    category: 'Marketing y publicidad',
    paymentMethod: 'Tarjeta de crédito',
    status: 'COMPLETED',
    origin: 'AUTOMATIC',
    date: new Date('2025-01-14'),
    clientId: null
  },
  {
    type: 'EXPENSE',
    amount: -2800,
    concept: 'Nómina enero',
    category: 'Sueldos y nóminas',
    paymentMethod: 'Domiciliación',
    status: 'COMPLETED',
    origin: 'AUTOMATIC',
    date: new Date('2025-01-13'),
    clientId: null
  },
  {
    type: 'EXPENSE',
    amount: -120,
    concept: 'Hosting y dominios',
    category: 'Software y herramientas',
    paymentMethod: 'Tarjeta de débito',
    status: 'COMPLETED',
    origin: 'AUTOMATIC',
    date: new Date('2025-01-11'),
    clientId: null
  },
  {
    type: 'EXPENSE',
    amount: -350,
    concept: 'Material oficina',
    category: 'Materiales oficina',
    paymentMethod: 'Efectivo',
    status: 'COMPLETED',
    origin: 'MANUAL',
    date: new Date('2025-01-09'),
    clientId: null
  },
  {
    type: 'EXPENSE',
    amount: -85,
    concept: 'Suscripción herramientas',
    category: 'Software y herramientas',
    paymentMethod: 'PayPal',
    status: 'PENDING',
    origin: 'AUTOMATIC',
    date: new Date('2025-01-07'),
    clientId: null
  },
  {
    type: 'EXPENSE',
    amount: -220,
    concept: 'Viaje cliente Madrid',
    category: 'Viajes y representación',
    clientId: 'client-1',
    paymentMethod: 'Tarjeta de crédito',
    status: 'COMPLETED',
    origin: 'MANUAL',
    date: new Date('2025-01-06')
  }
]

// Fixed expenses
export const mockFixedExpenses: Omit<FixedExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Alquiler oficina',
    amount: 1200,
    frequency: 'MONTHLY',
    nextPayment: new Date('2025-02-01'),
    active: true
  },
  {
    name: 'Suscripción AWS',
    amount: 450,
    frequency: 'MONTHLY',
    nextPayment: new Date('2025-02-15'),
    active: true
  },
  {
    name: 'Seguro responsabilidad civil',
    amount: 180,
    frequency: 'QUARTERLY',
    nextPayment: new Date('2025-04-01'),
    active: true
  },
  {
    name: 'Licencia QuickBooks',
    amount: 25,
    frequency: 'MONTHLY',
    nextPayment: new Date('2025-02-10'),
    active: true
  },
  {
    name: 'Mantenimiento servidor',
    amount: 320,
    frequency: 'MONTHLY',
    nextPayment: new Date('2025-02-20'),
    active: true
  }
]

// Budgets
export const mockBudgets: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    category: 'Marketing y publicidad',
    limit: 2000,
    period: 'MONTHLY',
    spent: 1450
  },
  {
    category: 'Software y herramientas',
    limit: 800,
    period: 'MONTHLY',
    spent: 620
  },
  {
    category: 'Viajes y representación',
    limit: 1500,
    period: 'QUARTERLY',
    spent: 890
  },
  {
    category: 'Formación y cursos',
    limit: 1000,
    period: 'ANNUAL',
    spent: 450
  },
  {
    category: 'Materiales oficina',
    limit: 500,
    period: 'MONTHLY',
    spent: 280
  }
]

// Financial goals
export const mockFinancialGoals: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Reserva de emergencia',
    description: 'Acumular 3 meses de gastos operativos',
    target: 15000,
    current: 8500,
    deadline: new Date('2025-12-31'),
    priority: 'HIGH',
    status: 'ACTIVE'
  },
  {
    title: 'Invertir en equipo',
    description: 'Comprar nuevo servidor y workstations',
    target: 25000,
    current: 12500,
    deadline: new Date('2025-06-30'),
    priority: 'MEDIUM',
    status: 'ACTIVE'
  },
  {
    title: 'Fondo marketing Q2',
    description: 'Campaña digital agresiva para crecimiento',
    target: 15000,
    current: 3200,
    deadline: new Date('2025-06-30'),
    priority: 'HIGH',
    status: 'ACTIVE'
  },
  {
    title: 'Capacitación equipo',
    description: 'Cursos especializados para todo el equipo',
    target: 8000,
    current: 5200,
    deadline: new Date('2025-09-30'),
    priority: 'MEDIUM',
    status: 'ACTIVE'
  }
]

// Finance alerts
export const mockFinanceAlerts: Omit<FinanceAlert, 'id' | 'userId'>[] = [
  {
    type: 'BUDGET_EXCEEDED',
    message: 'Presupuesto de Marketing excedido en 45%. Considera reducir gastos o aumentar límite.',
    severity: 'HIGH',
    read: false,
    createdAt: new Date()
  },
  {
    type: 'HIGH_EXPENSE',
    message: 'Gasto inusual detectado: €2,800 en nóminas. Revisa si es correcto.',
    severity: 'MEDIUM',
    read: false,
    createdAt: new Date()
  },
  {
    type: 'CASHFLOW_RISK',
    message: 'Proyección de flujo de caja negativo en 15 días. Considera acelerar cobros pendientes.',
    severity: 'CRITICAL',
    read: false,
    createdAt: new Date()
  },
  {
    type: 'RECURRING_PAYMENT',
    message: 'Pago recurrente de AWS vence en 3 días. Saldo disponible: €4,250.',
    severity: 'LOW',
    read: false,
    createdAt: new Date()
  },
  {
    type: 'GOAL_DEADLINE',
    message: 'Objetivo "Reserva de emergencia" vence en 30 días. Progreso: 57%.',
    severity: 'MEDIUM',
    read: false,
    createdAt: new Date()
  }
]

// Cashflow forecasts
export const mockCashflowForecasts: Omit<CashflowForecast, 'id' | 'userId' | 'createdAt'>[] = [
  {
    date: new Date('2025-01-31'),
    predictedIncome: 18500,
    predictedExpense: 14200,
    predictedNet: 4300,
    confidence: 0.85,
    factors: ['Contratos pendientes', 'Gastos fijos mensuales', 'Proyección conservadora']
  },
  {
    date: new Date('2025-02-28'),
    predictedIncome: 22100,
    predictedExpense: 15800,
    predictedNet: 6300,
    confidence: 0.78,
    factors: ['Nuevo proyecto TechCorp', 'Aumento marketing', 'Temporada alta']
  },
  {
    date: new Date('2025-03-31'),
    predictedIncome: 19800,
    predictedExpense: 16200,
    predictedNet: 3600,
    confidence: 0.72,
    factors: ['Estacionalidad baja', 'Mantenimiento contratos', 'Reducción gastos']
  }
]

// KPIs calculation
export const mockFinanceKPIs: FinanceKPIs = {
  totalIncome: 9650,
  totalExpenses: -5045,
  netProfit: 4605,
  pendingPayments: 1200,
  burnRate: 1681.67,
  recurringPayments: 2175,
  growthRate: 12.5,
  cashFlow: 4605
}

// Analytics data
export const mockFinanceAnalytics: FinanceAnalytics = {
  monthlyTrend: [
    { month: 'Ago', income: 15200, expenses: 12800, profit: 2400 },
    { month: 'Sep', income: 16800, expenses: 13500, profit: 3300 },
    { month: 'Oct', income: 18900, expenses: 14200, profit: 4700 },
    { month: 'Nov', income: 21100, expenses: 15600, profit: 5500 },
    { month: 'Dic', income: 19800, expenses: 14900, profit: 4900 },
    { month: 'Ene', income: 22100, expenses: 16400, profit: 5700 }
  ],
  categoryBreakdown: [
    { category: 'Servicios profesionales', amount: 6700, percentage: 69.5, trend: 'up' },
    { category: 'Consultoría', amount: 1800, percentage: 18.7, trend: 'stable' },
    { category: 'Licencias software', amount: 950, percentage: 9.8, trend: 'up' },
    { category: 'Comisiones', amount: 200, percentage: 2.0, trend: 'down' }
  ],
  clientRevenue: [
    { clientId: 'client-1', clientName: 'TechCorp Solutions', totalRevenue: 2500, transactions: 1 },
    { clientId: 'client-4', clientName: 'CloudMasters Ltd', totalRevenue: 3200, transactions: 1 },
    { clientId: 'client-2', clientName: 'DataFlow Systems', totalRevenue: 1800, transactions: 1 },
    { clientId: 'client-3', clientName: 'InnovateLab', totalRevenue: 950, transactions: 1 },
    { clientId: 'client-5', clientName: 'FutureApps Inc', totalRevenue: 1200, transactions: 1 }
  ]
}

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
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
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