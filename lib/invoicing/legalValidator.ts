/**
 * Legal validations for issuing Spanish-compliant invoices.
 * Required before issue: emitter (company name, taxId, address); client (name; if company, taxId).
 */

export type EmitterData = {
  companyName: string | null | undefined
  taxId: string | null | undefined
  address: string | null | undefined
}

export type ClientData = {
  name: string | null | undefined
  /** When client is a company, taxId is required. Optional if no company flag. */
  taxId?: string | null
  isCompany?: boolean
}

export type IssueValidationResult = {
  valid: boolean
  errors: string[]
}

const trim = (s: string | null | undefined): string => (s ?? "").trim()

/**
 * Validates that required fiscal data is present for issuing an invoice.
 * Use to disable issue button and show validation errors in UI.
 */
export function validateForIssue(emitter: EmitterData, client: ClientData): IssueValidationResult {
  const errors: string[] = []

  if (!trim(emitter.companyName)) {
    errors.push("Falta el nombre de la empresa emisora (perfil de facturación)")
  }
  if (!trim(emitter.taxId)) {
    errors.push("Falta el CIF/NIF de la empresa emisora")
  }
  if (!trim(emitter.address)) {
    errors.push("Falta la dirección fiscal de la empresa emisora")
  }

  if (!trim(client.name)) {
    errors.push("Falta el nombre del cliente")
  }
  if (client.isCompany && !trim(client.taxId ?? "")) {
    errors.push("Falta el CIF/NIF del cliente (empresa)")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
