/**
 * Domain types for provider email templates (order emails).
 */

export type ProviderTemplateRow = {
  id: string
  name: string
  subject: string
  body: string
  isDefault: boolean
}

export type ProviderTemplateFormData = {
  name: string
  subject: string
  body: string
  isDefault: boolean
}
