import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/leads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') ?? 1)
    const limit = Number(searchParams.get('limit') ?? 20)

    const offset = (page - 1) * limit

    console.log('[api/leads] session user:', session.user.id)

    // Leads del usuario actual
    const where = {
      userId: session.user.id
    }

    const [leads, total, globalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.lead.count({ where }),
      prisma.lead.count() // debug: total en la DB
    ])
    
    if (process.env.NODE_ENV === "development") {
      console.log('[api/leads] session user:', session.user.id)
      console.log('[api/leads] leads returned:', leads.length)
      console.log('[api/leads] total leads in DB:', globalCount)

      if (leads.length > 0) {
        const first = leads[0]
        console.log('[api/leads] first lead:', {
          id: first.id,
          email: first.email,
          userId: first.userId,
          createdAt: first.createdAt
        })
      }
    }

    return NextResponse.json({
      sessionUser: session.user.id,
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      debug: {
        leadsForUser: leads.length,
        totalLeadsInDatabase: globalCount
      }
    })

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('[api/leads] error:', error)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


// POST /api/leads
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

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

    const { LeadScoringService } = await import('@/lib/services/leadScoring')

    const initialScore = await LeadScoringService.calculateLeadScore(lead.id)

    const updatedLead = await prisma.lead.update({
      where: { id: lead.id },
      data: { score: initialScore },
      include: { stage: true }
    })

    await prisma.activity.create({
      data: {
        userId: session.user.id,
        leadId: lead.id,
        type: 'lead_created',
        title: 'Lead creado',
        description: `Nuevo lead ${name ?? email ?? 'sin nombre'} creado`,
        metadata: { source }
      }
    })

    return NextResponse.json(updatedLead, { status: 201 })

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('[api/leads] create error:', error)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}