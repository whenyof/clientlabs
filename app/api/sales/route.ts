import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/sales - List sales for current user. Real data from DB.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const sales = await prisma.sale.findMany({
      where: { userId: session.user.id },
      orderBy: { saleDate: 'desc' },
      take: 200,
    })
    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Sales list error:', error)
    return NextResponse.json(
      { error: 'Failed to load sales' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sales - Create a sale. Real persistence.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const {
      clientName,
      clientEmail,
      product,
      total,
      saleDate,
      status = 'PAGADO',
      notes,
    } = body

    if (!clientName || !product || total == null) {
      return NextResponse.json(
        { error: 'clientName, product and total are required' },
        { status: 400 }
      )
    }

    const sale = await prisma.sale.create({
      data: {
        id: `sale_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        userId: session.user.id,
        clientName: String(clientName),
        clientEmail: clientEmail ? String(clientEmail) : null,
        product: String(product),
        price: Number(total),
        total: Number(total),
        discount: 0,
        tax: 0,
        currency: 'EUR',
        paymentMethod: 'MANUAL',
        provider: 'MANUAL',
        status: String(status),
        notes: notes ? String(notes) : null,
        saleDate: saleDate ? new Date(saleDate) : new Date(),
        updatedAt: new Date(),
      },
    })
    revalidatePath('/dashboard/other')
    revalidatePath('/dashboard/other/sales')
    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Sales create error:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}
