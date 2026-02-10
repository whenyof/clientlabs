/**
 * Finance data access layer. Raw reads only; no KPIs, formatting, or UI.
 * All functions filter by userId and support date ranges (inclusive: gte from, lte to).
 */

export {
  getSalesInRange,
  getSalesByClient,
  getAverageTicket,
  type SaleRow,
} from "./sales.data"

export {
  getExpensesInRange,
  getExpensesByCategory,
  type ExpenseRow,
} from "./expenses.data"

export {
  getProviderPaymentsInRange,
  type ProviderPaymentRow,
} from "./providers.data"

export {
  getActiveClients,
  getClientRevenue,
  type ClientRow,
  type ClientRevenueRow,
} from "./clients.data"

export {
  getMoneyIn,
  getMoneyOut,
  type MoneyInRow,
  type MoneyOutRow,
} from "./cashflow.data"
