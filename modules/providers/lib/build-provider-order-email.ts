/**
 * Build provider order email from template and variables.
 * Re-exports and wraps renderOrderEmail for use in order flow.
 */

export {
  renderOrderEmail,
  formatProductsTable,
  type OrderEmailVars,
} from "@/modules/providers/services/renderOrderEmail"
