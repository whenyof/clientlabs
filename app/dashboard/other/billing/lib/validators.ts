/**
 * Valida un NIF (Número de Identificación Fiscal) español
 */
export function validateNIF(nif: string): boolean {
  if (!nif || nif.length !== 9) return false

  const nifRegex = /^[XYZ\d]\d{7}[A-Z]$/
  if (!nifRegex.test(nif.toUpperCase())) return false

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const number = nif.slice(0, 8).replace('X', '0').replace('Y', '1').replace('Z', '2')
  const expectedLetter = letters[parseInt(number) % 23]

  return nif.charAt(8).toUpperCase() === expectedLetter
}

/**
 * Valida un CIF (Código de Identificación Fiscal) español
 */
export function validateCIF(cif: string): boolean {
  if (!cif || cif.length !== 9) return false

  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[A-Z\d]$/
  if (!cifRegex.test(cif.toUpperCase())) return false

  // Algoritmo de validación CIF más complejo
  // Implementación simplificada
  const controlChars = 'JABCDEFGHI'
  const digits = cif.slice(1, 8).split('').map(Number)
  let sum = 0

  for (let i = 0; i < digits.length; i++) {
    let digit = digits[i]
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }

  const controlDigit = (10 - (sum % 10)) % 10
  const expectedControl = controlChars[controlDigit]

  return cif.charAt(8).toUpperCase() === expectedControl
}

/**
 * Valida un NIF/CIF (intenta ambos)
 */
export function validateNIFCIF(value: string): boolean {
  return validateNIF(value) || validateCIF(value)
}

/**
 * Valida una dirección de email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida una fecha en formato YYYY-MM-DD
 */
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Valida que la fecha de vencimiento sea posterior a la fecha de emisión
 */
export function validateDueDate(issueDate: string, dueDate: string): boolean {
  const issue = new Date(issueDate)
  const due = new Date(dueDate)
  return due > issue
}

/**
 * Valida los datos de una línea de factura
 */
export function validateInvoiceLine(line: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!line.description || line.description.trim().length === 0) {
    errors.push('La descripción es obligatoria')
  }

  if (!line.quantity || line.quantity <= 0) {
    errors.push('La cantidad debe ser mayor que 0')
  }

  if (line.unitPrice === undefined || line.unitPrice < 0) {
    errors.push('El precio unitario debe ser mayor o igual a 0')
  }

  if (line.taxRate === undefined || line.taxRate < 0 || line.taxRate > 100) {
    errors.push('El porcentaje de IVA debe estar entre 0 y 100')
  }

  if (line.discount !== undefined && (line.discount < 0 || line.discount > 100)) {
    errors.push('El descuento debe estar entre 0 y 100')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida los datos de un cliente
 */
export function validateClient(client: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!client.name || client.name.trim().length === 0) {
    errors.push('El nombre del cliente es obligatorio')
  }

  if (!client.nif || !validateNIFCIF(client.nif)) {
    errors.push('El NIF/CIF no es válido')
  }

  if (!client.email || !validateEmail(client.email)) {
    errors.push('El email no es válido')
  }

  if (!client.address || client.address.trim().length === 0) {
    errors.push('La dirección es obligatoria')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida los datos de una factura completa
 */
export function validateInvoice(invoice: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar cliente
  const clientValidation = validateClient(invoice.client)
  if (!clientValidation.isValid) {
    errors.push(...clientValidation.errors)
  }

  // Validar fechas
  if (!invoice.date || !validateDate(invoice.date)) {
    errors.push('La fecha de emisión no es válida')
  }

  if (!invoice.dueDate || !validateDate(invoice.dueDate)) {
    errors.push('La fecha de vencimiento no es válida')
  }

  if (invoice.date && invoice.dueDate && !validateDueDate(invoice.date, invoice.dueDate)) {
    errors.push('La fecha de vencimiento debe ser posterior a la fecha de emisión')
  }

  // Validar líneas
  if (!invoice.lines || invoice.lines.length === 0) {
    errors.push('La factura debe tener al menos una línea')
  } else {
    invoice.lines.forEach((line: any, index: number) => {
      const lineValidation = validateInvoiceLine(line)
      if (!lineValidation.isValid) {
        errors.push(`Línea ${index + 1}: ${lineValidation.errors.join(', ')}`)
      }
    })
  }

  // Validar totales
  if (invoice.total === undefined || invoice.total < 0) {
    errors.push('El total de la factura no es válido')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida un IBAN español
 */
export function validateIBAN(iban: string): boolean {
  if (!iban) return false

  // Remover espacios y convertir a mayúsculas
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()

  // Debe empezar con ES y tener 24 caracteres
  if (!/^ES\d{22}$/.test(cleanIBAN)) return false

  // Algoritmo de validación IBAN simplificado
  // En producción, implementar el algoritmo completo
  return true
}

/**
 * Valida un código postal español
 */
export function validatePostalCode(code: string): boolean {
  const postalCodeRegex = /^[0-5]\d{4}$/
  return postalCodeRegex.test(code)
}

/**
 * Obtiene el tipo de documento fiscal (NIF/CIF)
 */
export function getDocumentType(document: string): 'NIF' | 'CIF' | 'INVALID' {
  if (validateNIF(document)) return 'NIF'
  if (validateCIF(document)) return 'CIF'
  return 'INVALID'
}