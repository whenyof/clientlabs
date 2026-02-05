import { type NextRequest, NextResponse } from 'next/server'

/** No Invoice model in DB — always return empty list. */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const totalItems = 0
    const totalPages = 0

    const stats = {
      total: 0,
      filtered: 0,
      draft: 0,
      issued: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
      pendingHacienda: 0,
      sentHacienda: 0,
      acceptedHacienda: 0,
      rejectedHacienda: 0
    }

    return NextResponse.json({
      success: true,
      data: {
        invoices: [] as any[],
        stats,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNext: false,
          hasPrev: false
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