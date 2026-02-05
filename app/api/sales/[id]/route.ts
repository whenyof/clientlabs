import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/sales/[id] - Update sale (e.g. status). Real persistence.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const sale = await prisma.sale.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 })
    }

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        ...(typeof status === 'string' && status.trim() ? { status: status.trim() } : {}),
        updatedAt: new Date(),
      },
    })
    revalidatePath('/dashboard/other')
    revalidatePath('/dashboard/other/sales')
    return NextResponse.json({ sale: updated })
  } catch (error) {
    console.error('Sales update error:', error)
    return NextResponse.json(
      { error: 'Failed to update sale' },
      { status: 500 }
    )
  }
}
