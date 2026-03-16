/**
 * Domain types for provider orders and order items.
 */

export type ProviderOrderPayment = {
  id: string
  amount: number
  paymentDate: Date
  concept?: string | null
}

export type ProviderOrderFile = {
  id: string
  name: string
  url: string
  category: string
  createdAt?: Date
}

export type ProviderOrderInvoice = {
  id: string
  number: string
  status: string
  total?: unknown
}

export type ProviderOrderRow = {
  id: string
  description?: string | null
  amount: number
  orderDate: Date
  status: string
  type: string
  payment?: ProviderOrderPayment | null
  invoice?: ProviderOrderInvoice | null
  files?: ProviderOrderFile[]
}

export type ProviderOrderItemRow = {
  id: string
  codeSnapshot: string
  nameSnapshot: string
  unitSnapshot: string | null
  unitPriceSnapshot: number
  quantity: number
  subtotal: number
}
