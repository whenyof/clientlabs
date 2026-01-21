import { type NextRequest, NextResponse } from 'next/server'
import { validateInvoice } from '../lib/validators'
import { calculateInvoiceTotals, generateInvoiceHash } from '../lib/calculations'
import { type Invoice, type InvoiceLine } from '../mock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validation = validateInvoice(body)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors
        },
        { status: 400 }
      )
    }

    // Generar número de factura (simulado)
    const invoiceNumber = generateInvoiceNumber()

    // Calcular totales
    const totals = calculateInvoiceTotals(body.lines)

    // Generar hash para Hacienda (simulado)
    const invoiceData = {
      ...body,
      number: invoiceNumber,
      ...totals
    }
    const hash = generateInvoiceHash(invoiceData)

    // Crear factura
    const invoice: Invoice = {
      id: Date.now().toString(),
      number: invoiceNumber,
      client: body.client,
      company: body.company || {
        name: 'Mi Empresa SL',
        nif: 'A87654321',
        address: 'Gran Vía 456, Barcelona'
      },
      date: body.date,
      dueDate: body.dueDate,
      status: body.status || 'draft',
      haciendaStatus: 'pending',
      origin: 'manual',
      lines: body.lines,
      ...totals,
      currency: 'EUR',
      paymentTerms: body.paymentTerms || '30 días',
      notes: body.notes,
      hash,
      timestamp: new Date().toISOString()
    }

    // Aquí iría la lógica para guardar en base de datos
    console.log('Factura creada:', invoice)

    // Simular guardado en base de datos
    await saveInvoiceToDatabase(invoice)

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Factura creada exitosamente'
    })

  } catch (error) {
    console.error('Error creando factura:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${year}${month}-${random}`
}

async function saveInvoiceToDatabase(invoice: Invoice): Promise<void> {
  // Simular guardado en base de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Factura guardada en BD:', invoice.id)
      resolve()
    }, 100)
  })
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de factura requerido'
        },
        { status: 400 }
      )
    }

    // Validar datos de actualización
    const validation = validateInvoice(updateData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors
        },
        { status: 400 }
      )
    }

    // Calcular totales actualizados
    const totals = calculateInvoiceTotals(updateData.lines)

    // Actualizar hash si es necesario
    const hash = generateInvoiceHash({ ...updateData, ...totals })

    // Aquí iría la lógica para actualizar en base de datos
    const updatedInvoice: Partial<Invoice> = {
      ...updateData,
      ...totals,
      hash,
      timestamp: new Date().toISOString()
    }

    console.log('Factura actualizada:', id, updatedInvoice)

    // Simular actualización en base de datos
    await updateInvoiceInDatabase(id, updatedInvoice)

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
      message: 'Factura actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error actualizando factura:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

async function updateInvoiceInDatabase(id: string, updates: Partial<Invoice>): Promise<void> {
  // Simular actualización en base de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Factura actualizada en BD:', id)
      resolve()
    }, 100)
  })
}