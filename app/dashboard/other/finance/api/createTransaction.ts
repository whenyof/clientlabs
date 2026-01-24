import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      amount,
      concept,
      category,
      clientId,
      paymentMethod,
      date,
      origin = 'MANUAL'
    } = body

    // Validate required fields
    if (!type || !amount || !concept || !category || !paymentMethod || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate transaction type
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // If expense, make amount negative
    const finalAmount = type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount)

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: type as 'INCOME' | 'EXPENSE',
        amount: finalAmount,
        concept,
        category,
        clientId,
        paymentMethod,
        status: 'COMPLETED',
        origin: origin as 'MANUAL' | 'AUTOMATIC',
        date: new Date(date)
      },
      include: {
        Client: true
      }
    })

    return NextResponse.json({
      success: true,
      transaction
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}