// Financial Formatters

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value)
}

export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(dateObj)
}

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'Ahora mismo'
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`

  return formatDate(dateObj)
}

export const formatTransactionType = (type: string): string => {
  switch (type) {
    case 'INCOME':
      return 'Ingreso'
    case 'EXPENSE':
      return 'Gasto'
    default:
      return type
  }
}

export const formatTransactionStatus = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'Completado'
    case 'PENDING':
      return 'Pendiente'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return status
  }
}

export const formatTransactionOrigin = (origin: string): string => {
  switch (origin) {
    case 'MANUAL':
      return 'Manual'
    case 'AUTOMATIC':
      return 'Automático'
    default:
      return origin
  }
}

export const formatExpenseFrequency = (frequency: string): string => {
  switch (frequency) {
    case 'WEEKLY':
    case 'weekly':
      return 'Semanal'
    case 'MONTHLY':
    case 'monthly':
      return 'Mensual'
    case 'QUARTERLY':
    case 'quarterly':
      return 'Trimestral'
    case 'SEMIANNUAL':
      return 'Semestral'
    case 'ANNUAL':
      return 'Anual'
    default:
      return frequency
  }
}

export const formatBudgetPeriod = (period: string): string => {
  switch (period) {
    case 'MONTHLY':
      return 'Mensual'
    case 'QUARTERLY':
      return 'Trimestral'
    case 'ANNUAL':
      return 'Anual'
    default:
      return period
  }
}

export const formatGoalPriority = (priority: string): string => {
  switch (priority) {
    case 'LOW':
      return 'Baja'
    case 'MEDIUM':
      return 'Media'
    case 'HIGH':
      return 'Alta'
    default:
      return priority
  }
}

export const formatGoalStatus = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Activo'
    case 'COMPLETED':
      return 'Completado'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return status
  }
}

export const formatAlertType = (type: string): string => {
  switch (type) {
    case 'HIGH_EXPENSE':
      return 'Gasto Alto'
    case 'BUDGET_EXCEEDED':
      return 'Presupuesto Excedido'
    case 'CASHFLOW_RISK':
      return 'Riesgo Flujo de Caja'
    case 'UNUSUAL_PATTERN':
      return 'Patrón Inusual'
    case 'GOAL_DEADLINE':
      return 'Fecha Límite Objetivo'
    case 'RECURRING_PAYMENT':
      return 'Pago Recurrente'
    default:
      return type
  }
}

export const formatAlertSeverity = (severity: string): string => {
  switch (severity) {
    case 'LOW':
      return 'Baja'
    case 'MEDIUM':
      return 'Media'
    case 'HIGH':
      return 'Alta'
    case 'CRITICAL':
      return 'Crítica'
    default:
      return severity
  }
}

// Color formatters for UI
export const getAmountColor = (amount: number): string => {
  if (amount > 0) return 'text-green-400'
  if (amount < 0) return 'text-red-400'
  return 'text-gray-400'
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'PENDING':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'CANCELLED':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'ACTIVE':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'LOW':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'HIGH':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'LOW':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

// Trend indicators
export const formatTrend = (current: number, previous: number): string => {
  if (previous === 0) return '0%'

  const change = ((current - previous) / Math.abs(previous)) * 100
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export const getTrendIcon = (current: number, previous: number) => {
  if (current > previous) return '↗️'
  if (current < previous) return '↘️'
  return '➡️'
}

export const getTrendColor = (current: number, previous: number): string => {
  if (current > previous) return 'text-green-400'
  if (current < previous) return 'text-red-400'
  return 'text-gray-400'
}