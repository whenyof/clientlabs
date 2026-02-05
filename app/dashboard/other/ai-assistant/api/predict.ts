import { NextRequest, NextResponse } from 'next/server'
import { predictMonthlyRevenue, predictChurnRisk } from '../lib/predictions'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case 'revenue': {
        const historicalData = data.historicalData || [
          { month: 'Ene', revenue: 35000, leads: 45, conversions: 12, churnRate: 5, marketingSpend: 5000, newCustomers: 8 },
          { month: 'Feb', revenue: 38000, leads: 52, conversions: 15, churnRate: 4, marketingSpend: 5500, newCustomers: 10 },
          { month: 'Mar', revenue: 42000, leads: 48, conversions: 18, churnRate: 3, marketingSpend: 6000, newCustomers: 12 },
          { month: 'Abr', revenue: 39000, leads: 55, conversions: 14, churnRate: 6, marketingSpend: 5200, newCustomers: 9 },
          { month: 'May', revenue: 45000, leads: 58, conversions: 20, churnRate: 4, marketingSpend: 6500, newCustomers: 15 },
          { month: 'Jun', revenue: 48000, leads: 62, conversions: 22, churnRate: 3, marketingSpend: 7000, newCustomers: 18 }
        ]

        const currentFactors = data.factors || {
          trendStrength: Math.random() * 0.4 - 0.2, // -0.2 to +0.2
          seasonality: getCurrentSeasonality(),
          leadQuality: Math.random() * 0.6 + 0.4, // 0.4 to 1.0
          marketConditions: Math.random() * 0.8 - 0.4, // -0.4 to +0.4
          competitivePressure: Math.random() * 0.5 // 0 to 0.5
        }

        const prediction = predictMonthlyRevenue(historicalData, currentFactors)

        return NextResponse.json({
          success: true,
          data: {
            prediction,
            factors: currentFactors,
            insights: generatePredictionInsights(prediction, currentFactors)
          }
        })
      }

        interface Customer {
          id: string
          name: string
          lastActivity: number
          engagementScore: number
          contractValue: number
          timeAsCustomer: number
          supportTickets: number
        }

      case 'churn': {
        const customers: Customer[] = data.customers || [
          {
            id: '1',
            name: 'TechCorp S.L.',
            lastActivity: 35,
            engagementScore: 65,
            contractValue: 15000,
            timeAsCustomer: 8,
            supportTickets: 2
          },
          {
            id: '2',
            name: 'DataFlow Solutions',
            lastActivity: 95,
            engagementScore: 25,
            contractValue: 25000,
            timeAsCustomer: 12,
            supportTickets: 8
          },
          {
            id: '3',
            name: 'CloudMasters Ltd',
            lastActivity: 15,
            engagementScore: 85,
            contractValue: 8000,
            timeAsCustomer: 3,
            supportTickets: 1
          }
        ]

        const churnAnalysis = customers.map(customer => ({
          ...customer,
          riskAnalysis: predictChurnRisk({
            lastActivity: customer.lastActivity,
            engagementScore: customer.engagementScore,
            contractValue: customer.contractValue,
            timeAsCustomer: customer.timeAsCustomer,
            supportTickets: customer.supportTickets
          })
        }))

        return NextResponse.json({
          success: true,
          data: {
            churnAnalysis,
            summary: {
              totalCustomers: customers.length,
              highRisk: churnAnalysis.filter(c => c.riskAnalysis.riskLevel === 'high').length,
              mediumRisk: churnAnalysis.filter(c => c.riskAnalysis.riskLevel === 'medium').length,
              lowRisk: churnAnalysis.filter(c => c.riskAnalysis.riskLevel === 'low').length,
              averageRiskScore: churnAnalysis.reduce((sum, c) => sum + c.riskAnalysis.probability, 0) / churnAnalysis.length,
              totalValueAtRisk: churnAnalysis
                .filter(c => c.riskAnalysis.riskLevel === 'high')
                .reduce((sum, c) => sum + c.contractValue, 0)
            }
          }
        })
      }

        interface FunnelStage {
          stage: string
          count: number
          conversion: number
        }

      case 'conversion': {
        const leadData: FunnelStage[] = data.leads || [
          { stage: 'visitors', count: 1000, conversion: 100 },
          { stage: 'leads', count: 250, conversion: 25 },
          { stage: 'qualified', count: 80, conversion: 32 },
          { stage: 'proposals', count: 25, conversion: 31.25 },
          { stage: 'negotiations', count: 8, conversion: 32 },
          { stage: 'closed', count: 6, conversion: 75 }
        ]

        // Calculate funnel metrics
        const funnelMetrics = leadData.map((stage: FunnelStage, index: number) => {
          const nextStage = leadData[index + 1]
          const dropoff = nextStage ? ((stage.count - nextStage.count) / stage.count) * 100 : 0

          return {
            ...stage,
            dropoff: Math.round(dropoff * 100) / 100,
            value: stage.count * 100 // Mock value per lead
          }
        })

        const totalValue = funnelMetrics.reduce((sum: number, stage: any) => sum + (stage.count * stage.value), 0)
        const conversionRate = (funnelMetrics[funnelMetrics.length - 1].count / funnelMetrics[0].count) * 100

        return NextResponse.json({
          success: true,
          data: {
            funnel: funnelMetrics,
            metrics: {
              totalLeads: funnelMetrics[0].count,
              totalConversions: funnelMetrics[funnelMetrics.length - 1].count,
              conversionRate: Math.round(conversionRate * 100) / 100,
              averageDealSize: 1500, // Mock
              totalPipelineValue: totalValue,
              averageTimeToClose: 45 // days
            },
            insights: [
              `Tasa de conversión total: ${conversionRate.toFixed(1)}%`,
              `Mayor pérdida en etapa: ${findWorstStage(funnelMetrics)}`,
              `Valor promedio por lead: €${(totalValue / funnelMetrics[0].count).toFixed(0)}`
            ]
          }
        })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de predicción no soportado'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in AI prediction:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}

function getCurrentSeasonality(): number {
  const month = new Date().getMonth()
  // Higher in Q4, lower in Q1
  const seasonalFactors = [0.85, 0.8, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.05, 0.95, 0.9, 0.85]
  return seasonalFactors[month] - 1 // Convert to multiplier
}

function generatePredictionInsights(prediction: any, factors: any): string[] {
  const insights = []

  if (prediction.confidence > 80) {
    insights.push('Alta confianza en la predicción basada en datos históricos consistentes')
  }

  if (factors.trendStrength > 0.1) {
    insights.push('Tendencia positiva fuerte indica crecimiento continuo')
  } else if (factors.trendStrength < -0.1) {
    insights.push('Tendencia negativa requiere atención inmediata')
  }

  if (factors.leadQuality > 0.7) {
    insights.push('Calidad de leads excelente contribuye al optimismo')
  }

  if (factors.marketConditions > 0.2) {
    insights.push('Condiciones de mercado favorables')
  }

  return insights.length > 0 ? insights : ['Predicción basada en tendencias históricas']
}

function findWorstStage(funnel: any[]): string {
  let worstStage = ''
  let maxDropoff = 0

  funnel.forEach((stage, index) => {
    if (index < funnel.length - 1 && stage.dropoff > maxDropoff) {
      maxDropoff = stage.dropoff
      worstStage = stage.stage
    }
  })

  return worstStage
}