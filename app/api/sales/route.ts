import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { generateInvoiceFromSale } from '@/modules/billing/services/invoice-generator.service'
import { createInvoiceFromSale } from '@/modules/billing/services/finance-invoice'

/**
 * GET /api/sales - List sales for current user. Optional ?clientId= to filter by client (e.g. for invoice creation).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId') ?? undefined

    console.log('FETCH SALES FOR CLIENT:', clientId, 'USER:', userId)

    // STEP 3 — Hard DB check before any transformation
    const raw = await prisma.sale.findMany({
      where: {
        userId,
        ...(clientId ? { clientId } : {}),
      },
    })
    console.log('RAW SALES FOUND:', raw.length)
    console.log(raw.map((s) => ({ id: s.id, clientId: s.clientId, total: s.total })))

    // STEP 4 — If no sales by clientId, check if any sales exist for user (field name / relation check)
    if (clientId && raw.length === 0) {
      const allForUser = await prisma.sale.findMany({
        where: { userId },
        take: 5,
      })
      console.log('ALL SALES (user):', allForUser.length)
      if (allForUser.length > 0) {
        console.log('Sample sale clientId:', allForUser[0].clientId, 'clientName:', allForUser[0].clientName)
      }
    }

    // STEP 7 — Fix: use sales by clientId; if none, include sales with clientId null but clientName matching selected client
    let sales: Awaited<ReturnType<typeof prisma.sale.findMany>>
    if (clientId) {
      sales = await prisma.sale.findMany({
        where: { userId, clientId },
        orderBy: { saleDate: 'desc' },
        take: 200,
      })
      if (sales.length === 0) {
        const client = await prisma.client.findUnique({
          where: { id: clientId, userId },
          select: { name: true },
        })
        const clientName = client?.name?.trim() ?? null
        if (clientName) {
          const byName = await prisma.sale.findMany({
            where: { userId, clientId: null, clientName },
            orderBy: { saleDate: 'desc' },
            take: 200,
          })
          console.log('SALES BY CLIENT NAME (clientId null):', byName.length)
          sales = byName
        }
      }
    } else {
      sales = await prisma.sale.findMany({
        where: { userId },
        orderBy: { saleDate: 'desc' },
        take: 200,
      })
    }

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
    console.log("SALE CREATED:", sale.id)
    console.log("CALLING createInvoiceFromSale")
    try {
      void generateInvoiceFromSale(sale.id).catch((err) => {
        console.error('Auto invoice from sale failed', sale.id, err)
      })
      void createInvoiceFromSale(sale.id, session.user.id).catch((err) => {
        console.error('Invoicing draft from sale failed', sale.id, err)
      })
    } catch (_) {
      // non-blocking
    }
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
