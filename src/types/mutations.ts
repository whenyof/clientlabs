export interface CreateLeadInput {
  name: string
  email?: string
  phone?: string
  source?: string
}

export interface CreateTaskInput {
  title: string
  clientId?: string
  dueDate?: string
}

export interface CreateClientInput {
  name: string
  email?: string
  phone?: string
}

// For now these inputs are open-ended objects that mirror
// the payloads sent to their respective API routes. They are
// intentionally broad but still avoid `any`.
export type CreateNoteInput = Record<string, unknown>
export type CreateSaleInput = Record<string, unknown>
export type CreatePaymentInput = Record<string, unknown>
export type CreateProviderInput = Record<string, unknown>