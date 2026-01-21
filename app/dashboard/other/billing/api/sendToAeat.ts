import { type NextRequest, NextResponse } from 'next/server'
import { generateInvoiceHash } from '../lib/calculations'
import { type AeatLog } from '../mock'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, invoiceData } = body

    if (!invoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de factura requerido'
        },
        { status: 400 }
      )
    }

    // Generar hash de la factura
    const hash = generateInvoiceHash(invoiceData)
    const timestamp = new Date().toISOString()

    // Simular envío a Hacienda
    console.log('Enviando factura a Hacienda:', {
      invoiceId,
      hash,
      timestamp,
      data: invoiceData
    })

    // Simular llamada a la API de Hacienda
    const haciendaResponse = await simulateHaciendaSubmission(invoiceId, hash, invoiceData)

    // Crear registro de log
    const logEntry: AeatLog = {
      id: Date.now().toString(),
      invoiceId,
      timestamp,
      status: haciendaResponse.status,
      message: haciendaResponse.message,
      hash
    }

    // Guardar log en base de datos
    await saveAeatLog(logEntry)

    // Actualizar estado de la factura
    await updateInvoiceHaciendaStatus(invoiceId, haciendaResponse.status)

    return NextResponse.json({
      success: true,
      log: logEntry,
      message: haciendaResponse.message
    })

  } catch (error) {
    console.error('Error enviando a Hacienda:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

async function simulateHaciendaSubmission(
  invoiceId: string,
  hash: string,
  invoiceData: any
): Promise<{ status: 'sent' | 'accepted' | 'rejected'; message: string }> {
  // Simular diferentes escenarios de respuesta de Hacienda
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random()

      if (random < 0.7) {
        // 70% de éxito
        resolve({
          status: 'accepted',
          message: 'Factura aceptada por Hacienda correctamente'
        })
      } else if (random < 0.9) {
        // 20% enviada pero pendiente
        resolve({
          status: 'sent',
          message: 'Factura enviada a Hacienda, pendiente de validación'
        })
      } else {
        // 10% rechazada
        resolve({
          status: 'rejected',
          message: 'Factura rechazada: Datos incompletos o formato incorrecto'
        })
      }
    }, 2000 + Math.random() * 3000) // Simular delay de 2-5 segundos
  })
}

async function saveAeatLog(log: AeatLog): Promise<void> {
  // Simular guardado del log en base de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Log de Hacienda guardado:', log)
      resolve()
    }, 100)
  })
}

async function updateInvoiceHaciendaStatus(
  invoiceId: string,
  status: 'pending' | 'sent' | 'accepted' | 'rejected'
): Promise<void> {
  // Simular actualización del estado en base de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Estado Hacienda actualizado para factura:', invoiceId, status)
      resolve()
    }, 100)
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de factura requerido'
        },
        { status: 400 }
      )
    }

    // Obtener logs de Hacienda para la factura
    const logs = await getAeatLogs(invoiceId)

    return NextResponse.json({
      success: true,
      logs
    })

  } catch (error) {
    console.error('Error obteniendo logs de Hacienda:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

async function getAeatLogs(invoiceId: string): Promise<AeatLog[]> {
  // Simular obtención de logs de base de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockLogs: AeatLog[] = [
        {
          id: '1',
          invoiceId,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // Hace 1 día
          status: 'sent',
          message: 'Factura enviada correctamente',
          hash: 'abc123'
        },
        {
          id: '2',
          invoiceId,
          timestamp: new Date().toISOString(),
          status: 'accepted',
          message: 'Factura aceptada por Hacienda'
        }
      ]
      resolve(mockLogs)
    }, 100)
  })
}

// Webhook endpoint para recibir actualizaciones de Hacienda (simulado)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceId, status, message, externalId } = body

    // Validar que la solicitud viene de Hacienda (en producción)
    // verifyHaciendaSignature(request)

    console.log('Actualización de Hacienda recibida:', {
      invoiceId,
      status,
      message,
      externalId
    })

    // Actualizar estado en base de datos
    await updateInvoiceHaciendaStatus(invoiceId, status)

    // Crear log de la actualización
    const logEntry: AeatLog = {
      id: Date.now().toString(),
      invoiceId,
      timestamp: new Date().toISOString(),
      status,
      message,
      hash: externalId // Usar el ID externo como hash
    }

    await saveAeatLog(logEntry)

    return NextResponse.json({
      success: true,
      message: 'Actualización procesada correctamente'
    })

  } catch (error) {
    console.error('Error procesando actualización de Hacienda:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando actualización'
      },
      { status: 500 }
    )
  }
}