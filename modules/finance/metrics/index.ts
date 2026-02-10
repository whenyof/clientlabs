/**
 * Finance metrics layer. Pure business metrics from raw data.
 * No UI, no Prisma; uses only modules/finance/data.
 */

export {
  getTotalRevenue,
  getRevenueGrowth,
  getAverageTicket,
} from "./revenue.metrics"

export {
  getTotalExpenses,
  getExpenseDistribution,
} from "./expense.metrics"

export {
  getNetProfit,
  getProfitMargin,
} from "./profit.metrics"

export {
  getTopClients,
  getClientConcentration,
  type TopClientEntry,
} from "./client.metrics"

export {
  getBurnRate,
  getRunwayEstimate,
} from "./health.metrics"
