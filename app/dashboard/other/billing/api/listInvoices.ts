import { type NextRequest, NextResponse } from 'next/server'
import { mockInvoices, type Invoice } from '../mock'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filtros
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let filteredInvoices = [...mockInvoices]

    // Filtrar por estado
    if (status && status !== 'all') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status)
    }

    // Filtrar por búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.number.toLowerCase().includes(searchLower) ||
        invoice.client.name.toLowerCase().includes(searchLower) ||
        invoice.client.email.toLowerCase().includes(searchLower) ||
        invoice.client.nif.toLowerCase().includes(searchLower)
      )
    }

    // Ordenar
    filteredInvoices.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Invoice]
      let bValue: any = b[sortBy as keyof Invoice]

      // Manejar fechas
      if (sortBy === 'date' || sortBy === 'dueDate') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      // Manejar números
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Manejar strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })

    // Paginación
    const totalItems = filteredInvoices.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

    // Estadísticas
    const stats = {
      total: mockInvoices.length,
      filtered: totalItems,
      draft: mockInvoices.filter(inv => inv.status === 'draft').length,
      issued: mockInvoices.filter(inv => inv.status === 'issued').length,
      sent: mockInvoices.filter(inv => inv.status === 'sent').length,
      paid: mockInvoices.filter(inv => inv.status === 'paid').length,
      overdue: mockInvoices.filter(inv => inv.status === 'overdue').length,
      cancelled: mockInvoices.filter(inv => inv.status === 'cancelled').length,
      pendingHacienda: mockInvoices.filter(inv => inv.haciendaStatus === 'pending').length,
      sentHacienda: mockInvoices.filter(inv => inv.haciendaStatus === 'sent').length,
      acceptedHacienda: mockInvoices.filter(inv => inv.haciendaStatus === 'accepted').length,
      rejectedHacienda: mockInvoices.filter(inv => inv.haciendaStatus === 'rejected').length
    }

    return NextResponse.json({
      success: true,
      data: {
        invoices: paginatedInvoices,
        stats,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Error listando facturas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'IDs de facturas requeridos'
        },
        { status: 400 }
      )
    }

    // Aquí iría la lógica para eliminar facturas de la base de datos
    console.log('Eliminando facturas:', ids)

    // Simular eliminación
    await deleteInvoicesFromDatabase(ids)

    return NextResponse.json({
      success: true,
      message: `${ids.length} factura${ids.length > 1 ? 's' : ''} eliminada${ids.length > 1 ? 's' : ''} exitosamente`
    })

  } catch (error) {
    console.error('Error eliminando facturas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}

async function deleteInvoicesFromDatabase(ids: string[]): Promise<void> {
  // Simular eliminación en base de datos
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Facturas eliminadas de BD:', ids)
      resolve()
    }, 100)
  })
}