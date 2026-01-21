export interface AnalyticsKPIs {
  totalRevenue: number
  revenueGrowth: number
  newLeads: number
  conversionRate: number
  averageTicket: number
  automationRate: number
}

export interface ChartDataPoint {
  date: string
  revenue: number
  leads: number
  conversions: number
  visitors: number
}

export interface FunnelData {
  stage: string
  count: number
  conversion: number
  color: string
}

export interface ActivityItem {
  id: string
  date: string
  event: string
  user: string
  impact: number
  type: 'manual' | 'bot'
  category: string
}

export interface AiInsight {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  type: 'prediction' | 'recommendation' | 'alert'
  icon: string
}

export interface SectionAnalytics {
  section: string
  kpis: {
    primary: number
    secondary: number
    trend: number
  }
  chartData: Array<{ label: string; value: number; color: string }>
}

// Mock KPIs
export const mockKPIs: Record<string, AnalyticsKPIs> = {
  "1d": {
    totalRevenue: 2450,
    revenueGrowth: 12.5,
    newLeads: 24,
    conversionRate: 3.2,
    averageTicket: 185,
    automationRate: 68
  },
  "7d": {
    totalRevenue: 15680,
    revenueGrowth: 8.3,
    newLeads: 156,
    conversionRate: 4.1,
    averageTicket: 178,
    automationRate: 72
  },
  "15d": {
    totalRevenue: 31200,
    revenueGrowth: 15.7,
    newLeads: 312,
    conversionRate: 3.8,
    averageTicket: 192,
    automationRate: 69
  },
  "30d": {
    totalRevenue: 62400,
    revenueGrowth: 22.1,
    newLeads: 624,
    conversionRate: 4.3,
    averageTicket: 198,
    automationRate: 75
  },
  "1y": {
    totalRevenue: 756000,
    revenueGrowth: 18.5,
    newLeads: 7560,
    conversionRate: 4.2,
    averageTicket: 205,
    automationRate: 78
  }
}

// Mock chart data
export const mockChartData: Record<string, ChartDataPoint[]> = {
  "1d": [
    { date: "2024-01-20", revenue: 2450, leads: 24, conversions: 1, visitors: 750 }
  ],
  "7d": Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 3000) + 1500,
    leads: Math.floor(Math.random() * 30) + 15,
    conversions: Math.floor(Math.random() * 5) + 1,
    visitors: Math.floor(Math.random() * 200) + 500
  })),
  "15d": Array.from({ length: 15 }, (_, i) => ({
    date: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 2800) + 1600,
    leads: Math.floor(Math.random() * 25) + 12,
    conversions: Math.floor(Math.random() * 4) + 1,
    visitors: Math.floor(Math.random() * 150) + 400
  })),
  "30d": Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 2500) + 1800,
    leads: Math.floor(Math.random() * 20) + 10,
    conversions: Math.floor(Math.random() * 3) + 1,
    visitors: Math.floor(Math.random() * 120) + 350
  })),
  "1y": Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2024, i, 1).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 80000) + 50000,
    leads: Math.floor(Math.random() * 800) + 500,
    conversions: Math.floor(Math.random() * 40) + 20,
    visitors: Math.floor(Math.random() * 3000) + 2000
  }))
}

// Mock funnel data
export const mockFunnelData: FunnelData[] = [
  {
    stage: "Visitantes",
    count: 12500,
    conversion: 100,
    color: "#8B5CF6"
  },
  {
    stage: "Leads",
    count: 625,
    conversion: 5.0,
    color: "#A855F7"
  },
  {
    stage: "Oportunidades",
    count: 125,
    conversion: 20.0,
    color: "#C084FC"
  },
  {
    stage: "Ventas",
    count: 50,
    conversion: 40.0,
    color: "#DDD6FE"
  }
]

// Mock activity data
export const mockActivityData: ActivityItem[] = [
  {
    id: "1",
    date: "2024-01-20T14:30:00Z",
    event: "Nueva venta automática",
    user: "Sistema",
    impact: 2450,
    type: "bot",
    category: "venta"
  },
  {
    id: "2",
    date: "2024-01-20T13:15:00Z",
    event: "Lead convertido manualmente",
    user: "María García",
    impact: 890,
    type: "manual",
    category: "lead"
  },
  {
    id: "3",
    date: "2024-01-20T12:45:00Z",
    event: "Email marketing enviado",
    user: "Bot Marketing",
    impact: 0,
    type: "bot",
    category: "marketing"
  },
  {
    id: "4",
    date: "2024-01-20T11:20:00Z",
    event: "Factura generada automáticamente",
    user: "Sistema",
    impact: 1200,
    type: "bot",
    category: "facturacion"
  },
  {
    id: "5",
    date: "2024-01-20T10:10:00Z",
    event: "Cliente contactado",
    user: "Carlos Rodríguez",
    impact: 650,
    type: "manual",
    category: "cliente"
  },
  {
    id: "6",
    date: "2024-01-20T09:30:00Z",
    event: "Recordatorio de pago enviado",
    user: "Bot Finanzas",
    impact: 0,
    type: "bot",
    category: "finanzas"
  },
  {
    id: "7",
    date: "2024-01-19T16:45:00Z",
    event: "Nueva oportunidad creada",
    user: "Ana López",
    impact: 0,
    type: "manual",
    category: "oportunidad"
  },
  {
    id: "8",
    date: "2024-01-19T15:20:00Z",
    event: "Campaña publicitaria optimizada",
    user: "Bot IA",
    impact: 1500,
    type: "bot",
    category: "marketing"
  }
]

