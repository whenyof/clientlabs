// ─────────────────────────────────────────────────────────────
// Intelligence Core — Calculators
// ─────────────────────────────────────────────────────────────

export function calculateGrowth(current: number, previous: number): number {
 if (previous === 0) return current > 0 ? 100 : 0
 return ((current - previous) / previous) * 100
}

export function calculateVolatility(series: number[]): number {
 if (series.length < 2) return 0
 const mean = series.reduce((a, b) => a + b, 0) / series.length
 if (mean === 0) return 0
 const variance = series.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / series.length
 const stdDev = Math.sqrt(variance)
 return stdDev / mean // Coefficient of variation
}

export function calculateMaxConcentration(
 revenueByClient: { clientId: string; total: number }[],
 totalRevenue: number
): number {
 if (totalRevenue === 0 || revenueByClient.length === 0) return 0
 const maxVal = Math.max(...revenueByClient.map(c => c.total))
 return (maxVal / totalRevenue) * 100
}

/** 
 * Simple Linear Regression (Least Squares)
 * trend(x) = intercept + slope * x 
 */
export function calculateLinearTrend(series: number[]): { slope: number; intercept: number } {
 const n = series.length
 if (n === 0) return { slope: 0, intercept: 0 }

 let sumX = 0
 let sumY = 0
 let sumXY = 0
 let sumXX = 0

 for (let i = 0; i < n; i++) {
 sumX += i
 sumY += series[i]
 sumXY += i * series[i]
 sumXX += i * i
 }

 const denominator = (n * sumXX - sumX * sumX)
 const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
 const intercept = (sumY / n) - slope * ((n - 1) / 2)

 return { slope, intercept }
}
