"use client"

import { useCallback } from 'react'
import { type Invoice, type InvoiceLine } from '../mock'
import { calculateInvoiceTotals, generateInvoiceHash } from '../lib/calculations'

/**
 * Hook para generar facturas automáticamente desde ventas
 */
export function useInvoiceFromSale() {
  const generateInvoiceFromSale = useCallback(async (saleData: {
    clientId: string
    clientData: any
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      taxRate?: number
    }>
    saleId: string
  }): Promise<Invoice> => {
    const lines: InvoiceLine[] = saleData.items.map((item, index) => ({
      id: `line-${index + 1}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 21,
      total: 0 // Se calculará automáticamente
    }))

    const totals = calculateInvoiceTotals(lines)
    const invoiceNumber = generateInvoiceNumber()
    const hash = generateInvoiceHash({ ...saleData, lines, ...totals })

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      client: {
        name: saleData.clientData.name,
        nif: saleData.clientData.nif,
        address: saleData.clientData.address,
        email: saleData.clientData.email
      },
      company: {
        name: 'Mi Empresa SL',
        nif: 'A87654321',
        address: 'Gran Vía 456, Barcelona'
      },
      date: new Date().toISOString().split('T')[0],
      dueDate: calculateDueDate().toISOString().split('T')[0],
      status: 'issued',
      haciendaStatus: 'pending',
      origin: 'automatic',
      lines: lines.map(line => ({ ...line, total: calculateLineTotal(line) })),
      ...totals,
      currency: 'EUR',
      paymentTerms: '30 días',
      notes: `Factura generada automáticamente desde venta ${saleData.saleId}`,
      hash,
      timestamp: new Date().toISOString()
    }

    // Aquí iría la llamada a la API para guardar la factura
    console.log('Factura generada desde venta:', invoice)

    return invoice
  }, [])

  return { generateInvoiceFromSale }
}

/**
 * Hook para crear facturas recurrentes
 */
export function useRecurringInvoices() {
  const createRecurringInvoices = useCallback(async (config: {
    templateId: string
    clientData: any
    amount: number
    frequency: 'monthly' | 'quarterly' | 'yearly'
    startDate: string
    endDate?: string
    description: string
  }): Promise<Invoice[]> => {
    const invoices: Invoice[] = []
    const startDate = new Date(config.startDate)
    const endDate = config.endDate ? new Date(config.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año por defecto

    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dueDate = new Date(currentDate)
      dueDate.setDate(dueDate.getDate() + 30) // 30 días de vencimiento

      const lines: InvoiceLine[] = [{
        id: '1',
        description: config.description,
        quantity: 1,
        unitPrice: config.amount,
        taxRate: 21,
        total: config.amount * 1.21
      }]

      const totals = calculateInvoiceTotals(lines)
      const invoiceNumber = generateInvoiceNumber()
      const hash = generateInvoiceHash({ ...config, lines, date: currentDate.toISOString(), ...totals })

      const invoice: Invoice = {
        id: `recurring-${Date.now()}-${invoices.length}`,
        number: invoiceNumber,
        client: {
          name: config.clientData.name,
          nif: config.clientData.nif,
          address: config.clientData.address,
          email: config.clientData.email
        },
        company: {
          name: 'Mi Empresa SL',
          nif: 'A87654321',
          address: 'Gran Vía 456, Barcelona'
        },
        date: currentDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'draft', // Las recurrentes se crean como borrador
        haciendaStatus: 'pending',
        origin: 'automatic',
        lines,
        ...totals,
        currency: 'EUR',
        paymentTerms: '30 días',
        notes: `Factura recurrente - ${config.frequency}`,
        hash,
        timestamp: new Date().toISOString()
      }

      invoices.push(invoice)

      // Avanzar a la siguiente fecha según frecuencia
      switch (config.frequency) {
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3)
          break
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1)
          break
      }
    }

    // Aquí iría la llamada a la API para guardar las facturas
    console.log('Facturas recurrentes creadas:', invoices)

    return invoices
  }, [])

  return { createRecurringInvoices }
}

/**
 * Hook para enviar recordatorios de pago
 */
export function usePaymentReminders() {
  const sendPaymentReminder = useCallback(async (invoiceId: string, reminderType: 'first' | 'second' | 'final') => {
    const messages = {
      first: 'Recordatorio de pago pendiente',
      second: 'Segundo recordatorio de pago',
      final: 'Último recordatorio - acción requerida'
    }

    console.log(`Enviando ${reminderType} recordatorio para factura ${invoiceId}: ${messages[reminderType]}`)

    // Simular envío de email
    await simulateEmailSend(invoiceId, messages[reminderType])

    return {
      success: true,
      message: `${messages[reminderType]} enviado correctamente`
    }
  }, [])

  const sendBulkReminders = useCallback(async (invoiceIds: string[], reminderType: 'first' | 'second' | 'final') => {
    const results = await Promise.allSettled(
      invoiceIds.map(id => sendPaymentReminder(id, reminderType))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return {
      successful,
      failed,
      total: invoiceIds.length
    }
  }, [sendPaymentReminder])

  return { sendPaymentReminder, sendBulkReminders }
}

// Funciones auxiliares
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${year}${month}-${random}`
}

function calculateDueDate(): Date {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)
  return dueDate
}

function calculateLineTotal(line: InvoiceLine): number {
  const subtotal = line.quantity * line.unitPrice
  const discount = line.discount ? (subtotal * line.discount) / 100 : 0
  const subtotalWithDiscount = subtotal - discount
  const taxAmount = (subtotalWithDiscount * line.taxRate) / 100
  return subtotalWithDiscount + taxAmount
}

async function simulateEmailSend(invoiceId: string, message: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email enviado para factura ${invoiceId}: ${message}`)
      resolve()
    }, 500)
  })
}