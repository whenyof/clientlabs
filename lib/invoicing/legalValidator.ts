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

const DNI_CONTROL_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"
const CIF_CONTROL_LETTERS = "JABCDEFGHI"

/**
 * Validates the FORMAT and control digit/letter of a Spanish tax id (DNI/NIF,
 * NIE or CIF). This is a purely offline check (algorithmic control digit); it does
 * NOT verify that the id exists in the AEAT census — that happens at issue time via
 * Verifactu. Reusable by the issue flow and the client fiscal-data form.
 */
export function isValidSpanishTaxId(raw: string | null | undefined): boolean {
  const id = trim(raw).toUpperCase().replace(/[\s-]/g, "")
  if (!/^[A-Z0-9]{9}$/.test(id)) return false

  // DNI/NIF: 8 dígitos + letra de control
  if (/^\d{8}[A-Z]$/.test(id)) {
    return DNI_CONTROL_LETTERS[parseInt(id.slice(0, 8), 10) % 23] === id[8]
  }

  // NIE: X/Y/Z + 7 dígitos + letra de control (X→0, Y→1, Z→2)
  if (/^[XYZ]\d{7}[A-Z]$/.test(id)) {
    const prefix = { X: "0", Y: "1", Z: "2" }[id[0] as "X" | "Y" | "Z"]
    return DNI_CONTROL_LETTERS[parseInt(prefix + id.slice(1, 8), 10) % 23] === id[8]
  }

  // CIF: letra de organización + 7 dígitos + carácter de control (dígito o letra)
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(id)) {
    const digits = id.slice(1, 8)
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      let n = parseInt(digits[i], 10)
      if (i % 2 === 0) {
        n *= 2
        if (n > 9) n -= 9
      }
      sum += n
    }
    const controlDigit = (10 - (sum % 10)) % 10
    const controlLetter = CIF_CONTROL_LETTERS[controlDigit]
    const control = id[8]
    const orgType = id[0]
    // Algunas organizaciones exigen letra, otras dígito; el resto admite cualquiera.
    if ("NPQRSW".includes(orgType)) return control === controlLetter
    if ("ABEH".includes(orgType)) return control === String(controlDigit)
    return control === String(controlDigit) || control === controlLetter
  }

  return false
}

/**
 * Valores placeholder de versiones antiguas del branding por defecto: pueden
 * seguir guardados en perfiles de BD. NUNCA son datos fiscales válidos.
 */
const PLACEHOLDER_VALUES = new Set(["mi empresa", "b12345678", "calle ejemplo 1, 28001 madrid"])
const isPlaceholder = (s: string | null | undefined): boolean =>
  PLACEHOLDER_VALUES.has(trim(s).toLowerCase())

/**
 * Validates that required fiscal data is present for issuing an invoice.
 * Use to disable issue button and show validation errors in UI.
 */
export function validateForIssue(emitter: EmitterData, client: ClientData): IssueValidationResult {
  const errors: string[] = []

  const missingEmitter =
    !trim(emitter.companyName) || isPlaceholder(emitter.companyName) ||
    !trim(emitter.taxId) || isPlaceholder(emitter.taxId)
  if (missingEmitter) {
    errors.push("Completa tu NIF y razón social en Ajustes antes de emitir")
  }
  if (!trim(emitter.address) || isPlaceholder(emitter.address)) {
    errors.push("Falta la dirección fiscal de la empresa emisora (Ajustes)")
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
