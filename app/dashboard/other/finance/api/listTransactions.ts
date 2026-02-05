import { NextRequest, NextResponse } from 'next/server'
import { TransactionType } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // INCOME, EXPENSE, or null for all
    const category = searchParams.get('category')
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    const origin = searchParams.get('origin')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (type) where.type = type
    if (category) where.category = category
    if (clientId) where.clientId = clientId
    if (status) where.status = status
    if (origin) where.origin = origin

    // Date range filter
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    // Search filter
    if (search) {
      where.OR = [
        { concept: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { Client: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.transaction.count({ where })

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Calculate summary
    const summary = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        ...(type && { type: type as TransactionType }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      _sum: {
        amount: true
      },
      _count: true
    })

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalCount: summary._count
      }
    })

  } catch (error) {
    console.error('Error listing transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}