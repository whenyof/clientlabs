import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/leads - List leads with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const stageId = searchParams.get('stageId')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      userId: session.user.id
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Stage filter
    if (stageId) {
      where.stageId = stageId
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          stage: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.lead.count({ where })
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create new lead
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      company,
      source,
      budget,
      notes
    } = body

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        userId: session.user.id,
        name,
        email,
        phone,
        source: source || 'Web',
        notes,
        metadata: {
          ...(company ? { company } : {}),
          ...(budget ? { budget: parseFloat(budget) } : {})
        }
      },
      include: {
        stage: true
      }
    })

    // Calculate initial score
    const { LeadScoringService } = await import('@/lib/services/leadScoring')
    const initialScore = await LeadScoringService.calculateLeadScore(lead.id)

    // Update lead with initial score
    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: { score: initialScore },
      include: { stage: true }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        leadId: lead.id,
        type: 'lead_created',
        title: 'Lead creado',
        description: `Nuevo lead ${name} creado desde ${source}`,
        metadata: { source }
      }
    })

    return NextResponse.json(updatedLead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}