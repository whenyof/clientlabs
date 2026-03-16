/**
 * Domain types for provider products (catalog).
 */

export type ProviderProductRow = {
  id: string
  code: string
  name: string
  unit: string | null
  price: number
  description: string | null
  category: string | null
  isActive: boolean
}

export type ProviderProductFormData = {
  name: string
  code: string
  unit: string
  category: string
  price: string
  description: string
}

export type ProviderProductImportRow = {
  code: string
  name: string
  category?: string
  unit?: string
  price: number
  description?: string
}