// Mock AI insights
export const mockAiInsights: AiInsight[] = [
  {
    id: "1",
    title: "Mejores horas para vender",
    description: "Las ventas aumentan un 35% entre las 14:00-16:00. Recomendamos programar recordatorios automáticos en este horario.",
    impact: "high",
    type: "recommendation",
    icon: "⏰"
  },
  {
    id: "2",
    title: "Clientes en riesgo",
    description: "3 clientes tienen pagos pendientes superiores a 30 días. El riesgo de impago es del 45%.",
    impact: "high",
    type: "alert",
    icon: "⚠️"
  },
  {
    id: "3",
    title: "Predicción de ingresos",
    description: "Para el próximo mes se esperan €68,500 en ingresos (+12% vs mes anterior) basado en tendencias actuales.",
    impact: "medium",
    type: "prediction",
    icon: "📈"
  },
  {
    id: "4",
    title: "Automatización recomendada",
    description: "Implementar envío automático de facturas podría reducir el tiempo de cobro en un 40%.",
    impact: "medium",
    type: "recommendation",
    icon: "🤖"
  },
  {
    id: "5",
    title: "Segmento de alto valor",
    description: "Clientes del sector tecnológico generan un 65% más de ingresos. Enfocar esfuerzos de marketing aquí.",
    impact: "low",
    type: "recommendation",
    icon: "🎯"
  }
]

// Mock section analytics
export const mockSectionAnalytics: Record<string, SectionAnalytics> = {
  ventas: {
    section: "Ventas",
    kpis: {
      primary: 62400,
      secondary: 22.1,
      trend: 15.7
    },
    chartData: [
      { label: "Enero", value: 52000, color: "#8B5CF6" },
      { label: "Febrero", value: 62400, color: "#A855F7" },
      { label: "Marzo", value: 58000, color: "#C084FC" },
      { label: "Abril", value: 67200, color: "#DDD6FE" }
    ]
  },
  leads: {
    section: "Leads",
    kpis: {
      primary: 624,
      secondary: 18.3,
      trend: 12.4
    },
    chartData: [
      { label: "Orgánico", value: 245, color: "#10B981" },
      { label: "Redes", value: 156, color: "#3B82F6" },
      { label: "Email", value: 134, color: "#F59E0B" },
      { label: "Referidos", value: 89, color: "#EF4444" }
    ]
  },
  finanzas: {
    section: "Finanzas",
    kpis: {
      primary: 89400,
      secondary: 8.7,
      trend: -2.1
    },
    chartData: [
      { label: "Ingresos", value: 75600, color: "#10B981" },
      { label: "Gastos", value: 13800, color: "#EF4444" },
      { label: "Beneficio", value: 61800, color: "#8B5CF6" }
    ]
  },
  automatizaciones: {
    section: "Automatizaciones",
    kpis: {
      primary: 78,
      secondary: 156,
      trend: 23.5
    },
    chartData: [
      { label: "Activas", value: 78, color: "#10B981" },
      { label: "Inactivas", value: 22, color: "#6B7280" },
      { label: "Ejecuciones", value: 156, color: "#3B82F6" }
    ]
  },
  clientes: {
    section: "Clientes",
    kpis: {
      primary: 2450,
      secondary: 4.2,
      trend: 8.9
    },
    chartData: [
      { label: "Nuevos", value: 420, color: "#10B981" },
      { label: "Recurrentes", value: 1890, color: "#3B82F6" },
      { label: "VIP", value: 140, color: "#F59E0B" }
    ]
  }
}

// Helper functions
export const getKPIsForRange = (range: string): AnalyticsKPIs => {
  return mockKPIs[range] || mockKPIs["7d"]
}

export const getChartDataForRange = (range: string): ChartDataPoint[] => {
  return mockChartData[range] || mockChartData["7d"]
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatValue = (value: number, format: 'currency' | 'number' | 'percentage'): string => {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    default:
      return value.toLocaleString('es-ES')
  }
}

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export const getTrendColor = (trend: number): string => {
  if (trend > 0) return "text-green-400"
  if (trend < 0) return "text-red-400"
  return "text-gray-400"
}